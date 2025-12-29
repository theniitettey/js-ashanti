import cron from "node-cron";
import { Worker, Job, Queue } from "bullmq";
import Redis from "ioredis";
import { UserEvent } from "@/interface/analytics";
import { analyzeEventBatch } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);

const eventQueue = new Queue("user-events", { connection });

/**
 * Worker to process individual events
 * (Currently just logs them; batching happens in cron job)
 */
const worker = new Worker(
  "user-events",
  async (job: Job) => {
    const event = job.data as UserEvent;
    console.log(`Processing event ${event.eventId}: ${event.eventType}`);
    // Event is stored in queue; actual processing happens in batch
    return { processed: true };
  },
  {
    connection,
    concurrency: 10,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

/**
 * Batch processor - runs every 5 minutes
 */
export function startBatchProcessor() {
  console.log("Starting batch processor (every 5 minutes)...");

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running batch analysis...");

      // Get completed jobs from queue (processed by worker)
      const jobs = await eventQueue.getJobs(["completed"], 0, 100);

      if (jobs.length === 0) {
        console.log("No events to process");
        return;
      }

      const events: UserEvent[] = jobs
        .map((job) => job.data as UserEvent)
        .filter(Boolean);

      if (events.length === 0) {
        console.log("No valid events found");
        return;
      }

      console.log(`Analyzing ${events.length} events...`);

      // Send to AI for analysis
      const analysis = await analyzeEventBatch(events);

      // Store insight in database
      const insight = await prisma.insight.create({
        data: {
          summary: analysis.summary,
          confidence: analysis.confidence,
          patterns: analysis.patterns,
          timeWindow: "last_5_minutes",
          eventCount: events.length,
        },
      });

      console.log(`Insight created: ${insight.id}`);

      // Clean up processed jobs
      await Promise.all(jobs.map((job) => job.remove()));
    } catch (error) {
      console.error("Batch processing error:", error);
      // Don't throw - let it retry on next schedule
    }
  });

  console.log("Batch processor started");
}

// Auto-start in production
if (process.env.NODE_ENV === "production") {
  startBatchProcessor();
}
