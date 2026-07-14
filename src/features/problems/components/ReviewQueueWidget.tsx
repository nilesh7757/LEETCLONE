"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Brain, ChevronRight, Clock } from "lucide-react";

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

export default function ReviewQueueWidget() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDue = async () => {
      try {
        const { data } = await axios.get("/api/review/due");
        if (data.success && data.dueItems) {
          setItems(data.dueItems);
        }
      } catch (err) {
        console.error("Failed to fetch due review items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDue();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 mb-8 animate-pulse h-32" />
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 mb-8 relative overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
          <Brain size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">Due for Review</h2>
          <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Spaced Repetition Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const daysSinceLast = Math.max(0, Math.floor((Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 3600 * 24)));
          
          return (
            <Link 
              key={item.id} 
              href={`/problems/${item.problem.slug}`}
              className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-purple-500 transition-colors">
                    {item.problem.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${
                      item.problem.difficulty === 'Easy' ? 'text-green-500' : item.problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {item.problem.difficulty}
                    </span>
                    <span className="text-[9px] text-[var(--muted-foreground)] font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {daysSinceLast === 0 ? "Today" : `${daysSinceLast}d since last review`}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-purple-500 transition-colors ml-2 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
