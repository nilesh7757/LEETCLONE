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

interface AIResult {
  individualResults: EvaluationResult[];
  overallScore: number;
  overallFeedback: string;
  roadmap: Array<{ topic: string; reason: string; priority: "High" | "Medium" | "Low" }>;
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

  // 1. Save Raw Answers first (as a draft/safety)
  await prisma.mockInterview.update({
    where: { id: interviewId },
    data: {
      answers: answers.map((a: string, i: number) => ({
        questionId: questions[i]?.id || String(i + 1),
        answer: a,
        score: 0,
        feedback: "Pending evaluation..."
      })),
      status: "COMPLETED" // Marking as completed so user can't resubmit, but evaluation is pending
    }
  });

  // 2. AI Comprehensive Evaluation
  const evaluationPrompt = `
    You are a Senior Technical Interviewer. Evaluate the candidate's performance across 5 questions.
    
    QUESTIONS & ANSWERS:
    ${questions.map((q, i) => `
      Q${i+1}: ${q.question}
      Type: ${q.type}
      Candidate Answer: ${answers[i] || "No answer provided."}
    `).join("\n\n")}

    TASKS:
    1. For each answer, provide score, feedback, idealAnswer, and improvement.
    2. Provide an overall score (0-100).
    3. Provide a summary of strengths/weaknesses and a 3-step roadmap.

    Return ONLY JSON:
    {
      "individualResults": [
        { "questionId": "1", "score": 85, "feedback": "...", "idealAnswer": "...", "improvement": "..." },
        ...
      ],
      "overallScore": 80,
      "overallFeedback": "...",
      "roadmap": [
        { "topic": "...", "reason": "...", "priority": "High" },
        ...
      ]
    }
  `;

  try {
    let responseText = "";
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        responseText = await runAI("Conduct final interview evaluation.", evaluationPrompt, true);
        if (responseText) break;
      } catch (err) {
        if (retryCount === maxRetries) throw err;
        retryCount++;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount))); // Exponential backoff
      }
    }

    const result: AIResult = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());

    // 3. Format answers for DB
    const formattedAnswers = result.individualResults.map((res: EvaluationResult, i: number) => ({
      questionId: res.questionId,
      answer: answers[i],
      score: res.score,
      feedback: res.feedback,
      idealAnswer: res.idealAnswer,
      improvement: res.improvement
    }));

    // 4. Update DB with results
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
      interview: updatedInterview
    });

  } catch (aiError: unknown) {
    logger.error("Batch AI Evaluation failed:", aiError instanceof Error ? aiError.message : String(aiError));
    
    // Fallback: Use word count and keyword matching for a very basic score if AI totally fails
    const fallbackScore = Math.min(90, Math.floor(answers.join(" ").split(" ").length / 5));
    
    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        score: fallbackScore,
        feedback: "AI Evaluation was partially interrupted. Results reflect an estimated score based on response depth.",
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ 
      success: true, 
      score: fallbackScore, 
      warning: "Evaluation was simplified due to technical issues."
    });
  }
});
