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

interface EvaluationResult {
  questionId: string;
  score: number;
  feedback: string;
  idealAnswer: string;
  improvement: string;
}

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { interviewId, answers } = await req.json();

  const interview = await prisma.mockInterview.findUnique({
    where: { id: interviewId }
  });

  if (!interview || interview.userId !== session.user.id) {
    throw new ApiError("Forbidden", 403);
  }

  const questions = interview.questions as unknown as InterviewQuestion[];

  // 1. AI Comprehensive Evaluation
  const evaluationPrompt = `
    You are a Senior Technical Interviewer. Evaluate the candidate's performance across 5 questions.
    
    QUESTIONS & ANSWERS:
    ${questions.map((q, i) => `
      Q${i+1}: ${q.question}
      Type: ${q.type}
      Candidate Answer: ${answers[i] || "No answer provided."}
    `).join("\n\n")}

    TASKS:
    1. For each answer, provide:
       - score (0-100)
       - feedback: Brief critique of the user's answer.
       - idealAnswer: A detailed, high-quality sample answer that would score 100%.
       - improvement: Specific tips on how to make their answer better.
    2. Provide an overall score (0-100).
    3. Provide a detailed summary of strengths and weaknesses in HTML format.
    4. Provide a "roadmap": A list of 3 specific areas to improve and why.

    Return ONLY JSON:
    {
      "individualResults": [
        { 
          "questionId": "1", 
          "score": 85, 
          "feedback": "...", 
          "idealAnswer": "...", 
          "improvement": "..." 
        },
        ...
      ],
      "overallScore": 80,
      "overallFeedback": "...",
      "roadmap": [
        { "topic": "...", "reason": "...", "priority": "High/Medium/Low" },
        ...
      ]
    }
  `;

  try {
    const responseText = await runAI("Conduct final interview evaluation.", evaluationPrompt, true);
    const result = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());

    // 2. Format answers for DB
    const formattedAnswers = result.individualResults.map((res: EvaluationResult, i: number) => ({
      questionId: res.questionId,
      answer: answers[i],
      score: res.score,
      feedback: res.feedback,
      idealAnswer: res.idealAnswer,
      improvement: res.improvement
    }));

    // 3. Update DB
    const updatedInterview = await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        answers: formattedAnswers,
        score: result.overallScore,
        feedback: result.overallFeedback,
        roadmap: result.roadmap,
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ 
      success: true, 
      score: result.overallScore, 
      feedback: result.overallFeedback,
      roadmap: result.roadmap,
      interview: updatedInterview
    });

  } catch (aiError: unknown) {
    logger.error("Batch AI Evaluation failed:", aiError instanceof Error ? aiError.message : String(aiError));
    throw new ApiError("AI failed to evaluate the interview. Please try again.", 500);
  }
});
