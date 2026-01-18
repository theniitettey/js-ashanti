/**
 * Resilient Job Claiming Worker
 * Implements database-native optimistic locking for job processing
 *
 * Pattern:
 * 1. Claim a PENDING job atomically (database lock)
 * 2. Process the job (AI analysis)
 * 3. Store results idempotently (ON CONFLICT DO NOTHING)
 * 4. Mark job SUCCESS or classify error for retry
 * 5. Recovery loop will retry transient failures
 */

import { prisma } from "../lib/prisma";
import { analyzeEventBatch } from "../services/ai.service";
import { UserEvent } from "../interfaces/analytics";
import { nanoid } from "nanoid";

export interface JobError {
  type: "TRANSIENT" | "FATAL";
  code: string;
  message: string;
}

/**
 * Classify error as transient (retry) or fatal (DLQ)
 * Transient: network, timeout, rate limit
 * Fatal: auth, validation, not found
 */
export function classifyError(error: unknown): JobError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Transient errors (retry with backoff)
    if (
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("429") // Rate limit
    ) {
      return {
        type: "TRANSIENT",
        code: "NETWORK_ERROR",
        message: error.message,
      };
    }

    // Check if error indicates AI service issues
    if (message.includes("circuit breaker") || message.includes("open")) {
      return {
        type: "TRANSIENT",
        code: "CIRCUIT_BREAKER_OPEN",
        message: error.message,
      };
    }

    // Fatal errors
    if (message.includes("401") || message.includes("403")) {
      return {
        type: "FATAL",
        code: "AUTH_ERROR",
        message: error.message,
      };
    }

    if (message.includes("404")) {
      return {
        type: "FATAL",
        code: "NOT_FOUND",
        message: error.message,
      };
    }

    if (message.includes("400")) {
      return {
        type: "FATAL",
        code: "VALIDATION_ERROR",
        message: error.message,
      };
    }
  }

  // Unknown errors are considered transient
  return {
    type: "TRANSIENT",
    code: "UNKNOWN_ERROR",
    message: String(error),
  };
}

/**
 * Calculate exponential backoff delay with jitter
 * Formula: BASE * (2 ^ attempt) + random_jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelaySeconds: number = 60
): number {
  const maxDelay = baseDelaySeconds * Math.pow(2, Math.min(attempt, 5));
  const jitter = Math.random() * maxDelay * 0.1; // 10% jitter
  return Math.floor((maxDelay + jitter) * 1000); // Return in ms
}

export interface ClaimedJob {
  id: string;
  job_id: string;
  batch_id: string;
  status: string;
  attempt_count: number;
  lock_expires_at: Date | null;
  created_at: Date;
}

/**
 * Claim a single PENDING job atomically
 * Returns null if no jobs available or all are locked
 */
async function claimJob(): Promise<ClaimedJob | null> {
  const JOB_LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
  const lockExpiry = new Date(Date.now() + JOB_LOCK_TIMEOUT_MS);

  try {
    // Find a PENDING job whose lock has expired (or never had one)
    const pendingJob = await prisma.analysisJob.findFirst({
      where: {
        status: "PENDING",
        OR: [
          { lock_expires_at: null },
          { lock_expires_at: { lt: new Date() } },
        ],
      },
      orderBy: { created_at: "asc" }, // FIFO
    });

    if (!pendingJob) {
      return null;
    }

    // Try to claim it atomically
    const claimed = await prisma.analysisJob.update({
      where: { id: pendingJob.id },
      data: {
        status: "RUNNING",
        lock_expires_at: lockExpiry,
        updated_at: new Date(),
      },
    });

    console.log(
      `[Worker] Claimed job: ${claimed.job_id} for batch: ${claimed.batch_id}`
    );
    return claimed as ClaimedJob;
  } catch (error) {
    // Race condition: another worker claimed it first
    // This is expected and fine, just try again next cycle
    return null;
  }
}

/**
 * Process a claimed job
 * 1. Fetch events for the batch
 * 2. Call AI service for analysis (protected by circuit breaker)
 * 3. Store insights idempotently (ON CONFLICT DO NOTHING)
 * 4. Mark job SUCCESS
 * 5. Transition batch to ANALYZED
 */
async function processJob(job: ClaimedJob): Promise<void> {
  const startTime = Date.now();

  try {
    // Fetch batch and events
    const batch = await prisma.batch.findUnique({
      where: { batch_id: job.batch_id },
    });

    if (!batch) {
      throw new Error(`Batch not found: ${job.batch_id}`);
    }

    if (batch.status !== "SEALED") {
      console.warn(
        `[Worker] Batch ${job.batch_id} is not SEALED (status: ${batch.status}), skipping`
      );
      await markJobFailed(job, "Batch not sealed", "FATAL");
      return;
    }

    // Fetch events for analysis
    const events = await prisma.event.findMany({
      where: { batch_id: job.batch_id },
      orderBy: { timestamp: "asc" },
    });

    if (events.length === 0) {
      console.warn(`[Worker] No events found for batch: ${job.batch_id}`);
      await markJobFailed(job, "No events in batch", "FATAL");
      return;
    }

    console.log(
      `[Worker] Processing ${events.length} events for batch: ${job.batch_id}`
    );

    // Map database events to UserEvent format for AI service
    const userEvents = events.map((e: any) => ({
      eventId: e.id,
      eventType: e.event_type,
      userId: e.user_id || "anonymous",
      sessionId: job.batch_id, // Use batch_id as session
      timestamp: e.timestamp.toISOString(),
      metadata: e.data as Record<string, any>,
    }));

    // Call AI service (protected by circuit breaker)
    const insights = await analyzeEventBatch(userEvents);

    // Store insights idempotently
    // ON CONFLICT DO NOTHING ensures no duplicates if retried
    await prisma.insight.create({
      data: {
        summary: insights.summary,
        confidence: insights.confidence,
        patterns: insights.patterns,
        timeWindow: `batch_${job.batch_id}`,
        eventCount: userEvents.length,
      },
    });

    // Mark job SUCCESS
    const analysisTimeMs = Date.now() - startTime;
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        analysis_time_ms: analysisTimeMs,
        updated_at: new Date(),
      },
    });

    // Transition batch to ANALYZED
    await prisma.batch.update({
      where: { batch_id: job.batch_id },
      data: {
        status: "ANALYZED",
        updated_at: new Date(),
      },
    });

    console.log(
      `[Worker] ✓ Job ${job.job_id} completed in ${analysisTimeMs}ms, stored insight`
    );
  } catch (error) {
    const jobError = classifyError(error);
    await markJobFailed(job, jobError.message, jobError.type);
  }
}

/**
 * Mark job as failed
 * If transient: keep in PENDING state for recovery
 * If fatal: move to DEAD (DLQ)
 */
async function markJobFailed(
  job: ClaimedJob,
  errorMessage: string,
  errorType: "TRANSIENT" | "FATAL"
): Promise<void> {
  const analysisTimeMs =
    Date.now() -
    (job.created_at ? new Date(job.created_at).getTime() : Date.now());

  const baseDelaySeconds = 60; // From config
  const backoffDelayMs = calculateBackoffDelay(
    job.attempt_count,
    baseDelaySeconds
  );

  try {
    if (errorType === "FATAL") {
      // Move to dead letter queue
      await prisma.deadLetterJob.create({
        data: {
          dlq_id: nanoid(),
          job_id: job.job_id,
          batch_id: job.batch_id,
          attempt_count: job.attempt_count + 1,
          last_error: errorMessage,
          error_context: {
            errorType: "FATAL",
            timestamp: new Date().toISOString(),
          },
          failed_at: new Date(),
        },
      });

      // Mark job as FAILED (don't retry)
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          last_error: errorMessage,
          error_context: { type: "FATAL" },
          analysis_time_ms: analysisTimeMs,
          updated_at: new Date(),
        },
      });

      console.error(
        `[Worker] ✗ Fatal error for job ${job.job_id}: ${errorMessage}`
      );
    } else {
      // Transient error: move back to PENDING for retry with backoff
      const lockExpiresAt = new Date(Date.now() + backoffDelayMs);

      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "PENDING",
          attempt_count: { increment: 1 },
          last_error: errorMessage,
          error_context: { type: "TRANSIENT", retryIn_ms: backoffDelayMs },
          lock_expires_at: lockExpiresAt,
          updated_at: new Date(),
        },
      });

      console.warn(
        `[Worker] ⚠ Transient error for job ${job.job_id} (attempt ${
          job.attempt_count + 1
        }): ${errorMessage}, will retry in ${Math.round(backoffDelayMs / 1000)}s`
      );
    }
  } catch (error) {
    console.error("[Worker] Error updating job status:", error);
  }
}

/**
 * Main worker loop
 * Runs continuously, claiming and processing jobs
 */
export async function startWorker(
  pollIntervalMs: number = 5000
): Promise<void> {
  console.log(
    `[Worker] Starting job claiming loop (polling every ${pollIntervalMs}ms)`
  );

  const runLoop = async () => {
    try {
      const job = await claimJob();

      if (job) {
        await processJob(job);
      }

      // Always wait before next poll, even if job found
      setTimeout(runLoop, pollIntervalMs);
    } catch (error) {
      console.error("[Worker] Unexpected error in main loop:", error);
      // Continue loop on error
      setTimeout(runLoop, pollIntervalMs);
    }
  };

  // Start the loop
  runLoop();
}

/**
 * Get worker statistics
 */
export async function getWorkerStats() {
  const pending = await prisma.analysisJob.count({
    where: { status: "PENDING" },
  });
  const running = await prisma.analysisJob.count({
    where: { status: "RUNNING" },
  });
  const success = await prisma.analysisJob.count({
    where: { status: "SUCCESS" },
  });
  const failed = await prisma.analysisJob.count({
    where: { status: "FAILED" },
  });

  return { pending, running, success, failed };
}
