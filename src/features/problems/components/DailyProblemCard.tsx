"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Code2, Database, LayoutTemplate, Zap, Target } from "lucide-react";
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
      <div className="w-full h-64 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl animate-pulse flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#52525b]">Syncing Objective...</span>
         </div>
      </div>
    );
  }

  if (!problem) return null;

  const getIcon = () => {
      switch(problem.type) {
          case 'SQL': return <Database size={20} className="text-[#3b82f6]" />;
          case 'SYSTEM_DESIGN': return <LayoutTemplate size={20} className="text-[#a855f7]" />;
          default: return <Code2 size={20} className="text-[#22c55e]" />;
      }
  };

  const difficultyColor = 
      problem.difficulty === "Easy" ? "#22c55e" : 
      problem.difficulty === "Medium" ? "#f59e0b" : 
      "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <Link href={`/problems/${problem.slug}`} className="block h-full">
        <div className="relative p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-[#f59e0b]/20 overflow-hidden transition-all duration-500 hover:border-[#f59e0b]/40 shadow-2xl hover:shadow-[#f59e0b]/10 group-hover:-translate-y-1">
          
          {/* HUD Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f59e0b]/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
             <Target size={120} className="text-[#f59e0b]" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-xl shadow-inner border border-[#f59e0b]/20">
                    <Zap size={18} fill="currentColor" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f59e0b]">Active_Alert</span>
                    <span className="text-[8px] font-mono text-[#52525b] uppercase mt-[-2px]">Critical_Priority</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#020202] border border-white/5">
                 <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: difficultyColor, boxShadow: `0 0 8px ${difficultyColor}` }} />
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1aa]">{problem.difficulty}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
               <h3 className="text-3xl font-black tracking-tighter text-white leading-tight group-hover:text-[#f59e0b] transition-colors">
                   {problem.title}
               </h3>
               <div className="flex items-center gap-3 opacity-60">
                  {getIcon()}
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#a1a1aa]">{problem.category}</span>
               </div>
            </div>
            
            <p className="text-sm font-light text-[#52525b] mb-10 line-clamp-2 leading-relaxed">
               Analyze {problem.category} patterns and edge cases. Solve this featured challenge to sharpen your problem-solving skills.            </p>

            <div className="mt-auto flex items-center justify-between">
               <div className="flex items-center text-[#f59e0b] font-black text-[10px] uppercase tracking-[0.3em] gap-3">
                  Initiate_Task <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
               </div>
               <span className="text-[9px] font-mono text-[#262626]">00:00:00:12</span>
            </div>
          </div>
          
          {/* Scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f59e0b]/5 to-transparent h-[2px] w-full -translate-y-full group-hover:translate-y-[1000%] transition-all duration-[3000ms] ease-linear pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}