import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface BlitzChallenge {
  algorithm: string;
  complexity: string;
}

interface BlitzData {
  challenges: BlitzChallenge[];
}

interface BugSniperBug {
  language: string;
  title: string;
  code: string;
  bugLine: number;
  hint: string;
  fix: string;
}

interface BugSniperData {
  bugs: BugSniperBug[];
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { gameId } = await req.json();

  if (!gameId || typeof gameId !== "string") {
    throw new ApiError("Invalid or missing gameId", 400);
  }

  try {
    if (gameId === "BLITZ") {
      const systemPrompt = `You are a computer science trainer. Generate 15 distinct algorithms or data structure operations for a complexity speed-matching game.
Each task must have a name (algorithm) and its worst-case or average time complexity (complexity).
The complexity must be exactly one of: 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(V + E)', 'O(2^N)', 'O(N!)'.
Avoid generating only standard sorting algorithms. Choose a mix of graph operations, tree operations, dynamic programming, basic lookups, heaps, math, and string operations.

Return ONLY a JSON object:
{
  "challenges": [
    { "algorithm": "Algorithm/Operation Name", "complexity": "Complexity Option" }
  ]
}`;
      const userPrompt = "Generate 15 diverse and interesting algorithms with their tight Big-O time complexity.";
      const data = await runAI(userPrompt, systemPrompt, true) as BlitzData;
      
      // Ensure we got valid challenges
      if (!data || !Array.isArray(data.challenges) || data.challenges.length === 0) {
        throw new Error("AI returned empty challenges array");
      }
      
      return NextResponse.json(data);

    } else if (gameId === "BUG_SNIPER") {
      const systemPrompt = `You are a coding trainer. Generate 5 programming code blocks where each block contains exactly one syntax or logical bug.
Choose from languages: 'javascript', 'cpp', 'python', 'java'.
Keep each code snippet short and readable (under 12 lines).
Make sure you specify:
- language: lowercased programming language
- title: clear concept name of the bug
- code: complete snippet. Indent properly.
- bugLine: 1-indexed line number where the bug is located.
- hint: warning or clue pointing to the bug line.
- fix: correct line of code or value to fix it.

Return ONLY a JSON object:
{
  "bugs": [
    {
      "language": "javascript",
      "title": "Bug Title",
      "code": "...",
      "bugLine": 3,
      "hint": "Hint context",
      "fix": "Corrected code line"
    }
  ]
}`;
      const userPrompt = "Generate 5 interesting, diverse coding bugs for the Bug Sniper challenge.";
      const data = await runAI(userPrompt, systemPrompt, true) as BugSniperData;

      // Ensure we got valid bugs
      if (!data || !Array.isArray(data.bugs) || data.bugs.length === 0) {
        throw new Error("AI returned empty bugs array");
      }

      return NextResponse.json(data);
    } else {
      throw new ApiError(`Unsupported gameId: ${gameId}`, 400);
    }
  } catch (error: unknown) {
    logger.error("AI Generation for Arcade failed:", error instanceof Error ? error.message : String(error));
    throw new ApiError("Failed to generate AI questions. Please try again.", 500);
  }
});
