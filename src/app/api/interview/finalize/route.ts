import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

interface InterviewAnswer {
  score: number;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { interviewId } = await req.json();

  const interview = await prisma.mockInterview.findUnique({
    where: { id: interviewId }
  });

  if (!interview || interview.userId !== session.user.id) {
    throw new ApiError("Forbidden", 403);
  }

  const answers = interview.answers as unknown as InterviewAnswer[];
  
  // 1. Calculate overall score
  const totalScore = answers.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;

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
});
