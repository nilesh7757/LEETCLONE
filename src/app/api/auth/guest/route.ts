import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
    const rateLimitResult = await rateLimit(`guest-auth:${ip}`, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many guest accounts created. Please try again later." },
        { status: 429 }
      );
    }

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

    logger.info(`[GUEST_AUTH] Created random guest demo user: ${guestEmail}`);
    
    return NextResponse.json({ 
      success: true,
      email: guestEmail,
      password: guestPassword
    });
  } catch (error) {
    logger.error("[GUEST_AUTH] Error creating guest user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
