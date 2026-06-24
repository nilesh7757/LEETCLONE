"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { MessageSquarePlus, MessageCircle, Loader2 } from "lucide-react";
import TiptapEditor from "@/features/editor/components/TiptapEditor";
import CommentItem from "./CommentItem";

interface DiscussionSectionProps {
  problemId: string;
}

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
  parentId?: string | null;
}

let socket: Socket;

export default function DiscussionSection({ problemId }: DiscussionSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewCommentReceived = useCallback((newComment: Comment) => {
    setComments(prev => {
      const updatedList = [...prev]; 
      
      if (!newComment.parentId) {
         return [newComment, ...updatedList];
      } else {
         const addReply = (nodes: Comment[]): Comment[] => {
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
  }, []);

  const handleVoteUpdateReceived = useCallback((commentId: string, upvotes: number, downvotes: number) => {
    setComments(prev => {
      const updateVote = (nodes: Comment[]): Comment[] => {
        return nodes.map(node => {
          if (node.id === commentId) {
            const currentUserVote = node.votes.find((v: Vote) => v.userId === (session?.user as { id: string })?.id);
            const newVotes = [];
            let remainingUp = upvotes;
            let remainingDown = downvotes;
            
            if (currentUserVote) {
               newVotes.push(currentUserVote);
               if (currentUserVote.type === "UP") remainingUp--;
               else remainingDown--;
            }
            
            for (let i = 0; i < remainingUp; i++) newVotes.push({ type: "UP", userId: `anon_up_\${i}` } as Vote);
            for (let i = 0; i < remainingDown; i++) newVotes.push({ type: "DOWN", userId: `anon_down_\${i}` } as Vote);
            
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
  }, [session]);

  // Initialize Socket.io
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"; 
    
    socket = io(socketUrl, {
      transports: ["websocket"], 
    });

    socket.on("connect", () => {
      socket.emit("join_problem", problemId);
    });

    socket.on("comment_added", (newComment: Comment) => {
      handleNewCommentReceived(newComment);
    });

    socket.on("vote_updated", ({ commentId, upvotes, downvotes }: { commentId: string, upvotes: number, downvotes: number }) => {
      handleVoteUpdateReceived(commentId, upvotes, downvotes);
    });

    return () => {
      socket.disconnect();
    };
  }, [problemId, handleNewCommentReceived, handleVoteUpdateReceived]);

  // Fetch initial comments
  useEffect(() => {
    const buildCommentTree = (flatComments: Comment[]) => {
      const commentMap: { [key: string]: Comment } = {};
      const roots: Comment[] = [];

      flatComments.forEach(c => {
        commentMap[c.id] = { ...c, children: [] };
      });

      flatComments.forEach(c => {
        if (c.parentId) {
          if (commentMap[c.parentId]) {
            commentMap[c.parentId].children!.push(commentMap[c.id]);
          }
        } else {
          roots.push(commentMap[c.id]);
        }
      });

      roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return roots;
    };

    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`/api/comments?problemId=${problemId}`);
        const tree = buildCommentTree(data.comments);
        setComments(tree);
      } catch (err) {
        console.error("Failed to load comments:", err);
        toast.error("Failed to load discussion.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [problemId]);

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

        if (data.notification) {
           socket.emit("send_notification", { 
              recipientId: data.notification.userId, 
              notification: data.notification 
           });
        }
        
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
