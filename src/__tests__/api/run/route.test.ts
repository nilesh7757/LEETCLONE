/**
 * @jest-environment node
 */
// Mock dependencies early
jest.mock('@/auth', () => ({
  auth: jest.fn()
}))
jest.mock('@/lib/queue', () => ({
  executionQueue: { 
    getWorkers: jest.fn().mockResolvedValue([{ id: 'w1' }]),
    add: jest.fn().mockResolvedValue({ 
      waitUntilFinished: jest.fn().mockResolvedValue([{ actual: 'out' }]) 
    }) 
  },
  queueEvents: {},
  hasActiveWorkers: jest.fn().mockResolvedValue(true)
}))

import { POST } from '@/app/api/run/route';
import { auth } from '@/auth';
import { executionQueue } from '@/lib/queue';

describe('Run API (POST)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/api/run', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should execute code successfully', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });
    
    const req = new Request('http://localhost/api/run', {
      method: 'POST',
      body: JSON.stringify({ code: 'print(1)', language: 'python', testCases: [{ input: '1', expectedOutput: '1' }] })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0].actual).toBe('out');
    expect(executionQueue.add).toHaveBeenCalled();
  });

  it('should detect language if not provided', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'u1' } });

    const req = new Request('http://localhost/api/run', {
      method: 'POST',
      body: JSON.stringify({ code: 'def solve(): pass', testCases: [{ input: '', expectedOutput: '' }] })
    });

    await POST(req);

    expect(executionQueue.add).toHaveBeenCalledWith('run-code', expect.objectContaining({
      language: 'python'
    }));
  });
});
