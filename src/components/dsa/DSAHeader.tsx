"use client";

import React from "react";
import { motion } from "framer-motion";
import { Share2, Activity, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface DSAHeaderProps {
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  handleShare: () => void;
  isStudio?: boolean;
}

export const DSAHeader = ({ animationSpeed, setAnimationSpeed, handleShare, isStudio }: DSAHeaderProps) => {
  if (isStudio) {
    return (
      <div className="flex items-center gap-3 sm:gap-8 shrink overflow-hidden">
         <div className="flex items-center gap-2 sm:gap-4 bg-[var(--foreground)]/[0.03] border border-[var(--border)] px-2.5 sm:px-4 py-1.5 rounded-full backdrop-blur-xl shadow-xl shrink overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
               <span className="hidden xs:inline text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Speed</span>
               <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#3b82f6] tabular-nums w-10 sm:w-12">{animationSpeed}ms</span>
            </div>
            <div className="w-16 sm:w-40 h-1.5 relative flex items-center group/slider shrink overflow-hidden">
               <div className="absolute w-full h-1 bg-[var(--foreground)]/5 rounded-full overflow-hidden" />
               <input 
                  type="range" min="100" max="2000" step="100" 
                  value={animationSpeed} 
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} 
                  className="w-full h-2 opacity-0 cursor-pointer z-10" 
               />
               <div 
                  className="absolute h-1 bg-[#3b82f6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${((animationSpeed - 100) / 1900) * 100}%` }}
               />
               <div 
                  className="absolute w-3 h-3 bg-white rounded-full shadow-lg transition-transform group-hover/slider:scale-125 border-2 border-[var(--background)]"
                  style={{ left: `calc(${((animationSpeed - 100) / 1900) * 100}% - 6px)` }}
               />
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all border border-transparent hover:border-[var(--border)]">
               <Share2 size={16} />
            </button>
            <Link href="/problems" className="p-2 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 rounded-lg text-[#3b82f6] transition-all border border-[#3b82f6]/20 flex items-center gap-2 group">
               <span className="text-[9px] font-black uppercase tracking-widest ml-1">Practice</span>
               <Play size={14} className="fill-current group-hover:scale-110 transition-transform" />
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Mobile/Default Fallback */}
       <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
              <Link href="/" className="p-2 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6]"><ChevronLeft size={20} /></Link>
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">DSA <span className="text-[#3b82f6]">Studio</span></h1>
          </div>
          <button onClick={handleShare} className="p-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[var(--muted-foreground)]">
              <Share2 size={20} />
          </button>
      </div>
    </div>
  );
};
