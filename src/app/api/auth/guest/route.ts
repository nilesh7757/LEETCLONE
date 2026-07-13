import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST() {
  try {
    const guestEmail = "guest@logiquest.com";
    const guestPassword = "guestpassword";

    // 1. Check if the guest user already exists
    const existingGuest = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (existingGuest) {
      return NextResponse.json({ success: true });
    }

    // 2. Hash password and create guest user if it doesn't exist
    const hashedPassword = await bcrypt.hash(guestPassword, 10);
    await prisma.user.create({
      data: {
        email: guestEmail,
        name: "Guest Coder",
        password: hashedPassword,
        role: "USER",
        isVerified: true,
        solvedCount: 0,
        rating: 1500,
      },
    });

    console.log("[GUEST_AUTH] Created guest demo user.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GUEST_AUTH] Error ensuring guest user exists:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
