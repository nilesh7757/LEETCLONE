import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ChatClient from "./ChatClient";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch conversation and verify access
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          image: true,
                          lastActive: true,
                        }
                      }
          
        }
      }
    }
  });

  if (!conversation) {
    notFound();
  }

  // Check if user is participant
  const isParticipant = conversation.participants.some(p => p.userId === session.user.id);
  if (!isParticipant) {
    redirect("/chat"); // Or 403
  }

  // Identify other user
  const otherUser = conversation.participants.find(p => p.userId !== session.user.id)?.user;
  
  if (!otherUser) {
    redirect("/chat");
  }

  // Get all recipient IDs (everyone except current user)
  const recipientIds = conversation.participants
    .filter(p => p.userId !== session.user.id)
    .map(p => p.userId);

  return (
    <ChatClient 
      conversationId={id} 
      currentUser={{
        id: session.user.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: session.user.name as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image: session.user.image as any,
      }} 
      otherUser={otherUser} 
      recipientIds={recipientIds}
    />
  );
}
