import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    logger.warn("Register API: Unauthorized - Session or User ID missing");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contestId } = await req.json();
    logger.info(`Register API: Registering user ${session.user.id} for contest ${contestId}`);

    // Verify contest existence and visibility
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const now = new Date();
    const contestEndTime = new Date(contest.endTime);

    if (contest.status === "ENDED") {
      return NextResponse.json({ error: "Contest has already ended" }, { status: 400 });
    }

    if (contest.status === "DRAFT" || contest.status === "READY") {
      return NextResponse.json({ error: "Contest is not yet open for registration" }, { status: 400 });
    }

    if (now > contestEndTime) {
      return NextResponse.json({ error: "Contest has already ended" }, { status: 400 });
    }

    if (contest.visibility === "PRIVATE" && contest.accessCode) {
      const { accessCode: providedCode } = await req.json();
      if (providedCode !== contest.accessCode) {
        return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
      }
    }

    // Removed access code validation for private contests as per user request

    // Check if already registered
    const existing = await prisma.contestRegistration.findUnique({
      where: {
        userId_contestId: {
          userId: session.user.id,
          contestId,
        },
      },
    });

    if (existing) {
      logger.info("Register API: User already registered");
      return NextResponse.json({ message: "Already registered" });
    }

    const registration = await prisma.contestRegistration.create({
      data: {
        userId: session.user.id,
        contestId,
      },
    });

    logger.info("Register API: Registration successful");
    return NextResponse.json({ registration });
  } catch (error) {
    logger.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register for contest" },
      { status: 500 }
    );
  }
}
