import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Ensure it's not cached statically forever

export async function GET() {
  try {
    // 1. Fetch all public problem IDs
    const problems = await prisma.problem.findMany({
      where: { isPublic: true },
      select: { id: true, title: true, slug: true, difficulty: true, category: true, type: true },
      orderBy: { createdAt: 'asc' }, // Deterministic order
    });

    if (problems.length === 0) {
      return NextResponse.json({ message: "No problems available" }, { status: 404 });
    }

    // 2. Calculate "Daily" Index
    // Use days since epoch to pick an index
    const now = new Date();
    const startOfEpoch = new Date(0); // 1970-01-01
    const diffTime = now.getTime() - startOfEpoch.getTime();
    const daysSinceEpoch = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const dailyIndex = daysSinceEpoch % problems.length;
    const dailyProblem = problems[dailyIndex];

    return NextResponse.json({ problem: dailyProblem });
  } catch (error) {
    console.error("Error fetching daily problem:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
