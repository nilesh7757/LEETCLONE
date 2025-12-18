import { NextRequest, NextResponse } from "next/server";
import { chatWithAI, AIError } from "@/lib/gemini";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || !context) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const responseText = await chatWithAI(messages, context);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}