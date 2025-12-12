"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { useDebounce } from "use-debounce"; // We might need to install this or implement a simple hook

// Simple debounce hook implementation if package not available
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

const categories = ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "Other"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function ProblemFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const debouncedSearch = useDebounceValue(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    if (difficulty && difficulty !== "All") params.set("difficulty", difficulty);
    else params.delete("difficulty");

    if (category && category !== "All") params.set("category", category);
    else params.delete("category");

    // Reset page on filter change
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }, [debouncedSearch, difficulty, category, router]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] backdrop-blur-sm mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/50" />
        <input 
          type="text" 
          placeholder="Search problems..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-sm focus:border-[var(--accent-gradient-to)] outline-none transition-colors"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-sm outline-none cursor-pointer focus:border-[var(--accent-gradient-to)] transition-colors min-w-[140px]"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground)]/50 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-sm outline-none cursor-pointer focus:border-[var(--accent-gradient-to)] transition-colors min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground)]/50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
