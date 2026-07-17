import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic'; // Ensure it's not cached statically forever

export async function GET(req: Request) {
  try {
    const session = await auth();
    
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
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    let dateString = dateParam;
    
    // Validate date format YYYY-MM-DD
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const now = new Date();
      dateString = now.toISOString().split('T')[0];
    }
    
    // Simple hash function for the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the absolute hash to pick an index
    const dailyIndex = Math.abs(hash) % problems.length;
    const dailyProblem = problems[dailyIndex];

    // Check if the user has solved this challenge
    let isSolved = false;
    if (session?.user?.id) {
      const submission = await prisma.submission.findFirst({
        where: {
          userId: session.user.id,
          problemId: dailyProblem.id,
          status: "Accepted",
        },
      });
      isSolved = !!submission;
    }

    return NextResponse.json({ 
      problem: dailyProblem, 
      date: dateString, 
      isSolved 
    });
  } catch (error) {
    console.error("Error fetching daily problem:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
