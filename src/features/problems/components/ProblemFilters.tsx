"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, Tag, Star, Briefcase } from "lucide-react";

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
  { name: "Arrays & Hashing", color: "var(--viz-blue)" },
  { name: "Two Pointers", color: "var(--viz-green)" },
  { name: "Sliding Window", color: "var(--viz-cyan)" },
  { name: "Stack", color: "var(--viz-rose)" },
  { name: "Binary Search", color: "var(--viz-amber)" },
  { name: "Linked List", color: "var(--viz-gold)" },
  { name: "Trees", color: "var(--viz-emerald)" },
  { name: "Tries", color: "var(--viz-purple)" },
  { name: "Heap", color: "var(--viz-blue)" },
  { name: "Backtracking", color: "var(--viz-red)" },
  { name: "Graphs", color: "var(--viz-purple)" },
  { name: "Advanced Graphs", color: "var(--viz-rose)" },
  { name: "1-D DP", color: "var(--viz-rose)" },
  { name: "2-D DP", color: "var(--viz-rose)" },
  { name: "Greedy", color: "var(--viz-gold)" },
  { name: "Math & Geometry", color: "var(--viz-red)" },
];

const companies = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Uber",
  "Nvidia",
  "Samsung",
  "Cisco",
  "BNY Mellon",
  "Tekion",
  "Meesho",
  "Goldman Sachs",
  "Sprinklr",
  "Trilogy Innovation",
  "Directi",
  "Flipkart",
  "Accolite",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function ProblemFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const isFirstMount = useRef(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [company, setCompany] = useState(searchParams.get("company") || "All");
  const [starred, setStarred] = useState(searchParams.get("starred") === "true");
  
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);
  const debouncedSearch = useDebounceValue(search, 400);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompaniesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query state reactively inside startTransition when filters change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    if (difficulty && difficulty !== "All") params.set("difficulty", difficulty);
    else params.delete("difficulty");

    if (category && category !== "All") params.set("category", category);
    else params.delete("category");

    if (company && company !== "All") params.set("company", company);
    else params.delete("company");

    if (starred) params.set("starred", "true");
    else params.delete("starred");

    params.set("page", "1");
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [debouncedSearch, difficulty, category, company, starred, router]);

  return (
    <div className="flex flex-col gap-4 pb-5 border-b border-[var(--border)]/20 select-none">
      
      {/* Row 1: Search Input (Left) and Starred Button (Right) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
        <div className="relative w-full md:max-w-md group/input">
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={() => setStarred(!starred)}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer w-full md:w-auto justify-center ${
            starred 
              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 font-black shadow-sm" 
              : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)] hover:bg-white/5"
          }`}
          title="Filter starred problems only"
        >
          <Star size={12} className={starred ? "fill-yellow-500 text-yellow-500" : ""} />
          Starred
        </button>
      </div>

      {/* Row 2: Difficulty Selector and Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full justify-center">
        
        {/* Difficulty Tabs */}
        <div className="flex bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl p-0.5 gap-0.5 shrink-0 w-full sm:w-auto justify-between">
          {["All", ...difficulties].map(d => {
             const isActive = difficulty === d;
             return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  type="button"
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all text-center cursor-pointer ${
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

        {/* Dropdown filters container */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={tagsDropdownRef}>
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              type="button"
              className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Tag size={12} className="text-blue-400" />
                {category === "All" ? "Topic tags" : category}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTagsOpen ? "rotate-180" : ""}`} />
            </button>

            {isTagsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="px-3 py-1.5 text-[9px] font-black text-[var(--muted-foreground)]/80 uppercase tracking-widest border-b border-[var(--border)] mb-1.5">
                  Topic Tag Filters
                </div>
                <button
                  onClick={() => { setCategory("All"); setIsTagsOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    category === "All" ? "text-blue-400 bg-[var(--foreground)]/5" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  All Topics
                </button>
                {tags.map(tag => {
                  const isSelected = category === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() => { setCategory(tag.name); setIsTagsOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                        isSelected ? "text-[var(--foreground)] bg-[var(--foreground)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
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

          {/* Company Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={companyDropdownRef}>
            <button
              onClick={() => setIsCompaniesOpen(!isCompaniesOpen)}
              type="button"
              className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Briefcase size={12} className="text-emerald-400" />
                {company === "All" ? "Companies" : company}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCompaniesOpen ? "rotate-180" : ""}`} />
            </button>

            {isCompaniesOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="px-3 py-1.5 text-[9px] font-black text-[var(--muted-foreground)]/80 uppercase tracking-widest border-b border-[var(--border)] mb-1.5">
                  Company Filters
                </div>
                <button
                  onClick={() => { setCompany("All"); setIsCompaniesOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    company === "All" ? "text-emerald-400 bg-[var(--foreground)]/5" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  All Companies
                </button>
                {companies.map(c => {
                  const isSelected = company === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setCompany(c); setIsCompaniesOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                        isSelected ? "text-emerald-400 bg-[var(--foreground)]/10" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}