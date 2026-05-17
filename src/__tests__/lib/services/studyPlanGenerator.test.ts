/**
 * @jest-environment node
 */
import { generatePersonalizedStudyPlan } from '@/lib/services/studyPlanGenerator';
import { prisma } from '@/lib/prisma';
import { runAI } from '@/lib/gemini';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    submission: { findMany: jest.fn() },
    problem: { findMany: jest.fn() },
    studyPlan: { create: jest.fn() }
  }
}));

jest.mock('@/lib/gemini', () => ({
  runAI: jest.fn()
}));

describe('generatePersonalizedStudyPlan', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if not enough failure data', async () => {
    (prisma.submission.findMany as jest.Mock).mockResolvedValue([{ id: 'sub-1' }]); // Only 1 failure

    const result = await generatePersonalizedStudyPlan(userId);
    expect(result).toEqual({ error: expect.stringContaining('Not enough failure data') });
  });

  it('should generate and save a plan if enough data exists', async () => {
    const mockFailures = [
      { problem: { title: 'Two Sum' }, status: 'Wrong Answer' },
      { problem: { title: 'Add Two' }, status: 'Time Limit Exceeded' },
      { problem: { title: 'LCS' }, status: 'Runtime Error' }
    ];
    const mockProblems = [{ title: 'P1', slug: 's1' }, { title: 'P2', slug: 's2' }];
    const mockPlanData = {
      title: 'Plan Title',
      description: 'Desc',
      problemSlugs: ['s1', 's2'],
      reasoning: 'AI Reason'
    };

    (prisma.submission.findMany as jest.Mock).mockResolvedValue(mockFailures);
    (prisma.problem.findMany as jest.Mock).mockResolvedValue(mockProblems);
    (runAI as jest.Mock).mockResolvedValue(mockPlanData);
    (prisma.studyPlan.create as jest.Mock).mockResolvedValue({ id: 'plan-123' });

    const result = await generatePersonalizedStudyPlan(userId);

    expect(result).toEqual({ id: 'plan-123' });
    expect(prisma.studyPlan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: 'Plan Title',
        creatorId: userId
      })
    }));
  });

  it('should throw if runAI fails', async () => {
    (prisma.submission.findMany as jest.Mock).mockResolvedValue([
      { problem: { title: 'P1' }, status: 'WA' },
      { problem: { title: 'P2' }, status: 'TLE' },
      { problem: { title: 'P3' }, status: 'RE' }
    ]);
    (prisma.problem.findMany as jest.Mock).mockResolvedValue([]);
    (runAI as jest.Mock).mockRejectedValue(new Error('AI Failed'));

    await expect(generatePersonalizedStudyPlan(userId)).rejects.toThrow('AI Failed');
  });
});
