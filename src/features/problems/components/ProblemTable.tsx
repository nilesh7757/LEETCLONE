"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Play, AlertCircle, HelpCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  companies?: string[];
  companyTags?: string[];
  isSolved?: boolean;
  isAttempted?: boolean;
  acceptanceRate?: string;
  isStarred?: boolean;
}

interface ProblemTableProps {
  problems: Problem[];
  totalPages: number;
  currentPage: number;
}

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    Easy: { color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    Medium: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    Hard: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  }[difficulty] || { color: "text-[var(--muted-foreground)]", bg: "bg-[var(--foreground)]/5 border-[var(--border)]" };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.bg} ${config.color}`}>
      {difficulty}
    </span>
  );
};

export default function ProblemTable({ problems, totalPages, currentPage }: ProblemTableProps) {
  const searchParams = useSearchParams();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll local states
  const [items, setItems] = useState<Problem[]>(problems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(1 < totalPages);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync state with parent server component when query/filters reset initial list
  useEffect(() => {
    setItems(problems);
    setPage(1);
    setHasMore(1 < totalPages);
    setLoadingMore(false);
  }, [problems, totalPages]);

  const [starredMap, setStarredMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    problems.forEach(p => {
      initialMap[p.id] = p.isStarred || false;
    });
    return initialMap;
  });

  useEffect(() => {
    const newMap: Record<string, boolean> = {};
    items.forEach(p => {
      newMap[p.id] = p.isStarred || false;
    });
    setStarredMap(newMap);
  }, [items]);

  const toggleStar = async (id: string, slug: string) => {
    setStarredMap(prev => ({ ...prev, [id]: !prev[id] }));
    try {
      const { data } = await axios.post(`/api/problems/${slug}/star`);
      setStarredMap(prev => ({ ...prev, [id]: data.starred }));
      if (data.starred) {
        toast.success("Problem bookmarked!");
      } else {
        toast.success("Bookmark removed.");
      }
    } catch {
      setStarredMap(prev => ({ ...prev, [id]: !prev[id] }));
      toast.error("Failed to update bookmark.");
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          try {
            const nextPage = page + 1;
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(nextPage));

            const { data } = await axios.get(`/api/problems?${params.toString()}`);
            if (data.success && data.problems) {
              setItems(prev => [...prev, ...data.problems]);
              setPage(nextPage);
              setHasMore(nextPage < data.totalPages);
            }
          } catch (err) {
            console.error("Failed to load next page of problems", err);
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loadingMore, page, searchParams]);

  return (
    <div className="space-y-4 select-none">
      
      {/* Scrollable table body wrapper matching left sidebar card boundaries */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar border border-[var(--border)]/10 rounded-2xl bg-zinc-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]/40 bg-[var(--background)]/35 sticky top-0 z-10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/60">
              <th className="py-4 pl-4 w-[40px]"></th>
              <th className="py-4 pl-4 w-[60px]">Status</th>
              <th className="py-4">Title</th>
              <th className="py-4 w-[120px]">Difficulty</th>
              <th className="py-4 w-[160px]">Category</th>
              <th className="py-4 w-[120px] text-right pr-6">Acceptance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/40">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--muted-foreground)]">
                  No problems found matching these criteria.
                </td>
              </tr>
            ) : (
              items.map((problem, idx) => (
              <tr 
                key={problem.id}
                className="group hover:bg-[var(--foreground)]/[0.02] transition-colors"
              >
                {/* Star Toggle Column */}
                <td className="py-4 pl-4">
                  <button
                    onClick={() => toggleStar(problem.id, problem.slug)}
                    className="p-1 rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-yellow-500 cursor-pointer"
                    title={starredMap[problem.id] ? "Remove bookmark" : "Bookmark problem"}
                  >
                    <Star 
                      size={14} 
                      className={starredMap[problem.id] ? "fill-yellow-500 text-yellow-500" : "text-gray-500 opacity-30 hover:opacity-100"} 
                    />
                  </button>
                </td>

                {/* Status Column */}
                <td className="py-4 pl-4">
                  {problem.isSolved ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500" title="Solved">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  ) : problem.isAttempted ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500" title="Attempted">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]/30 group-hover:border-[var(--primary)]/30 group-hover:text-[var(--primary)] transition-colors">
                      <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-[var(--primary)]/40" />
                    </div>
                  )}
                </td>

                {/* Title Column */}
                <td className="py-4 pr-4">
                  <div className="flex flex-col gap-1">
                    <Link href={`/problems/${problem.slug}`} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--muted-foreground)]/40 group-hover:text-[var(--primary)]/60 transition-colors">
                        {String(idx + 1).padStart(3, '0')}.
                      </span>
                      <span className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors tracking-tight">
                        {problem.title}
                      </span>
                    </Link>
                    {problem.companyTags && problem.companyTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 ml-7 mt-0.5">
                        {problem.companyTags.slice(0, 3).map(company => (
                          <span key={company} className="px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/5 border border-[var(--border)] text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                            {company}
                          </span>
                        ))}
                        {problem.companyTags.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/5 border border-[var(--border)] text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                            +{problem.companyTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Difficulty Column */}
                <td className="py-4">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>

                {/* Category Column */}
                <td className="py-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/80">
                    {problem.category}
                  </span>
                </td>

                {/* Acceptance Column */}
                <td className="py-4 pr-6 text-right">
                  <span className="font-mono text-xs font-semibold text-[var(--muted-foreground)]">
                    {problem.acceptanceRate || "0.0"}%
                  </span>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Sentinel Loader node for infinite scroll */}
      {hasMore && (
        <div ref={loaderRef} className="py-4 flex justify-center items-center">
          {loadingMore ? (
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500/80 animate-pulse">
              Scroll down to load more
            </span>
          )}
        </div>
      )}
    </div>
  );
}