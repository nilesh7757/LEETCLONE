"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { MessageSquarePlus, MessageCircle, Loader2 } from "lucide-react";
import TiptapEditor from "@/components/TiptapEditor";
import CommentItem from "./CommentItem";

interface DiscussionSectionProps {
  problemId: string;
}

let socket: Socket;

export default function DiscussionSection({ problemId }: DiscussionSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Socket.io
  useEffect(() => {
    // Connect to the socket server
    // Note: In production, this URL should be an env variable
    // If you are running locally, make sure 'npm run socket' is running
    const socketUrl = "http://localhost:3001"; 
    
    socket = io(socketUrl, {
      transports: ["websocket"], // Force websocket to avoid polling issues sometimes
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_problem", problemId);
    });

    socket.on("comment_added", (newComment) => {
      console.log("New comment received:", newComment);
      handleNewCommentReceived(newComment);
    });

    socket.on("vote_updated", ({ commentId, upvotes, downvotes }) => {
      handleVoteUpdateReceived(commentId, upvotes, downvotes);
    });

    return () => {
      socket.disconnect();
    };
  }, [problemId]);

  // Fetch initial comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`/api/comments?problemId=${problemId}`);
        // Build the tree structure from flat list
        const tree = buildCommentTree(data.comments);
        setComments(tree);
      } catch (error) {
        console.error("Failed to load comments:", error);
        toast.error("Failed to load discussion.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [problemId]);

  const buildCommentTree = (flatComments: any[]) => {
    const commentMap: { [key: string]: any } = {};
    const roots: any[] = [];

    // Initialize map
    flatComments.forEach(c => {
      commentMap[c.id] = { ...c, children: [] };
    });

    // Build hierarchy
    flatComments.forEach(c => {
      if (c.parentId) {
        if (commentMap[c.parentId]) {
          commentMap[c.parentId].children.push(commentMap[c.id]);
        }
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    // Sort by newest first (or by votes if desired)
    // Roots: Newest first
    roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return roots;
  };

  const handleNewCommentReceived = (newComment: any) => {
    setComments(prev => {
      // We need to re-insert the new comment into the existing tree
      // The simplest way (though not most efficient) is to flatten, add, rebuild.
      // Or just handle root vs child case.
      
      // Let's assume we can just add it if we kept a flat list or deep update.
      // Since we converted to tree, deep update is tricky.
      // For now, let's just trigger a re-fetch or try to append.
      // Appending to tree:
      
      const updatedList = [...prev]; // This is the root list
      
      if (!newComment.parentId) {
         // Root comment
         return [newComment, ...updatedList];
      } else {
         // It's a reply. We need to find the parent in the tree recursively.
         // Helper function to find and append
         const addReply = (nodes: any[]): any[] => {
            return nodes.map(node => {
               if (node.id === newComment.parentId) {
                  return { ...node, children: [...(node.children || []), newComment] };
               } else if (node.children && node.children.length > 0) {
                  return { ...node, children: addReply(node.children) };
               }
               return node;
            });
         };
         return addReply(updatedList);
      }
    });
  };

  const handleVoteUpdateReceived = (commentId: string, upvotes: number, downvotes: number) => {
    setComments(prev => {
      const updateVote = (nodes: any[]): any[] => {
        return nodes.map(node => {
          if (node.id === commentId) {
            // We need to update the votes array structure to reflect the counts
            // Since we don't have the full list of votes from the socket, we fake it or just store counts if we refactored CommentItem.
            // But CommentItem calculates score from `node.votes`.
            // We need to structurally update `node.votes` to match the count.
            // This is tricky because `votes` is an array of objects { type, userId }.
            // We don't know *who* voted, just the new counts.
            
            // Hack/Fix: We will just mock the votes array to have the correct length of UPs and DOWNs.
            // We preserve the current user's vote if it exists in the old state.
            const currentUserVote = node.votes.find((v: any) => v.userId === session?.user?.id);
            
            // Reconstruct array
            const newVotes = [];
            
            // Add current user's vote first if it exists
            let remainingUp = upvotes;
            let remainingDown = downvotes;
            
            if (currentUserVote) {
               newVotes.push(currentUserVote);
               if (currentUserVote.type === "UP") remainingUp--;
               else remainingDown--;
            }
            
            // Fill the rest with anonymous placeholders
            for (let i = 0; i < remainingUp; i++) newVotes.push({ type: "UP", userId: `anon_up_${i}` });
            for (let i = 0; i < remainingDown; i++) newVotes.push({ type: "DOWN", userId: `anon_down_${i}` });
            
            return { ...node, votes: newVotes };
          }
          if (node.children) {
            return { ...node, children: updateVote(node.children) };
          }
          return node;
        });
      };
      return updateVote(prev);
    });
  };

  const handlePostComment = async () => {
    if (!newCommentContent.trim()) return;
    if (!session) {
      toast.error("You must be logged in to comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/comments", {
        problemId,
        content: newCommentContent,
      });

      // Optimistic update or wait for socket?
      // Since we are the sender, the socket event "comment_added" is broadcast to OTHERS (in our server impl).
      // So we must manually update our own state.
      
      const newComment = data.comment;
      handleNewCommentReceived(newComment);
      
      // Emit to socket so others see it
      socket.emit("new_comment", { problemId, comment: newComment });

      setNewCommentContent("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
     if (!session) {
        toast.error("Login to reply");
        return;
     }
     try {
        const { data } = await axios.post("/api/comments", {
           problemId,
           content,
           parentId
        });
        
        const newComment = data.comment;
        handleNewCommentReceived(newComment);
        socket.emit("new_comment", { problemId, comment: newComment });
        
        toast.success("Reply posted");
     } catch (error) {
        toast.error("Failed to reply");
        throw error; // Let CommentItem handle loading state reset
     }
  };

  const handleVote = async (commentId: string, type: "UP" | "DOWN") => {
      if (!session) {
          toast.error("Login to vote");
          return;
      }
      
      // Optimistic update
      // We will skip optimistic update for now to ensure consistency, or keep it.
      // Let's keep the API call as the source of truth for the socket emit.

      try {
          const { data } = await axios.post(`/api/comments/${commentId}/vote`, { type });
          if (data.success) {
             // Update local state with real counts
             handleVoteUpdateReceived(commentId, data.upvotes, data.downvotes);
             
             // Broadcast
             socket.emit("vote_update", { 
                problemId, 
                commentId, 
                upvotes: data.upvotes, 
                downvotes: data.downvotes 
             });
          }
      } catch (error) {
          console.error(error);
          toast.error("Failed to vote");
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 pb-4 border-b border-[var(--card-border)]">
        <MessageCircle className="w-6 h-6 text-[var(--foreground)]" />
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Discussion</h2>
        <span className="text-sm px-2 py-0.5 rounded-full bg-[var(--foreground)]/10 text-[var(--foreground)]/60">
           Live
        </span>
      </div>

      {/* Main Input */}
      <div className="space-y-4">
        <TiptapEditor 
          description={newCommentContent} 
          onChange={setNewCommentContent} 
        />
        <div className="flex justify-end">
          <button
            onClick={handlePostComment}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="w-4 h-4" />
            )}
            Post Comment
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 text-[var(--foreground)]/50">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading discussions...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-[var(--foreground)]/50">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              problemId={problemId} 
              onReply={handleReply}
              onVote={handleVote}
            />
          ))
        )}
      </div>
    </div>
  );
}
