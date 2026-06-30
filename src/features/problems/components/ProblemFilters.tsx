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
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-md relative overflow-hidden group select-none">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)]">
            <Filter size={16} />
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/60">Search & Filter</span>
           <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">Refine Problems</span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Search */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[var(--muted-foreground)]/60 uppercase tracking-widest ml-1">Search Keywords</label>
          <div className="relative group/input">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/40 group-focus-within/input:text-[var(--primary)] transition-colors pointer-events-none">
                <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-10 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 focus:outline-none focus:border-[var(--primary)]/50 transition-all font-mono"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white p-1 rounded-lg hover:bg-[var(--foreground)]/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[var(--muted-foreground)]/60 uppercase tracking-widest ml-1">Difficulty Level</label>
          <div className="flex bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl p-1 w-full gap-1">
            {["All", ...difficulties].map(d => {
               const isActive = difficulty === d;
               return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    type="button"
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center cursor-pointer ${
                      isActive 
                        ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--border)]" 
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent border border-transparent"
                    }`}
                  >
                    {d}
                  </button>
               )
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
           <button 
             onClick={() => setIsTagsOpen(!isTagsOpen)}
             type="button"
             className="flex items-center justify-between w-full text-[10px] font-black text-[var(--muted-foreground)]/60 uppercase tracking-widest ml-1 hover:text-[var(--primary)] transition-colors group cursor-pointer"
           >
             <div className="flex items-center gap-2">
                <Tag size={12} className="group-hover:rotate-12 transition-transform" />
                Problem Categories
             </div>
             <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTagsOpen ? "rotate-180" : ""}`} />
           </button>
           
           <AnimatePresence>
             {isTagsOpen && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="flex flex-wrap gap-1.5 pt-2">
                   <button
                      onClick={() => setCategory("All")}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all border ${
                        category === "All" 
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                          : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] border-[var(--border)] hover:border-white/10"
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
                          className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all border ${
                            isSelected
                              ? "bg-white/10 text-white border-white/20 shadow-sm"
                              : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] border-[var(--border)] hover:border-white/10 hover:text-[var(--foreground)]"
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

      <div className="mt-6 pt-4 border-t border-[var(--border)]/30 flex items-center gap-1.5">
         <div className="w-1 h-1 rounded-full bg-emerald-500" />
         <span className="text-[9px] font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">Filters Active</span>
      </div>
    </div>
  );
}