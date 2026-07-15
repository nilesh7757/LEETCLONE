import { NextResponse } from "next/server";
import { runAI } from "@/lib/gemini";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const algorithmId = searchParams.get("algorithmId");
  if (!algorithmId) throw new ApiError("Algorithm ID required", 400);

  const chat = await prisma.aiChat.findUnique({
    where: { userId_problemId: { userId: session.user.id, problemId: "dsa_viz_" + algorithmId } }
  });

  return NextResponse.json({ messages: chat?.messages || [] });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);
  const userId = session.user.id;

  const body = await req.json();
  const { messages, algorithmId, algorithmName } = body;

  if (!messages || !Array.isArray(messages) || !algorithmId || !algorithmName) {
    throw new ApiError("Invalid request", 400);
  }

  const systemPrompt = `You are the LogiQuest DSA Copilot, an expert algorithms and data structures tutor.
Your goal is to help students learn and master the algorithm: "${algorithmName}".

STRICT GUIDELINES:
1. Explain the algorithm, its runtime/space complexities, use cases, and logic steps clearly.
2. Recommend LogiQuest problems (like "/problems/binary-search" or "/problems/accounts-merge-using-dsu") or LeetCode questions if the user asks for practice questions.
3. Keep your answers relatively concise, structured, and easy to read. Use Markdown, code blocks, and bullet points.
4. If the user asks for suggestions, offer next steps, resources, or code walkthroughs.`;

  let conversationText = "";
  for (const msg of messages) {
    conversationText += `\n${msg.role === 'user' ? 'Student' : 'Copilot'}: ${msg.content}`;
  }

  const userPrompt = `Conversation History: ${conversationText}\n\nRespond to the Student's last message as the Copilot tutor.`;

  try {
    const aiResult = await runAI(userPrompt, systemPrompt);
    const responseText = typeof aiResult === "string" ? aiResult : JSON.stringify(aiResult);

    const newMessages = [
      ...messages,
      { role: "model", content: responseText }
    ];

    await prisma.aiChat.upsert({
      where: { userId_problemId: { userId, problemId: "dsa_viz_" + algorithmId } },
      update: { messages: newMessages },
      create: { userId, problemId: "dsa_viz_" + algorithmId, messages: newMessages }
    });

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    logger.error("DSA Visualizer Chat failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
});
