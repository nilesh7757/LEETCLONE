import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const executionQueue = new Queue('code-execution', { connection });
export const queueEvents = new QueueEvents('code-execution', { connection });
