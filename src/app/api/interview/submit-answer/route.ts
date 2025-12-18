import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewId, questionId, answer } = await req.json();

    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId }
    });

    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questions = interview.questions as any[];
    const question = questions.find(q => String(q.id) === String(questionId));

    if (!question) {
      return NextResponse.json({ error: "Question not found in this session" }, { status: 404 });
    }

    // 1. AI Score this specific answer
    const systemPrompt = `You are a Technical Interviewer. Evaluate the candidate's answer to this question.
    Question: ${question.question}
    Answer: ${answer}

    Return ONLY JSON: { "score": 0-100, "feedback": "Brief critique" }`;

    try {
      const responseText = await runAI("Evaluate this interview answer.", systemPrompt, true);
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const evaluation = JSON.parse(cleanJson);

      // 2. Append to answers array
      const currentAnswers = (interview.answers as any[]) || [];
      const newAnswer = {
        questionId,
        answer,
        score: evaluation.score ?? 50, // Fallback score
        feedback: evaluation.feedback ?? "Good effort."
      };

      const updatedAnswers = [...currentAnswers, newAnswer];

      const updatedInterview = await prisma.mockInterview.update({
        where: { id: interviewId },
        data: { answers: updatedAnswers }
      });

      return NextResponse.json({ evaluation, isFinished: updatedAnswers.length === questions.length });
    } catch (aiError) {
      console.error("AI Evaluation failed:", aiError);
      return NextResponse.json({ error: "AI failed to evaluate your answer. Please try again." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Answer Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
