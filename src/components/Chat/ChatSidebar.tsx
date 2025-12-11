"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      
      // Deduplicate by otherUser.id (keep most recent)
      const uniqueConversationsMap = new Map();
      
      data.conversations.forEach((chat: any) => {
        if (!chat.otherUser?.id) return; // Skip if no other user (e.g. self chat or deleted user)
        
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
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`block p-4 border-b border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors ${
                  isActive ? "bg-[var(--foreground)]/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 overflow-hidden shrink-0">
                    {otherUser?.image ? (
                      <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-[var(--foreground)]/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-[var(--foreground)] truncate">{otherUser?.name || "Unknown User"}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-[var(--foreground)]/40 shrink-0 ml-2">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
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
