"use client";

import Link from "next/link";
import { Code2, Menu, X, UserCircle, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "next-auth/react"; // signOut will be moved to profile page

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession(); // Use the useSession hook

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

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-[var(--foreground)]/5 rounded-lg border border-[var(--card-border)] group-hover:border-[var(--foreground)]/20 transition-colors">
              <Code2 className="w-6 h-6 text-[var(--foreground)]" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              LeetClone
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/problems">Problems</NavLink>
            <NavLink href="/contest">Contest</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/chat">Chat</NavLink>
            {session?.user?.role === "ADMIN" && (
                <NavLink href="/admin">Admin</NavLink>
            )}
          </div>

          {/* Auth & Theme */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-[var(--card-border)]" />
            {status === "authenticated" ? (
              <Link
                href="/profile" // Link to profile page
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

          {/* Mobile Menu & Theme */}
          <div className="md:hidden flex items-center gap-4 relative" ref={dropdownRef}>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
            >
              {isOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Dropdown */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-xl z-50 backdrop-blur-xl"
                >
                  <div className="px-2 space-y-1">
                    <MobileNavLink href="/problems">Problems</MobileNavLink>
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