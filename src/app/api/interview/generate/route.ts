import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, name: true }
    });

    const { topic, difficulty } = await req.json();

    // 1. Fetch user's solving stats for context
    const submissions = await prisma.submission.findMany({
      where: { userId, status: "Accepted" },
      select: { problem: { select: { category: true, pattern: true } } }
    });

    const stats: any = {};
    submissions.forEach(s => {
      const cat = s.problem.pattern || s.problem.category;
      stats[cat] = (stats[cat] || 0) + 1;
    });

    // 2. AI Generates 5 specialized questions
    const systemPrompt = `You are a Technical Interviewer. Generate a Mock Interview session.
    Candidate Skills: ${user?.skills.join(", ") || "None listed"}
    Candidate Experience: ${JSON.stringify(stats)}
    Interview Focus: ${topic}
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

    const userPrompt = `Create a challenging ${difficulty} level interview about ${topic}.`;
    
    try {
      const responseText = await runAI(userPrompt, systemPrompt, true);
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const interviewData = JSON.parse(cleanJson);

      // 3. Save to DB
      const interview = await prisma.mockInterview.create({
        data: {
          userId,
          topic,
          difficulty,
          questions: interviewData.questions,
          status: "ONGOING"
        }
      });

      return NextResponse.json({ interview });
    } catch (parseError) {
      console.error("AI Generation or Parse failed:", parseError);
      return NextResponse.json({ error: "AI failed to generate interview questions. Please try again." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Interview Gen Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
