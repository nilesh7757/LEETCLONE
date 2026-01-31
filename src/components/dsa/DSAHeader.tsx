"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Share2, Activity } from "lucide-react";

interface DSAHeaderProps {
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  handleShare: () => void;
}

export const DSAHeader = ({ animationSpeed, setAnimationSpeed, handleShare }: DSAHeaderProps) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)] shadow-sm"><GraduationCap size={20} /></div>
              <h1 className="text-xl font-light tracking-tight text-[var(--foreground)]">DSA <span className="text-[var(--primary)] font-medium">Visualizer</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">
                <Share2 size={20} />
            </button>
          </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12 pt-8 relative">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 group">
              <div className="p-3 bg-[var(--primary)]/10 rounded-[1.25rem] text-[var(--primary)] shadow-inner transition-transform group-hover:rotate-12 duration-500"><GraduationCap size={32} /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.5em] text-[var(--muted-foreground)] uppercase">Neuro-Computational</span>
                <span className="text-[10px] font-black tracking-[0.5em] text-[var(--primary)] uppercase mt-[-2px]">Academy of Algorithms</span>
              </div>
          </div>
          <div className="flex items-center gap-8">
            <h1 className="text-7xl font-light tracking-tighter text-[var(--foreground)] leading-none">
              Neuro <span className="text-[var(--primary)] font-black italic">Visualize</span>
            </h1>
            <button onClick={handleShare} className="mt-2 p-4 bg-[var(--muted)] rounded-2xl text-[var(--muted-foreground)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all shadow-inner group">
              <Share2 size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
            Deconstruct complex computational manifolds through interactive state transformation and temporal frequency analysis.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} className="p-8 bg-[var(--card)] rounded-[3rem] flex flex-col gap-6 min-w-[320px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-gold)]/30 to-transparent" />
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern group-hover:opacity-[0.05] transition-opacity" />
           
           <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.3em]">Temporal Unit Frequency</span>
                <div className="text-3xl font-black text-[var(--viz-gold)] font-mono">{animationSpeed}<span className="text-xs ml-1 font-light opacity-40">ms</span></div>
              </div>
              <div className="p-2 bg-[var(--viz-gold)]/10 rounded-lg text-[var(--viz-gold)] shadow-inner"><Activity size={16} /></div>
           </div>
           
           <div className="relative flex items-center h-2 group/slider">
             <div className="absolute w-full h-1.5 bg-[var(--muted)] rounded-full shadow-inner" />
             <input type="range" min="100" max="2000" step="100" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} className="w-full h-2 opacity-0 cursor-pointer z-10" />
             <motion.div 
               className="absolute h-1.5 bg-[var(--viz-gold)] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
               style={{ width: `${((animationSpeed - 100) / 1900) * 100}%` }}
             />
             <div 
               className="absolute w-4 h-4 bg-white rounded-full shadow-xl pointer-events-none transition-all duration-300 group-hover/slider:scale-125"
               style={{ left: `calc(${((animationSpeed - 100) / 1900) * 100}% - 8px)` }}
             />
           </div>
           
           <div className="flex justify-between text-[9px] font-mono font-black text-[var(--muted-foreground)]/30 uppercase tracking-widest relative z-10">
             <span>High Frequency</span>
             <span>Deep Analysis</span>
           </div>
        </motion.div>
      </div>
    </>
  );
};