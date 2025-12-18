import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewId, answers } = await req.json(); // answers is array of strings

    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId }
    });

    if (!interview || interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questions = interview.questions as any[];

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
      1. For each answer, provide a score (0-100) and a brief feedback.
      2. Provide an overall score (0-100).
      3. Provide a detailed summary of strengths and weaknesses in HTML format.
      4. Provide a "roadmap": A list of 3 specific areas to improve and why.

      Return ONLY JSON:
      {
        "individualResults": [
          { "questionId": "1", "score": 85, "feedback": "..." },
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
      const formattedAnswers = result.individualResults.map((res: any, i: number) => ({
        questionId: res.questionId,
        answer: answers[i],
        score: res.score,
        feedback: res.feedback
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

    } catch (aiError) {
      console.error("Batch AI Evaluation failed:", aiError);
      return NextResponse.json({ error: "AI failed to evaluate the interview. Please try again." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Interview Submit All Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
