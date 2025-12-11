import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import BlogEditClient from "./BlogEditClient"; // Client component for the form

interface BlogEditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Only author or admin can edit
  const isAuthorOrAdmin = session.user.id === post.authorId || session.user.role === "ADMIN";

  if (!isAuthorOrAdmin) {
    redirect(`/blog/${slug}`); // Redirect if not authorized
  }

  // Serialize dates and remove sensitive author info for client
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    // We don't need to pass the author object to the client, just the ID
    author: undefined, 
    // Pass authorId separately if needed on client, though not strictly required for edit
  };

  return (
    <BlogEditClient initialPost={serializedPost} />
  );
}
