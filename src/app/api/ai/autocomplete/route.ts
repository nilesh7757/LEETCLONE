import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prefix, suffix, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 64, // Keep completion suggestions short and fast
        temperature: 0.1,    // Keep suggestions deterministic
      }
    });

    const systemPrompt = `You are a professional software engineer assistant. Your task is to autocomplete the code at the cursor position, which lies between the prefix and suffix.
Respond with the completed code ONLY. Do NOT repeat the prefix or suffix. Do NOT add markdown backticks or explanations. Output the exact characters that should be inserted.`;

    const userPrompt = `Language: ${language}

--- PREFIX START ---
${prefix}
--- PREFIX END ---

--- SUFFIX START ---
${suffix}
--- SUFFIX END ---

Provide the missing code to insert:`;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    let text = response.text();

    // Clean up if the model wrapped in markdown block backticks
    if (text.startsWith("```")) {
      // Remove starting ```[language]
      text = text.replace(/^```[a-zA-Z0-9+#]*\n/, "");
      // Remove trailing ```
      text = text.replace(/\n```$/, "");
      text = text.replace(/```$/, "");
    }

    return NextResponse.json({ suggestion: text });
  } catch (error: unknown) {
    console.error("AI Autocomplete API error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
