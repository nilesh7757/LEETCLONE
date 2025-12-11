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

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Failed to post comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
