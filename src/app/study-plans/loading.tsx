"use client";

import { Layers, BookOpen } from "lucide-react";

export default function StudyPlansLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-16">
      {/* HEADER SKELETON */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
                <BookOpen size={20} className="text-[var(--muted-foreground)]" />
             </div>
             <div className="w-32 h-3 bg-[var(--muted)]/50 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="w-64 h-12 bg-[var(--muted)]/50 rounded-2xl animate-pulse" />
            <div className="w-full h-4 bg-[var(--muted)]/50 rounded-lg animate-pulse" />
            <div className="w-4/5 h-4 bg-[var(--muted)]/50 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="w-32 h-12 bg-[var(--muted)]/50 rounded-2xl animate-pulse" />
          <div className="w-32 h-12 bg-[var(--muted)]/50 rounded-2xl animate-pulse" />
          <div className="w-32 h-12 bg-[var(--muted)]/50 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="space-y-24">
        {/* AI SECTION SKELETON */}
        <div className="w-full h-48 bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] animate-pulse" />

        {/* PLANS GRID SKELETON */}
        <section>
          <div className="flex items-center gap-4 mb-10">
              <div className="h-[1px] flex-1 bg-[var(--muted)]/50" />
              <div className="flex items-center gap-3 px-4">
                <Layers size={14} className="text-[#262626]" />
                <div className="w-40 h-3 bg-[var(--muted)]/50 rounded-full animate-pulse" />
              </div>
              <div className="h-[1px] flex-1 bg-[var(--muted)]/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] flex flex-col h-[400px]">
                <div className="aspect-video w-full bg-[var(--muted)]/50 rounded-[1.5rem] mb-8 animate-pulse" />
                <div className="space-y-4 mb-8">
                  <div className="w-3/4 h-7 bg-[var(--muted)]/50 rounded-xl animate-pulse" />
                  <div className="w-full h-4 bg-[var(--muted)]/50 rounded-lg animate-pulse" />
                  <div className="w-5/6 h-4 bg-[var(--muted)]/50 rounded-lg animate-pulse" />
                </div>
                <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="w-24 h-4 bg-[var(--muted)]/50 rounded-full animate-pulse" />
                  <div className="w-16 h-4 bg-[var(--muted)]/50 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
