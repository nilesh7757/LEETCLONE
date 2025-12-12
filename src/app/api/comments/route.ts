import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) return NextResponse.json({ error: "Missing problemId" }, { status: 400 });

  try {
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
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { problemId, content, parentId } = await req.json();

    if (!content || !problemId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

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
  } catch (error) {
    console.error("Failed to post comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
