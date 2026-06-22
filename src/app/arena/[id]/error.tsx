"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Arena page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Something went wrong</h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-8">
          Failed to load contest. Please try again.
        </p>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}