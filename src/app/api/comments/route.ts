import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    throw new ApiError("Missing problemId", 400);
  }

  // Fetch all comments for the problem (flat list)
  // We will rebuild the tree on the client side
  const comments = await prisma.comment.findMany({
    where: { problemId },
    include: {
      user: { 
        select: { id: true, name: true, image: true } 
      },
      votes: true
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ comments });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { problemId, content, parentId } = await req.json();

  if (!content || !problemId) {
    throw new ApiError("Missing fields", 400);
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      problemId,
      userId: session.user.id,
      parentId: parentId || null
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      votes: true
    }
  });

  let notification = null;

  // Notification Logic
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { userId: true }
    });

    if (parentComment && parentComment.userId !== session.user.id) {
      notification = await prisma.notification.create({
        data: {
          type: "COMMENT_REPLY",
          userId: parentComment.userId, // Recipient
          senderId: session.user.id,
          message: `${session.user.name || "Someone"} replied to your comment.`,
          link: `/problems/${problemId}`, // TODO: Add deep link to comment
        },
        include: {
          sender: { select: { id: true, name: true, image: true } }
        }
      });
    }
  }

  return NextResponse.json({ comment, notification });
});
