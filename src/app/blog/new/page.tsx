"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import TiptapEditor from "@/features/editor/components/TiptapEditor";

export default function NewBlogPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contests, setContests] = useState<any[]>([]);

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
      // Fetch contests for the dropdown
      axios.get("/api/contest").then(({ data }) => {
          setContests(data.contests || []);
      }).catch(err => console.error(err));
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
    } catch (error: any) {
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
      // Extract excerpt from content (first 150 chars of text)
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
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Write a New Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a catchy title..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] text-lg font-medium focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none placeholder:text-[var(--foreground)]/30"
                />
            </div>

             {/* Cover Image */}
             <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
                    Cover Image
                </label>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverUpload}
                />

                <div className="flex flex-col gap-4">
                    {formData.coverImage ? (
                        <div className="relative w-full h-64 rounded-xl overflow-hidden group border border-[var(--card-border)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={formData.coverImage} 
                                alt="Cover" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                                    title="Change Image"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeCoverImage}
                                    className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors"
                                    title="Remove Image"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-[var(--card-border)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent-gradient-to)] hover:bg-[var(--foreground)]/5 transition-all group"
                        >
                            {uploadingCover ? (
                                <div className="flex flex-col items-center gap-2 text-[var(--foreground)]/60">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-[var(--foreground)]/40 group-hover:text-[var(--accent-gradient-to)]">
                                    <ImageIcon className="w-8 h-8" />
                                    <span className="text-sm font-medium">Click to upload cover image</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Contest Link (Optional) */}
            <div>
                 <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
                    Link to Contest (Optional)
                 </label>
                 <select
                    value={formData.contestId}
                    onChange={(e) => setFormData({ ...formData, contestId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none"
                 >
                    <option value="">-- Select a contest --</option>
                    {contests.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.title} ({c.status})
                        </option>
                    ))}
                 </select>
                 <p className="text-xs text-[var(--foreground)]/40 mt-1">
                    Linking this post to a contest helps others find solutions/editorials for it.
                 </p>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
                    Tags (comma separated)
                </label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tutorial, dynamic-programming, contest-123..."
                    className="w-full px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none"
                />
            </div>

            {/* Content Editor */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">
                    Content
                </label>
                <div className="prose-editor-wrapper">
                    <TiptapEditor
                        description={formData.content}
                        onChange={(html) => setFormData({ ...formData, content: html })}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={isSubmitting || uploadingCover}
                    className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" /> Publish Post
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </main>
  );
}
