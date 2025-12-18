"use client";

import Link from "next/link";
import { Menu, X, UserCircle, MessageSquare, Flame } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "next-auth/react";
import UserSearch from "./UserSearch";
import NotificationBell from "./NotificationBell";
import Logo from "./Logo";

import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dailySlug, setDailySlug] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [solvedToday, setSolvedToday] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Streak from DB
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

  // Update streak if session changes
  useEffect(() => {
    if (session?.user?.streak !== undefined) {
      setStreak(session.user.streak);
    }
  }, [session?.user?.streak]);

  // Fetch Daily Problem Slug
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const { data } = await axios.get("/api/problems/daily");
        if (data.problem?.slug) {
          setDailySlug(data.problem.slug);
        }
      } catch (error) {
        console.error("Failed to fetch daily problem for streak link", error);
      }
    };
    fetchDaily();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 md:gap-6">
          {/* Left Section: Logo & Desktop Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="w-9 h-9 transition-transform group-hover:scale-105 duration-300" />
              <span className="text-xl font-bold text-[var(--foreground)] hidden sm:block tracking-tight">
                LeetClone
              </span>
            </Link>

            {/* Desktop Nav Links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/problems">Problems</NavLink>
              <NavLink href="/study-plans">Study Plans</NavLink>
              <Link 
                href="/interview" 
                className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors relative"
              >
                Interview
                <span className="absolute -top-3 -right-4 px-1.5 py-0.5 bg-purple-600 text-[8px] font-black text-white rounded-full animate-pulse shadow-lg">NEW</span>
              </Link>
              <NavLink href="/contest">Contest</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/leaderboard">Leaderboard</NavLink>
              <NavLink href="/chat">Chat</NavLink>
              {session?.user?.role === "ADMIN" && (
                  <NavLink href="/admin">Admin</NavLink>
              )}
            </div>
          </div>

          {/* Middle Section: UserSearch (flexible width) */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4">
            <UserSearch />
          </div>

          {/* Right Section: Theme Toggle, Auth/Profile, Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0" ref={dropdownRef}>
            {status === "authenticated" && (
              <Link 
                href={dailySlug ? `/problems/${dailySlug}` : "/problems"}
                className={`flex items-center gap-1 font-medium mr-1 sm:mr-2 px-2 py-1 rounded-md transition-colors ${solvedToday ? 'text-orange-500 hover:bg-orange-500/10' : 'text-[var(--foreground)]/40 hover:bg-[var(--foreground)]/5'}`}
                title={solvedToday ? "Daily Streak - Solved today!" : "Daily Streak - Solve Today's Problem!"}
              >
                <Flame className={`w-5 h-5 ${solvedToday ? "fill-orange-500 text-orange-500" : "text-[var(--foreground)]/40"}`} />
                <span>{streak}</span>
              </Link>
            )}
            <NotificationBell />
            <ThemeToggle />
            
            {/* Desktop Auth/Profile */}
            <div className="hidden md:flex items-center gap-4">
              <div className="h-6 w-px bg-[var(--card-border)]" />
              {status === "authenticated" ? (
                <Link
                  href="/profile"
                  className="text-sm text-[var(--foreground)]/80 flex items-center gap-2 hover:text-[var(--foreground)] transition-colors"
                >
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-7 h-7" />
                  )}
                  <span>{session.user?.name || session.user?.email?.split('@')[0]}</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Dropdown (Nav Links & Auth/Profile for small screens) */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-xl z-50 backdrop-blur-xl md:hidden"
              >
                <div className="px-2 space-y-1">
                  <MobileNavLink href="/problems">Problems</MobileNavLink>
                  <MobileNavLink href="/study-plans">Study Plans</MobileNavLink>
                  <Link 
                    href="/interview" 
                    className="flex items-center justify-between px-4 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"
                  >
                    Interview
                    <span className="px-1.5 py-0.5 bg-purple-600 text-[8px] font-black text-white rounded-full">NEW</span>
                  </Link>
                  <MobileNavLink href="/contest">Contest</MobileNavLink>
                  <MobileNavLink href="/blog">Blog</MobileNavLink>
                  <MobileNavLink href="/leaderboard">Leaderboard</MobileNavLink>
                  <MobileNavLink href="/chat">Chat</MobileNavLink>
                  {session?.user?.role === "ADMIN" && (
                      <MobileNavLink href="/admin">Admin</MobileNavLink>
                  )}
                </div>
                <div className="my-2 border-t border-[var(--card-border)]" />
                <div className="px-2 space-y-2">
                  {status === "authenticated" ? (
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-[var(--foreground)]/80 flex items-center gap-2 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"
                    >
                      {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="w-7 h-7 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-7 h-7" />
                      )}
                      <span>{session.user?.name || session.user?.email?.split('@')[0]}</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-2 text-sm font-medium text-center text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}