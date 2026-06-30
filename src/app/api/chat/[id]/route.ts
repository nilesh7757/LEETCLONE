import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

// GET: Get messages for a conversation
export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { id } = await params;

  // Verify participation
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId: id
      }
    }
  });

  if (!participation) {
    throw new ApiError("Forbidden", 403);
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: {
        select: { id: true, name: true, image: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ messages });
});

// POST: Send a message
export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { id } = await params; // conversationId
  const { content, type, fileUrl } = await req.json();

  // Verify participation
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId: id
      }
    }
  });

  if (!participation) {
    throw new ApiError("Forbidden", 403);
  }

  const message = await prisma.message.create({
    data: {
      content,
      type: type || "TEXT",
      fileUrl,
      conversationId: id,
      senderId: session.user.id
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true }
      }
    }
  });
  
  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return NextResponse.json({ message });
});

// DELETE: Clear all messages in a conversation
export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { id } = await params;

  // Verify participation
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId: id
      }
    }
  });

  if (!participation) {
    throw new ApiError("Forbidden", 403);
  }

  // Delete all messages in the conversation
  await prisma.message.deleteMany({
    where: { conversationId: id }
  });

  return NextResponse.json({ success: true });
});
