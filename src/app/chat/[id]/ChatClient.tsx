"use client";

import { useState, useEffect, useRef } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import axios from "axios";
import { Send, UserCircle, Paperclip, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ChatClientProps {
  conversationId: string;
  currentUser: any;
  otherUser: any;
  recipientIds: string[];
}

export default function ChatClient({ conversationId, currentUser, otherUser, recipientIds }: ChatClientProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState<Date | null>(otherUser?.lastActive ? new Date(otherUser.lastActive) : null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Initialize Socket
  useEffect(() => {
    const newSocket = ClientIO(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_conversation", conversationId);
      newSocket.emit("join_user", currentUser.id); // Join personal room for status updates
      
      // Get initial online status
      newSocket.emit("get_online_users", (onlineUserIds: string[]) => {
        if (otherUser && onlineUserIds.includes(otherUser.id)) {
          setIsOnline(true);
        }
      });
    });

    newSocket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on("user_online", ({ userId }) => {
      if (userId === otherUser?.id) {
        setIsOnline(true);
      }
    });

    newSocket.on("user_offline", ({ userId, lastActive }) => {
      if (userId === otherUser?.id) {
        setIsOnline(false);
        setLastActive(new Date(lastActive));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId, otherUser?.id, currentUser.id]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/chat/${conversationId}`);
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() && !sending) return;

    setSending(true);
    try {
        const { data } = await axios.post(`/api/chat/${conversationId}`, {
            content: newMessage,
            type: "TEXT"
        });
        
        // Add to local list
        setMessages((prev) => [...prev, data.message]);
        
        // Emit to server so it broadcasts to others
        socket?.emit("send_message", { 
          conversationId, 
          message: data.message,
          recipientIds 
        });
        
        setNewMessage("");
        scrollToBottom();
    } catch (error) {
        console.error("Failed to send", error);
    } finally {
        setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--card-border)] flex items-center gap-4 bg-[var(--card-bg)] shrink-0">
        <Link href={`/profile/${otherUser?.id}`} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 overflow-hidden border border-[var(--card-border)] group-hover:border-[var(--foreground)]/30 transition-colors">
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
          <div>
              <h2 className="font-bold text-[var(--foreground)] group-hover:underline">{otherUser?.name || "Unknown User"}</h2>
              <p className="text-[10px] font-medium transition-colors">
                {isOnline ? (
                  <span className="text-green-500">Active now</span>
                ) : lastActive ? (
                  <span className="text-[var(--foreground)]/40">
                    Last seen {formatDistanceToNow(lastActive, { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-[var(--foreground)]/40">Offline</span>
                )}
              </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {loading ? (
            <div className="flex justify-center mt-10">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--foreground)]/40" />
            </div>
        ) : (
            messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe 
                            ? "bg-[var(--foreground)] text-[var(--background)] rounded-tr-sm" 
                            : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-tl-sm"
                        }`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                                {format(new Date(msg.createdAt), "h:mm a")}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[var(--card-bg)] border-t border-[var(--card-border)] shrink-0 flex gap-2">
        <button 
            type="button" 
            className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
            title="Attach file (Coming Soon)"
        >
            <Paperclip className="w-5 h-5" />
        </button>
        <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-full px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)]/30 transition-colors"
        />
        <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-[var(--foreground)] text-[var(--background)] rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
