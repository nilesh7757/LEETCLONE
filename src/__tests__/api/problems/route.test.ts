/**
 * @jest-environment node
 */
// Mock dependencies early
jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

import { GET } from '@/app/api/problems/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    problem: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Problems API (GET)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return public problems when unauthenticated', async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    (prisma.problem.findMany as jest.Mock).mockResolvedValue([{ id: '1', title: 'P1', submissions: [], contests: [] }]);
    (prisma.problem.count as jest.Mock).mockResolvedValue(1);

    const req = new Request('http://localhost/api/problems');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.problems).toHaveLength(1);
    expect(prisma.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
            expect.objectContaining({ isPublic: true })
        ])
      })
    }));
  });

  it('should filter by user problems when tab=mine', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.problem.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.problem.count as jest.Mock).mockResolvedValue(0);

    const req = new Request('http://localhost/api/problems?tab=mine');
    await GET(req);

    expect(prisma.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { creatorId: 'user-1' }
    }));
  });

  it('should apply search query', async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    (prisma.problem.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.problem.count as jest.Mock).mockResolvedValue(0);

    const req = new Request('http://localhost/api/problems?q=searchterm');
    await GET(req);

    expect(prisma.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        AND: expect.arrayContaining([
          expect.any(Object),
          expect.objectContaining({
            OR: expect.arrayContaining([
               expect.objectContaining({ title: { contains: 'searchterm', mode: 'insensitive' } })
            ])
          })
        ])
      })
    }));
  });
});
