"use client";

import React from "react";
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
    <div className="mb-10 flex flex-col md:flex-row gap-6 items-center">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-[#58C4DD] transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search algorithms..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#58C4DD]/50 transition-all placeholder:text-muted-foreground/30"
        />
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeGroup === group.id ? "bg-[#58C4DD] text-black shadow-[0_0_15px_rgba(88,196,221,0.3)]" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}
          >
            {group.icon}
            {group.title}
          </button>
        ))}
      </div>
    </div>
  );
};