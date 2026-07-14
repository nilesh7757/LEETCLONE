"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import axios from "axios";
import { 
  Send, UserCircle, Paperclip, Loader2, MoreVertical, 
  ChevronLeft, Check, CheckCheck, Trash, MoreHorizontal 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  lastActive?: string | Date | null;
}

interface Message {
  id: string;
  content: string | null;
  senderId: string;
  createdAt: string | Date;
  type: string;
  isDeletedForEveryone?: boolean;
  deletedForUsers?: string;
  status?: string;
}

interface ChatClientProps {
  conversationId: string;
  currentUser: User;
  otherUser: User;
  recipientIds: string[];
}

export default function ChatClient({ conversationId, currentUser, otherUser, recipientIds }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState<Date | null>(otherUser?.lastActive ? new Date(otherUser.lastActive) : null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const fetchMessages = useCallback(async (isSilent = false) => {
    try {
      const { data } = await axios.get(`/api/chat/${conversationId}`);
      setMessages((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
          if (!isSilent) scrollToBottom();
          return data.messages;
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  const markAsSeen = useCallback(async () => {
    if (!messages.length) return;
    const unseenIds = messages
      .filter(m => m.senderId !== currentUser.id && m.status !== "SEEN" && !m.isDeletedForEveryone)
      .map(m => m.id);

    if (unseenIds.length > 0) {
      try {
        await axios.post(`/api/chat/${conversationId}/seen`, { messageIds: unseenIds });
        socket?.emit("messages_seen", { conversationId, senderId: currentUser.id });
      } catch (err) {
        console.error("Failed to mark as seen:", err);
      }
    }
  }, [messages, conversationId, currentUser.id, socket]);

  useEffect(() => {
    markAsSeen();
  }, [messages, markAsSeen]);

  // Initialize Socket
  useEffect(() => {
    const newSocket = ClientIO(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setSocketConnected(true);
      newSocket.emit("join_conversation", conversationId);
      newSocket.emit("join_user", currentUser.id);
      
      newSocket.emit("get_online_users", (onlineUserIds: string[]) => {
        if (otherUser && onlineUserIds.includes(otherUser.id)) {
          setIsOnline(true);
        }
      });
    });

    newSocket.on("disconnect", () => {
      setSocketConnected(false);
    });

    newSocket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on("message_deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, isDeletedForEveryone: true, content: "This message was deleted" } : m));
    });

    newSocket.on("messages_seen", ({ conversationId: room }: { conversationId: string }) => {
      if (room === conversationId) {
        setMessages((prev) => prev.map(m => m.senderId === currentUser.id ? { ...m, status: "SEEN" } : m));
      }
    });

    newSocket.on("chat_cleared", ({ conversationId: room }: { conversationId: string }) => {
      if (room === conversationId) {
        setMessages([]);
      }
    });

    newSocket.on("user_online", ({ userId }: { userId: string }) => {
      if (userId === otherUser?.id) {
        setIsOnline(true);
      }
    });

    newSocket.on("user_offline", ({ userId, lastActive }: { userId: string, lastActive: string }) => {
      if (userId === otherUser?.id) {
        setIsOnline(false);
        setLastActive(new Date(lastActive));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId, otherUser?.id, currentUser.id, otherUser, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fallback Polling Effect (every 3.5 seconds)
  useEffect(() => {
    if (socketConnected) return;

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [socketConnected, fetchMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() && !sending) return;

    setSending(true);
    try {
        const { data } = await axios.post(`/api/chat/${conversationId}`, {
            content: newMessage,
            type: "TEXT"
        });
        
        const initialStatus = isOnline ? "RECEIVED" : "SENT";
        const messageWithStatus = { ...data.message, status: initialStatus };

        setMessages((prev) => [...prev, messageWithStatus]);
        
        socket?.emit("send_message", { 
          conversationId, 
          message: messageWithStatus,
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

  const clearChat = async () => {
    try {
      await axios.delete(`/api/chat/${conversationId}`);
      setMessages([]);
      setIsHeaderMenuOpen(false);
      socket?.emit("clear_chat", { conversationId, recipientIds });
      toast.success("Chat history cleared");
    } catch (err) {
      toast.error("Failed to clear chat");
    }
  };

  const deleteMessage = async (messageId: string, type: 'me' | 'everyone') => {
    try {
      await axios.delete(`/api/chat/messages/${messageId}?type=${type}`);
      setActiveMenuId(null);
      
      if (type === 'everyone') {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeletedForEveryone: true, content: "This message was deleted" } : m));
        socket?.emit("delete_message", { conversationId, messageId, recipientIds });
      } else {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".header-menu-trigger") && !target.closest(".header-menu")) {
        setIsHeaderMenuOpen(false);
      }
      if (!target.closest(".message-menu-trigger") && !target.closest(".message-menu")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, []);

  const visibleMessages = messages.filter(msg => {
    const deletedUsers = msg.deletedForUsers ? msg.deletedForUsers.split(",") : [];
    return !deletedUsers.includes(currentUser.id);
  });

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[var(--background)]">
      {/* Header bar */}
      <div className="h-16 px-5 flex items-center justify-between bg-[var(--card)]/80 backdrop-blur-md border-b border-[var(--border)] relative z-20 shrink-0">
        <div className="flex items-center gap-3">
            <Link href="/chat" className="p-1.5 rounded-full hover:bg-[var(--foreground)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors md:hidden">
                <ChevronLeft size={18} />
            </Link>
            
            <Link href={`/profile/${otherUser?.id}`} className="group flex items-center gap-3 relative">
                <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-full overflow-hidden border transition-all relative ${isOnline ? "border-emerald-500" : "border-[var(--border)] group-hover:border-[var(--primary)]"}`}>
                        {otherUser?.image ? (
                            <Image 
                                src={otherUser.image} 
                                alt={otherUser.name || "User profile"} 
                                fill
                                className="object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
                                <UserCircle className="w-5 h-5 text-[var(--muted-foreground)]" />
                            </div>
                        )}
                    </div>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--card)] rounded-full animate-pulse" />
                    )}
                </div>
                
                <div>
                    <h2 className="font-bold text-sm text-[var(--foreground)] tracking-tight group-hover:text-[var(--primary)] transition-colors">{otherUser?.name || "User"}</h2>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${isOnline ? "bg-emerald-500" : "bg-[var(--muted-foreground)]/30"}`} />
                        <p className="text-[10px] font-bold text-[var(--muted-foreground)]/65">
                            {isOnline ? "ONLINE" : lastActive ? `ACTIVE ${formatDistanceToNow(lastActive, { addSuffix: true }).toUpperCase()}` : "OFFLINE"}
                        </p>
                    </div>
                </div>
            </Link>
        </div>

        <div className="flex items-center gap-1.5 relative">
            <button 
              onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)} 
              className="header-menu-trigger p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
                <MoreVertical size={16} />
            </button>
            
            {isHeaderMenuOpen && (
              <div className="header-menu absolute right-0 top-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 w-40 text-xs font-semibold z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button 
                    onClick={clearChat} 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-red-500 hover:bg-red-500/10 w-full cursor-pointer border-none bg-transparent"
                  >
                      <Trash size={14} /> Clear Chat
                  </button>
              </div>
            )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 relative z-10">
        {loading ? (
            <div className="flex justify-center mt-20">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
            </div>
        ) : visibleMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]/40 text-xs font-semibold">
                No conversation history. Start typing below...
            </div>
        ) : (
            <AnimatePresence initial={false}>
                {visibleMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isSequence = idx > 0 && visibleMessages[idx - 1].senderId === msg.senderId;
                    const isDeleted = msg.isDeletedForEveryone;

                    return (
                        <motion.div 
                            key={msg.id || idx} 
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.15 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} ${isSequence ? "mt-0.5" : "mt-3"}`}
                        >
                            <div className={`relative max-w-[70%] md:max-w-[55%] px-4 py-2.5 shadow-sm group ${
                                isMe 
                                ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl rounded-tr-sm" 
                                : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl rounded-tl-sm"
                            }`}>
                                <p className={`text-xs leading-relaxed ${isDeleted ? 'italic text-opacity-50' : 'font-semibold'}`}>
                                    {isDeleted ? "This message was deleted" : msg.content}
                                </p>
                                
                                <div className={`flex items-center justify-end gap-1 mt-1 opacity-60 ${isMe ? "text-[var(--primary-foreground)]/80" : "text-[var(--muted-foreground)]"}`}>
                                    <span className="text-[8px] font-mono font-bold tracking-wider">
                                        {format(new Date(msg.createdAt), "HH:mm")}
                                    </span>
                                    {isMe && !isDeleted && (
                                        <span className="flex items-center">
                                            {msg.status === "SEEN" ? (
                                                <span title="Seen"><CheckCheck size={10} strokeWidth={3} className="text-emerald-500" /></span>
                                            ) : msg.status === "RECEIVED" ? (
                                                <span title="Received"><CheckCheck size={10} strokeWidth={3} className="text-slate-400" /></span>
                                            ) : (
                                                <span title="Sent (Not received)"><Check size={10} strokeWidth={3} className="text-slate-400" /></span>
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Dropdown Menu for Message Actions */}
                                {!isDeleted && (
                                    <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                        <button 
                                            type="button"
                                            onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                            className="message-menu-trigger p-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] shadow-sm cursor-pointer"
                                        >
                                            <MoreHorizontal size={10} />
                                        </button>
                                        {activeMenuId === msg.id && (
                                            <div 
                                                className="message-menu absolute right-0 top-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-1 flex flex-col gap-0.5 w-36 text-[10px] font-bold z-40 animate-in fade-in zoom-in-95 duration-100"
                                            >
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteMessage(msg.id, 'me')} 
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5 w-full cursor-pointer border-none bg-transparent"
                                                >
                                                    <Trash size={10} /> Delete for me
                                                </button>
                                                {isMe && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => deleteMessage(msg.id, 'everyone')} 
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-red-500 hover:bg-red-500/10 w-full cursor-pointer border-none bg-transparent"
                                                    >
                                                        <Trash size={10} /> Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Message Input deck */}
      <div className="p-3 bg-transparent relative z-20">
        <form 
            onSubmit={handleSend} 
            className="flex items-center gap-2 p-1.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm relative group focus-within:border-[var(--primary)]/50 transition-colors"
        >
            <button 
                type="button" 
                className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-xl transition-all"
                title="Attach file"
            >
                <Paperclip className="w-4 h-4" />
            </button>
            
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none px-2 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:ring-0 outline-none max-h-32 font-medium"
            />
            
            <button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
        </form>
      </div>
    </div>
  );
}
