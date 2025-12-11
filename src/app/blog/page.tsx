"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, User, Calendar, Tag, Search, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
  tags: string[];
  author: {
    name: string;
    image: string;
  };
  contest?: {
    title: string;
  };
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get("/api/blog");
        setPosts(data.posts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
       {/* Background Elements */}
       <div className="fixed inset-0 bg-grid-pattern opacity-5 -z-10" />
       
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Community Blog</h1>
            <p className="text-[var(--foreground)]/60">Share your knowledge, contest solutions, and experiences.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                <input 
                  type="text" 
                  placeholder="Search posts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                />
             </div>
             {session?.user && (
                <Link
                    href="/blog/new"
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                >
                    <Edit3 className="w-4 h-4" /> Write Post
                </Link>
             )}
          </div>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                  <div key={i} className="h-64 rounded-2xl bg-[var(--card-bg)] animate-pulse border border-[var(--card-border)]" />
              ))}
           </div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 border border-[var(--card-border)] rounded-2xl bg-[var(--card-bg)]">
                <MessageSquare className="w-12 h-12 text-[var(--foreground)]/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)]">No posts found</h3>
                <p className="text-[var(--foreground)]/60">Be the first to share something!</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col h-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[var(--foreground)]/20 transition-all"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                     {post.contest && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                            Contest Solution
                        </span>
                     )}
                     <div className="flex gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-medium bg-[var(--foreground)]/5 text-[var(--foreground)]/60 rounded-full">
                                {tag}
                            </span>
                        ))}
                     </div>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block group-hover:text-[var(--accent-gradient-to)] transition-colors">
                     <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 line-clamp-2">{post.title}</h2>
                  </Link>
                  
                  <p className="text-[var(--foreground)]/60 text-sm mb-6 line-clamp-3 flex-1">
                    {post.excerpt || "No excerpt available."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)] mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                             {post.author.image ? (
                                 <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                             ) : (
                                 <User className="w-full h-full p-1.5 text-[var(--foreground)]/40" />
                             )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-[var(--foreground)]">{post.author.name}</span>
                            <span className="text-[10px] text-[var(--foreground)]/40">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-[var(--foreground)]/40 hover:text-[var(--accent-gradient-to)] transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
