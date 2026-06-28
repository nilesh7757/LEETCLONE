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
  companies?: string[];
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
    Easy: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" },
    Medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    Hard: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
  }[difficulty] || { color: "#52525b", bg: "rgba(82, 82, 91, 0.1)" };

  return (
    <span 
        className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-md"
        style={{ 
            color: config.color,
            backgroundColor: config.bg,
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
      <div className="flex flex-col items-center justify-center py-40 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern pointer-events-none" />
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 rotate-12 transition-transform duration-500">
          <Code2 className="w-10 h-10 text-[#52525b]" />
        </div>
        <h3 className="text-3xl font-bold tracking-tighter text-white">No Problems Found</h3>
        <p className="text-[10px] text-[#52525b] mt-4 font-bold uppercase tracking-widest">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-4">
        {problems.map((problem, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            key={problem.id}
            className="group relative"
          >
            <Link href={`/problems/${problem.slug}`} className="block">
               <div className="relative bg-white/[0.02] border border-white/5 hover:border-[#3b82f6]/30 rounded-2xl p-6 transition-all duration-500 hover:bg-white/[0.04] overflow-hidden group/card shadow-xl">
                  {/* Status Glow */}
                  {problem.isSolved && (
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />
                  )}
                  
                  {/* Side Accent Bar */}
                  <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-500 ${
                     problem.isSolved ? "bg-[#22c55e]" : 
                     problem.isAttempted ? "bg-[#f59e0b]" : 
                     "bg-transparent group-hover/card:bg-[#3b82f6]/40"
                  }`} />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                     <div className="flex-1 flex gap-6 items-center">
                        <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#020202] border border-white/5 shrink-0 group-hover/card:border-[#3b82f6]/20 transition-colors">
                           <span className="text-[8px] font-bold text-[#262626] uppercase mb-1">No.</span>
                           <span className="text-[14px] font-mono font-bold text-[#52525b] group-hover/card:text-white transition-colors">{String(idx + 1 + (currentPage - 1) * 12).padStart(3, '0')}</span>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-4 flex-wrap">
                              <h3 className="text-2xl font-bold tracking-tight text-white group-hover/card:text-[#3b82f6] transition-all">
                                 {problem.title}
                              </h3>
                              
                              {problem.isSolved && (
                                 <div className="flex items-center gap-2 text-[#22c55e] text-[9px] font-bold uppercase tracking-widest bg-[#22c55e]/5 px-3 py-1 rounded-full border border-[#22c55e]/10">
                                    <Check size={12} strokeWidth={3} /> Solved
                                 </div>
                              )}
                           </div>

                           <div className="flex items-center gap-5 text-sm text-[#52525b]">
                              <DifficultyBadge difficulty={problem.difficulty} />
                              <div className="h-3 w-px bg-white/5" />
                              <div className="flex items-center gap-2">
                                 <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                                 <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{problem.category}</span>
                              </div>
                              {problem.companies && problem.companies.length > 0 && (
                                 <>
                                    <div className="h-3 w-px bg-white/5" />
                                    <div className="flex items-center gap-2">
                                      {problem.companies.slice(0, 3).map(company => (
                                        <span key={company} className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-[#a1a1aa] uppercase tracking-widest border border-white/10">
                                          {company}
                                        </span>
                                      ))}
                                      {problem.companies.length > 3 && (
                                        <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-widest">
                                          +{problem.companies.length - 3}
                                        </span>
                                      )}
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-8">
                        {/* Meta Stats */}
                        <div className="hidden xl:flex gap-10">
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-bold uppercase text-[#262626] tracking-widest">Acceptance</span>
                              <span className="text-xs font-mono text-[#52525b]">84.2%</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-bold uppercase text-[#262626] tracking-widest">Memory</span>
                              <span className="text-xs font-mono text-[#52525b]">256MB</span>
                           </div>
                        </div>

                        <div className="group-hover/card:translate-x-2 transition-transform duration-500 text-[#3b82f6]/40 group-hover/card:text-[#3b82f6]">
                           <ArrowRight size={24} strokeWidth={1} />
                        </div>
                     </div>
                  </div>
               </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-12 pt-12">
           <button
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
             className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[#52525b] hover:text-[#3b82f6] hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all group"
           >
             <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
           </button>
           
           <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#262626]">Page</span>
              <div className="text-xl font-bold text-white flex items-center gap-3">
                 <span className="text-[#3b82f6]">{currentPage}</span>
                 <span className="text-white/10 text-xs">/</span>
                 <span className="text-[#52525b] text-base">{totalPages}</span>
              </div>
           </div>
           
           <button
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[#52525b] hover:text-[#3b82f6] hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all group"
           >
             <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      )}
    </div>
  );
}