import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false, // Prevent commands from hanging indefinitely when offline
  retryStrategy(times: number) {
    // Reconnect backoff strategy to reduce log spam and connection overhead
    return Math.min(times * 500, 10000);
  },
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {})
};
export const connection = new Redis(redisUrl, redisOptions);
(globalThis as unknown as Record<string, unknown>)._redisConnection = connection;

let redisRateLimited = false;

connection.on('error', (err: Error) => {
  const msg = err.message || '';
  // Avoid verbose logging if connection is just failing in background to prevent log flood
  if (!msg.includes("ECONNREFUSED")) {
    logger.error(`[REDIS_ERROR] Connection error: ${msg}`);
  }
  if (msg.includes("max requests limit exceeded") && !redisRateLimited) {
    redisRateLimited = true;
    logger.warn("[REDIS_CIRCUIT_BREAKER] Upstash Redis request limit exceeded. Disconnecting Redis connection to prevent further requests...");
    try {
      connection.disconnect();
      queueEvents.close().catch(e => logger.error("[REDIS_CIRCUIT_BREAKER] Failed to close queueEvents:", e));
      executionQueue.close().catch(e => logger.error("[REDIS_CIRCUIT_BREAKER] Failed to close executionQueue:", e));
    } catch (e) {
      logger.error("[REDIS_CIRCUIT_BREAKER] Failed to close queue resources:", e);
    }
  }
});

export const executionQueue = new Queue('code-execution', { connection });
export const queueEvents = new QueueEvents('code-execution', { connection });

/**
 * Checks if the background queue is available and has active workers.
 * Fail-safes immediately if Redis is unreachable or if it takes too long.
 */
export async function hasActiveWorkers(): Promise<boolean> {
  if (connection.status !== 'ready') {
    return false;
  }
  try {
    const workersPromise = executionQueue.getWorkers();
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout checking workers")), 1500)
    );
    const workers = await Promise.race([workersPromise, timeoutPromise]);
    return workers.length > 0;
  } catch (err) {
    logger.warn(`[QUEUE_CHECK] Worker status check failed or timed out: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

