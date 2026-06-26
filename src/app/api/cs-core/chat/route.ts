import { NextResponse } from "next/server";
import { runAI } from "@/lib/gemini";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ResponseSchema = z.object({
  response: z.string().describe("Your direct response to the student."),
  internal_analysis: z.string().describe("Your internal thought process on the student's answer."),
  knowledge_profile_update: z.string().nullable().describe("If you detected a weakness, describe it concisely so we can store it. If not, return null.")
});

export const GET = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  if (!topicId) throw new ApiError("Topic ID required", 400);

  const chat = await prisma.aiChat.findUnique({
    where: { userId_problemId: { userId: session.user.id, problemId: "cs_core_" + topicId } }
  });

  return NextResponse.json({ messages: chat?.messages || [] });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);
  const userId = session.user.id;

  const body = await req.json();
  const { messages, topic, topicId } = body;

  if (!messages || !Array.isArray(messages) || !topic || !topicId) {
    throw new ApiError("Invalid request", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const pastWeaknesses = user?.aiProfileFeedback || "None recorded yet.";

  const systemPrompt = `You are the CS Core Simplifier AI. Your goal is to explain CS Core topics using the Feynman Technique. 
Topic: ${topic}
Student's Known Weaknesses (Remember these and tailor your approach): ${pastWeaknesses}

Method: Use a simple analogy first. 
Practicality: Connect theory to actual system structures (e.g. Linux kernel).
Rules: 
1. Ask the user to explain parts of the concept to you to check their understanding.
2. If they use too much jargon, tell them to simplify.
3. Be relentless but encouraging.
4. If you notice a fundamental misunderstanding, record it in 'knowledge_profile_update' so we can drill them on it next time.`;

  let conversationText = "";
  for (const msg of messages) {
    conversationText += `\n${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`;
  }
  
  const userPrompt = `Conversation History: ${conversationText}\n\nRespond to the Student's last message as the Tutor. Provide your internal analysis and the final response.`;

  try {
    const aiResult = await runAI(userPrompt, systemPrompt, ResponseSchema) as z.infer<typeof ResponseSchema>;
    
    const newMessages = [
      ...messages,
      { role: "model", content: aiResult.response, internal_analysis: aiResult.internal_analysis }
    ];

    await prisma.aiChat.upsert({
      where: { userId_problemId: { userId, problemId: "cs_core_" + topicId } },
      update: { messages: newMessages },
      create: { userId, problemId: "cs_core_" + topicId, messages: newMessages }
    });

    if (aiResult.knowledge_profile_update) {
      const updatedProfile = pastWeaknesses === "None recorded yet." 
        ? aiResult.knowledge_profile_update 
        : pastWeaknesses + "\n- " + aiResult.knowledge_profile_update;
      
      await prisma.user.update({
        where: { id: userId },
        data: { aiProfileFeedback: updatedProfile }
      });
    }

    return NextResponse.json({ 
      response: aiResult.response, 
      analysis: aiResult.internal_analysis 
    });
  } catch (error: unknown) {
    logger.error("CS Core Chat failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
});
