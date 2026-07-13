"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Code2, RefreshCw, Home, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console (swap for Sentry/Datadog in production)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center overflow-hidden px-4">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(143,68,240,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(143,68,240,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none" />

      <div className="flex flex-col items-center text-center w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#8F44F0]/15 flex items-center justify-center border border-[#8F44F0]/30">
            <Code2 className="w-5 h-5 text-[#8F44F0]" />
          </div>
          <span className="text-base font-black tracking-[0.2em] text-[var(--foreground)] uppercase">
            LOGIQUEST
          </span>
        </div>

        {/* Error card */}
        <div className="w-full bg-[var(--card)] border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl mb-8">
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-red-500/15 bg-red-500/5">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-red-400">
                Runtime Exception
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-mono mt-0.5">
                An unexpected error interrupted the application.
              </p>
            </div>
          </div>

          {/* Error detail */}
          <div className="p-5 text-left space-y-3">
            <p className="text-sm font-bold text-[var(--foreground)]">
              Something went wrong
            </p>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              A component threw an unhandled error. This has been logged. You can try again — if the problem persists, refresh the page or return to the home screen.
            </p>

            {/* Error message (only in dev) */}
            {process.env.NODE_ENV === "development" && error?.message && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] font-mono text-[11px] text-red-400 break-all">
                <span className="text-[var(--muted-foreground)] block mb-1 text-[9px] uppercase tracking-widest">
                  Error message (dev only)
                </span>
                {error.message}
                {error.digest && (
                  <span className="block text-[var(--muted-foreground)] mt-1">
                    digest: {error.digest}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8F44F0] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(143,68,240,0.35)] active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--input)] text-[var(--foreground)] font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-all text-sm uppercase tracking-wider active:scale-95"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
          <Link href="/problems" className="hover:text-[#8F44F0] transition-colors">Problems</Link>
          <Link href="/arena" className="hover:text-[#8F44F0] transition-colors">Arena</Link>
          <Link href="/dsa" className="hover:text-[#8F44F0] transition-colors">Visualizer</Link>
          <Link href="/leaderboard" className="hover:text-[#8F44F0] transition-colors">Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
