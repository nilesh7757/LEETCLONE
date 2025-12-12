import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { problemId, isPublic } = await req.json();
    
    if (!problemId) {
        return NextResponse.json({ error: "Problem ID required" }, { status: 400 });
    }

    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: { isPublic },
    });

    return NextResponse.json({ problem: updatedProblem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update problem visibility" }, { status: 500 });
  }
}
