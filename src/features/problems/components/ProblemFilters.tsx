"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, ChevronDown, Check, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const tags = [
  { name: "Arrays", color: "var(--viz-blue)" },
  { name: "Strings", color: "var(--viz-green)" },
  { name: "Trees", color: "var(--viz-emerald)" },
  { name: "Graphs", color: "var(--viz-purple)" },
  { name: "DP", color: "var(--viz-rose)" },
  { name: "Sorting", color: "var(--viz-amber)" },
  { name: "Greedy", color: "var(--viz-gold)" },
  { name: "Math", color: "var(--viz-red)" },
  { name: "Bit Manipulation", color: "var(--viz-cyan)" },
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function ProblemFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const debouncedSearch = useDebounceValue(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    if (difficulty && difficulty !== "All") params.set("difficulty", difficulty);
    else params.delete("difficulty");

    if (category && category !== "All" && category !== "DP") params.set("category", category);
    else if (category === "DP") params.set("category", "Dynamic Programming");
    else params.delete("category");

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, difficulty, category, router, searchParams]);

  return (
    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent" />
      
      <div className="flex items-center gap-4 mb-10">
        <div className="p-2.5 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6]">
            <Filter size={20} />
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Search & Filter</span>
           <span className="text-sm font-bold text-white tracking-tight">Refine Problems</span>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* Search */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest ml-1">Search Keywords</label>
          <div className="relative group/input">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within/input:text-[#3b82f6] transition-colors pointer-events-none">
                <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#020202] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-[#f5f5f5] placeholder:text-[#262626] focus:outline-none focus:border-[#3b82f6]/50 transition-all font-mono"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest ml-1">Difficulty Level</label>
          <div className="grid grid-cols-1 gap-2">
            <button
               onClick={() => setDifficulty("All")}
               className={`relative flex items-center justify-between px-5 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                 difficulty === "All" 
                 ? "bg-white text-black border-white shadow-lg" 
                 : "bg-white/[0.01] text-[#52525b] border-white/5 hover:bg-white/5 hover:text-[#a1a1aa]"
               }`}
            >
              <span>All Difficulties</span>
            </button>
            
            {difficulties.map(d => {
               const isActive = difficulty === d;
               const colorVar = d === "Easy" ? "#22c55e" : d === "Medium" ? "#f59e0b" : "#ef4444";
               
               return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`relative flex items-center justify-between px-5 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 group border ${
                      isActive ? "bg-white/5 border-white/10 shadow-md" : "bg-transparent border-transparent hover:bg-white/[0.01]"
                    }`}
                    style={isActive ? { color: colorVar } : { color: '#52525b' }}
                  >
                    <span>{d}</span>
                    {isActive && <Check size={12} className="text-current" />}
                  </button>
               )
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
           <button 
             onClick={() => setIsTagsOpen(!isTagsOpen)}
             className="flex items-center justify-between w-full text-[10px] font-bold text-[#52525b] uppercase tracking-widest ml-1 hover:text-[#3b82f6] transition-colors group"
           >
             <div className="flex items-center gap-3">
                <Tag size={14} className="group-hover:rotate-12 transition-transform" />
                Problem Categories
             </div>
             <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${isTagsOpen ? "rotate-180" : ""}`} />
           </button>
           
           <AnimatePresence>
             {isTagsOpen && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="flex flex-wrap gap-2 pt-2">
                   <button
                      onClick={() => setCategory("All")}
                      className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all border ${
                        category === "All" 
                          ? "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                          : "bg-white/[0.02] text-[#52525b] border-white/5 hover:border-white/10"
                      }`}
                   >
                     All Topics
                   </button>
                   {tags.map(tag => {
                      const isSelected = category === tag.name || (tag.name === "DP" && category === "Dynamic Programming");
                      return (
                        <button
                          key={tag.name}
                          onClick={() => setCategory(tag.name)}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all border ${
                            isSelected
                              ? "bg-white/10 text-white border-white/20 shadow-sm"
                              : "bg-white/[0.02] text-[#52525b] border-white/5 hover:border-white/10 hover:text-[#a1a1aa]"
                          }`}
                          style={isSelected ? { color: tag.color, borderColor: `${tag.color}30` } : {}}
                        >
                          {tag.name}
                        </button>
                      )
                   })}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-2">
         <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
         <span className="text-[9px] font-bold text-[#262626] uppercase tracking-widest">Filters Active</span>
      </div>
    </div>
  );
}