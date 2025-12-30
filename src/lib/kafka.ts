/**
 * Kafka Integration - Optional
 *
 * For high-volume, multi-consumer event streaming:
 * - Publish events to Kafka topic after DB insert
 * - Fallback: Database polling still works if Kafka down
 * - Outbox pattern: KafkaOutbox table for at-least-once delivery
 */

import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let consumer: Consumer | null = null;

/**
 * Initialize Kafka client
 */
export function getKafkaClient(): Kafka | null {
  if (kafka) return kafka;

  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) {
    console.warn("[Kafka] KAFKA_BROKERS not configured, Kafka disabled");
    return null;
  }

  try {
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || "js-ashanti-analytics",
      brokers: brokers.split(","),
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    });

    console.log("[Kafka] Client initialized");
    return kafka;
  } catch (error) {
    console.error("[Kafka] Failed to initialize:", error);
    return null;
  }
}

/**
 * Get or create Kafka producer
 */
export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;

  const kafkaClient = getKafkaClient();
  if (!kafkaClient) return null;

  try {
    producer = kafkaClient.producer();
    await producer.connect();
    console.log("[Kafka] Producer connected");
    return producer;
  } catch (error) {
    console.error("[Kafka] Producer connection failed:", error);
    return null;
  }
}

/**
 * Publish event to Kafka topic
 * Falls back gracefully if Kafka unavailable
 */
export async function publishEvent(
  topic: string,
  event: any
): Promise<boolean> {
  const prod = await getProducer();
  if (!prod) {
    console.warn("[Kafka] Producer not available, skipping publish");
    return false;
  }

  try {
    await prod.send({
      topic,
      messages: [
        {
          key: event.event_id || nanoid(),
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
        },
      ],
    });

    console.log(`[Kafka] Published event to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error("[Kafka] Publish failed:", error);
    return false;
  }
}

/**
 * Process Kafka outbox table (transactional outbox pattern)
 * Ensures at-least-once delivery even if Kafka is temporarily down
 */
export async function processOutbox(): Promise<number> {
  const prod = await getProducer();
  if (!prod) {
    console.warn("[Kafka] Producer not available, outbox processing skipped");
    return 0;
  }

  try {
    // Get unpublished outbox entries
    const unpublished = await prisma.kafkaOutbox.findMany({
      where: { published: false },
      take: 100,
      orderBy: { created_at: "asc" },
    });

    if (unpublished.length === 0) {
      return 0;
    }

    console.log(`[Kafka] Processing ${unpublished.length} outbox entries`);

    let publishedCount = 0;

    for (const entry of unpublished) {
      try {
        await prod.send({
          topic: "analytics-events",
          messages: [
            {
              key: entry.aggregate_id,
              value: JSON.stringify(entry.payload),
            },
          ],
        });

        // Mark as published
        await prisma.kafkaOutbox.update({
          where: { id: entry.id },
          data: { published: true },
        });

        publishedCount++;
      } catch (error) {
        console.error(
          `[Kafka] Failed to publish outbox entry ${entry.id}:`,
          error
        );
        // Continue with next entry
      }
    }

    console.log(
      `[Kafka] Published ${publishedCount}/${unpublished.length} outbox entries`
    );
    return publishedCount;
  } catch (error) {
    console.error("[Kafka] Outbox processing error:", error);
    return 0;
  }
}

/**
 * Write event to outbox table (for later Kafka publishing)
 * This ensures events are never lost even if Kafka is down
 */
export async function writeToOutbox(
  aggregateId: string,
  eventType: string,
  payload: any
): Promise<boolean> {
  try {
    await prisma.kafkaOutbox.create({
      data: {
        outbox_id: nanoid(),
        aggregate_id: aggregateId,
        event_type: eventType,
        payload,
        published: false,
      },
    });

    return true;
  } catch (error) {
    console.error("[Kafka] Outbox write failed:", error);
    return false;
  }
}

/**
 * Create Kafka consumer (for multi-consumer scenarios)
 */
export async function getConsumer(groupId: string): Promise<Consumer | null> {
  if (consumer) return consumer;

  const kafkaClient = getKafkaClient();
  if (!kafkaClient) return null;

  try {
    consumer = kafkaClient.consumer({ groupId });
    await consumer.connect();
    console.log(`[Kafka] Consumer connected (group: ${groupId})`);
    return consumer;
  } catch (error) {
    console.error("[Kafka] Consumer connection failed:", error);
    return null;
  }
}

/**
 * Subscribe to topic and process messages
 */
export async function subscribe(
  topic: string,
  groupId: string,
  handler: (payload: EachMessagePayload) => Promise<void>
): Promise<boolean> {
  const cons = await getConsumer(groupId);
  if (!cons) return false;

  try {
    await cons.subscribe({ topic, fromBeginning: false });
    await cons.run({
      eachMessage: handler,
    });

    console.log(`[Kafka] Subscribed to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error("[Kafka] Subscribe failed:", error);
    return false;
  }
}

/**
 * Graceful shutdown
 */
export async function disconnectKafka(): Promise<void> {
  try {
    if (producer) {
      await producer.disconnect();
      producer = null;
    }
    if (consumer) {
      await consumer.disconnect();
      consumer = null;
    }
    console.log("[Kafka] Disconnected gracefully");
  } catch (error) {
    console.error("[Kafka] Disconnect error:", error);
  }
}

export default {
  publishEvent,
  processOutbox,
  writeToOutbox,
  subscribe,
  disconnectKafka,
};
