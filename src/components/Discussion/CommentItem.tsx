"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, CornerDownRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import TiptapEditor from "@/components/TiptapEditor";
import Link from "next/link";

interface CommentItemProps {
  comment: any;
  problemId: string;
  depth?: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onVote: (commentId: string, type: "UP" | "DOWN") => Promise<void>;
}

export default function CommentItem({ comment, problemId, depth = 0, onReply, onVote }: CommentItemProps) {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate votes
  const upvotes = comment.votes.filter((v: any) => v.type === "UP").length;
  const downvotes = comment.votes.filter((v: any) => v.type === "DOWN").length;
  const score = upvotes - downvotes;
  
  const userVote = comment.votes.find((v: any) => v.userId === session?.user?.id);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setIsReplying(false);
      setReplyContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? "ml-4 pl-4 border-l border-[var(--card-border)]" : ""}`}>
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
        {comment.user?.id ? (
          <Link href={`/profile/${comment.user.id}`} className="font-semibold text-[var(--foreground)] hover:underline hover:text-[var(--accent-gradient-to)] transition-colors">
            {comment.user.name}
          </Link>
        ) : (
          <span className="font-semibold text-[var(--foreground)]">{comment.user?.name || "Anonymous"}</span>
        )}
        <span>•</span>
        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
      </div>

      {/* Comment Body */}
      <div 
        className="prose prose-invert prose-sm max-w-none text-[var(--foreground)]/90 bg-[var(--card-bg)]/50 p-3 rounded-lg border border-[var(--card-border)]"
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm text-[var(--foreground)]/60">
        <div className="flex items-center gap-1 bg-[var(--card-border)]/50 rounded-full px-2 py-0.5">
          <button 
            onClick={() => onVote(comment.id, "UP")}
            className={`p-1 rounded hover:bg-[var(--foreground)]/10 transition-colors cursor-pointer ${userVote?.type === "UP" ? "text-green-500" : ""}`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <span className="font-mono font-medium min-w-[20px] text-center">{score}</span>
          <button 
            onClick={() => onVote(comment.id, "DOWN")}
            className={`p-1 rounded hover:bg-[var(--foreground)]/10 transition-colors cursor-pointer ${userVote?.type === "DOWN" ? "text-red-500" : ""}`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => setIsReplying(!isReplying)}
          className="flex items-center gap-1 hover:text-[var(--accent-gradient-to)] transition-colors cursor-pointer"
        >
          <Reply className="w-4 h-4" /> Reply
        </button>
      </div>

      {/* Reply Input */}
      {isReplying && (
        <div className="mt-2 ml-4">
           <TiptapEditor 
             description={replyContent} 
             onChange={setReplyContent} 
           />
           <div className="flex justify-end gap-2 mt-2">
             <button 
               onClick={() => setIsReplying(false)}
               className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors cursor-pointer"
             >
               Cancel
             </button>
             <button 
               onClick={handleReplySubmit}
               disabled={isSubmitting}
               className="px-3 py-1.5 text-xs font-medium bg-[var(--foreground)] text-[var(--background)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
             >
               {isSubmitting ? "Posting..." : "Reply"}
             </button>
           </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-2">
          {comment.children.map((child: any) => (
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
