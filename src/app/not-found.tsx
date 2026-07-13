"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Code2, ArrowLeft, Home, Terminal } from "lucide-react";

const GLITCH_CHARS = "!@#$%^&*<>/\\|{}[]01";

function useGlitch(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (frame > i * 2) return char;
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join("")
      );
      frame++;
      if (frame > text.length * 2 + 10) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text, active]);

  return display;
}

export default function NotFound() {
  const [glitching, setGlitching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    // Trigger glitch on mount
    setTimeout(() => setGlitching(true), 300);
    setTimeout(() => setGlitching(false), 2500);
  }, []);

  const errorCode = useGlitch("404", glitching);
  const errorMsg = useGlitch("PAGE_NOT_FOUND", glitching);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center overflow-hidden px-4">

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8F44F0]/8 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(143,68,240,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(143,68,240,0.025)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(143,68,240,0.4) 2px, rgba(143,68,240,0.4) 3px)",
        }}
      />

      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[#8F44F0]/15 flex items-center justify-center border border-[#8F44F0]/30">
            <Code2 className="w-5 h-5 text-[#8F44F0]" />
          </div>
          <span className="text-base font-black tracking-[0.2em] text-[var(--foreground)] uppercase">
            LOGIQUEST
          </span>
        </div>

        {/* Terminal window */}
        <div className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl mb-10">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-1.5">
              <Terminal size={10} />
              error.log
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-6 font-mono text-left space-y-2 text-sm">
            <div className="text-[var(--muted-foreground)]">
              <span className="text-[#8F44F0]">$</span> navigate <span className="text-green-400">--to</span> requested_page
            </div>
            <div className="text-red-400">
              ✗ Error: Resource not found at requested path
            </div>
            <div className="text-[var(--muted-foreground)]">
              <span className="text-[#8F44F0]">$</span> status_code
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8F44F0] via-[#c084fc] to-[#60a5fa] leading-none select-none cursor-pointer"
                onClick={() => { setGlitching(true); setTimeout(() => setGlitching(false), 2500); }}
                title="Click to glitch"
              >
                {errorCode}
              </span>
              <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-widest font-bold">
                {errorMsg}
              </span>
            </div>
            <div className="text-[var(--muted-foreground)] text-xs pt-2 border-t border-[var(--border)]">
              The route you requested does not exist or has been moved.
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8F44F0] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(143,68,240,0.35)] active:scale-95"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <button
            onClick={() => history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--input)] text-[var(--foreground)] font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-all text-sm uppercase tracking-wider active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
          <Link href="/problems" className="hover:text-[#8F44F0] transition-colors">Problems</Link>
          <Link href="/arena" className="hover:text-[#8F44F0] transition-colors">Arena</Link>
          <Link href="/dsa" className="hover:text-[#8F44F0] transition-colors">Visualizer</Link>
          <Link href="/leaderboard" className="hover:text-[#8F44F0] transition-colors">Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
