"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon, Tag, Hash, Link as LinkIcon, PenTool, Sparkles } from "lucide-react";
import Link from "next/link";
import TiptapEditor from "@/features/editor/components/TiptapEditor";
import { motion, AnimatePresence } from "framer-motion";

interface Contest {
  id: string;
  title: string;
}

export default function NewBlogPostPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contests, setContests] = useState<Contest[]>([]);

  // Cover Image State
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    contestId: "",
    coverImage: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
      axios.get("/api/contest").then(({ data }) => {
          setContests(data.contests || []);
      }).catch(err => console.error("Failed to fetch contests:", err));
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({ ...prev, coverImage: res.data.url }));
      toast.success("Cover image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formData.content;
      const textContent = tempDiv.textContent || "";
      const excerpt = textContent.slice(0, 150) + (textContent.length > 150 ? "..." : "");

      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);

      await axios.post("/api/blog", {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        excerpt,
        coverImage: formData.coverImage,
        contestId: formData.contestId || undefined,
        published: true,
      });

      toast.success("Post published successfully!");
      router.push("/blog");
    } catch (error) {
      console.error("Failed to publish post:", error);
      toast.error("Failed to publish post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return null;

  return (
    <main className="min-h-screen w-full relative pb-20 overflow-x-hidden pt-24">
      {/* Deep Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[var(--background)]">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[var(--viz-cyan)]/5 rounded-full blur-[150px] opacity-40" />
         <div className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-[var(--viz-purple)]/5 rounded-full blur-[150px] opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)]/50 backdrop-blur-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--viz-cyan)]/30 transition-all mb-8 text-xs font-bold uppercase tracking-wider shadow-sm group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Transmission Abort
        </Link>

        <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] border border-[var(--viz-cyan)]/20 shadow-[0_0_20px_rgba(var(--viz-cyan-rgb),0.15)]">
                <PenTool size={24} />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight">New Broadcast</h1>
                <p className="text-[var(--muted-foreground)] font-light mt-1">Share your neural patterns with the collective.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Editor Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-10 rounded-[2.5rem] bg-[var(--card)]/30 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
                <div className="space-y-8 relative z-10">
                    {/* Title */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 group-focus-within:text-[var(--viz-cyan)] transition-colors">
                            <Sparkles size={12} /> Headline Signal
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter a catchy title..."
                            className="w-full bg-transparent text-[var(--foreground)] text-3xl md:text-4xl font-bold placeholder:text-[var(--muted-foreground)]/20 focus:outline-none pb-4 transition-all"
                        />
                    </div>

                    {/* Cover Image Dropzone */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                            <ImageIcon size={12} /> Visual Context
                        </label>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverUpload}
                        />

                        <AnimatePresence mode="wait">
                            {formData.coverImage ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative w-full h-72 rounded-3xl overflow-hidden group shadow-2xl"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={formData.coverImage} 
                                        alt="Blog post cover image" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" /> Replace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeCoverImage}
                                            className="px-6 py-3 bg-red-500/20 backdrop-blur-md rounded-xl text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500/30 transition-all flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Clear
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-[var(--background)]/30 hover:bg-[var(--viz-purple)]/5 transition-all group relative overflow-hidden"
                                >
                                    {uploadingCover ? (
                                        <div className="flex flex-col items-center gap-3 text-[var(--viz-purple)]">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)] group-hover:text-[var(--viz-purple)] transition-colors relative z-10">
                                            <div className="p-3 rounded-full bg-[var(--background)]/50 group-hover:scale-110 transition-transform shadow-lg">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Drop Cover Image</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contest Link */}
                        <div className="space-y-3 group">
                             <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-amber)] transition-colors">
                                <LinkIcon size={12} /> Contest Association
                             </label>
                             <div className="relative">
                                 <select
                                    value={formData.contestId}
                                    onChange={(e) => setFormData({ ...formData, contestId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)]/30 text-[var(--foreground)] outline-none appearance-none font-mono text-sm shadow-sm transition-all cursor-pointer hover:bg-[var(--background)]/50"
                                 >
                                    <option value="">-- No Association --</option>
                                    {contests.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                 </select>
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
                                     <ChevronDownIcon size={14} />
                                 </div>
                             </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3 group">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors">
                                <Hash size={12} /> Semantic Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="dp, graph, tutorial..."
                                className="w-full px-4 py-3 rounded-xl bg-[var(--background)]/30 text-[var(--foreground)] font-mono text-sm outline-none shadow-sm transition-all focus:bg-[var(--background)]/50"
                            />
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-3 pt-4">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                            <PenTool size={12} /> Transmission Content
                        </label>
                        <div className="prose-editor-wrapper rounded-[2.5rem] overflow-hidden">
                            <TiptapEditor
                                description={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting || uploadingCover}
                    className="relative group px-10 py-4 bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_10px_30px_-10px_rgba(var(--foreground-rgb),0.3)] overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSubmitting ? "Broadcasting..." : "Execute Publish"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
            </div>
        </form>
      </div>
    </main>
  );
}

const ChevronDownIcon = ({ size }: { size?: number }) => (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);