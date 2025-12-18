"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Loader2, Code2, Database, LayoutTemplate } from "lucide-react";
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
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-md flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--foreground)]/40" />
      </div>
    );
  }

  if (!problem) return null;

  const getIcon = () => {
      switch(problem.type) {
          case 'SQL': return <Database className="w-5 h-5 text-blue-500" />;
          case 'SYSTEM_DESIGN': return <LayoutTemplate className="w-5 h-5 text-purple-500" />;
          default: return <Code2 className="w-5 h-5 text-green-500" />;
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-md mx-auto mt-10 relative group"
    >
      <Link href={`/problems/${problem.slug}`} className="block">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
        <div className="relative p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xl hover:border-[var(--foreground)]/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[var(--foreground)]/80">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Problem of the Day</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
               problem.difficulty === "Easy" ? "bg-green-500/10 text-green-500 border-green-500/20" :
               problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
               "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
              {getIcon()}
              {problem.title}
          </h3>
          
          <p className="text-sm text-[var(--foreground)]/60 mb-6">
             {problem.category}
          </p>

          <div
            className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Solve Now <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
