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
  }, [debouncedSearch, difficulty, category, router]);

  return (
    <div className="bg-[var(--card)]/50 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-purple)] opacity-50" />

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[var(--viz-cyan)]/10 rounded-lg text-[var(--viz-cyan)]">
            <Filter size={18} />
        </div>
        <span className="font-bold text-[var(--foreground)]">Refine Matrix</span>
      </div>

      <div className="space-y-8">
        
        {/* Search */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Search Keywords</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--viz-cyan)] transition-colors pointer-events-none">
                <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="e.g. 'Binary Search'..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--viz-cyan)]/50 focus:border-[var(--viz-cyan)] transition-all shadow-inner"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Complexity</label>
          <div className="grid grid-cols-1 gap-2">
            <button
               onClick={() => setDifficulty("All")}
               className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                 difficulty === "All" 
                 ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" 
                 : "bg-[var(--background)]/30 text-[var(--muted-foreground)] hover:bg-[var(--background)]/60 hover:text-[var(--foreground)]"
               }`}
            >
              <span>Any Complexity</span>
              {difficulty === "All" && <Check className="w-4 h-4" />}
            </button>
            
            {difficulties.map(d => {
               const isActive = difficulty === d;
               const colorVar = d === "Easy" ? "var(--viz-green)" : d === "Medium" ? "var(--viz-amber)" : "var(--viz-red)";
               
               return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden group ${
                      isActive ? "bg-[var(--background)] shadow-md" : "hover:bg-[var(--background)]/50"
                    }`}
                    style={isActive ? { color: colorVar } : { color: 'var(--muted-foreground)' }}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: colorVar }} />
                    <span className={`transition-transform ${isActive ? 'translate-x-2' : ''} group-hover:text-[var(--foreground)]`}>{d}</span>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
               )
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
           <button 
             onClick={() => setIsTagsOpen(!isTagsOpen)}
             className="flex items-center justify-between w-full text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1 hover:text-[var(--foreground)] transition-colors"
           >
             <div className="flex items-center gap-2">
                <Tag size={12} />
                Topics
             </div>
             <ChevronDown className={`w-3 h-3 transition-transform ${isTagsOpen ? "rotate-180" : ""}`} />
           </button>
           
           <AnimatePresence>
             {isTagsOpen && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="flex flex-wrap gap-2 pt-1">
                   <button
                      onClick={() => setCategory("All")}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        category === "All" 
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--background)]/30 text-[var(--muted-foreground)] hover:bg-[var(--background)]/60 hover:text-[var(--foreground)]"
                      }`}
                   >
                     All
                   </button>
                   {tags.map(tag => {
                      const isSelected = category === tag.name || (tag.name === "DP" && category === "Dynamic Programming");
                      return (
                        <button
                          key={tag.name}
                          onClick={() => setCategory(tag.name)}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-transparent hover:border-[var(--border)] ${
                            isSelected
                              ? "bg-[var(--background)] shadow-inner"
                              : "bg-[var(--background)]/30 text-[var(--muted-foreground)] hover:bg-[var(--background)]/60 hover:text-[var(--foreground)]"
                          }`}
                          style={isSelected ? { color: tag.color, boxShadow: `0 0 10px ${tag.color}20` } : {}}
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
    </div>
  );
}