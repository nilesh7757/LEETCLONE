import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { title, excerpt, content, coverImage, tags } = await req.json();

  try {
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { authorId: true, published: true }, // Select 'published' to maintain its state if not explicitly updated
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Authorization: Only the author or an admin can update the post
    if (session.user.id !== existingPost.authorId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You are not authorized to edit this post." }, { status: 403 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        title: title,
        excerpt: excerpt,
        content: content,
        coverImage: coverImage,
        tags: tags,
        // If the slug changes, we need to handle it carefully. For now, assume slug doesn't change on edit.
        // If title changes, a new slug might be generated, which means the URL would change.
        // This complexity is omitted for initial implementation.
        // published: existingPost.published, // Maintain published status unless explicitly changed in UI
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post", details: error.message },
      { status: 500 }
    );
  }
}