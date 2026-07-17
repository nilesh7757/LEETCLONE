"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { Brain, ChevronRight, Clock, Trophy, Calendar, ChevronLeft } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
}

interface ReviewItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
  updatedAt: string;
  problem: Problem;
}

const ITEMS_PER_PAGE = 4;

export default function ReviewQueueWidget() {
  const [allItems, setAllItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/review/due?all=true`);
        if (data.success && data.dueItems) {
          setAllItems(data.dueItems);
        }
      } catch (err) {
        console.error("Failed to fetch review queue items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Compute stats on the client side
  const { dueItems, retentionScore } = useMemo(() => {
    const now = Date.now();
    const due: ReviewItem[] = [];

    allItems.forEach((item) => {
      const targetTime = new Date(item.nextReviewDate).getTime();
      if (targetTime <= now) {
        due.push(item);
      }
    });

    const score = allItems.length > 0 
      ? Math.round(((allItems.length - due.length) / allItems.length) * 100)
      : 100;

    return { dueItems: due, retentionScore: score };
  }, [allItems]);

  const totalPages = useMemo(() => {
    return Math.ceil(allItems.length / ITEMS_PER_PAGE);
  }, [allItems]);

  const paginatedItems = useMemo(() => {
    return allItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  }, [allItems, currentPage]);

  const getDueStatus = (nextReviewDateStr: string) => {
    const now = Date.now();
    const target = new Date(nextReviewDateStr).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { label: "DUE NOW", isDue: true };
    }

    const diffHrs = Math.floor(diff / (1000 * 3600));
    if (diffHrs < 24) {
      if (diffHrs <= 0) {
        return { label: "In < 1h", isDue: false };
      }
      return { label: `In ${diffHrs}h`, isDue: false };
    }

    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    if (diffDays === 1) {
      return { label: "Tomorrow", isDue: false };
    }
    return { label: `In ${diffDays}d`, isDue: false };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "from-emerald-500 to-teal-600";
      case "Medium": return "from-amber-500 to-orange-600";
      default: return "from-rose-500 to-red-600";
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[var(--card)]/40 border border-[var(--border)] rounded-[2.5rem] p-6 mb-8 animate-pulse h-48 relative overflow-hidden">
        <div className="h-4 w-1/3 bg-muted/30 rounded-md mb-6" />
        <div className="space-y-3">
          <div className="h-10 bg-muted/20 rounded-xl" />
          <div className="h-10 bg-muted/20 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-950/40 backdrop-blur-md border border-zinc-800/80 rounded-[2.2rem] p-5 mb-8 relative overflow-hidden shadow-2xl transition-all duration-300">
      
      {/* Top ambient glowing neon border line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-80" />
      
      {/* Background glow circle */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-inner">
            <Brain size={13} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1">
              Review Queue
            </h2>
            <p className="text-[8px] text-zinc-400 font-mono tracking-widest uppercase">Spaced Repetition</p>
          </div>
        </div>

        {/* Pagination buttons */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[9px] font-bold">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft size={10} />
            </button>
            <span className="text-[8px] font-mono text-zinc-500 px-0.5">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight size={10} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Retention Score Meter */}
      <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-2xl p-3 mb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Trophy size={11} className="text-amber-400" /> Retention Strength
          </span>
          <span className={`font-mono font-black ${
            retentionScore >= 80 ? "text-emerald-400" : retentionScore >= 50 ? "text-amber-400" : "text-rose-400"
          }`}>
            {retentionScore}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
              retentionScore >= 80 ? "from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : 
              retentionScore >= 50 ? "from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]" : 
              "from-rose-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
            }`} 
            style={{ width: `${retentionScore}%` }}
          />
        </div>
      </div>

      {/* 3. Items List */}
      {paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl">
          <Clock size={16} className="text-zinc-600 mb-2" />
          <p className="text-[10px] font-bold text-zinc-400">
            Your review queue is empty.
          </p>
          <p className="text-[8px] text-zinc-500/80 mt-1 max-w-[170px] leading-relaxed">
            Solve problems and submit correct solutions to automatically add them to your spaced repetition tracker.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 min-h-[220px]">
          {paginatedItems.map((item) => {
            const status = getDueStatus(item.nextReviewDate);
            
            return (
              <Link 
                key={item.id} 
                href={`/problems/${item.problem.slug}`}
                className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl hover:border-purple-500/40 hover:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all duration-200 group relative overflow-hidden"
              >
                {/* Left decorative color border matching difficulty */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${getDifficultyColor(item.problem.difficulty)}`} />
                
                <div className="flex flex-col min-w-0 gap-1 pl-1">
                  <h3 className="text-xs font-bold text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                    {item.problem.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {status.isDue ? (
                      <span className="text-[7.5px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1 rounded flex items-center gap-1 animate-pulse">
                        ● {status.label}
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-1 rounded flex items-center gap-1">
                        <Calendar size={7} /> {status.label}
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight size={12} className="text-zinc-500 group-hover:text-purple-300 transition-all group-hover:translate-x-0.5 ml-2 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
