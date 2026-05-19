import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface InterviewQuestion {
  id: string;
  type: string;
  question: string;
}

interface InterviewData {
  questions: InterviewQuestion[];
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skills: true, name: true }
  });

  const { topic, difficulty } = await req.json();

  // Input Validation
  if (!topic || typeof topic !== 'string' || topic.trim().length < 2 || topic.trim().length > 100) {
    throw new ApiError("Topic must be between 2 and 100 characters.", 400);
  }

  if (!["Entry", "Senior", "Staff"].includes(difficulty)) {
    throw new ApiError("Invalid difficulty level. Must be Entry, Senior, or Staff.", 400);
  }

  const sanitizedTopic = topic.trim().replace(/[<>]/g, ""); // Basic XSS/HTML tag removal

  // 1. Fetch user's solving stats for context
  const submissions = await prisma.submission.findMany({
    where: { userId, status: "Accepted" },
    select: { problem: { select: { category: true, pattern: true } } }
  });

  const stats: Record<string, number> = {};
  submissions.forEach(s => {
    const cat = s.problem.pattern || s.problem.category;
    stats[cat] = (stats[cat] || 0) + 1;
  });

  // 2. AI Generates 5 specialized questions
  const systemPrompt = `You are a Technical Interviewer. Generate a Mock Interview session.
  Candidate Skills: ${user?.skills.join(", ") || "None listed"}
  Candidate Experience: ${JSON.stringify(stats)}
  Interview Focus: ${sanitizedTopic}
  Difficulty Level: ${difficulty}

  Return ONLY JSON:
  {
    "questions": [
      { "id": "1", "type": "CONCEPTUAL", "question": "..." },
      { "id": "2", "type": "CONCEPTUAL", "question": "..." },
      { "id": "3", "type": "CONCEPTUAL", "question": "..." },
      { "id": "4", "type": "CODING", "question": "Describe an efficient algorithm to..." },
      { "id": "5", "type": "CODING", "question": "How would you design a system that..." }
    ]
  }`;

  const userPrompt = `Create a challenging ${difficulty} level interview about ${sanitizedTopic}.`;
  
  try {
    const interviewData = await runAI(userPrompt, systemPrompt, true) as InterviewData;

    // 3. Save to DB
    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        topic: sanitizedTopic,
        difficulty,
        questions: interviewData.questions as any,
        status: "ONGOING"
      }
    });

    return NextResponse.json({ interview });
  } catch (parseError: unknown) {
    logger.error("AI Generation or Parse failed:", parseError instanceof Error ? parseError.message : String(parseError));
    throw new ApiError("AI failed to generate interview questions. Please try again.", 500);
  }
});
