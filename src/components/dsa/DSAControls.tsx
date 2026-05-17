"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Terminal } from "lucide-react";

interface DSAControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  groups: { id: string, title: string, icon: React.ReactNode }[];
}

export const DSAControls = ({ searchTerm, setSearchTerm, activeGroup, setActiveGroup, groups }: DSAControlsProps) => {
  return (
    <div className="mb-12 flex flex-col gap-8">
      <div className="flex flex-col xl:flex-row items-center gap-8">
        {/* Terminal Search */}
        <div className="relative w-full xl:w-[480px] group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-[#3b82f6]/40 group-focus-within:text-[#3b82f6] transition-colors duration-500 pointer-events-none">
            <Terminal size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">cmd:</span>
          </div>
          <input 
            type="text" 
            placeholder="search_manifolds..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-24 pr-8 text-sm text-[#f5f5f5] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6]/20 transition-all placeholder:text-[#52525b] font-mono shadow-2xl"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20 group-focus-within:opacity-40 transition-opacity">
            <kbd className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-mono font-black text-white shadow-sm">CTRL</kbd>
            <kbd className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-mono font-black text-white shadow-sm">K</kbd>
          </div>
        </div>
        
        {/* Module Toggles */}
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar w-full mask-fade-edges px-2">
            {groups.map((group) => {
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative overflow-hidden group/btn border ${
                    isActive 
                      ? "bg-[#3b82f6]/10 text-white border-[#3b82f6]/30 shadow-[0_0_25px_rgba(59,130,246,0.15)]" 
                      : "bg-white/[0.02] text-[#52525b] hover:text-[#a1a1aa] hover:bg-white/5 border-white/5 shadow-lg"
                  }`}
                >
                  <span className={`transition-all duration-500 ${isActive ? "text-[#3b82f6] scale-110" : "group-hover/btn:rotate-12"}`}>
                    {group.icon}
                  </span>
                  {group.title}
                  {isActive && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 px-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_#22c55e]" />
           <span className="text-[9px] font-black text-[#52525b] uppercase tracking-[0.4em]">System Status: Ready</span>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
};
