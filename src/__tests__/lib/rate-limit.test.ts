/**
 * @jest-environment node
 */
import { rateLimit } from '@/lib/rate-limit';
import { Redis } from '@upstash/redis';

jest.mock('@upstash/redis');

describe('rateLimit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Memory Store Fallback', () => {
    it('should allow requests within limit', async () => {
      // Ensure no Redis env vars
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const result = await rateLimit('test-id', 2, 60000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should deny requests exceeding limit', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      const id = 'test-deny';
      await rateLimit(id, 1, 60000);
      const result = await rateLimit(id, 1, 60000);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Redis Store', () => {
    it('should use Redis if environment variables are set', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'http://mock-redis';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      const mockPipeline = {
        incr: jest.fn().mockReturnThis(),
        pexpireat: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([5]), // 5th request
      };

      (Redis.prototype as unknown as { pipeline: unknown }).pipeline = jest.fn().mockReturnValue(mockPipeline);

      const result = await rateLimit('redis-id', 10, 60000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
      expect(mockPipeline.incr).toHaveBeenCalled();
      expect(mockPipeline.exec).toHaveBeenCalled();
    });

    it('should fail gracefully and fallback to memory if Redis throws', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'http://mock-redis';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      (Redis.prototype as unknown as { pipeline: unknown }).pipeline = jest.fn().mockImplementation(() => {
        throw new Error('Redis down');
      });

      const result = await rateLimit('fallback-id', 5, 60000);
      expect(result.success).toBe(true); // Should work via memory fallback
    });
  });
});
