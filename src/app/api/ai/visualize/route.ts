import { NextResponse } from "next/server";
import { runAI } from "@/lib/gemini";
import { z } from "zod";
import { logger } from "@/lib/logger";

const VisualizeSchema = z.object({
  steps: z.array(z.object({
    description: z.string(),
    variables: z.record(z.string(), z.any()),
    highlightLines: z.array(z.number())
  })),
  summary: z.string()
});

export async function POST(req: Request) {
  try {
    const { code, language, input, problemTitle } = await req.json();

    if (!code || !input) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `
      Visualize the execution of this ${language} code for the input: "${input}".
      Problem: ${problemTitle}
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Break down the execution into 5-8 key steps. For each step, provide:
      1. A description of what is happening.
      2. The current state of important variables.
      3. The line numbers to highlight.

      Return the result in JSON format.
    `;

    const result = await runAI(prompt, "You are a master debugger and visualizer.", VisualizeSchema);

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[API_VISUALIZE] Error:", error);
    return NextResponse.json({ error: "Visualization failed" }, { status: 500 });
  }
}
