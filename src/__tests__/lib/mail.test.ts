import { sendOtpEmail, sendPasswordResetEmail, sendStudyReminderEmail } from '@/lib/mail';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('mail.ts', () => {
  const sendMailMock = jest.fn().mockResolvedValue({});
  (nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: sendMailMock,
  });

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { 
        ...originalEnv,
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: '587',
        SMTP_USER: 'user@test.com',
        SMTP_PASS: 'pass'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should log to console and return if SMTP credentials missing', async () => {
    delete process.env.SMTP_HOST;
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await sendOtpEmail('test@user.com', '123456');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('OTP for test@user.com: 123456'));
    expect(sendMailMock).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('should send OTP email when credentials are present', async () => {
    await sendOtpEmail('test@user.com', '123456');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@user.com',
      subject: 'Verify your account',
      html: expect.stringContaining('123456')
    }));
  });

  it('should send password reset email', async () => {
    await sendPasswordResetEmail('test@user.com', 'token-123');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@user.com',
      subject: 'Reset your password',
      html: expect.stringContaining('token-123')
    }));
  });

  it('should send study reminder email', async () => {
    await sendStudyReminderEmail('test@user.com', 'DP Mastery', 50);

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@user.com',
      subject: 'Daily Reminder: DP Mastery',
      html: expect.stringContaining('50%')
    }));
  });
});
