import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, otp: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("========================================");
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    console.log("========================================");
    console.warn("SMTP credentials not found. OTP logged to console.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LeetClone" <${SMTP_USER}>`,
    to: email,
    subject: "Verify your account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Use the following OTP to complete your sign up procedure:</p>
        <h1 style="background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NEXT_PUBLIC_APP_URL } = process.env;
  
  const appUrl = NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("========================================");
    console.log(`[DEV MODE] Password Reset for ${email}: ${resetLink}`);
    console.log("========================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LeetClone" <${SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to reset it:</p>
        <a href="${resetLink}" style="background: #000; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Reset Password</a>
        <p>Or verify using this link: <a href="${resetLink}">${resetLink}</a></p>
        <p>This link is valid for 1 hour.</p>
      </div>
    `,
  });
}
