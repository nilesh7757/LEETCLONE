// Mock dependencies early
jest.mock('@/auth', () => ({
  auth: jest.fn()
}))
jest.mock('@/lib/queue', () => ({
  executionQueue: { 
    getWorkers: jest.fn().mockResolvedValue([{ id: 'w1' }]),
    add: jest.fn().mockResolvedValue({ 
      waitUntilFinished: jest.fn().mockResolvedValue([{ status: 'Accepted', runtime: 100, actual: '3' }]) 
    }) 
  },
  queueEvents: {}
}))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    problem: { findUnique: jest.fn() },
    submission: { create: jest.fn(), count: jest.fn(), update: jest.fn() },
    user: { update: jest.fn() },
    $transaction: jest.fn((cb) => cb({
        submission: { create: jest.fn(), count: jest.fn() },
        user: { update: jest.fn() }
    }))
  }
}))

import { createRequest } from 'node-mocks-http'
import { POST } from '@/app/api/submission/route'
import { executeCode } from '@/lib/codeExecution'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProblemType } from '@prisma/client'

// Additional mocks
jest.mock('@/lib/codeExecution')
jest.mock('@/lib/socket-client', () => ({
  socketClient: {
    connect: jest.fn(),
    socket: { emit: jest.fn() }
  }
}))
jest.mock('@/lib/gemini', () => ({
  auditAndAnalyze: jest.fn().mockResolvedValue({ passed: true, feedback: 'Good', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' }),
  evaluateSystemDesign: jest.fn().mockResolvedValue({ score: 90, feedback: 'Excellent' })
}))
jest.mock('@/lib/services/streak', () => ({
  updateUserStreak: jest.fn().mockResolvedValue(5)
}))
jest.mock('@/lib/services/contest', () => ({
  processContestScoring: jest.fn().mockResolvedValue(undefined)
}))

const mockedAuth = auth as jest.Mock
const mockedExecuteCode = executeCode as jest.Mock

describe('Submission API (POST)', () => {
  const userId = 'user-123'
  const problemId = '123e4567-e89b-12d3-a456-426614174000'

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: userId } })
  })

  it('should return 401 if unauthorized', async () => {
    mockedAuth.mockResolvedValue(null)
    const req = createRequest({
      method: 'POST',
      json: () => Promise.resolve({})
    }) as unknown as Request

    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('should return 404 if problem not found', async () => {
    (prisma.problem.findUnique as jest.Mock).mockResolvedValue(null)
    const req = createRequest({
      method: 'POST',
      json: () => Promise.resolve({ problemId, code: 'print(1)', language: 'python' })
    }) as unknown as Request

    const response = await POST(req)
    expect(response.status).toBe(404)
  })

  it('should process a successful coding submission', async () => {
    const mockProblem = {
      id: problemId,
      title: 'Sum',
      difficulty: 'Easy',
      description: 'Add two numbers',
      timeLimit: 1,
      memoryLimit: 512,
      testSets: JSON.stringify([{ input: '1 2', expectedOutput: '3' }]),
      type: ProblemType.CODING,
      initialSchema: null,
      initialData: null,
    }

    const txMock = {
        submission: { 
            create: jest.fn().mockResolvedValue({ id: 'sub-789', status: 'Accepted' }),
            count: jest.fn().mockResolvedValue(0)
        },
        user: { update: jest.fn().mockResolvedValue({}) }
    };

    (prisma.problem.findUnique as jest.Mock).mockResolvedValue(mockProblem);
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => await cb(txMock));
    mockedExecuteCode.mockResolvedValue([{ status: 'Accepted', runtime: 100, input: '1 2', actual: '3', expected: '3' }])
    
    const req = createRequest({
      method: 'POST',
      json: () => Promise.resolve({ problemId, code: 'print(3)', language: 'python', type: 'CODING' })
    }) as unknown as Request

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.submission.status).toBe('Accepted')
    expect(data.newStreak).toBe(5)
    expect(txMock.submission.create).toHaveBeenCalled()
    expect(txMock.user.update).toHaveBeenCalled()
  })
})
