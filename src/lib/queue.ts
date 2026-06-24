import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisOptions = {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {})
};
export const connection = new Redis(redisUrl, redisOptions);

export const executionQueue = new Queue('code-execution', { connection });
export const queueEvents = new QueueEvents('code-execution', { connection });
