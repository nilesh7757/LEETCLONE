import { NextRequest, NextResponse } from "next/server";
import { chatWithAI, chatWithAIStream, AIError } from "@/lib/gemini";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const body = await req.json();
  const { messages, context, stream = false } = body;

  if (!messages || !Array.isArray(messages) || !context) {
    throw new ApiError("Invalid request body", 400);
  }

  if (stream) {
    const resultStream = await chatWithAIStream(messages, context);
    
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (error) {
          logger.error("Streaming error:", error instanceof Error ? error.message : String(error));
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const responseText = await chatWithAI(messages, context);
    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    if (error instanceof AIError && error.status === 429) {
      throw error;
    }
    logger.error("Chat with AI failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
});