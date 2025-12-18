"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Code2, X, Loader2, Plus } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";

interface ProblemSearchResult {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
}

interface ProblemSearchProps {
  onSelect: (problem: ProblemSearchResult) => void;
  excludeIds?: string[];
}

export default function ProblemSearch({ onSelect, excludeIds = [] }: ProblemSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProblemSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchProblems = useDebouncedCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`/api/problems?q=${encodeURIComponent(searchTerm)}`);
      // Assuming /api/problems can filter by q. If not, I'll need to update it or handle locally.
      // Based on existing code, /api/problems might return all. 
      // Let's check /api/problems first.
      setResults(data.problems.filter((p: any) => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !excludeIds.includes(p.id)
      ));
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchProblems(query);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, searchProblems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-[var(--foreground)]/50" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search problems to add (title or pattern)..."
          className="w-full py-3 pl-12 pr-10 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 transition-all"
        />
        {loading ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
             <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : query && (
          <button 
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
           {loading && results.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--foreground)]/50">Searching problems...</div>
           ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto py-2">
                {results.map((problem) => (
                  <button 
                    key={problem.id} 
                    type="button"
                    onClick={() => { 
                      onSelect(problem); 
                      setQuery(""); 
                      setIsOpen(false); 
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--foreground)]/5 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Code2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-blue-500 transition-colors">
                        {problem.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          problem.difficulty === "Easy" ? "text-green-500" :
                          problem.difficulty === "Medium" ? "text-yellow-500" :
                          "text-red-500"
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[10px] text-[var(--foreground)]/40 uppercase tracking-wider">
                          {problem.category}
                        </span>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
           ) : query.length >= 2 ? (
              <div className="p-8 text-center text-sm text-[var(--foreground)]/50">No matching problems found.</div>
           ) : null}
        </div>
      )}
    </div>
  );
}
