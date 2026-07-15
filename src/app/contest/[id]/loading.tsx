"use client";

import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[1px] border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">
          Loading contest...
        </p>
      </div>
    </div>
  );
}