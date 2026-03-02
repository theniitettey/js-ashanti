import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);

/**
 * Event queue for async processing
 * Stores user events for batching and AI analysis
 */
export const eventQueue = new Queue("user-events", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
});

/**
 * Add event to queue for async processing
 */
export async function queueEvent(event: any) {
  await eventQueue.add("process-event", event, {
    jobId: event.eventId, // Prevent duplicate events
  });
}

/**
 * Get queue stats for monitoring
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    eventQueue.getWaitingCount(),
    eventQueue.getActiveCount(),
    eventQueue.getCompletedCount(),
    eventQueue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}
