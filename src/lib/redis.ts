/**
 * Redis Integration - Optional
 * Used for:
 * 1. Caching recent insights (read-heavy dashboard)
 * 2. Distributing circuit breaker state across workers
 * 3. Optional caching layer for batch queries
 *
 * Fallback: In-memory state per worker if Redis unavailable
 */

import Redis from "ioredis";

let redis: Redis | null = null;

/**
 * Get Redis client (singleton)
 * Falls back gracefully if REDIS_URL not configured
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Redis] REDIS_URL not configured, caching disabled");
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    redis.on("error", (err) => {
      console.error("[Redis] Error:", err.message);
    });

    return redis;
  } catch (error) {
    console.error("[Redis] Failed to initialize:", error);
    return null;
  }
}

/**
 * Cache insight data with TTL
 */
export async function cacheInsight(
  insightId: string,
  data: any,
  ttlSeconds: number = 3600
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(
      `insight:${insightId}`,
      ttlSeconds,
      JSON.stringify(data)
    );
    return true;
  } catch (error) {
    console.error("[Redis] Cache set failed:", error);
    return false;
  }
}

/**
 * Get cached insight
 */
export async function getCachedInsight(insightId: string): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(`insight:${insightId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[Redis] Cache get failed:", error);
    return null;
  }
}

/**
 * Cache batch statistics
 */
export async function cacheBatchStats(
  data: any,
  ttlSeconds: number = 60
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex("batch:stats", ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("[Redis] Batch stats cache failed:", error);
    return false;
  }
}

/**
 * Get cached batch stats
 */
export async function getCachedBatchStats(): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get("batch:stats");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[Redis] Batch stats get failed:", error);
    return null;
  }
}

/**
 * Distribute circuit breaker state across workers
 */
export async function setCircuitBreakerState(state: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.set("circuit-breaker:state", state);
    return true;
  } catch (error) {
    console.error("[Redis] Circuit breaker state set failed:", error);
    return false;
  }
}

/**
 * Get shared circuit breaker state
 */
export async function getCircuitBreakerState(): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    return await client.get("circuit-breaker:state");
  } catch (error) {
    console.error("[Redis] Circuit breaker state get failed:", error);
    return null;
  }
}

export default {
  getRedisClient,
  cacheInsight,
  getCachedInsight,
  cacheBatchStats,
  getCachedBatchStats,
  setCircuitBreakerState,
  getCircuitBreakerState,
};
