import { NextRequest, NextResponse } from "next/server";
import { chatWithAI, chatWithAIStream, AIError } from "@/lib/gemini";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages, context, stream = false } = body;

    if (!messages || !Array.isArray(messages) || !context) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (stream) {
      const resultStream = await chatWithAIStream(messages, context);
      
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of resultStream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const responseText = await chatWithAI(messages, context);
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini Chat Error Details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    if (error instanceof AIError && error.status === 429) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    
    const status = error.status || error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || "Internal Server Error";
    
    return NextResponse.json({ error: message }, { status });
  }
}