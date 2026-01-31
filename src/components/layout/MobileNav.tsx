"use client";

import Link from "next/link";
import { Menu, X, Code2, BookOpen, MonitorPlay, Trophy, PenTool, LineChart, Globe, MessageSquare, ShieldAlert, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../ui/Logo";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "../ui/ThemeToggle";
import UserSearch from "../ui/UserSearch";
import { usePathname } from "next/navigation";
import NotificationBell from "../ui/NotificationBell";
import axios from "axios";
import { Flame } from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [dailySlug, setDailySlug] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [solvedToday, setSolvedToday] = useState<boolean>(false);

  useEffect(() => {
    const fetchStreak = async () => {
      if (status === "authenticated") {
        try {
          const { data } = await axios.get("/api/profile/streak");
          setStreak(data.streak);
          setSolvedToday(data.solvedToday);
        } catch (error) {
          console.error("Failed to fetch streak", error);
        }
      }
    };
    fetchStreak();
  }, [status]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const { data } = await axios.get("/api/problems/daily");
        if (data.problem?.slug) {
          setDailySlug(data.problem.slug);
        }
      } catch (error) {
        console.error("Failed to fetch daily problem", error);
      }
    };
    fetchDaily();
  }, []);

  const navItems = [
    { label: "Problems", href: "/problems", icon: Code2 },
    { label: "Study Plans", href: "/study-plans", icon: BookOpen },
    { label: "Interview", href: "/interview", icon: MonitorPlay },
    { label: "Contest", href: "/contest", icon: Trophy },
    { label: "Visualize", href: "/dsa", icon: PenTool },
    { label: "Leaderboard", href: "/leaderboard", icon: LineChart },
    { label: "Blog", href: "/blog", icon: Globe },
    { label: "Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <>
      {/* Top Bar for Mobile */}
      <nav className="md:hidden fixed top-0 w-full z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
                <Logo className="w-8 h-8" />
                <span className="font-bold text-lg text-[var(--foreground)]">LeetClone</span>
            </Link>
        </div>
        
        <div className="flex items-center gap-2">
            {status === "authenticated" && (
                <Link
                    href={dailySlug ? `/problems/${dailySlug}` : "/problems"}
                    className={`flex items-center gap-1.5 px-1.5 py-1 transition-all duration-300 ${
                        solvedToday
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-[var(--foreground)]/60"
                    }`}
                >
                    <Flame
                        className={`w-5 h-5 ${
                        solvedToday ? "fill-orange-500 text-orange-500" : ""
                        }`}
                    />
                    <span className="text-xs font-bold">{streak}</span>
                </Link>
            )}
            {status === "authenticated" && <NotificationBell />}
            <ThemeToggle direction="down" />
        </div>
      </nav>

      {/* Full Screen Menu / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/50 md:hidden backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Drawer */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-[70] w-4/5 max-w-xs bg-[var(--background)] border-r border-[var(--card-border)] md:hidden flex flex-col shadow-2xl"
            >
                {/* Header of Drawer */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--card-border)]">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-lg text-[var(--foreground)]">LeetClone</span>
                    </Link>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    
                    {/* Search */}
                    <div>
                        <UserSearch className="w-full" />
                    </div>

                    {/* Nav Links */}
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    pathname.startsWith(item.href)
                                    ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                        {session?.user?.role === "ADMIN" && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <ShieldAlert className="w-5 h-5" />
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="h-px bg-[var(--card-border)]" />

                    {/* User Section */}
                    {status === "authenticated" && session.user ? (
                        <div className="space-y-4">
                            <Link 
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--foreground)]/5"
                            >
                                {session.user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
                                ) : (
                                    <UserCircle className="w-10 h-10" />
                                )}
                                <div>
                                    <div className="font-medium">{session.user.name}</div>
                                    <div className="text-xs text-[var(--foreground)]/60">View Profile</div>
                                </div>
                            </Link>
                            
                            <button 
                                onClick={() => signOut()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex w-full items-center justify-center px-4 py-3 rounded-lg bg-[var(--foreground)]/5 font-medium hover:bg-[var(--foreground)]/10"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsOpen(false)}
                                className="flex w-full items-center justify-center px-4 py-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}