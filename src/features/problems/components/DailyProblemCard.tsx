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
      <div className="w-full h-32 rounded-3xl bg-[var(--card)]/30 backdrop-blur-md animate-pulse flex items-center justify-center">
         <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (!problem) return null;

  const getIcon = () => {
      switch(problem.type) {
          case 'SQL': return <Database className="w-5 h-5 text-[var(--viz-blue)]" />;
          case 'SYSTEM_DESIGN': return <LayoutTemplate className="w-5 h-5 text-[var(--viz-purple)]" />;
          default: return <Code2 className="w-5 h-5 text-[var(--viz-green)]" />;
      }
  };

  const difficultyColor = 
      problem.difficulty === "Easy" ? "var(--viz-green)" : 
      problem.difficulty === "Medium" ? "var(--viz-amber)" : 
      "var(--viz-red)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <Link href={`/problems/${problem.slug}`} className="block h-full">
        <div className="relative p-8 rounded-[2rem] bg-[var(--card)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--viz-cyan)]/10 group-hover:-translate-y-1">
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--viz-cyan)]/10 to-transparent rounded-bl-[10rem] opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] rounded-lg">
                    <Zap size={18} fill="currentColor" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Daily Context</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--background)] border border-[var(--border)]">
                 <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: difficultyColor }} />
                 <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: difficultyColor }}>{problem.difficulty}</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-3 group-hover:text-[var(--viz-cyan)] transition-colors">
                {getIcon()}
                {problem.title}
            </h3>
            
            <p className="text-sm font-light text-[var(--muted-foreground)] mb-8 line-clamp-2">
               Mastering {problem.category} patterns for optimal performance.
            </p>

            <div className="mt-auto flex items-center text-[var(--viz-cyan)] font-bold text-xs uppercase tracking-widest gap-2 opacity-80 group-hover:opacity-100 group-hover:gap-4 transition-all">
               Initialize Sequence <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}