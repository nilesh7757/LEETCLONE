import { NextResponse } from "next/server";
import { predictComplexity } from "@/lib/gemini";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Missing code or language" }, { status: 400 });
    }

    // Call the AI utility we just updated in gemini.ts
    const complexity = await predictComplexity(code, language);

    return NextResponse.json(complexity);
  } catch (error) {
    logger.error("[API_PREDICT_COMPLEXITY] Error:", error);
    return NextResponse.json(
      { timeComplexity: "N/A", spaceComplexity: "N/A", error: "AI service busy" },
      { status: 500 }
    );
  }
}
