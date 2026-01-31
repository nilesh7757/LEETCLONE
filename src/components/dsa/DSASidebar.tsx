"use client";

import React from "react";

interface DSASidebarProps {
  filteredCategories: any[];
  selectedCategory: any;
  setSelectedCategory: (cat: any) => void;
}

export const DSASidebar = ({ filteredCategories, selectedCategory, setSelectedCategory }: DSASidebarProps) => {
  return (
    <div className="hidden lg:block lg:col-span-3 space-y-4 max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide sticky top-32">
      <h3 className="text-[10px] font-black text-muted-foreground/30 px-4 uppercase tracking-[0.25em] mb-4">Coordinate Systems</h3>
      {filteredCategories.length > 0 ? (
        filteredCategories.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat)} 
            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${selectedCategory.id === cat.id ? "bg-muted border-[#58C4DD]/50 shadow-[0_0_20px_rgba(88,196,221,0.1)] translate-x-2" : "bg-transparent border-border hover:border-foreground/20"}`}
          >
            <div className={`p-2.5 rounded-xl transition-colors ${selectedCategory.id === cat.id ? "bg-[#58C4DD]/20" : "bg-muted group-hover:bg-muted/80"}`}>{cat.icon}</div>
            <div>
              <h4 className="font-bold text-xs tracking-wide">{cat.title}</h4>
              <p className="text-[9px] text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter">{cat.description}</p>
            </div>
          </button>
        ))
      ) : (
        <div className="p-8 text-center border border-dashed border-border rounded-2xl">
          <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">No matching manifolds</p>
        </div>
      )}
    </div>
  );
};