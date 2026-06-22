import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request) => {
  const { email, otp } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isVerified) {
    return NextResponse.json({ message: "Already verified" });
  }

  if (!user.otp || !user.otpExpires) {
    throw new ApiError("No OTP found", 400);
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError("OTP expired", 400);
  }

  if (user.otp !== otp) {
    throw new ApiError("Invalid OTP", 400);
  }

  // Verify
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null
    }
  });

  return NextResponse.json({ message: "Verified successfully" });
});
