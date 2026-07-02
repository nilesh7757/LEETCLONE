"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Play, AlertCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  companies?: string[];
  isSolved?: boolean;
  isAttempted?: boolean;
  acceptanceRate?: string;
}

interface ProblemTableProps {
  problems: Problem[];
  totalPages: number;
  currentPage: number;
}

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    Easy: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)] relative overflow-hidden">
        <HelpCircle className="w-10 h-10 text-[var(--muted-foreground)]/30 mb-4" />
        <h3 className="text-xl font-bold tracking-tight">No Problems Found</h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">Try adjusting your active filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/60">
              <th className="py-4 pl-4 w-[60px]">Status</th>
              <th className="py-4">Title</th>
              <th className="py-4 w-[120px]">Difficulty</th>
              <th className="py-4 w-[160px]">Category</th>
              <th className="py-4 w-[120px] text-right pr-4">Acceptance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/40">
            {problems.map((problem, idx) => (
              <tr 
                key={problem.id}
                className="group hover:bg-[var(--foreground)]/[0.02] transition-colors"
              >
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
                  <Link href={`/problems/${problem.slug}`} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--muted-foreground)]/40 group-hover:text-[var(--primary)]/60 transition-colors">
                      {String(idx + 1 + (currentPage - 1) * 12).padStart(3, '0')}.
                    </span>
                    <span className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors tracking-tight">
                      {problem.title}
                    </span>
                    {problem.companies && problem.companies.length > 0 && (
                      <div className="hidden lg:flex items-center gap-1">
                        {problem.companies.slice(0, 2).map(company => (
                          <span key={company} className="px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/5 text-[8px] font-extrabold text-[var(--muted-foreground)]/70 uppercase tracking-widest border border-[var(--border)]">
                            {company}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
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
                <td className="py-4 pr-4 text-right">
                  <span className="font-mono text-xs font-semibold text-[var(--muted-foreground)]">
                    {problem.acceptanceRate || "0.0"}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-8 pt-6 border-t border-[var(--border)]/20">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--foreground)]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <div className="text-xs font-semibold text-[var(--muted-foreground)] font-mono">
            Page <span className="text-[var(--primary)] font-bold">{currentPage}</span> / <span className="text-[var(--foreground)]">{totalPages}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--foreground)]/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer group"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}