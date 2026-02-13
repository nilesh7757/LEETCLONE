export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, { count: number; reset: number }>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  const reset = windowStart + windowMs;

  const key = `${identifier}:${windowStart}`;

  // Clean up old entries occasionally
  if (Math.random() < 0.05) {
    for (const [k] of memoryStore) {
      const ts = parseInt(k.split(":")[1]);
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
