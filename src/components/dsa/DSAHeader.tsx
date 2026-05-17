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
      <div className="flex items-center gap-8">
         <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-[#52525b] uppercase tracking-widest">Speed</span>
               <span className="text-[11px] font-mono font-bold text-[#3b82f6] tabular-nums w-12">{animationSpeed}ms</span>
            </div>
            <div className="w-40 h-1.5 relative flex items-center group/slider">
               <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden" />
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
                  className="absolute w-3 h-3 bg-white rounded-full shadow-lg transition-transform group-hover/slider:scale-125 border-2 border-[#050505]"
                  style={{ left: `calc(${((animationSpeed - 100) / 1900) * 100}% - 6px)` }}
               />
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-white/5 rounded-lg text-[#52525b] hover:text-white transition-all border border-transparent hover:border-white/5">
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
              <h1 className="text-xl font-bold tracking-tight text-white">DSA <span className="text-[#3b82f6]">Studio</span></h1>
          </div>
          <button onClick={handleShare} className="p-2 bg-white/5 border border-white/5 rounded-xl text-[#52525b]">
              <Share2 size={20} />
          </button>
      </div>
    </div>
  );
};
