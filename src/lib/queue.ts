import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisOptions = {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {})
};
export const connection = new Redis(redisUrl, redisOptions);

let redisRateLimited = false;

connection.on('error', (err: Error) => {
  const msg = err.message || '';
  logger.error(`[REDIS_ERROR] Connection error: ${msg}`);
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
