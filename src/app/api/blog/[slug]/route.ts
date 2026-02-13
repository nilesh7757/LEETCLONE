import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const { slug } = await params;
  const { title, excerpt, content, coverImage, tags } = await req.json();

  const existingPost = await prisma.blogPost.findUnique({
    where: { slug },
    select: { authorId: true, published: true },
  });

  if (!existingPost) {
    throw new ApiError("Blog post not found", 404);
  }

  // Authorization: Only the author or an admin can update the post
  if (session.user.id !== existingPost.authorId && session.user.role !== "ADMIN") {
    throw new ApiError("Forbidden: You are not authorized to edit this post.", 403);
  }

  const updatedPost = await prisma.blogPost.update({
    where: { slug },
    data: {
      title: title,
      excerpt: excerpt,
      content: content,
      coverImage: coverImage,
      tags: tags,
    },
  });

  return NextResponse.json({ post: updatedPost });
});