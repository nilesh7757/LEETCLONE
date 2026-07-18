import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() || 
               req.headers.get("x-real-ip")?.trim() || 
               "127.0.0.1";
    const rateLimitResult = await rateLimit(`guest-auth:${ip}`, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many guest accounts created. Please try again later." },
        { status: 429 }
      );
    }

    // Deterministic credentials based on IP to ensure 1 account per IP
    const emailHash = crypto.createHash("md5").update(ip).digest("hex").substring(0, 12);
    const guestEmail = `guest_${emailHash}@logiquest.com`;
    const guestPassword = crypto
      .createHmac("sha256", process.env.AUTH_SECRET || "fallback-secret-for-guests")
      .update(ip)
      .digest("hex")
      .substring(0, 16);

    // Check if a guest account for this IP already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (existingUser) {
      logger.info(`[GUEST_AUTH] Reusing existing guest demo user: ${guestEmail}`);
      return NextResponse.json({
        success: true,
        email: guestEmail,
        password: guestPassword
      });
    }

    // Hash password and create a unique guest user
    const hashedPassword = await bcrypt.hash(guestPassword, 10);
    await prisma.user.create({
      data: {
        email: guestEmail,
        name: `Guest Coder #${emailHash.substring(0, 6)}`,
        password: hashedPassword,
        role: "USER",
        isVerified: true,
        description: "Temporary Guest Account",
        solvedCount: 0,
        rating: 1500,
      },
    });

    logger.info(`[GUEST_AUTH] Created deterministic guest demo user: ${guestEmail}`);
    
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
