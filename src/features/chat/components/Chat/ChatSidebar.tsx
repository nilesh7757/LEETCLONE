"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import Image from "next/image";

let socket: Socket;

interface ChatUser {
  id: string;
  name: string | null;
  image?: string;
  lastActive?: string | Date;
}

interface Conversation {
  id: string;
  otherUser: ChatUser;
  lastMessage?: {
    content: string;
    createdAt: string | Date;
  };
}

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    fetchConversations();
    
    if (session?.user?.id) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      socket = io(socketUrl, { transports: ["websocket"] });

      socket.on("connect", () => {
        socket.emit("join_user", session.user.id);
        socket.emit("get_online_users", (users: string[]) => {
          setOnlineUsers(new Set(users));
        });
      });

      socket.on("user_online", ({ userId }) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socket.on("user_offline", ({ userId }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socket.on("new_message", () => {
        // If the sidebar is open, refresh the conversations list to show the new message
        // or move the conversation to the top.
        fetchConversations();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      
      // Deduplicate by otherUser.id (keep most recent)
      const uniqueConversationsMap = new Map<string, Conversation>();
      
      data.conversations.forEach((chat: Conversation) => {
        if (!chat.otherUser?.id) return; // Skip if no other user (e.g. self chat or deleted user)
        
        // Use otherUser.id as key to ensure one entry per person
        if (!uniqueConversationsMap.has(chat.otherUser.id)) {
            uniqueConversationsMap.set(chat.otherUser.id, chat);
        }
      });
      
      setConversations(Array.from(uniqueConversationsMap.values()));
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-r border-white/5 bg-[var(--card)]/30 backdrop-blur-xl h-full flex flex-col shrink-0 relative z-20">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]">
            <MessageSquare size={18} />
        </div>
        <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground)]">Neural Link</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--viz-cyan)]" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <UserCircle className="w-10 h-10 text-[var(--muted-foreground)] mb-3 opacity-50" />
            <p className="text-xs font-medium text-[var(--muted-foreground)]">No active signals.</p>
            <p className="text-[10px] text-[var(--muted-foreground)]/50 mt-1">Initiate a link from a profile.</p>
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}`;
            const otherUser = chat.otherUser;
            const isOnline = otherUser && onlineUsers.has(otherUser.id);

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`group relative block p-4 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)]/30 shadow-[0_0_20px_rgba(var(--viz-cyan-rgb),0.1)]" 
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${isActive ? "border-[var(--viz-cyan)]" : "border-transparent group-hover:border-white/10"}`}>
                      {otherUser?.image ? (
                        <Image src={otherUser.image} alt={otherUser.name || "User"} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
                          <UserCircle className="w-6 h-6 text-[var(--muted-foreground)]" />
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--viz-emerald)] border-2 border-[var(--card)] rounded-full shadow-[0_0_10px_var(--viz-emerald)] animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-bold text-sm truncate ${isActive ? "text-[var(--viz-cyan)]" : "text-[var(--foreground)]"}`}>
                        {otherUser?.name || "Unknown Entity"}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-[9px] font-mono text-[var(--muted-foreground)] shrink-0 opacity-60">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-xs truncate font-medium ${isActive ? "text-[var(--foreground)]/80" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]/60"}`}>
                      {chat.lastMessage?.content || "No transmission data"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
