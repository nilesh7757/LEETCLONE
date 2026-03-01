export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store for environments where Redis is unavailable (like Edge)
const memoryStore = new Map<string, { count: number; reset: number }>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  const reset = windowStart + windowMs;
  const key = `ratelimit:${identifier}:${windowStart}`;

  // Try to use Redis only if we are NOT in the Edge Runtime and REDIS_URL exists
  // Middleware/Proxy runs in Edge where ioredis doesn't work.
  if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge" && process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid breaking Edge runtime
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(process.env.REDIS_URL);
      
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.pexpireat(key, reset);
      const results = await pipeline.exec();
      
      if (results && results[0] && results[0][1] !== null) {
        const count = results[0][1] as number;
        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          reset,
        };
      }
    } catch (error) {
      console.error("Redis rate limit error, falling back to memory:", error);
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
