"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ArrowRight, Code2 } from "lucide-react";
import { motion } from "framer-motion";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  isSolved?: boolean;
  isAttempted?: boolean;
}

interface ProblemTableProps {
  problems: Problem[];
  totalPages: number;
  currentPage: number;
}

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    Easy: { color: "var(--viz-green)", bg: "var(--viz-green-rgb)" },
    Medium: { color: "var(--viz-amber)", bg: "var(--viz-amber-rgb)" },
    Hard: { color: "var(--viz-red)", bg: "var(--viz-red-rgb)" },
  }[difficulty] || { color: "var(--muted-foreground)", bg: "100, 100, 100" };

  return (
    <span 
        className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-transparent backdrop-blur-md"
        style={{ 
            color: config.color,
            backgroundColor: `rgba(${config.bg}, 0.1)`,
            borderColor: `rgba(${config.bg}, 0.15)`
        }}
    >
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
      <div className="flex flex-col items-center justify-center py-32 text-center rounded-[3rem] bg-[var(--card)]/30 backdrop-blur-sm border-2 border-dashed border-[var(--border)]">
        <div className="w-20 h-20 bg-[var(--muted)]/50 rounded-full flex items-center justify-center mb-6">
          <Code2 className="w-10 h-10 text-[var(--muted-foreground)]/50" />
        </div>
        <h3 className="text-2xl font-light text-[var(--foreground)]">No signals found</h3>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 font-mono uppercase tracking-widest">Adjust filters to calibrate search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5">
        {problems.map((problem, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={problem.id}
            className="group relative bg-[var(--card)] rounded-2xl p-1 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--viz-cyan)]/5 hover:-translate-y-1"
          >
            {/* Hover Glow Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--viz-cyan)]/0 via-[var(--viz-cyan)]/5 to-[var(--viz-purple)]/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

            <div className="relative bg-[var(--card)] rounded-xl p-6 h-full flex flex-col md:flex-row md:items-center gap-6 z-10 overflow-hidden">
                {/* Status Indicator Bar */}
                {problem.isSolved && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--viz-green)]" />
                )}
                
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link href={`/problems/${problem.slug}`} className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--viz-cyan)] transition-colors line-clamp-1">
                            {problem.title}
                        </Link>
                        
                        {problem.isSolved && (
                            <div className="flex items-center gap-1 text-[var(--viz-green)] text-[10px] font-black uppercase tracking-widest bg-[var(--viz-green)]/10 px-2 py-0.5 rounded-full">
                                <Check size={10} /> Complete
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                        <DifficultyBadge difficulty={problem.difficulty} />
                        <div className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]/30" />
                        <span className="font-mono text-xs uppercase tracking-wider opacity-60">{problem.category}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                    <Link 
                       href={`/problems/${problem.slug}`}
                       className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                           problem.isSolved 
                             ? "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                             : "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--viz-cyan)] hover:text-black hover:shadow-lg hover:shadow-[var(--viz-cyan)]/25"
                       }`}
                    >
                       {problem.isSolved ? "Review" : "Solve"} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination - Minimalist */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-10">
           <button
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
             className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-30 disabled:hover:bg-[var(--card)] text-[var(--foreground)] transition-all shadow-lg"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           
           <span className="text-xs font-mono font-black tracking-widest text-[var(--muted-foreground)]">
             PAGE <span className="text-[var(--foreground)] text-base mx-1">{currentPage}</span> / {totalPages}
           </span>
           
           <button
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-30 disabled:hover:bg-[var(--card)] text-[var(--foreground)] transition-all shadow-lg"
           >
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}
    </div>
  );
}