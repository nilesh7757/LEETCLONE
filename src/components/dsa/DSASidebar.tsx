"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

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

interface DSASidebarProps {
  filteredCategories: DSACategory[];
  selectedCategory: DSACategory;
  setSelectedCategory: (cat: DSACategory) => void;
}

export const DSASidebar = ({ filteredCategories, selectedCategory, setSelectedCategory }: DSASidebarProps) => {
  return (
    <div className="hidden lg:block lg:col-span-3 space-y-4 max-h-[80vh] overflow-y-auto pr-6 scrollbar-hide sticky top-12 pb-20">
      <div className="flex items-center gap-3 px-4 mb-6 opacity-40">
        <Layers size={14} className="text-[var(--primary)]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Coordinate Systems</h3>
      </div>
      
      {filteredCategories.length > 0 ? (
        <div className="space-y-2">
          {filteredCategories.map((cat) => {
            const isActive = selectedCategory.id === cat.id;
            const themeColor = cat.themeColor || "var(--primary)";
            const themeRGB = cat.themeRGB || "var(--viz-blue-rgb)";
            
            return (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat)} 
                className={`w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 flex items-center gap-5 group relative overflow-hidden ${
                  isActive 
                    ? "bg-[var(--muted)] shadow-xl translate-x-2" 
                    : "bg-transparent hover:bg-[var(--muted)]/40 hover:translate-x-1"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-glow"
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(to right, ${themeColor}0D, transparent)` }}
                  />
                )}
                
                <div className={`p-3 rounded-2xl transition-all duration-500 shadow-inner ${
                  isActive ? "text-[var(--background)] scale-110 shadow-lg" : "bg-[var(--muted)] text-[var(--muted-foreground)]/40 group-hover:text-[var(--muted-foreground)]"
                }`}
                style={isActive ? { backgroundColor: themeColor, boxShadow: `0 0 20px rgba(${themeRGB}, 0.2)` } : {}}
                >
                  {React.isValidElement(cat.icon) && React.cloneElement(cat.icon as React.ReactElement<{ size: number }>, { size: 20 })}
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                  <h4 className={`font-bold text-sm tracking-tight transition-colors ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/60 group-hover:text-[var(--foreground)]"}`}>
                    {cat.title}
                  </h4>
                  <p className="text-[9px] text-[var(--muted-foreground)]/40 font-mono mt-1 uppercase tracking-tighter line-clamp-1">
                    {cat.description}
                  </p>
                </div>

                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="w-1.5 h-1.5 rounded-full shadow-lg" 
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--muted)]/20 rounded-[2.5rem] border border-dashed border-[var(--border)]">
          <p className="text-[10px] text-[var(--muted-foreground)]/40 font-mono uppercase tracking-widest text-center">No matching manifolds detected</p>
        </div>
      )}
    </div>
  );
};