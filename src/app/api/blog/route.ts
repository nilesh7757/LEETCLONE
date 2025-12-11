import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/blog - List all published blog posts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get("contestId");
    
    const whereClause: any = {
      published: true,
    };

    if (contestId) {
      whereClause.contestId = contestId;
    }

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        contest: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/blog - Create a new blog post
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, excerpt, coverImage, tags, contestId, problemId, published } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now();

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        tags: tags || [],
        published: published ?? true, // Default to published for now
        authorId: session.user.id,
        contestId: contestId || null,
        problemId: problemId || null,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
