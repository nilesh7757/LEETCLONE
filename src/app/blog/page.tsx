"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Edit3, User, Search, ArrowRight, 
  Sparkles, BookOpen, Filter 
} from "lucide-react";
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
    id: string;
    name: string;
    image: string;
  };
  contest?: {
    title: string;
  };
}

const getTagColor = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('dp') || t.includes('dynamic')) return 'var(--viz-deep-purple)';
  if (t.includes('graph') || t.includes('tree')) return 'var(--viz-rose)';
  if (t.includes('sort') || t.includes('array')) return 'var(--viz-amber)';
  if (t.includes('search') || t.includes('string')) return 'var(--viz-cyan)';
  return 'var(--viz-slate)';
};

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
    <main className="min-h-screen w-full relative pb-20 overflow-x-hidden">
       {/* Deep Atmosphere */}
       <div className="fixed inset-0 pointer-events-none -z-10 bg-[var(--background)]">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--viz-purple)]/5 rounded-full blur-[120px] opacity-60" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[var(--viz-blue)]/5 rounded-full blur-[120px] opacity-60" />
       </div>
       
      <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20 space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm"
            >
                <BookOpen size={14} className="text-[var(--viz-purple)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Knowledge Base</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40">
                Community Blog
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
                Insights, algorithms, and architectural patterns shared by the LogiQuest engineering community.            </p>

            {/* Action Bar */}
            <div className="w-full max-w-2xl mt-8 flex flex-col md:flex-row gap-4 relative z-20">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-purple)] rounded-2xl opacity-20 blur-md group-focus-within:opacity-40 transition-opacity" />
                    <div className="relative flex items-center bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg group-focus-within:border-[var(--viz-cyan)]/50 transition-colors">
                        <Search className="ml-4 w-5 h-5 text-[var(--muted-foreground)]" />
                        <input 
                            type="text" 
                            placeholder="Search by title, tag, or author..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-4 bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none font-medium"
                        />
                    </div>
                </div>
                
                {session?.user && (
                    <Link
                        href="/blog/new"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl whitespace-nowrap"
                    >
                        <Edit3 className="w-4 h-4" /> 
                        <span>New Post</span>
                    </Link>
                )}
            </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[400px] rounded-[2rem] bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              ))}
           </div>
        ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border border-dashed border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-sm text-center px-4">
                <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mb-6">
                    <Filter className="w-8 h-8 text-[var(--muted-foreground)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">No transmissions found</h3>
                <p className="text-[var(--muted-foreground)]">Try adjusting your search filters or start a new discussion.</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex flex-col h-full bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-0" aria-label={post.title} />
                
                {/* Decoration Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent group-hover:via-[var(--viz-cyan)] transition-all duration-700" />

                <div className="p-8 flex-1 flex flex-col relative z-10 pointer-events-none h-full">
                  {/* Tags Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-6 pointer-events-auto min-h-[28px]">
                     {post.contest && (
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-[var(--viz-amber)]/10 text-[var(--viz-amber)] rounded-lg border border-[var(--viz-amber)]/20 flex items-center gap-1">
                            <Sparkles size={10} /> Contest
                        </span>
                     )}
                     {post.tags.slice(0, 3).map(tag => {
                        const color = getTagColor(tag);
                        return (
                            <button 
                                key={tag} 
                                onClick={(e) => { e.preventDefault(); setSearchQuery(tag); }}
                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-transparent hover:border-current transition-colors cursor-pointer"
                                style={{ backgroundColor: `${color}15`, color: color }}
                            >
                                {tag}
                            </button>
                        );
                     })}
                  </div>

                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 line-clamp-2 leading-tight group-hover:text-[var(--viz-cyan)] transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-[var(--muted-foreground)] text-sm mb-8 line-clamp-3 leading-relaxed flex-1 font-light">
                    {post.excerpt || "Click to read the full analysis..."}
                  </p>

                  <div className="flex items-end justify-between mt-auto pt-6 border-t border-[var(--border)]/50">
                    <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 pointer-events-auto group/author">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-[var(--muted)] overflow-hidden shadow-sm border border-[var(--border)] group-hover/author:border-[var(--viz-cyan)] transition-colors">
                                {post.author.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--viz-cyan)] rounded-full border-2 border-[var(--card)] opacity-0 group-hover/author:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-[var(--foreground)] group-hover/author:text-[var(--viz-cyan)] transition-colors">{post.author.name}</span>
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </Link>
                    
                    <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--viz-cyan)] group-hover:bg-[var(--viz-cyan)] group-hover:text-black transition-all duration-300">
                        <ArrowRight size={16} />
                    </div>
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
