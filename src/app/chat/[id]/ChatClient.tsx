"use client";

import { useState, useEffect, useRef } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import axios from "axios";
import { Send, UserCircle, Paperclip, Loader2, MoreVertical, Phone, Video, ChevronLeft, Check, CheckCheck } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col h-full relative overflow-hidden bg-[var(--background)]">
      {/* Deep Space Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--viz-purple)]/5 rounded-full blur-[120px] opacity-50" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--viz-cyan)]/5 rounded-full blur-[120px] opacity-50" />
      </div>

      {/* Holographic Header */}
      <div className="h-20 px-6 flex items-center justify-between bg-[var(--card)]/30 backdrop-blur-xl border-b border-white/5 relative z-20 shrink-0">
        <div className="flex items-center gap-4">
            <Link href="/chat" className="p-2 rounded-full hover:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors md:hidden">
                <ChevronLeft size={20} />
            </Link>
            
            <Link href={`/profile/${otherUser?.id}`} className="group flex items-center gap-4 relative">
                <div className="relative shrink-0">
                    {/* Ring Pulse for Online */}
                    {isOnline && <div className="absolute inset-[-4px] rounded-full border border-[var(--viz-emerald)]/30 animate-ping opacity-50" />}
                    
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${isOnline ? "border-[var(--viz-emerald)]" : "border-white/10 group-hover:border-[var(--viz-cyan)]"}`}>
                        {otherUser?.image ? (
                            <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
                                <UserCircle className="w-6 h-6 text-[var(--muted-foreground)]" />
                            </div>
                        )}
                    </div>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--viz-emerald)] border-2 border-[var(--card)] rounded-full shadow-[0_0_10px_var(--viz-emerald)]" />
                    )}
                </div>
                
                <div>
                    <h2 className="font-bold text-lg text-[var(--foreground)] tracking-tight group-hover:text-[var(--viz-cyan)] transition-colors">{otherUser?.name || "Unknown Entity"}</h2>
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[var(--viz-emerald)] shadow-[0_0_8px_var(--viz-emerald)]" : "bg-[var(--muted-foreground)]/30"}`} />
                        <p className="text-xs font-mono font-medium text-[var(--muted-foreground)]">
                            {isOnline ? "SIGNAL ACTIVE" : lastActive ? `LAST SIGNAL: ${formatDistanceToNow(lastActive, { addSuffix: true }).toUpperCase()}` : "OFFLINE"}
                        </p>
                    </div>
                </div>
            </Link>
        </div>

        <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--viz-cyan)] transition-colors">
                <Phone size={18} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--viz-purple)] transition-colors">
                <Video size={18} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--muted-foreground)] transition-colors">
                <MoreVertical size={18} />
            </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10">
        {loading ? (
            <div className="flex justify-center mt-20">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--viz-cyan)]" />
            </div>
        ) : (
            <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isSequence = idx > 0 && messages[idx - 1].senderId === msg.senderId;

                    return (
                        <motion.div 
                            key={msg.id || idx} 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} ${isSequence ? "mt-1" : "mt-4"}`}
                        >
                            <div className={`relative max-w-[75%] md:max-w-[60%] px-5 py-3 shadow-lg backdrop-blur-sm group ${
                                isMe 
                                ? "bg-gradient-to-br from-[var(--viz-cyan)] to-[var(--viz-blue)] text-black rounded-[1.5rem] rounded-tr-sm" 
                                : "bg-[var(--card)]/40 border border-white/5 text-[var(--foreground)] rounded-[1.5rem] rounded-tl-sm hover:border-[var(--viz-purple)]/30 transition-colors"
                            }`}>
                                <p className={`text-sm leading-relaxed ${isMe ? "font-semibold" : "font-medium"}`}>{msg.content}</p>
                                
                                <div className={`flex items-center justify-end gap-1 mt-1 opacity-60 ${isMe ? "text-black/70" : "text-[var(--muted-foreground)]"}`}>
                                    <span className="text-[9px] font-mono font-bold tracking-widest">
                                        {format(new Date(msg.createdAt), "HH:mm")}
                                    </span>
                                    {isMe && (
                                        <CheckCheck size={12} strokeWidth={3} />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Control Deck Input */}
      <div className="p-4 bg-transparent relative z-20">
        <form 
            onSubmit={handleSend} 
            className="flex items-end gap-3 p-2 bg-[var(--card)]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative group focus-within:border-[var(--viz-cyan)]/30 transition-colors"
        >
            <button 
                type="button" 
                className="p-3 mb-1 text-[var(--muted-foreground)] hover:text-[var(--viz-purple)] hover:bg-[var(--viz-purple)]/10 rounded-full transition-all"
                title="Data Link"
            >
                <Paperclip className="w-5 h-5" />
            </button>
            
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Initialize transmission..."
                className="flex-1 bg-transparent border-none px-2 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:ring-0 max-h-32 font-medium"
            />
            
            <button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="p-3 mb-1 bg-[var(--foreground)] text-[var(--background)] rounded-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(var(--foreground-rgb),0.2)]"
            >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
      </div>
    </div>
  );
}
