import { Worker, Job } from 'bullmq';
import { executeCode, ExecuteCodeParams } from './codeExecution';
import { connection } from './queue';
import { logger } from './logger';

export const executionWorker = new Worker('code-execution', async (job: Job<ExecuteCodeParams>) => {
  logger.info(`[WORKER] Processing job ${job.id}`);
  try {
    const results = await executeCode(job.data);
    return results;
  } catch (error) {
    logger.error(`[WORKER] Job ${job.id} failed:`, error);
    throw error;
  }
}, { 
  connection,
  concurrency: 5 // Process 5 submissions concurrently
});

executionWorker.on('completed', (job) => {
  logger.info(`[WORKER] Job ${job.id} completed successfully`);
});

executionWorker.on('failed', (job, err) => {
  logger.error(`[WORKER] Job ${job?.id} failed with error:`, err);
});
