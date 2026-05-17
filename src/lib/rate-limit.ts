import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Memory fallback if Upstash isn't configured
const memoryStore = new Map<string, { count: number; reset: number }>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  const reset = windowStart + windowMs;
  const key = `ratelimit:${identifier}:${windowStart}`;

  // Use Upstash Redis which is fully compatible with Vercel Edge Runtime
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.pexpireat(key, reset);
      const results = await pipeline.exec();

      if (results && results.length > 0) {
        const count = results[0] as number;
        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          reset,
        };
      }
    } catch (error) {
      console.error("Upstash rate limit error, falling back to memory:", error);
    }
  }

  // Fallback to memory store
  if (Math.random() < 0.05) {
    for (const [k] of memoryStore) {
      const ts = parseInt(k.split(":")[2]);
      if (ts < now - windowMs) {
        memoryStore.delete(k);
      }
    }
  }

  const entry = memoryStore.get(key) || { count: 0, reset };

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  entry.count++;
  memoryStore.set(key, entry);

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset,
  };
}
