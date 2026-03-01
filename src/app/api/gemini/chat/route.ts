import { NextResponse } from "next/server";
import { chatWithAI, chatWithAIStream, AIError } from "@/lib/gemini";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    throw new ApiError("Problem ID is required", 400);
  }

  const chat = await prisma.aiChat.findUnique({
    where: {
      userId_problemId: {
        userId: session.user.id,
        problemId
      }
    }
  });

  return NextResponse.json({ messages: chat?.messages || [] });
});

export const DELETE = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) throw new ApiError("Problem ID required", 400);

  await prisma.aiChat.delete({
    where: { userId_problemId: { userId: session.user.id, problemId } }
  });

  return NextResponse.json({ success: true });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }
  const userId = session.user.id;

  const body = await req.json();
  const { messages, context, stream = false } = body;
  const problemId = context.problemId;

  if (!messages || !Array.isArray(messages) || !context || !problemId) {
    throw new ApiError("Invalid request body. problemId is required in context.", 400);
  }

  // Helper to persist chat
  const persistChat = async (allMessages: unknown[]) => {
    try {
      await prisma.aiChat.upsert({
        where: { userId_problemId: { userId, problemId } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        update: { messages: allMessages as any },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: { userId, problemId, messages: allMessages as any }
      });
    } catch (err) {
      logger.error("Failed to persist chat:", err);
    }
  };

  if (stream) {
    const resultStream = await chatWithAIStream(messages, context);
    
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
          
          // Save the full conversation after streaming finishes
          const newMessages = [
            ...messages,
            { role: "model", parts: [{ text: fullResponse }] }
          ];
          await persistChat(newMessages);

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
    
    // Save the full conversation
    const newMessages = [
      ...messages,
      { role: "model", parts: [{ text: responseText }] }
    ];
    await persistChat(newMessages);

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    if (error instanceof AIError && error.status === 429) {
      throw error;
    }
    logger.error("Chat with AI failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
});
