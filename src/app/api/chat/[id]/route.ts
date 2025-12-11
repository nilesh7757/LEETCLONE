import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: Get messages for a conversation
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
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
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { id } = await params; // conversationId
    const { content, type, fileUrl } = await req.json();

    try {
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
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    } catch (error) {
      console.error("Send message error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
