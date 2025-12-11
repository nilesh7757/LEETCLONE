import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      } else {
        // Resend OTP for unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            password: hashedPassword,
            otp,
            otpExpires,
          },
        });

        try {
          await sendOtpEmail(email, otp);
        } catch (emailError) {
          console.error("Failed to send OTP email:", emailError);
        }

        return NextResponse.json(
          { message: "OTP sent to email", requireVerification: true, email: existingUser.email },
          { status: 200 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false
      },
    });

    try {
        await sendOtpEmail(email, otp);
    } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
    }

    return NextResponse.json(
      { message: "OTP sent to email", requireVerification: true, email: newUser.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
