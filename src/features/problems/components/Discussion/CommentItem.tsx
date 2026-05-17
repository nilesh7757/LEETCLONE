"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { useSession } from "next-auth/react";
import TiptapEditor from "@/features/editor/components/TiptapEditor";
import Link from "next/link";
import DOMPurify from "dompurify";

interface Vote {
  userId: string;
  type: "UP" | "DOWN";
}

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  user: User | null;
  votes: Vote[];
  children?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  problemId: string;
  depth?: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onVote: (commentId: string, type: "UP" | "DOWN") => Promise<void>;
}

export default function CommentItem({
  comment,
  problemId,
  depth = 0,
  onReply,
  onVote,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState(comment.content);

  useEffect(() => {
    setSanitizedContent(DOMPurify.sanitize(comment.content));
  }, [comment.content]);

  const upvotes = comment.votes.filter((v) => v.type === "UP").length;
  const downvotes = comment.votes.filter((v) => v.type === "DOWN").length;
  const userVote = comment.votes.find((v) => v.userId === session?.user?.id);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const author = comment.user || { id: "", name: "Anonymous User", image: null };

  return (
    <div
      className={`space-y-4 ${
        depth > 0 ? "ml-6 pl-6 border-l border-[var(--card-border)]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name || ""}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-[var(--card-border)]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--muted)] border border-[var(--card-border)] flex items-center justify-center">
            <span className="text-xs font-bold uppercase">
              {author.name?.charAt(0) || "U"}
            </span>
          </div>
        )}
        <div>
          <Link
            href={`/profile/${author.id}`}
            className="text-sm font-bold hover:text-[var(--accent-gradient-to)] transition-colors"
          >
            {author.name || "Anonymous User"}
          </Link>
          <p className="text-[10px] text-[var(--foreground)]/50 uppercase tracking-widest">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Comment Body - Switched to client-side DOMPurify to fix SSR crash */}
      <div
        className="prose prose-invert prose-sm max-w-none text-[var(--foreground)]/90 bg-[var(--card-bg)]/50 p-3 rounded-lg border border-[var(--card-border)]"
        dangerouslySetInnerHTML={{
          __html: sanitizedContent,
        }}
      />

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm text-[var(--foreground)]/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onVote(comment.id, "UP")}
            className={`p-1.5 rounded-md hover:bg-[var(--foreground)]/5 transition-colors ${
              userVote?.type === "UP" ? "text-emerald-500 bg-emerald-500/10" : ""
            }`}
          >
            <ThumbsUp size={14} />
          </button>
          <span className="text-xs font-mono font-bold">
            {upvotes - downvotes}
          </span>
          <button
            onClick={() => onVote(comment.id, "DOWN")}
            className={`p-1.5 rounded-md hover:bg-[var(--foreground)]/5 transition-colors ${
              userVote?.type === "DOWN" ? "text-rose-500 bg-rose-500/10" : ""
            }`}
          >
            <ThumbsDown size={14} />
          </button>
        </div>

        <button
          onClick={() => setIsReplying(!isReplying)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--foreground)]/5 transition-colors ${
            isReplying ? "text-[var(--accent-gradient-to)]" : ""
          }`}
        >
          <Reply size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Reply
          </span>
        </button>
      </div>

      {isReplying && (
        <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <TiptapEditor
            content={replyContent}
            onChange={setReplyContent}
            placeholder="Write your reply..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsReplying(false)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={isSubmitting || !replyContent.trim()}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div className="space-y-4 mt-4">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              problemId={problemId}
              depth={depth + 1}
              onReply={onReply}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
