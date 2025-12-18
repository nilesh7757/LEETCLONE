import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: List all conversations for the user
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true, lastActive: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Format for client
    const formatted = conversations.map(c => {
       const otherParticipant = c.participants.find(p => p.userId !== session.user.id)?.user;
       return {
           id: c.id,
           otherUser: otherParticipant,
           lastMessage: c.messages[0],
           updatedAt: c.updatedAt
       };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("Fetch chats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create or Get conversation with a specific user
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { participantId } = await req.json();
      
      // Check if conversation already exists (exact match for 2 participants)
      // Prisma doesn't have a direct "find conversation where participants are exactly [A, B]" easily.
      // Strategy: Find conversations where I am a participant, then filter where Other is participant.
      
      const existingConversations = await prisma.conversation.findMany({
        where: {
          AND: [
             { participants: { some: { userId: session.user.id } } },
             { participants: { some: { userId: participantId } } }
          ]
        },
        take: 1
      });

      if (existingConversations.length > 0) {
          return NextResponse.json({ conversationId: existingConversations[0].id });
      }

      // Create new
      const conversation = await prisma.conversation.create({
          data: {
              participants: {
                  create: [
                      { userId: session.user.id },
                      { userId: participantId }
                  ]
              }
          }
      });
  
      return NextResponse.json({ conversationId: conversation.id });
    } catch (error) {
      console.error("Create chat error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
