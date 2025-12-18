"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket: Socket;

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastActiveMap, setLastActiveMap] = useState<Map<string, Date>>(new Map());
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    fetchConversations();
    
    if (session?.user?.id) {
      const socketUrl = "http://localhost:3001";
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

      socket.on("user_offline", ({ userId, lastActive }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setLastActiveMap((prev) => {
          const next = new Map(prev);
          next.set(userId, new Date(lastActive));
          return next;
        });
      });

      socket.on("new_message", (message) => {
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
      const uniqueConversationsMap = new Map();
      
      data.conversations.forEach((chat: any) => {
        if (!chat.otherUser?.id) return; // Skip if no other user (e.g. self chat or deleted user)
        
        // Use otherUser.id as key to ensure one entry per person
        if (!uniqueConversationsMap.has(chat.otherUser.id)) {
            uniqueConversationsMap.set(chat.otherUser.id, chat);
            if (chat.otherUser.lastActive) {
              setLastActiveMap(prev => {
                const next = new Map(prev);
                next.set(chat.otherUser.id, new Date(chat.otherUser.lastActive));
                return next;
              });
            }
        } else {
           // If we already have this user, but this chat object is newer (should be first in array due to API sorting)
           // we don't need to do anything since the first one found is the newest
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
    <div className="w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] h-full flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--card-border)]">
        <h2 className="font-bold text-lg text-[var(--foreground)]">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--foreground)]/40" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--foreground)]/60">
            No conversations yet. Start a chat from a user profile!
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}`;
            const otherUser = chat.otherUser;
            const isOnline = otherUser && onlineUsers.has(otherUser.id);
            const lastActive = otherUser && lastActiveMap.get(otherUser.id);

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`block p-4 border-b border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors ${
                  isActive ? "bg-[var(--foreground)]/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                      {otherUser?.image ? (
                        <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-[var(--foreground)]/40" />
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--background)] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-medium text-[var(--foreground)] truncate">{otherUser?.name || "Unknown User"}</h3>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-[var(--foreground)]/40 shrink-0 ml-2">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {!isOnline && lastActive && (
                      <p className="text-[10px] text-[var(--foreground)]/40 mb-1">
                        Last active: {formatDistanceToNow(lastActive, { addSuffix: true })}
                      </p>
                    )}
                    <p className="text-sm text-[var(--foreground)]/60 truncate">
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
