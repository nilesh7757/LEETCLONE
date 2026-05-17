/**
 * @jest-environment node
 */
import { processContestScoring } from '@/lib/services/contest';
import { prisma } from '@/lib/prisma';

// Mock Socket
const mockEmit = jest.fn();
jest.mock('@/lib/socket-client', () => ({
  socketClient: {
    connect: jest.fn(),
    socket: { emit: (...args: unknown[]) => mockEmit(...args) }
  }
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    contest: { findMany: jest.fn(), findUnique: jest.fn() },
    submission: { count: jest.fn(), findMany: jest.fn() },
    contestRegistration: { update: jest.fn(), findMany: jest.fn() }
  }
}));

describe('processContestScoring', () => {
  const userId = 'user-1';
  const problemId = 'prob-1';
  const submissionId = 'sub-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not update anything if no active contests', async () => {
    (prisma.contest.findMany as jest.Mock).mockResolvedValue([]);

    await processContestScoring(userId, problemId, 'Easy', submissionId);

    expect(prisma.submission.count).not.toHaveBeenCalled();
    expect(prisma.contestRegistration.update).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('should award points for first solve in an active contest', async () => {
    const contestStartTime = new Date('2026-05-01T11:00:00Z');
    const activeContest = {
      id: 'contest-1',
      creatorId: 'user-other',
      scoringProtocol: 'CLASSIC',
      startTime: contestStartTime,
      endTime: new Date('2026-05-01T13:00:00Z'),
      registrations: [{ id: 'reg-1', userId }]
    };

    (prisma.contest.findMany as jest.Mock).mockResolvedValue([activeContest]);
    (prisma.submission.count as jest.Mock).mockResolvedValue(0);
    (prisma.contestRegistration.update as jest.Mock).mockResolvedValue({});
    (prisma.contest.findUnique as jest.Mock).mockResolvedValue(activeContest);
    (prisma.contestRegistration.findMany as jest.Mock).mockResolvedValue([{ id: 'reg-1', userId, score: 10, user: { id: userId } }]);
    (prisma.submission.findMany as jest.Mock).mockResolvedValue([{ userId, createdAt: new Date('2026-05-01T11:30:00Z') }]);

    await processContestScoring(userId, problemId, 'Easy', submissionId);

    expect(prisma.contestRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'reg-1' },
        data: { score: { increment: 10 }, rank: { increment: 60 } }
      })
    );
    expect(mockEmit).toHaveBeenCalledWith('leaderboard_update', expect.any(Object));
  });

  it('should apply decaying scoring if protocol is DECAY', async () => {
    const contestStartTime = new Date('2026-05-01T11:00:00Z');
    const activeContest = {
      id: 'contest-2',
      creatorId: 'user-other',
      scoringProtocol: 'DECAY',
      startTime: contestStartTime,
      endTime: new Date('2026-05-01T13:00:00Z'),
      registrations: [{ id: 'reg-2', userId }]
    };

    (prisma.contest.findMany as jest.Mock).mockResolvedValue([activeContest]);
    (prisma.submission.count as jest.Mock).mockResolvedValue(0);
    (prisma.contestRegistration.update as jest.Mock).mockResolvedValue({});
    (prisma.contest.findUnique as jest.Mock).mockResolvedValue(activeContest);
    (prisma.contestRegistration.findMany as jest.Mock).mockResolvedValue([]);

    await processContestScoring(userId, problemId, 'Hard', submissionId);

    expect(prisma.contestRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { score: { increment: 21 }, rank: { increment: 60 } }
      })
    );
  });
});
