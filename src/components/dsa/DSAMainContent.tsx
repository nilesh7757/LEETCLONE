"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface DSAMainContentProps {
  selectedCategory: any;
  animationSpeed: number;
}

export const DSAMainContent = ({ selectedCategory, animationSpeed }: DSAMainContentProps) => {
  return (
    <div className="lg:col-span-9 w-full">
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory.id} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.98 }} 
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile Specific Controls */}
          <div className="lg:hidden mb-6 p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Speed</span>
              <div className="text-xs font-mono text-[#f59e0b] font-bold">{animationSpeed}ms</div>
          </div>

          {/* The Visualizer */}
          <div className="mb-12 w-full overflow-hidden relative group/viz">
            <div id="viz-container" className="bg-card rounded-[3rem] border border-border overflow-hidden">
              <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
                  {selectedCategory.component(animationSpeed)}
              </ErrorBoundary>
            </div>
          </div>

          {/* Mathematical Documentation */}
          <div className="mt-12">
             <div className="flex items-center gap-4 mb-10">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><BookOpen size={14} className="text-[#58C4DD]" />Logical Documentation</h3>
                <div className="h-[1px] flex-1 bg-border" />
             </div>
             
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[200px]">
                  {selectedCategory.detailedDocs || (
                      <div className="p-12 border border-dashed border-border rounded-[3rem] text-center">
                          <p className="text-muted-foreground/20 text-xs font-mono uppercase tracking-widest">Documentation for this manifold is currently rendering.</p>
                      </div>
                  )}
             </motion.div>
          </div>

          {/* Footer Action */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 p-8 bg-card border border-border rounded-[3rem] flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#58C4DD]/20 to-transparent" />
             <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#58C4DD]/10 flex items-center justify-center text-[#58C4DD] shadow-inner"><Search size={24} /></div>
                <div><h4 className="font-bold text-lg">Next Objectives</h4><p className="text-xs text-muted-foreground font-light tracking-wide mt-1">Apply this lemma to real-world complexity challenges.</p></div>
             </div>
             <button className="group px-8 py-3 bg-[#58C4DD] text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_#58C4DD44]">Start Challenges <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};