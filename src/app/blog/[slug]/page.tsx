import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, Edit } from "lucide-react"; // Added Edit icon
import { Metadata } from "next";
import { auth } from "@/auth"; // Import auth for session

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true }
  });

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      contest: {
        select: {
            id: true,
            title: true
        }
      }
    },
  });

  if (!post) {
    notFound();
  }

  const session = await auth();
  const isAuthorOrAdmin = session?.user?.id === post.authorId || session?.user?.role === "ADMIN";

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            {isAuthorOrAdmin && (
                <Link 
                    href={`/blog/${post.slug}/edit`} 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Edit className="w-4 h-4" /> Edit Post
                </Link>
            )}
        </div>

        <article>
          {post.coverImage && (
            <div className="w-full h-64 md:h-96 relative mb-8 rounded-2xl overflow-hidden border border-[var(--card-border)]">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-8">
             <div className="flex flex-wrap gap-2 mb-4">
                {post.contest && (
                    <Link href={`/contest/${post.contest.id}`} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                        Solution for: {post.contest.title}
                    </Link>
                )}
                {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--foreground)]/5 text-[var(--foreground)]/60">
                        {tag}
                    </span>
                ))}
             </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                        {post.author.image ? (
                            <img src={post.author.image} alt={post.author.name || "Author"} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-2 text-[var(--foreground)]/40" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-[var(--foreground)]">{post.author.name}</div>
                        <div className="text-sm text-[var(--foreground)]/60">{post.author.bio || "Community Member"}</div>
                    </div>
                </div>
                <div className="text-right text-sm text-[var(--foreground)]/60">
                    <div className="flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
          </header>

          <div 
            className="prose prose-invert max-w-none text-[var(--foreground)]/90 prose-headings:text-[var(--foreground)] prose-a:text-[var(--accent-gradient-to)] prose-strong:text-[var(--foreground)] prose-code:text-[var(--accent-gradient-to)] prose-pre:bg-[var(--card-bg)] prose-pre:border prose-pre:border-[var(--card-border)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </main>
  );
}
