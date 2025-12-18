import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewId } = await req.json();

    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId }
    });

    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const answers = interview.answers as any[];
    
    // 1. Calculate overall score
    const avgScore = Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length);

    // 2. AI Overall Critique
    const systemPrompt = `Analyze this candidate's performance across 5 interview questions.
    Topic: ${interview.topic}
    Answers & Feedback: ${JSON.stringify(answers)}
    
    Return a detailed summary of their strengths and weaknesses in HTML format.`;

    const overallFeedback = await runAI("Provide a final performance review.", systemPrompt);

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        score: avgScore,
        feedback: overallFeedback,
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ score: avgScore, feedback: overallFeedback });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
