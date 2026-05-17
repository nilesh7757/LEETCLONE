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
    <div className="min-h-screen bg-[#020202] text-[#e1e1e1] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-[#52525b] text-sm mb-8">
          Failed to load contest. Please try again.
        </p>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}