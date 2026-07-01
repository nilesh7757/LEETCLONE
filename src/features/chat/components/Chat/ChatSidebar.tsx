"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Loader2, MessageSquare, Plus, Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";

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

interface SearchUser {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
        fetchConversations();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        // Filter out ourselves
        const filtered = data.users.filter((u: SearchUser) => u.id !== session?.user?.id);
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, session?.user?.id]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      
      const uniqueConversationsMap = new Map<string, Conversation>();
      
      data.conversations.forEach((chat: Conversation) => {
        if (!chat.otherUser?.id) return;
        
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

  const startConversation = async (participantId: string) => {
    try {
      const { data } = await axios.post("/api/chat", { participantId });
      setIsSearching(false);
      setSearchQuery("");
      setSearchResults([]);
      router.push(`/chat/${data.conversationId}`);
      fetchConversations();
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  return (
    <div className="w-80 border-r border-[var(--border)] bg-[var(--card)]/50 h-full flex flex-col shrink-0 relative z-20">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <MessageSquare size={16} />
          </div>
          <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)]">Conversations</h2>
        </div>
        <button 
          onClick={() => setIsSearching(!isSearching)} 
          className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          title="New Chat"
        >
          {isSearching ? <X size={15} /> : <Plus size={15} />}
        </button>
      </div>

      {isSearching && (
        <div className="p-3 border-b border-[var(--border)] space-y-2 bg-[var(--card)]/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users to chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded-xl focus:border-[var(--primary)]/50 outline-none transition-all"
            />
          </div>
          
          {searchLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-1 py-1 custom-scrollbar">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--foreground)]/5 transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--foreground)]/10 shrink-0 relative">
                    {user.image ? (
                      <Image src={user.image} alt={user.name || "User"} fill className="object-cover animate-fade-in" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
                        <UserCircle className="w-4 h-4 text-[var(--muted-foreground)]/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[var(--foreground)] truncate">
                      {user.name || "User"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="text-center text-[10px] text-[var(--muted-foreground)] py-3">No users found</div>
          ) : null}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--foreground)]/[0.01]">
            <UserCircle className="w-8 h-8 text-[var(--muted-foreground)]/50 mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">No active chats</p>
            <p className="text-[10px] text-[var(--muted-foreground)]/65 mt-1">Start a chat by searching above.</p>
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
                className={`group relative block p-3.5 rounded-xl border transition-all duration-200 ${
                  isActive 
                    ? "bg-[var(--foreground)]/5 border-[var(--border)]" 
                    : "bg-transparent border-transparent hover:bg-[var(--foreground)]/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${isActive ? "border-[var(--primary)]" : "border-transparent group-hover:border-[var(--border)]"}`}>
                      {otherUser?.image ? (
                        <Image src={otherUser.image} alt={otherUser.name || "User"} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
                          <UserCircle className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--card)] rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-semibold text-xs truncate ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
                        {otherUser?.name || "User"}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-[8px] font-mono text-[var(--muted-foreground)]/65 shrink-0 opacity-60">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-[11px] truncate font-medium ${isActive ? "text-[var(--foreground)]/70" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]/60"}`}>
                      {chat.lastMessage?.content || "No messages yet"}
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
