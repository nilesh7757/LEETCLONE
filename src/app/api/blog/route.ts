import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

// GET /api/blog - List all published blog posts
export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const contestId = searchParams.get("contestId");
  
  const whereClause: { published: boolean; contestId?: string } = {
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
});

// POST /api/blog - Create a new blog post
export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const { title, content, excerpt, coverImage, tags, contestId, problemId, published } = await req.json();

  if (!title || !content) {
    throw new ApiError("Title and content are required", 400);
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
});
