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

    // 2. Stable "Daily" Selection
    const now = new Date();
    // Use a string like "2026-01-30" as a seed
    const dateString = now.toISOString().split('T')[0];
    
    // Simple hash function for the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the absolute hash to pick an index
    const dailyIndex = Math.abs(hash) % problems.length;
    const dailyProblem = problems[dailyIndex];

    return NextResponse.json({ problem: dailyProblem });
  } catch (error) {
    console.error("Error fetching daily problem:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
