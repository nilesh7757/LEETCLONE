import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST() {
  try {
    const randomId = crypto.randomBytes(6).toString("hex");
    const guestEmail = `guest_${randomId}@logiquest.com`;
    const guestPassword = `guest_pass_${randomId}`;

    // Hash password and create a unique guest user
    const hashedPassword = await bcrypt.hash(guestPassword, 10);
    await prisma.user.create({
      data: {
        email: guestEmail,
        name: `Guest Coder #${randomId}`,
        password: hashedPassword,
        role: "USER",
        isVerified: true,
        description: "Temporary Guest Account",
        solvedCount: 0,
        rating: 1500,
      },
    });

    console.log(`[GUEST_AUTH] Created random guest demo user: ${guestEmail}`);
    
    return NextResponse.json({ 
      success: true,
      email: guestEmail,
      password: guestPassword
    });
  } catch (error) {
    console.error("[GUEST_AUTH] Error creating guest user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
