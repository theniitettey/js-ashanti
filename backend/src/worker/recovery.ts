/**
 * Recovery Loop - Crash Detection & Self-Healing
 *
 * Runs every 60 seconds to:
 * 1. Detect stuck jobs (RUNNING > 15 minutes)
 * 2. Retry transient failures
 * 3. Move unrecoverable jobs to DLQ
 * 4. Prevent infinite retry loops with max_attempts
 */

import { prisma } from "../lib/prisma";
import { nanoid } from "nanoid";

export interface RecoveryConfig {
  stuckJobTimeoutMinutes: number; // How long before marking as stuck
  maxJobAttempts: number; // Max retries before DLQ
  recoveryIntervalMs: number; // How often to run
}

export const DEFAULT_RECOVERY_CONFIG: RecoveryConfig = {
  stuckJobTimeoutMinutes: 15,
  maxJobAttempts: 5,
  recoveryIntervalMs: 60 * 1000, // 1 minute
};

/**
 * Find and recover stuck jobs
 * A job is stuck if it's been RUNNING for longer than the timeout
 */
async function recoverStuckJobs(config: RecoveryConfig): Promise<number> {
  const stuckThresholdMs = config.stuckJobTimeoutMinutes * 60 * 1000;
  const stuckTime = new Date(Date.now() - stuckThresholdMs);

  console.log(
    `[Recovery] Scanning for jobs stuck since: ${stuckTime.toISOString()}`
  );

  // Find all jobs that are RUNNING but haven't been updated recently
  const stuckJobs = await prisma.analysisJob.findMany({
    where: {
      status: "RUNNING",
      updated_at: {
        lt: stuckTime, // Not updated in 15 minutes
      },
    },
    orderBy: { updated_at: "asc" },
  });

  if (stuckJobs.length === 0) {
    return 0;
  }

  console.log(`[Recovery] Found ${stuckJobs.length} stuck jobs`);

  let recovered = 0;
  let deadLettered = 0;

  for (const job of stuckJobs) {
    try {
      if (job.attempt_count >= config.maxJobAttempts) {
        // Move to dead letter queue (too many attempts)
        await prisma.deadLetterJob.create({
          data: {
            dlq_id: nanoid(),
            job_id: job.job_id,
            batch_id: job.batch_id,
            attempt_count: job.attempt_count,
            last_error: `Stuck for ${config.stuckJobTimeoutMinutes} minutes with ${job.attempt_count} attempts`,
            error_context: {
              reason: "STUCK_JOB_MAX_ATTEMPTS",
              last_error: job.last_error,
              timestamp: new Date().toISOString(),
            },
            failed_at: new Date(),
          },
        });

        await prisma.analysisJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            updated_at: new Date(),
          },
        });

        console.log(
          `[Recovery] → Moved job ${job.job_id} to DLQ (${job.attempt_count} attempts)`
        );
        deadLettered++;
      } else {
        // Transient failure: move back to PENDING for retry
        const backoffDelayMs =
          60000 * Math.pow(2, Math.min(job.attempt_count, 4)); // Exponential backoff
        const lockExpiresAt = new Date(Date.now() + backoffDelayMs);

        await prisma.analysisJob.update({
          where: { id: job.id },
          data: {
            status: "PENDING",
            attempt_count: { increment: 1 },
            lock_expires_at: lockExpiresAt,
            error_context: {
              recovered_from_stuck: true,
              recovery_time: new Date().toISOString(),
              retry_delay_ms: backoffDelayMs,
              previous_error: job.last_error,
            } as any,
            updated_at: new Date(),
          },
        });

        console.log(
          `[Recovery] → Recovered job ${job.job_id} (attempt ${
            job.attempt_count + 1
          }), will retry in ${Math.round(backoffDelayMs / 1000)}s`
        );
        recovered++;
      }
    } catch (error) {
      console.error(
        `[Recovery] Error processing stuck job ${job.job_id}:`,
        error
      );
    }
  }

  console.log(
    `[Recovery] Completed: ${recovered} recovered, ${deadLettered} dead lettered`
  );

  return recovered + deadLettered;
}

/**
 * Check for expired locks and release them back to PENDING
 * (This is a safety mechanism in case lock_expires_at is not respected)
 */
async function releaseExpiredLocks(): Promise<number> {
  const expiredLocks = await prisma.analysisJob.findMany({
    where: {
      status: "RUNNING",
      lock_expires_at: {
        lt: new Date(), // Lock has expired
      },
    },
  });

  if (expiredLocks.length === 0) {
    return 0;
  }

  console.log(
    `[Recovery] Found ${expiredLocks.length} jobs with expired locks`
  );

  for (const job of expiredLocks) {
    try {
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "PENDING",
          lock_expires_at: null,
          updated_at: new Date(),
        },
      });

      console.log(`[Recovery] → Released expired lock on job ${job.job_id}`);
    } catch (error) {
      console.error(
        `[Recovery] Error releasing lock on job ${job.job_id}:`,
        error
      );
    }
  }

  return expiredLocks.length;
}

/**
 * Log forensics on dead letter jobs
 * Helps with debugging persistent failures
 */
async function logDeadLetterForensics(): Promise<void> {
  const recentDLQJobs = await prisma.deadLetterJob.findMany({
    where: {
      failed_at: {
        gte: new Date(Date.now() - 3600000), // Last hour
      },
    },
    orderBy: { failed_at: "desc" },
    take: 10,
  });

  if (recentDLQJobs.length > 0) {
    console.log(
      `[Recovery] Recent DLQ jobs (last hour): ${recentDLQJobs.length}`
    );
    for (const dlq of recentDLQJobs) {
      console.log(
        `  - ${dlq.job_id} (batch: ${dlq.batch_id}, attempts: ${dlq.attempt_count}): ${dlq.last_error}`
      );
    }
  }
}

/**
 * Main recovery loop
 * Runs periodically to detect and fix stuck jobs
 */
export async function startRecoveryLoop(
  config: RecoveryConfig = DEFAULT_RECOVERY_CONFIG
): Promise<void> {
  console.log(
    `[Recovery] Starting recovery loop (interval: ${config.recoveryIntervalMs}ms, stuck timeout: ${config.stuckJobTimeoutMinutes}min, max attempts: ${config.maxJobAttempts})`
  );

  const runLoop = async () => {
    try {
      console.log(
        `[Recovery] Running recovery cycle at ${new Date().toISOString()}`
      );

      // Check for stuck jobs
      await recoverStuckJobs(config);

      // Release expired locks
      await releaseExpiredLocks();

      // Log forensics
      await logDeadLetterForensics();
    } catch (error) {
      console.error("[Recovery] Unexpected error in recovery loop:", error);
    }

    // Schedule next cycle
    setTimeout(runLoop, config.recoveryIntervalMs);
  };

  // Start the loop
  runLoop();
}

/**
 * Get recovery statistics
 */
export async function getRecoveryStats() {
  const stuckCount = await prisma.analysisJob.count({
    where: {
      status: "RUNNING",
      updated_at: {
        lt: new Date(Date.now() - 15 * 60 * 1000), // > 15 minutes
      },
    },
  });

  const dlqCount = await prisma.deadLetterJob.count();

  const recentDLQ = await prisma.deadLetterJob.count({
    where: {
      failed_at: {
        gte: new Date(Date.now() - 3600000), // Last hour
      },
    },
  });

  return {
    stuckJobs: stuckCount,
    totalDLQ: dlqCount,
    recentDLQ,
  };
}
