import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { id } = await params; // conversationId
  const { messageIds } = await req.json();

  if (!messageIds || !Array.isArray(messageIds)) {
    throw new ApiError("Invalid payload", 400);
  }

  await (prisma.message as any).updateMany({
    where: {
      id: { in: messageIds },
      conversationId: id
    },
    data: { status: "SEEN" }
  });

  return NextResponse.json({ success: true });
});
