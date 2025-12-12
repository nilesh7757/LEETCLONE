import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

// Helper function to interact with Gemini API
async function generateEditorialWithGemini(description: string, referenceSolution: string, language: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is not set");
  }

  const prompt = `
You are an expert competitive programmer and technical writer. 
Generate a comprehensive editorial for the following coding problem.

**Problem Description:**
${description}

**Reference Solution (${language}):**
\`\`\`${language}
${referenceSolution}
\`\`\`

**Requirements:**
1.  **Explanation:** Explain the intuition, approach, and algorithm used in the reference solution. Be clear and concise.
2.  **Complexity Analysis:** specific Time and Space complexity analysis.
3.  **Multi-Language Solutions:** Convert the provided reference solution into the following languages: JavaScript, Python, Java, C++, C#, Go, Ruby, Swift, Rust, PHP. 
    - Provide the code for each language in a separate markdown code block.
    - Ensure the code is idiomatic for that language.
4.  **Format:** Return the output in Markdown format. Do not wrap the entire output in a single code block; use standard markdown headers, text, and specific code blocks for the code.
`;

  const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Low temperature for more deterministic code conversion
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const candidate = response.data.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      }
    } catch (error: any) {
      console.warn(`Model ${model} failed for editorial generation:`, error.message);
      // Continue to next model
    }
  }
  throw new Error("All AI models failed to generate editorial.");
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch problem to verify ownership and get details
  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  if (problem.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!problem.referenceSolution) {
      return NextResponse.json({ error: "Reference solution is required to generate an editorial." }, { status: 400 });
  }

  try {
    // Defaulting language to javascript if not detectable (though in our app we usually know it contextually, 
    // but the DB only stores the string. We can try to infer or pass it in body if we wanted to be precise, 
    // but the AI usually detects it fine).
    // Actually, let's allow passing language in body, or default to "code".
    const { language = "code" } = await req.json().catch(() => ({})); 

    const editorialContent = await generateEditorialWithGemini(
      problem.description,
      problem.referenceSolution,
      language
    );

    // Update the problem with the generated editorial
    const updatedProblem = await prisma.problem.update({
      where: { id: problem.id },
      data: { editorial: editorialContent },
    });

    return NextResponse.json({ editorial: updatedProblem.editorial });

  } catch (error: any) {
    console.error("Editorial generation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate editorial" }, { status: 500 });
  }
}
