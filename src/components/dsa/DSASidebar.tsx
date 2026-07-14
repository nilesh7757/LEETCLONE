"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, ChevronRight, Hash, Activity } from "lucide-react";

export interface DSACategory {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  themeRGB: string;
  complexity?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (speed: number) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detailedDocs: any;
  codeImplementations?: Record<string, string | undefined>;
}

interface DSASidebarProps {
  filteredCategories: DSACategory[];
  selectedCategory: DSACategory;
  setSelectedCategory: (cat: DSACategory) => void;
  isStudio?: boolean;
}

export const DSASidebar = ({ filteredCategories, selectedCategory, setSelectedCategory, isStudio }: DSASidebarProps) => {
  return (
    <div className="space-y-1">
      {filteredCategories.length > 0 ? (
        filteredCategories.map((cat) => {
          const isActive = selectedCategory.id === cat.id;
          const themeColor = cat.themeColor || "#3b82f6";
          
          return (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat)} 
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-4 group relative overflow-hidden border ${
                isActive 
                  ? "bg-[var(--foreground)]/[0.04] border-[var(--border)] shadow-2xl translate-x-1" 
                  : "bg-transparent border-transparent hover:bg-[var(--foreground)]/[0.02] hover:translate-x-0.5"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-glow"
                  className="absolute inset-y-2 left-0 w-1 rounded-r-full pointer-events-none"
                  style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
                />
              )}
              
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 shadow-inner shrink-0 ${
                isActive ? "text-[var(--background)] scale-110 shadow-lg" : "bg-[var(--foreground)]/[0.03] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
              }`}
              style={isActive ? { backgroundColor: themeColor } : {}}
              >
                {React.isValidElement(cat.icon) && React.cloneElement(cat.icon as React.ReactElement<{ size: number }>, { size: 16 })}
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between gap-2">
                   <h4 className={`font-bold text-[12px] tracking-tight transition-colors truncate ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"}`}>
                      {cat.title}
                   </h4>
                   <div className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[7px] font-mono text-[var(--muted-foreground)] shrink-0 group-hover:text-[#3b82f6]/60 transition-colors">
                      O(log N)
                   </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[8px] text-[var(--muted-foreground)]/60 font-black uppercase tracking-widest line-clamp-1 group-hover:text-[var(--muted-foreground)] transition-colors">
                     Execution Unit_{cat.id.slice(0, 4)}
                   </p>
                </div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="p-12 text-center bg-[var(--foreground)]/[0.02] rounded-[2rem] border border-dashed border-[var(--border)]">
          <p className="text-[9px] text-[var(--muted-foreground)] font-mono uppercase tracking-[0.3em] text-center">Protocol Not Found</p>
        </div>
      )}
    </div>
  );
};
