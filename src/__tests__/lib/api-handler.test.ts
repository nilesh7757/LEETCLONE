import { apiHandler } from '@/lib/api-handler';
import { ApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';

describe('apiHandler', () => {
  it('should return 200 and data if handler succeeds', async () => {
    const mockHandler = jest.fn().mockResolvedValue(Response.json({ success: true }));
    const wrapped = apiHandler(mockHandler);
    
    const req = new Request('http://localhost');
    const response = await wrapped(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return specific status for ApiError', async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new ApiError('Custom Error', 418);
    });
    const wrapped = apiHandler(mockHandler);

    const req = new Request('http://localhost');
    const response = await wrapped(req);
    const data = await response.json();

    expect(response.status).toBe(418);
    expect(data.error).toBe('Custom Error');
  });

  it('should return 409 for Prisma P2002 (Unique Constraint)', async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError('Unique error', { code: 'P2002', clientVersion: '5.0' });
    });
    const wrapped = apiHandler(mockHandler);

    const response = await wrapped(new Request('http://localhost'));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('unique value already exists');
  });

  it('should return 404 for Prisma P2025 (Not Found)', async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError('Not found', { code: 'P2025', clientVersion: '5.0' });
    });
    const wrapped = apiHandler(mockHandler);

    const response = await wrapped(new Request('http://localhost'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('record was not found');
  });

  it('should return 500 for unknown errors', async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Error('Boom');
    });
    const wrapped = apiHandler(mockHandler);

    const response = await wrapped(new Request('http://localhost'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
