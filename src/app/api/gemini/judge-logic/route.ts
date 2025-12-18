import { NextResponse } from "next/server";
import { runAI, AIError } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { title, description, logic } = await req.json();

    if (!title || !description || !logic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("[Judge Logic API] Judging for:", title);

    const systemPrompt = `You are an expert coding interviewer. Your task is to judge a candidate's logic for a specific coding problem.
Analyze the provided problem and the candidate's explanation.

Guidelines:
1. Check if the logic is correct and efficient.
2. Ensure they haven't missed major edge cases.
3. Don't be too strict on syntax, focus on conceptual understanding.
4. Return a JSON response with the following structure:
{
  "passed": boolean,
  "explanation": "A concise feedback on why it passed or failed.",
  "suggestions": ["suggestion 1", "suggestion 2"] // optional, especially if failed
}

IMPORTANT: Return ONLY the JSON object.`;

    const userPrompt = `Problem Title: ${title}
Problem Description: ${description.substring(0, 1000)}

Candidate's Logic:
${logic}`;

    try {
      const responseText = await runAI(userPrompt, systemPrompt, true);
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return NextResponse.json(parsed);
    } catch (e) {
      console.error(`[Judge Logic API] Parse failed:`, e);
      return NextResponse.json({ 
        passed: false, 
        explanation: "The AI failed to analyze your logic. Please try rephrasing it slightly." 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Judge Logic API] Error:", error);
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}