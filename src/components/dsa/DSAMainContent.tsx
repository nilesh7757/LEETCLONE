"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface DSACategory {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  themeRGB: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (speed: number) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detailedDocs: any;
}

interface DSAMainContentProps {
  selectedCategory: DSACategory;
  animationSpeed: number;
}

export const DSAMainContent = ({ selectedCategory, animationSpeed }: DSAMainContentProps) => {
  const themeColor = selectedCategory.themeColor || "var(--primary)";
  const themeRGB = selectedCategory.themeRGB || "var(--viz-blue-rgb)";

  return (
    <div className="w-full space-y-12 relative">
      {/* Dynamic Background Glow for the specific Algorithm */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none blur-[120px] transition-colors duration-1000 rounded-full"
        style={{ backgroundColor: themeColor }}
      />

      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory.id} 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.98 }} 
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-16"
        >
          {/* Mobile Specific Controls */}
          <div className="lg:hidden p-6 bg-[var(--card)] rounded-2xl flex items-center justify-between shadow-xl">
              <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em]">Temporal Unit Scale</span>
              <div className="text-sm font-mono font-black" style={{ color: "var(--viz-gold)" }}>{animationSpeed}ms</div>
          </div>

          {/* The Visualizer Container */}
          <div className="w-full relative group/viz">
            <div id="viz-container" className="bg-[var(--card)] rounded-[3.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${themeColor}1A, transparent)` }} />
              <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
                  {selectedCategory.component(animationSpeed)}
              </ErrorBoundary>
            </div>
          </div>

          {/* Mathematical Documentation */}
          <div className="space-y-12">
             <div className="flex items-center gap-6">
                <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to right, transparent, ${themeColor}1A)` }} />
                <h3 className="text-[10px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-[0.4em] flex items-center gap-3">
                  <BookOpen size={16} style={{ color: themeColor }} />
                  Manifold Specification
                </h3>
                <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to left, transparent, ${themeColor}1A)` }} />
             </div>
             
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               transition={{ delay: 0.2 }}
               className="min-h-[200px]"
             >
                  {selectedCategory.detailedDocs || (
                      <div className="p-20 rounded-[3rem] text-center bg-[var(--muted)]/10 relative overflow-hidden group">
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
                          <p className="text-[var(--muted-foreground)]/30 text-xs font-mono uppercase tracking-[0.3em] relative z-10 animate-pulse">Documentation for this protocol is currently synthesizing...</p>
                      </div>
                  )}
             </motion.div>
          </div>

          {/* Footer Action */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="p-10 bg-[var(--card)] rounded-[3rem] flex flex-col md:flex-row gap-10 items-center justify-between shadow-2xl overflow-hidden relative group"
          >
             <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${themeColor}4D, transparent)` }} />
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern group-hover:opacity-[0.04] transition-opacity" />
             
             <div className="flex gap-8 items-center relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${themeColor}1A`, color: themeColor }}>
                  <Search size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-2xl tracking-tight text-[var(--foreground)]">Cognitive Challenges</h4>
                  <p className="text-sm text-[var(--muted-foreground)] font-light tracking-wide mt-2">Apply this lemma to real-world complexity protocols.</p>
                </div>
             </div>
             
             <button className="group/btn relative px-10 py-4 text-[var(--background)] rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center gap-3 shadow-2xl overflow-hidden"
               style={{ backgroundColor: themeColor, boxShadow: `0 0 30px rgba(${themeRGB}, 0.2)` }}
             >
                <span className="relative z-10">Initialize Vector</span>
                <ChevronRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
             </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};