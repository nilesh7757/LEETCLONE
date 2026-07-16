import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (request: Request) => {
  const { email } = await request.json();

  if (!email) throw new ApiError("Email is required", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError("No account found with this email", 404);
  if (user.isVerified) throw new ApiError("Email is already verified", 400);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires },
  });

  await sendOtpEmail(email, otp);

  return NextResponse.json({ message: "OTP resent successfully" });
});
