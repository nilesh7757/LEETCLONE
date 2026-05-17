/**
 * @jest-environment node
 */
import { POST } from '@/app/api/register/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '@/lib/mail';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('bcrypt');
jest.mock('@/lib/mail');

describe('Register API (POST)', () => {
  const userData = { name: 'Test', email: 'test@test.com', password: 'password123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pwd');
  });

  it('should create a new user and send OTP', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ email: userData.email });

    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.requireVerification).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ email: userData.email, isVerified: false })
    }));
    expect(sendOtpEmail).toHaveBeenCalled();
  });

  it('should return 409 if user already exists and is verified', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: userData.email, isVerified: true });

    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('already exists');
  });

  it('should resend OTP if user exists but is not verified', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: userData.email, isVerified: false });
    (prisma.user.update as jest.Mock).mockResolvedValue({ email: userData.email });

    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(sendOtpEmail).toHaveBeenCalled();
  });
});
