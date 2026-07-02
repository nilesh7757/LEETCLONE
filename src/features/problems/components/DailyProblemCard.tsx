"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Code2, Database, LayoutTemplate, Zap } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface DailyProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  type: string;
}

export default function DailyProblemCard() {
  const [problem, setProblem] = useState<DailyProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const { data } = await axios.get("/api/problems/daily");
        setProblem(data.problem);
      } catch (error) {
        console.error("Failed to fetch daily problem", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-44 rounded-3xl bg-[var(--foreground)]/[0.01] border border-[var(--border)] animate-pulse flex items-center justify-center">
         <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/40">Syncing Objective...</span>
         </div>
      </div>
    );
  }

  if (!problem) return null;

  const getIcon = () => {
      switch(problem.type) {
          case 'SQL': return <Database size={14} className="text-blue-500" />;
          case 'SYSTEM_DESIGN': return <LayoutTemplate size={14} className="text-purple-500" />;
          default: return <Code2 size={14} className="text-emerald-500" />;
      }
  };

  const difficultyColor = 
      problem.difficulty === "Easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : 
      problem.difficulty === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : 
      "text-red-500 bg-red-500/10 border-red-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <Link href={`/problems/${problem.slug}`} className="block">
        <div className="relative p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:border-[var(--primary)]/30 shadow-md">
          {/* Subtle ambient gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--primary)]/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Daily Challenge</span>
              </div>
              
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${difficultyColor}`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="space-y-2">
               <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] leading-snug group-hover:text-[var(--primary)] transition-colors">
                   {problem.title}
               </h3>
               <div className="flex items-center gap-2 text-[var(--muted-foreground)]/80">
                  {getIcon()}
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">{problem.category}</span>
               </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/30 mt-1">
               <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
                  Solve challenge <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
               </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}