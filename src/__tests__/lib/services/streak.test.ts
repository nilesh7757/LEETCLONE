import { updateUserStreak } from '@/lib/services/streak';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('updateUserStreak', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const streak = await updateUserStreak(userId);
    expect(streak).toBe(0);
  });

  it('should set streak to 1 if user has no lastSolvedDate', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ streak: 0, lastSolvedDate: null });
    (prisma.user.update as jest.Mock).mockResolvedValue({ streak: 1 });

    const streak = await updateUserStreak(userId);

    expect(streak).toBe(1);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId },
        data: expect.objectContaining({ streak: 1 }),
      })
    );
  });

  it('should increment streak if lastSolvedDate was yesterday', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ streak: 5, lastSolvedDate: yesterday });
    (prisma.user.update as jest.Mock).mockResolvedValue({ streak: 6 });

    const streak = await updateUserStreak(userId);

    expect(streak).toBe(6);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 6 }),
      })
    );
  });

  it('should reset streak to 1 if lastSolvedDate was before yesterday', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ streak: 5, lastSolvedDate: twoDaysAgo });
    (prisma.user.update as jest.Mock).mockResolvedValue({ streak: 1 });

    const streak = await updateUserStreak(userId);

    expect(streak).toBe(1);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 1 }),
      })
    );
  });

  it('should not change streak if already solved today', async () => {
    const today = new Date();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ streak: 5, lastSolvedDate: today });

    const streak = await updateUserStreak(userId);

    expect(streak).toBe(5);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
