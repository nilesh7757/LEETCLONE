"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, Tag } from "lucide-react";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const debouncedSearch = useDebounceValue(search, 400);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query state reactively inside startTransition
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
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [debouncedSearch, difficulty, category, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]/20 select-none">
      {/* Search Input (Left) */}
      <div className="relative w-full sm:max-w-xs group/input">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/40 group-focus-within/input:text-[var(--primary)] transition-colors pointer-events-none">
            <Search className="w-3.5 h-3.5" />
        </div>
        <input 
          type="text" 
          placeholder="Search problems..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2.5 pl-9.5 pr-8 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 focus:outline-none focus:border-[var(--primary)]/50 transition-all font-mono"
        />
        {search && (
          <button 
            onClick={() => setSearch("")} 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Difficulty Select (Center) */}
        <div className="flex bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl p-0.5 gap-0.5 shrink-0">
          {["All", ...difficulties].map(d => {
             const isActive = difficulty === d;
             return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  type="button"
                  className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all text-center cursor-pointer ${
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

        {/* Category Dropdown (Right) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Tag size={12} className="text-blue-400" />
            {category === "All" ? "Topic tags" : category}
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTagsOpen ? "rotate-180" : ""}`} />
          </button>

          {isTagsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1.5">
                Topic Tag Filters
              </div>
              <button
                onClick={() => { setCategory("All"); setIsTagsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                  category === "All" ? "text-blue-400 bg-white/5" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                All Topics
              </button>
              {tags.map(tag => {
                const isSelected = category === tag.name || (tag.name === "DP" && category === "Dynamic Programming");
                return (
                  <button
                    key={tag.name}
                    onClick={() => { setCategory(tag.name); setIsTagsOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                      isSelected ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                    style={isSelected ? { color: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}