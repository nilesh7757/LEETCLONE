import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

interface AnswerInput {
  questionId: string;
  content: string;
  isSkipped: boolean;
}

interface InterviewQuestion {
  id: string;
  type: string;
  question: string;
  difficulty?: string;
  category?: string;
  expectedConcepts?: string[];
}

interface AIResult {
  score: number;
  feedback: string;
  categoryScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export const POST = apiHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { answers }: { answers: AnswerInput[] } = await req.json();

  const interview = await prisma.mockInterview.findUnique({
    where: { id }
  });

  if (!interview || interview.userId !== session.user.id) {
    throw new ApiError("Forbidden", 403);
  }

  const questions = interview.questions as unknown as InterviewQuestion[];

  // 1. AI Comprehensive Evaluation Prompt
  const evaluationPrompt = `
    You are a Senior Technical Interviewer. Evaluate the candidate's performance across this mock interview.
    
    Topic: ${interview.topic}
    Difficulty: ${interview.difficulty}
    
    QUESTIONS & ANSWERS:
    ${questions.map((q, i) => `
      Question ${i+1}: ${q.question}
      Type: ${q.type}
      Expected Concepts: ${q.expectedConcepts ? q.expectedConcepts.join(", ") : "N/A"}
      Candidate Answer: ${answers.find(a => String(a.questionId) === String(q.id))?.content || "No answer provided / skipped."}
    `).join("\n\n")}

    TASKS:
    1. Calculate a score for each question.
    2. Group questions by their categories/topics and calculate a score (0-100) for each under 'categoryScores'.
    3. Generate a list of candidate's strengths (at least 2).
    4. Generate a list of candidate's weaknesses (at least 2).
    5. Generate a list of actionable recommendations for improvement (at least 2).
    6. Provide an overall score (0-100).
    7. Provide a detailed summary of their strengths and weaknesses in HTML format.

    Return ONLY JSON:
    {
      "score": 85,
      "feedback": "<p>Excellent performance...</p>",
      "categoryScores": {
        "Coding": 85,
        "Conceptual": 90
      },
      "strengths": [
        "Strong understanding of algorithmic logic",
        "Proper use of data structures"
      ],
      "weaknesses": [
        "Did not consider corner cases for empty inputs",
        "Could optimize space complexity"
      ],
      "recommendations": [
        "Practice more graph algorithms",
        "Study space-time trade-offs"
      ]
    }
  `;

  try {
    let responseText = "";
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        responseText = await runAI("Conduct mock interview submission evaluation.", evaluationPrompt, true);
        if (responseText) break;
      } catch (err) {
        if (retryCount === maxRetries) throw err;
        retryCount++;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount))); // Exponential backoff
      }
    }

    const result: AIResult = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());

    // 2. Format answers for storage
    const formattedAnswers = questions.map((q) => {
      const candAnswer = answers.find(a => String(a.questionId) === String(q.id));
      return {
        questionId: q.id,
        question: q.question,
        answer: candAnswer?.content || "",
        isSkipped: candAnswer?.isSkipped ?? true,
        feedback: "Evaluated successfully"
      };
    });

    // 3. Update DB with evaluation results
    const updatedInterview = await prisma.mockInterview.update({
      where: { id },
      data: {
        answers: formattedAnswers as unknown as Prisma.InputJsonValue,
        score: result.score,
        feedback: result.feedback,
        roadmap: result.recommendations as unknown as Prisma.InputJsonValue,
        status: "COMPLETED"
      }
    });

    // 4. Return results matching frontend InterviewResult structure
    return NextResponse.json({
      score: result.score,
      feedback: result.feedback,
      categoryScores: result.categoryScores || { "Conceptual": result.score },
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      recommendations: result.recommendations || []
    });

  } catch (aiError: unknown) {
    logger.error("Interview submission AI evaluation failed:", aiError instanceof Error ? aiError.message : String(aiError));
    
    // Fallback: Use word count and keyword matching for a basic score if AI fails
    const totalWords = answers.reduce((acc, curr) => acc + curr.content.split(/\s+/).length, 0);
    const fallbackScore = Math.max(10, Math.min(90, Math.floor(totalWords / 4)));
    
    const fallbackResult: AIResult = {
      score: fallbackScore,
      feedback: "<p>Evaluation was simplified due to technical issues. The score reflects response depth and word count.</p>",
      categoryScores: { "General": fallbackScore },
      strengths: ["Attempted all questions"],
      weaknesses: ["AI evaluation was temporarily offline"],
      recommendations: ["Retry the interview evaluation or contact support if the issue persists"]
    };

    const formattedAnswers = questions.map((q) => {
      const candAnswer = answers.find(a => String(a.questionId) === String(q.id));
      return {
        questionId: q.id,
        question: q.question,
        answer: candAnswer?.content || "",
        isSkipped: candAnswer?.isSkipped ?? true,
        feedback: "Simplified fallback evaluation"
      };
    });

    await prisma.mockInterview.update({
      where: { id },
      data: {
        answers: formattedAnswers as unknown as Prisma.InputJsonValue,
        score: fallbackResult.score,
        feedback: fallbackResult.feedback,
        roadmap: fallbackResult.recommendations as unknown as Prisma.InputJsonValue,
        status: "COMPLETED"
      }
    });

    return NextResponse.json(fallbackResult);
  }
});
