"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Edit2, Book, Hash, Image, Zap, FileText, Upload, X, Loader2 } from "lucide-react"; 
import { toast } from "sonner";
import axios from "axios";
import TiptapEditor from "@/components/TiptapEditor";

interface BlogFormData {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string; // Comma separated string for tags
}

interface BlogEditClientProps {
  initialPost: {
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
  };
}

export default function BlogEditClient({ initialPost }: BlogEditClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState(initialPost.content);
  
  // Cover Image Upload State
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: initialPost.title,
      excerpt: initialPost.excerpt || "",
      content: initialPost.content,
      coverImage: initialPost.coverImage || "",
      tags: initialPost.tags.join(", "),
    },
  });

  const coverImageUrl = watch("coverImage");

  const onSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    toast.info("Updating blog post...");

    try {
      await axios.patch(`/api/blog/${initialPost.slug}`, {
        title: data.title,
        excerpt: data.excerpt,
        content: editorContent, // Use state for Tiptap content
        coverImage: data.coverImage,
        tags: data.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      });
      toast.success("Blog post updated successfully!");
      router.push(`/blog/${initialPost.slug}`);
    } catch (error: any) {
      console.error("Failed to update blog post:", error);
      toast.error(error.response?.data?.error || "Failed to update blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setValue("coverImage", res.data.url);
      toast.success("Cover image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const removeCoverImage = () => {
    setValue("coverImage", "");
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-8 space-y-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-center text-[var(--foreground)]">
          Edit Blog Post: {initialPost.title}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Title
            </label>
            <div className="relative">
              <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
              <input
                id="title"
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                placeholder="Blog Post Title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Excerpt (Short Summary)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-[var(--foreground)]/60" />
              <textarea
                id="excerpt"
                {...register("excerpt")}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none resize-y"
                placeholder="A brief summary of your blog post"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Cover Image
            </label>
            
            <input 
                type="hidden" 
                {...register("coverImage")} 
            />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverUpload}
            />

            <div className="flex flex-col gap-4">
                {coverImageUrl ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden group border border-[var(--card-border)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={coverImageUrl} 
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
                                <Image className="w-8 h-8" />
                                <span className="text-sm font-medium">Click to upload cover image</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Tags (comma-separated)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/60" />
              <input
                id="tags"
                type="text"
                {...register("tags")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none"
                placeholder="e.g., programming, tutorial, leetcode"
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
              Content
            </label>
            <TiptapEditor description={initialPost.content} onChange={setEditorContent} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploadingCover}
            className="w-full px-6 py-3 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <Loader />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Update Blog Post
          </button>
        </form>
      </motion.div>
    </main>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center space-x-2 text-[var(--foreground)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-4 h-4 border-2 border-[var(--foreground)]/50 border-t-[var(--foreground)] rounded-full"
      />
      <span>Loading...</span>
    </div>
  );
}
