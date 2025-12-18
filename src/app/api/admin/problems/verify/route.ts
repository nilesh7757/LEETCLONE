import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { problemId, isVerified } = await req.json();

    const problem = await prisma.problem.update({
      where: { id: problemId },
      data: { 
        isVerified,
        isPublic: isVerified // Automatically make public if verified
      }
    });

    return NextResponse.json({ success: true, problem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify problem" }, { status: 500 });
  }
}
