"use client";

import Link from "next/link";
import { Menu, X, UserCircle, Flame, ChevronDown } from "lucide-react";
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
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Section: Logo & Desktop Nav Links */}
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Logo className="w-8 h-8 lg:w-9 lg:h-9 transition-transform group-hover:scale-105 duration-300" />
              <span className="text-lg lg:text-xl font-bold text-[var(--foreground)] hidden sm:block tracking-tight">
                LeetClone
              </span>
            </Link>

            {/* Desktop Nav Links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <NavLink href="/problems">Problems</NavLink>
              <NavLink href="/study-plans">Study Plans</NavLink>
              <NavLink href="/interview">Interview</NavLink>
              <NavLink href="/contest">Contest</NavLink>
              
              {/* More Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] rounded-md transition-colors">
                  More <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-48 py-1 mt-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left flex flex-col p-1">
                   <DropdownLink href="/dsa">Visualize</DropdownLink>
                   <DropdownLink href="/leaderboard">Leaderboard</DropdownLink>
                   <DropdownLink href="/blog">Blog</DropdownLink>
                   <DropdownLink href="/chat">Chat</DropdownLink>
                </div>
              </div>

              {session?.user?.role === "ADMIN" && (
                  <NavLink href="/admin">Admin</NavLink>
              )}
            </div>
          </div>

          {/* Middle Section: UserSearch (flexible width) */}
          <div className="flex-1 max-w-sm lg:max-w-md hidden sm:block">
            <UserSearch />
          </div>

          {/* Right Section: Theme Toggle, Auth/Profile, Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0" ref={dropdownRef}>
            
            {/* Mobile Search Icon Placeholder (if needed, or user search is just hidden on very small screens) */}
            <div className="sm:hidden">
                 {/* Ideally we'd have a search icon toggle here, but keeping it simple for now */}
            </div>

            {status === "authenticated" && (
              <Link 
                href={dailySlug ? `/problems/${dailySlug}` : "/problems"}
                className={`flex items-center gap-1.5 font-medium px-2 py-1.5 rounded-md transition-colors ${solvedToday ? 'text-orange-500 bg-orange-500/10' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
                title={solvedToday ? "Daily Streak - Solved today!" : "Daily Streak - Solve Today's Problem!"}
              >
                <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${solvedToday ? "fill-orange-500" : ""}`} />
                <span className="text-sm sm:text-base">{streak}</span>
              </Link>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell />
                <ThemeToggle />
            </div>
            
            {/* Desktop Auth/Profile */}
            <div className="hidden md:flex items-center gap-4 pl-2 border-l border-[var(--card-border)] ml-2">
              {status === "authenticated" ? (
                <Link
                  href="/profile"
                  className="group flex items-center gap-2 text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="relative">
                     {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-[var(--foreground)]/10 transition-all"
                        />
                      ) : (
                        <UserCircle className="w-8 h-8" />
                      )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-all shadow-sm hover:shadow"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 -mr-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 w-full bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--card-border)] shadow-lg md:hidden overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  
                  {/* Mobile Search */}
                  <div className="sm:hidden">
                      <UserSearch />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <MobileNavLink href="/problems">Problems</MobileNavLink>
                    <MobileNavLink href="/study-plans">Study Plans</MobileNavLink>
                    <MobileNavLink href="/interview">Interview</MobileNavLink>
                    <MobileNavLink href="/contest">Contest</MobileNavLink>
                    <MobileNavLink href="/dsa">Visualize</MobileNavLink>
                    <MobileNavLink href="/leaderboard">Leaderboard</MobileNavLink>
                    <MobileNavLink href="/blog">Blog</MobileNavLink>
                    <MobileNavLink href="/chat">Chat</MobileNavLink>
                    {session?.user?.role === "ADMIN" && (
                        <MobileNavLink href="/admin">Admin</MobileNavLink>
                    )}
                  </div>

                  <div className="h-px bg-[var(--card-border)] my-2" />

                  {status === "authenticated" ? (
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {session.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10" />
                      )}
                      <div>
                          <div className="font-medium text-[var(--foreground)]">
                              {session.user?.name || session.user?.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-[var(--foreground)]/60">View Profile</div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 text-center text-sm font-medium text-[var(--foreground)] bg-[var(--foreground)]/5 rounded-lg hover:bg-[var(--foreground)]/10 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 text-center text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Get Started
                      </Link>
                    </div>
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
      className="px-3 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-md transition-all"
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-lg transition-colors mx-1"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center px-4 py-3 text-sm font-medium text-[var(--foreground)]/70 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 hover:text-[var(--foreground)] rounded-xl transition-all"
    >
      {children}
    </Link>
  );
}
