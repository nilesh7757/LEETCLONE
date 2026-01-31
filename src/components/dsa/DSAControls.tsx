"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface DSAControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  groups: { id: string, title: string, icon: React.ReactNode }[];
}

export const DSAControls = ({ searchTerm, setSearchTerm, activeGroup, setActiveGroup, groups }: DSAControlsProps) => {
  return (
    <div className="mb-16 flex flex-col gap-10">
      <div className="flex flex-col xl:flex-row items-center gap-10">
        <div className="relative w-full xl:w-[450px] group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--primary)]/40 group-focus-within:text-[var(--primary)] group-focus-within:scale-110 transition-all duration-500 pointer-events-none" >
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Search neural protocols..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--card)] rounded-[1.5rem] py-5 pl-16 pr-8 text-lg text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-[var(--muted-foreground)]/20 shadow-2xl font-light border-none"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
            <kbd className="px-2 py-1 bg-[var(--muted)] rounded-md text-[10px] font-mono font-black tracking-widest text-[var(--foreground)] shadow-sm">CTRL</kbd>
            <kbd className="px-2 py-1 bg-[var(--muted)] rounded-md text-[10px] font-mono font-black tracking-widest text-[var(--foreground)] shadow-sm">K</kbd>
          </div>
        </div>
        
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide w-full mask-fade-edges">
            {groups.map((group) => {
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap relative overflow-hidden group/btn ${
                    isActive 
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xl shadow-[var(--primary)]/30 scale-105" 
                      : "bg-[var(--card)] text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--muted)] shadow-lg"
                  }`}
                >
                  <span className={`transition-transform duration-500 ${isActive ? "scale-110" : "group-hover/btn:rotate-12"}`}>
                    {group.icon}
                  </span>
                  {group.title}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white/10 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <span className="text-[9px] font-black text-[var(--muted-foreground)]/20 uppercase tracking-[0.5em]">Command Protocol v2.0.4</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>
    </div>
  );
};