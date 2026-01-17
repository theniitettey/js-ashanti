import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

/**
 * Production-Grade Batch Processor
 *
 * Implements two cron jobs:
 * 1. Batch Sealer Loop (every 1 minute)
 *    - Seals OPEN batches if event_count >= 100 OR age > 10 minutes
 *    - Sets sealed_at timestamp (immutable after this point)
 *
 * 2. Job Creator Loop (every 2 minutes)
 *    - Creates PENDING analysis jobs for newly SEALED batches
 *    - Ensures only one job per batch (handled by database unique constraint)
 */

export interface BatchProcessorConfig {
  BATCH_SIZE_THRESHOLD: number; // Events to trigger seal
  BATCH_TIME_WINDOW_MIN: number; // Minutes before auto-seal
  BATCH_SEAL_INTERVAL_MS: number; // How often to seal batches
  CRON_INTERVAL_MS: number; // How often to create jobs
}

export const DEFAULT_CONFIG: BatchProcessorConfig = {
  BATCH_SIZE_THRESHOLD: 100,
  BATCH_TIME_WINDOW_MIN: 10,
  BATCH_SEAL_INTERVAL_MS: 60 * 1000, // 1 minute
  CRON_INTERVAL_MS: 2 * 60 * 1000, // 2 minutes
};

/**
 * Batch Sealer Loop - runs every 1 minute
 * Transitions OPEN → SEALED based on event count or time threshold
 */
async function sealExpiredBatches(
  config: BatchProcessorConfig
): Promise<number> {
  const timeThreshold = new Date(
    Date.now() - config.BATCH_TIME_WINDOW_MIN * 60 * 1000
  );

  // Find OPEN batches that meet sealing criteria
  const batchesToSeal = await prisma.batch.findMany({
    where: {
      status: "OPEN",
      OR: [
        { event_count: { gte: config.BATCH_SIZE_THRESHOLD } }, // Reached event count
        { created_at: { lt: timeThreshold } }, // Older than time window
      ],
    },
  });

  if (batchesToSeal.length === 0) {
    return 0;
  }

  console.log(`[BatchProcessor] Sealing ${batchesToSeal.length} batches`);

  let sealed = 0;
  for (const batch of batchesToSeal) {
    try {
      const updated = await prisma.batch.update({
        where: { id: batch.id },
        data: {
          status: "SEALED",
          sealed_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log(
        `[BatchProcessor] ✓ Sealed batch ${batch.batch_id} (${batch.event_count} events)`
      );
      sealed++;
    } catch (error) {
      console.error(
        `[BatchProcessor] Error sealing batch ${batch.batch_id}:`,
        error
      );
    }
  }

  return sealed;
}

/**
 * Job Creator Loop - runs every 2 minutes
 * Creates PENDING analysis jobs for newly SEALED batches
 */
async function createJobsForSealedBatches(): Promise<number> {
  // Find SEALED batches without a PENDING or RUNNING job
  const sealedBatches = await prisma.batch.findMany({
    where: {
      status: "SEALED",
    },
  });

  let created = 0;

  for (const batch of sealedBatches) {
    try {
      // Check if job already exists for this batch
      const existingJob = await prisma.analysisJob.findFirst({
        where: {
          batch_id: batch.batch_id,
          status: {
            in: ["PENDING", "RUNNING", "SUCCESS"],
          },
        },
      });

      if (existingJob) {
        // Job already exists, skip
        continue;
      }

      // Create new analysis job
      const jobId = nanoid();
      const newJob = await prisma.analysisJob.create({
        data: {
          job_id: jobId,
          batch_id: batch.batch_id,
          status: "PENDING",
          trigger_type: "SCHEDULED",
          attempt_count: 0,
          max_attempts: 5,
        },
      });

      console.log(
        `[BatchProcessor] ✓ Created job ${jobId} for batch ${batch.batch_id}`
      );
      created++;
    } catch (error) {
      // Handle unique constraint violation (another process created it first)
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        console.log(
          `[BatchProcessor] Job already exists for batch ${batch.batch_id}, skipping`
        );
      } else {
        console.error(
          `[BatchProcessor] Error creating job for batch ${batch.batch_id}:`,
          error
        );
      }
    }
  }

  return created;
}

/**
 * Start batch processor with two scheduled cron jobs
 */
export function startBatchProcessor(
  config: BatchProcessorConfig = DEFAULT_CONFIG
): void {
  console.log("[BatchProcessor] Starting batch processor");
  console.log(`  - Sealing batches every ${config.BATCH_SEAL_INTERVAL_MS}ms`);
  console.log(`  - Creating jobs every ${config.CRON_INTERVAL_MS}ms`);
  console.log(
    `  - Threshold: ${config.BATCH_SIZE_THRESHOLD} events or ${config.BATCH_TIME_WINDOW_MIN}min`
  );

  // Batch Sealer Loop - every 1 minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      const sealed = await sealExpiredBatches(config);
      if (sealed > 0) {
        console.log(`[BatchProcessor] Sealed ${sealed} batches`);
      }
    } catch (error) {
      console.error("[BatchProcessor] Error in sealer loop:", error);
    }
  });

  // Job Creator Loop - every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const created = await createJobsForSealedBatches();
      if (created > 0) {
        console.log(`[BatchProcessor] Created ${created} analysis jobs`);
      }
    } catch (error) {
      console.error("[BatchProcessor] Error in job creator loop:", error);
    }
  });

  console.log("[BatchProcessor] Cron jobs scheduled");
}

/**
 * Get batch processor statistics
 */
export async function getBatchProcessorStats() {
  const [open, sealed, analyzed] = await Promise.all([
    prisma.batch.count({ where: { status: "OPEN" } }),
    prisma.batch.count({ where: { status: "SEALED" } }),
    prisma.batch.count({ where: { status: "ANALYZED" } }),
  ]);

  return { open, sealed, analyzed };
}

// Auto-start in production
if (process.env.NODE_ENV === "production") {
  startBatchProcessor();
}
