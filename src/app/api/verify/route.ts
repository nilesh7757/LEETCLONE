import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
        return NextResponse.json({ message: "Already verified" });
    }

    if (!user.otp || !user.otpExpires) {
        return NextResponse.json({ error: "No OTP found" }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (user.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
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

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
