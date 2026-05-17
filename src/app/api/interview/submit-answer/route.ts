import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

interface InterviewQuestion {
  id: string;
  question: string;
}

interface InterviewAnswer {
  questionId: string;
  answer: string;
  score: number;
  feedback: string;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { interviewId, questionId, answer } = await req.json();

  const interview = await prisma.mockInterview.findUnique({
    where: { id: interviewId }
  });

  if (!interview || interview.userId !== session.user.id) {
    throw new ApiError("Forbidden", 403);
  }

  const questions = interview.questions as unknown as InterviewQuestion[];
  const question = questions.find(q => String(q.id) === String(questionId));

  if (!question) {
    throw new ApiError("Question not found in this session", 404);
  }

  // 1. AI Score this specific answer
  const systemPrompt = `You are a Technical Interviewer. Evaluate the candidate's answer to this question.
  Question: ${question.question}
  Answer: ${answer}

  Return ONLY JSON: { "score": 0-100, "feedback": "Brief critique" }`;

  try {
    const evaluation = await runAI("Evaluate this interview answer.", systemPrompt, true) as { score: number, feedback: string };

    // 2. Append to answers array
    const currentAnswers = (interview.answers as unknown as InterviewAnswer[]) || [];
    const newAnswer: InterviewAnswer = {
      questionId,
      answer,
      score: evaluation.score ?? 50,
      feedback: evaluation.feedback ?? "Good effort."
    };

    const updatedAnswers = [...currentAnswers, newAnswer];

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: { answers: updatedAnswers as unknown as Prisma.InputJsonValue } // Cast to Prisma.InputJsonValue for JSON storage
    });

    return NextResponse.json({ evaluation, isFinished: updatedAnswers.length === questions.length });
  } catch (aiError: unknown) {
    logger.error("AI Evaluation failed:", aiError instanceof Error ? aiError.message : String(aiError));
    throw new ApiError("AI failed to evaluate your answer. Please try again.", 500);
  }
});
