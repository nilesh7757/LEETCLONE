import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    console.log("Register API: Unauthorized - Session or User ID missing", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contestId, accessCode } = await req.json();
    console.log(`Register API: Registering user ${session.user.id} for contest ${contestId}`);

    // Verify contest existence and visibility
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
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
      console.log("Register API: User already registered");
      return NextResponse.json({ message: "Already registered" });
    }

    const registration = await prisma.contestRegistration.create({
      data: {
        userId: session.user.id,
        contestId,
      },
    });

    console.log("Register API: Registration successful");
    return NextResponse.json({ registration });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register for contest" },
      { status: 500 }
    );
  }
}
