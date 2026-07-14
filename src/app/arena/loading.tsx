"use client";

import { Activity, Trophy, Users, Globe, ShieldCheck } from "lucide-react";

const shimmer = "animate-pulse";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-x-hidden pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '100px 100px', perspective: '1200px', transform: 'rotateX(65deg) translateY(-10%)', transformOrigin: 'top' }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10"> 
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${shimmer}`}>
                  <Trophy size={28} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-[#52525b] uppercase w-24 h-3 bg-white/10 rounded" />
                  <span className="text-[10px] font-bold tracking-widest uppercase mt-[-2px] w-32 h-3 bg-white/10 rounded" />
               </div>
            </div>

            <div className="space-y-2">
               <h1 className="text-7xl font-bold tracking-tighter text-white leading-none w-64 h-16 bg-white/10 rounded-2xl" />
               <p className="text-xl text-[#a1a1aa] max-w-2xl font-light leading-relaxed w-96 h-6 bg-white/5 rounded" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="w-48 h-14 bg-white/10 rounded-2xl" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-3xl w-fit mb-12">
           <div className="flex items-center gap-3 px-10 py-4 rounded-2xl w-32 h-12 bg-white/10" />
           <div className="flex items-center gap-3 px-10 py-4 rounded-2xl w-32 h-12 bg-white/5" />
        </div>

        <div className="flex items-center gap-4 mb-16">
           {[1,2,3,4].map(i => (
             <div key={i} className="flex items-center gap-3 px-8 py-3 rounded-full shrink-0 w-28 h-10 bg-white/5" />
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 h-96" />
           ))}
        </div>
      </div>
    </main>
  );
}