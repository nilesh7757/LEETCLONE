"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, MailOpen, Clock, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

let socket: Socket;

const BrushIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M10,4 C10,2.8954305 10.8954305,2 12,2 C13.1045695,2 14,2.8954305 14,4 L14,10 L20,10 L20,14 L4,14 L4,10 L10,10 L10,4 Z M4,14 L20,14 L20,22 L12,22 L4,22 L4,14 Z M16,22 L16,16.3646005 M8,22 L8,16.3646005 M12,22 L12,16.3646005" />
  </svg>
);

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Socket and Fetch Notifications
  useEffect(() => {
    if (!session?.user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get("/api/notifications");
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();

    // Socket Connection
    const socketUrl = "http://localhost:3001";
    socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_user", session.user.id);
    });

    socket.on("notification_received", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(newNotification.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (notificationId?: string) => {
    try {
      await axios.post("/api/notifications/read", {
        notificationId,
        markAll: !notificationId,
      });

      if (notificationId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      await axios.delete("/api/notifications");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications cleared");
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Failed to clear notifications", error);
      toast.error("Failed to clear notifications");
    }
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--card)]/50 border border-[var(--border)] hover:bg-[var(--muted)] hover:border-[var(--foreground)]/20 transition-all duration-300"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--viz-red)]/0 to-[var(--viz-amber)]/0 group-hover:from-[var(--viz-red)]/10 group-hover:to-[var(--viz-amber)]/10 transition-all duration-500" />
        
        <div className="relative">
            <Bell className={`w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors ${unreadCount > 0 ? "animate-swing" : ""}`} />
            
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute right-0 top-full mt-3 w-96 max-h-[500px] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl shadow-2xl shadow-black/20 z-50 origin-top-right overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--background)]/30 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-[var(--viz-blue)]/10 rounded-lg text-[var(--viz-blue)]">
                    <AlertCircle size={16} />
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-[var(--foreground)] leading-none">Inbox</h3>
                    <p className="text-[10px] font-medium text-[var(--muted-foreground)] mt-0.5">{unreadCount} unread signals</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => handleMarkRead()}
                    className="p-2 hover:bg-[var(--viz-blue)]/10 text-[var(--viz-blue)] rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider"
                    title="Mark all as read"
                  >
                    Read All
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-2 text-[var(--muted-foreground)] hover:bg-[var(--viz-red)]/10 hover:text-[var(--viz-red)] rounded-lg transition-colors"
                    title="Clear inbox"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 relative min-h-[300px]">
              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div 
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    className="absolute inset-0 z-50 bg-[var(--background)]/80 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-16 h-16 bg-[var(--viz-red)]/10 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-8 h-8 text-[var(--viz-red)]" />
                    </div>
                    <h4 className="font-bold text-[var(--foreground)] mb-2">Flush Buffer?</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6 max-w-[200px]">This will permanently remove all notification data.</p>
                    <div className="flex flex-col w-full gap-3">
                      <button 
                        onClick={confirmClearAll}
                        className="w-full py-2.5 bg-[var(--viz-red)] hover:bg-[var(--viz-red)]/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[var(--viz-red)]/20"
                      >
                        Confirm Delete
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="w-full py-2.5 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {notifications.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-[var(--muted)]/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <MailOpen className="w-10 h-10 text-[var(--muted-foreground)]/50" />
                  </div>
                  <h4 className="text-[var(--foreground)] font-medium mb-1">All Caught Up</h4>
                  <p className="text-[var(--muted-foreground)] text-xs">System idle. No new signals received.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                    {notifications.map((notification, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={notification.id}
                        className={`group relative p-4 rounded-2xl border border-transparent hover:bg-[var(--foreground)]/5 hover:border-[var(--border)] transition-all cursor-pointer ${
                        !notification.read ? "bg-[var(--viz-blue)]/5 border-[var(--viz-blue)]/10" : ""
                        }`}
                        onClick={() => {
                             if (!notification.read) handleMarkRead(notification.id);
                             setIsOpen(false);
                        }}
                    >
                        <div className="flex gap-4">
                            <div className="shrink-0 pt-1">
                                {notification.sender?.image ? (
                                    <Image
                                    src={notification.sender.image}
                                    alt="Sender"
                                    width={36}
                                    height={36}
                                    className="rounded-xl object-cover ring-2 ring-[var(--background)]"
                                    />
                                ) : (
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${!notification.read ? "bg-[var(--viz-blue)] text-[var(--background)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                                       <Bell className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                                <Link href={notification.link || "#"} className="block group-hover:text-[var(--viz-blue)] transition-colors">
                                    <p className={`text-sm leading-snug ${!notification.read ? "font-bold text-[var(--foreground)]" : "font-medium text-[var(--muted-foreground)]"}`}>
                                        {notification.message}
                                    </p>
                                </Link>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted-foreground)]/60">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {!notification.read && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkRead(notification.id);
                                    }}
                                    className="shrink-0 self-start p-1.5 hover:bg-[var(--viz-green)]/10 text-[var(--muted-foreground)] hover:text-[var(--viz-green)] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Mark as read"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}