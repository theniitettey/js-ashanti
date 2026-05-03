/**
 * Resilient Job Claiming Worker
 * Atomic job claiming via raw SQL SKIP LOCKED, max_attempts enforcement,
 * and idempotent insight upsert.
 */

import { prisma } from "../lib/prisma";
import { analyzeEventBatch } from "../services/ai.service";
import { UserEvent } from "../interfaces/analytics";
import { nanoid } from "nanoid";

const MAX_JOB_ATTEMPTS = 5;
const JOB_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

export interface JobError {
  type: "TRANSIENT" | "FATAL";
  code: string;
  message: string;
}

export function classifyError(error: unknown): JobError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("429")
    ) {
      return { type: "TRANSIENT", code: "NETWORK_ERROR", message: error.message };
    }

    if (message.includes("circuit breaker") || message.includes("open")) {
      return { type: "TRANSIENT", code: "CIRCUIT_BREAKER_OPEN", message: error.message };
    }

    if (message.includes("401") || message.includes("403")) {
      return { type: "FATAL", code: "AUTH_ERROR", message: error.message };
    }

    if (message.includes("404")) {
      return { type: "FATAL", code: "NOT_FOUND", message: error.message };
    }

    if (message.includes("400")) {
      return { type: "FATAL", code: "VALIDATION_ERROR", message: error.message };
    }
  }

  return { type: "TRANSIENT", code: "UNKNOWN_ERROR", message: String(error) };
}

export function calculateBackoffDelay(
  attempt: number,
  baseDelaySeconds: number = 60
): number {
  const maxDelay = baseDelaySeconds * Math.pow(2, Math.min(attempt, 5));
  const jitter = Math.random() * maxDelay * 0.1;
  return Math.floor((maxDelay + jitter) * 1000);
}

export interface ClaimedJob {
  id: string;
  job_id: string;
  batch_id: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  lock_expires_at: Date | null;
  created_at: Date;
}

async function claimJob(): Promise<ClaimedJob | null> {
  const lockExpiry = new Date(Date.now() + JOB_LOCK_TIMEOUT_MS);

  try {
    const claimed = await prisma.$queryRaw<ClaimedJob[]>`
      UPDATE "analysis_jobs"
      SET status = 'RUNNING',
          lock_expires_at = ${lockExpiry},
          updated_at = NOW()
      WHERE id = (
        SELECT id FROM "analysis_jobs"
        WHERE status = 'PENDING'
          AND (lock_expires_at IS NULL OR lock_expires_at < NOW())
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, job_id, batch_id, status, attempt_count, max_attempts, lock_expires_at, created_at
    `;

    if (!claimed || claimed.length === 0) {
      return null;
    }

    console.log(
      `[Worker] Claimed job: ${claimed[0].job_id} for batch: ${claimed[0].batch_id}`
    );
    return claimed[0];
  } catch (error: any) {
    if (error?.message?.includes("connect")) {
      console.error("[Worker] Database connection error during claim:", error.message);
    }
    return null;
  }
}

async function processJob(job: ClaimedJob): Promise<void> {
  const startTime = Date.now();

  try {
    const batch = await prisma.batch.findUnique({
      where: { batch_id: job.batch_id },
    });

    if (!batch) {
      throw new Error(`Batch not found: ${job.batch_id}`);
    }

    if (batch.status !== "SEALED") {
      if (batch.status === "OPEN") {
        await markJobFailed(job, "Batch not sealed yet", "TRANSIENT");
        return;
      }

      if (batch.status === "ANALYZED" || batch.status === "ARCHIVED") {
        const analysisTimeMs = Date.now() - startTime;
        await prisma.analysisJob.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            analysis_time_ms: analysisTimeMs,
            last_error: null,
            error_context: undefined,
            updated_at: new Date(),
          },
        });
        console.warn(
          `[Worker] Job ${job.job_id} skipped — batch ${job.batch_id} already ${batch.status}`
        );
        return;
      }

      await markJobFailed(job, `Batch in invalid state: ${batch.status}`, "FATAL");
      return;
    }

    const events = await prisma.event.findMany({
      where: { batch_id: job.batch_id },
      orderBy: { timestamp: "asc" },
    });

    if (events.length === 0) {
      await markJobFailed(job, "No events in batch", "FATAL");
      return;
    }

    console.log(
      `[Worker] Processing ${events.length} events for batch: ${job.batch_id}`
    );

    const userEvents: UserEvent[] = events.map((e) => ({
      eventId: e.id,
      eventType: e.event_type,
      userId: e.user_id || "anonymous",
      sessionId: job.batch_id,
      timestamp: e.timestamp.toISOString(),
      metadata: e.data as Record<string, unknown>,
    }));

    const insights = await analyzeEventBatch(userEvents);

    const timeWindowKey = `batch_${job.batch_id}`;
    await prisma.insight.upsert({
      where: { timeWindow: timeWindowKey },
      update: {
        summary: insights.summary,
        confidence: insights.confidence,
        patterns: insights.patterns,
        eventCount: userEvents.length,
      },
      create: {
        summary: insights.summary,
        confidence: insights.confidence,
        patterns: insights.patterns,
        timeWindow: timeWindowKey,
        eventCount: userEvents.length,
      },
    });

    const analysisTimeMs = Date.now() - startTime;
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        analysis_time_ms: analysisTimeMs,
        updated_at: new Date(),
      },
    });

    await prisma.batch.update({
      where: { batch_id: job.batch_id },
      data: { status: "ANALYZED", updated_at: new Date() },
    });

    console.log(`[Worker] Job ${job.job_id} completed in ${analysisTimeMs}ms`);
  } catch (error) {
    const jobError = classifyError(error);
    await markJobFailed(job, jobError.message, jobError.type);
  }
}

async function markJobFailed(
  job: ClaimedJob,
  errorMessage: string,
  errorType: "TRANSIENT" | "FATAL"
): Promise<void> {
  const baseDelaySeconds = 60;
  const backoffDelayMs = calculateBackoffDelay(job.attempt_count, baseDelaySeconds);
  const nextAttempt = job.attempt_count + 1;
  const maxAttempts = job.max_attempts || MAX_JOB_ATTEMPTS;

  try {
    if (errorType === "FATAL" || nextAttempt >= maxAttempts) {
      await prisma.deadLetterJob.create({
        data: {
          dlq_id: nanoid(),
          job_id: job.job_id,
          batch_id: job.batch_id,
          attempt_count: nextAttempt,
          last_error: errorMessage,
          error_context: {
            errorType: errorType === "FATAL" ? "FATAL" : "MAX_ATTEMPTS_EXHAUSTED",
            maxAttempts,
            timestamp: new Date().toISOString(),
          },
          failed_at: new Date(),
        },
      });

      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          attempt_count: nextAttempt,
          last_error: errorMessage,
          error_context: { type: errorType === "FATAL" ? "FATAL" : "MAX_ATTEMPTS_EXHAUSTED", maxAttempts },
          updated_at: new Date(),
        },
      });

      const reason = errorType === "FATAL" ? "Fatal error" : `Max attempts (${maxAttempts}) exhausted`;
      console.error(`[Worker] ${reason} for job ${job.job_id}: ${errorMessage}`);
    } else {
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
        `[Worker] Transient error for job ${job.job_id} (attempt ${nextAttempt}/${maxAttempts}): ${errorMessage}, retry in ${Math.round(backoffDelayMs / 1000)}s`
      );
    }
  } catch (error) {
    console.error("[Worker] Error updating job status:", error);
  }
}

export async function startWorker(pollIntervalMs: number = 5000): Promise<void> {
  console.log(`[Worker] Starting (polling every ${pollIntervalMs}ms)`);

  const runLoop = async () => {
    try {
      const job = await claimJob();
      if (job) await processJob(job);
      setTimeout(runLoop, pollIntervalMs);
    } catch (error) {
      console.error("[Worker] Unexpected error in main loop:", error);
      setTimeout(runLoop, pollIntervalMs);
    }
  };

  runLoop();
}

export async function getWorkerStats() {
  const pending = await prisma.analysisJob.count({ where: { status: "PENDING" } });
  const running = await prisma.analysisJob.count({ where: { status: "RUNNING" } });
  const success = await prisma.analysisJob.count({ where: { status: "SUCCESS" } });
  const failed = await prisma.analysisJob.count({ where: { status: "FAILED" } });
  return { pending, running, success, failed };
}
