import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ messageId: string }> }) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { messageId } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "me" or "everyone"

  const message = await (prisma.message as any).findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          participants: true
        }
      }
    }
  });

  if (!message) {
    throw new ApiError("Message not found", 404);
  }

  const isParticipant = message.conversation.participants.some((p: any) => p.userId === session.user.id);
  if (!isParticipant) {
    throw new ApiError("Forbidden", 403);
  }

  if (type === "everyone") {
    if (message.senderId !== session.user.id) {
      throw new ApiError("Forbidden: Only sender can delete for everyone", 403);
    }

    await (prisma.message as any).update({
      where: { id: messageId },
      data: { isDeletedForEveryone: true }
    });
  } else {
    const currentDeleted = message.deletedForUsers ? message.deletedForUsers.split(",") : [];
    if (!currentDeleted.includes(session.user.id)) {
      currentDeleted.push(session.user.id);
    }

    await (prisma.message as any).update({
      where: { id: messageId },
      data: { deletedForUsers: currentDeleted.join(",") }
    });
  }

  return NextResponse.json({ success: true });
});
