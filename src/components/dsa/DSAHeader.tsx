"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Share2 } from "lucide-react";

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
              <div className="p-2 bg-[#58C4DD]/20 rounded-xl text-[#58C4DD]"><GraduationCap size={20} /></div>
              <h1 className="text-xl font-light tracking-tight">DSA <span className="text-[#58C4DD] font-medium">Visualizer</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 bg-muted rounded-xl text-muted-foreground hover:bg-muted/80 transition-all">
                <Share2 size={20} />
            </button>
          </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 pt-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#58C4DD]/20 rounded-xl text-[#58C4DD]"><GraduationCap size={24} /></div>
              <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">Academy of Algorithms</span>
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-5xl font-light mb-4 tracking-tight">
              DSA <span className="text-[#58C4DD] font-medium">Visualizer</span>
            </h1>
            <button onClick={handleShare} className="mb-4 p-3 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-[#58C4DD] hover:border-[#58C4DD]/30 transition-all">
              <Share2 size={20} />
            </button>
          </div>
          <p className="text-muted-foreground max-w-xl text-lg font-light leading-relaxed">
            Explore the mathematical elegance of computer science through interactive coordinate transformations and temporal state analysis.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-card border border-border rounded-[2.5rem] flex flex-col gap-4 min-w-[280px] backdrop-blur-xl shadow-2xl">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Temporal Scale</span>
              <span className="text-xs font-mono text-[#f59e0b] font-bold">{animationSpeed}ms</span>
           </div>
           <input type="range" min="100" max="2000" step="100" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-[#f59e0b]" />
           <div className="flex justify-between text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter"><span>High Frequency</span><span>Deep Analysis</span></div>
        </motion.div>
      </div>
    </>
  );
};