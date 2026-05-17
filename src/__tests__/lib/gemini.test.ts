/**
 * @jest-environment node
 */
import { auditAndAnalyze, predictComplexity, evaluateSystemDesign } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    codeCache: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('groq-sdk');
jest.mock('openai');
jest.mock('@google/generative-ai');

describe('gemini.ts (AI Services)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runAI', () => {
    it('should throw if no API keys are configured', async () => {
        // This test still needs isolation because keys are captured at module load
        await jest.isolateModules(async () => {
            const originalEnv = process.env;
            process.env = { ...originalEnv, GEMINI_API_KEY: '', GROQ_API_KEY: '', NVIDIA_API_KEY: '' };
            const { runAI: isolatedRunAI } = await import('@/lib/gemini');
            await expect(isolatedRunAI('test')).rejects.toThrow('No AI API Keys configured.');
            process.env = originalEnv;
        });
    });
  });

  describe('auditAndAnalyze', () => {
    it('should return cached result if available', async () => {
      const cachedResult = { passed: true, feedback: 'Cached', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' };
      (prisma.codeCache.findUnique as jest.Mock).mockResolvedValue({ result: cachedResult });

      const result = await auditAndAnalyze('code', 'js', 'title', 'desc');

      expect(result).toEqual(cachedResult);
    });

    it('should return fallback if cache throws', async () => {
      (prisma.codeCache.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await auditAndAnalyze('code', 'js', 'title', 'desc');

      expect(result.passed).toBe(true);
      expect(result.feedback).toBe('Analysis currently offline.');
    });
  });

  describe('Complexity and Design', () => {
    // These will fall back to "Calculating..." or "Evaluation unavailable." because the SDK mocks will throw or return nothing.
    it('predictComplexity should return calculating placeholder on error', async () => {
      const result = await predictComplexity('code', 'js');
      expect(result.timeComplexity).toBe('Calculating...');
    });

    it('evaluateSystemDesign should return fallback on error', async () => {
      const result = await evaluateSystemDesign('Q', 'A');
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('Evaluation unavailable.');
    });
  });
});
