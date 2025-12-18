"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
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
        className="relative p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-[var(--foreground)]/5 cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--background)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-xl z-50 flex flex-col"
          >
            <div className="p-3 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--background)]/50 backdrop-blur-sm">
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Notifications</h3>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1.5 text-[var(--foreground)]/40 hover:text-red-500 transition-colors cursor-pointer"
                    title="Clear all notifications"
                  >
                    <BrushIcon className="w-4 h-4" />
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={() => handleMarkRead()}
                    className="text-xs text-blue-500 hover:underline cursor-pointer font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 relative">
              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                  >
                    <BrushIcon className="w-10 h-10 text-red-500 mb-4" />
                    <h4 className="font-bold text-[var(--foreground)] mb-1">Clear all?</h4>
                    <p className="text-xs text-[var(--foreground)]/60 mb-6">This action cannot be undone. All your notifications will be removed.</p>
                    <div className="flex flex-col w-full gap-2">
                      <button 
                        onClick={confirmClearAll}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Yes, Clear Everything
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="w-full py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-lg text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--foreground)]/40 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors flex gap-3 ${
                      !notification.read ? "bg-[var(--foreground)]/5" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {notification.sender?.image ? (
                        <Image
                          src={notification.sender.image}
                          alt="Sender"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-[var(--foreground)]/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={notification.link || "#"}
                        onClick={() => {
                          setIsOpen(false);
                          if (!notification.read) handleMarkRead(notification.id);
                        }}
                        className="text-sm text-[var(--foreground)] hover:underline block"
                      >
                         {notification.message}
                      </Link>
                      <p className="text-xs text-[var(--foreground)]/40 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="shrink-0 text-[var(--foreground)]/20 hover:text-[var(--foreground)]/60 cursor-pointer self-center"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
