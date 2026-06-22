"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, Target, Shield, ChevronRight, 
  Loader2, CheckCircle2, Sparkles, AlertCircle,
  Building2, Calendar, LayoutList, Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Netflix", 
  "Atlassian", "Uber", "Zomato", "Stripe", "Codeforces Master"
];

interface SiegeTask {
  type: 'PROBLEM' | 'CONCEPT' | 'MOCK';
  title: string;
  difficulty: string;
}

interface SiegeWeek {
  week: number;
  topic: string;
  description: string;
  tasks: SiegeTask[];
}

interface SiegePlan {
  target: string;
  rationale: string;
  weeks: SiegeWeek[];
}

export default function SiegePage() {
  const { data: session } = useSession();
  const [target, setTarget] = useState("");
  const [generating, setSyncing] = useState(false);
  const [currentPlan, setPlan] = useState<SiegePlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const fetchActivePlan = async () => {
    try {
      const { data } = await axios.get("/api/siege/latest");
      if (data.plan) setPlan(data.plan.planData as SiegePlan);
    } catch (e) {} finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleInitiateSiege = async () => {
    if (!target) return toast.error("Select a target company first.");
    setSyncing(true);
    try {
      const { data } = await axios.post("/api/siege/generate", { targetCompany: target });
      setPlan(data.plan);
      toast.success(`Siege Plan for ${target} Generated!`, {
        description: "Your roadmap to victory is ready."
      });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.error 
        : "Strategic calculation failed.";
      toast.error(message || "Strategic calculation failed.");
    } finally {
      setSyncing(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 md:p-12 relative overflow-hidden">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[var(--primary)]/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--viz-red)]/5 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[var(--primary)]/10 rounded-2xl text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(var(--viz-blue-rgb),0.2)]">
              <Shield size={28} />
            </div>
            <span className="text-[10px] font-black tracking-[0.5em] text-[var(--primary)] uppercase">Strategic Operations</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic">
            TARGETED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--foreground)]/50">SIEGE</span>
          </h1>
          <p className="text-[var(--muted-foreground)] mt-6 max-w-2xl text-lg font-medium leading-relaxed">
            Standard prep is dead. Initiate a targeted siege to analyze your neural nodes and bridge the gap to your target company&apos;s hiring bar.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!currentPlan ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-7 space-y-8">
                <div className="p-8 rounded-[3rem] bg-[var(--foreground)]/5 border border-[var(--border)] backdrop-blur-xl">
                  <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-2 uppercase">
                    <Building2 className="text-[var(--primary)]" /> Choose Your Target
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMPANIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTarget(c)}
                        className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${
                          target === c 
                            ? 'bg-[var(--primary)] border-[var(--primary)]/50 text-[var(--primary-foreground)] shadow-[0_0_30px_rgba(var(--viz-blue-rgb),0.3)]' 
                            : 'bg-[var(--background)]/40 border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleInitiateSiege}
                  disabled={generating || !target}
                  className="w-full py-6 rounded-[2.5rem] bg-[var(--foreground)] text-[var(--background)] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(var(--foreground-rgb),0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket size={20} />}
                  {generating ? "CALCULATING_TRAJECTORY..." : "INITIATE_SIEGE_PROTOCOL"}
                </button>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="p-8 rounded-[3rem] bg-[var(--viz-red)]/5 border border-[var(--viz-red)]/20">
                  <div className="flex items-center gap-3 mb-4 text-[var(--viz-red)]">
                    <AlertCircle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Warning</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--viz-red)]/60 leading-relaxed">
                    Siege roadmaps are generated using **NVIDIA 405B Deep Intelligence**. The curation process is compute-heavy and strictly tailored to your current Omni-Stats. Ensure your profile is synced for maximum accuracy.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* PLAN HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-[var(--border)]">
                 <div>
                    <div className="flex items-center gap-2 text-[var(--primary)] font-black text-[10px] uppercase tracking-[0.4em] mb-3">
                       <Trophy size={14} /> Mission_Active
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter">OPERATIONS: {currentPlan.target}</h2>
                 </div>
                 <div className="p-6 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-3xl max-w-md">
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic">
                      <Sparkles size={12} className="inline mr-2 text-[var(--viz-gold)]" />
                      &quot;{currentPlan.rationale}&quot;
                    </p>
                 </div>
                 <button 
                  onClick={() => setPlan(null)}
                  className="px-6 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                 >
                   Re-Generate
                 </button>
              </div>

              {/* WEEKLY TIMELINE */}
              <div className="space-y-16">
                 {currentPlan?.weeks?.map((week, idx) => (
                    <motion.div 
                      key={week.week}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-12 md:pl-24"
                    >
                       {/* VERTICAL LINE */}
                       <div className="absolute left-6 md:left-12 top-0 bottom-[-64px] w-px bg-gradient-to-b from-[var(--primary)] to-transparent opacity-20" />
                       
                       {/* NUMBER BUBBLE */}
                       <div className="absolute left-0 md:left-6 top-0 w-12 h-12 bg-[var(--background)] border-2 border-[var(--primary)] rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(var(--viz-blue-rgb),0.3)]">
                          {week.week}
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          <div className="lg:col-span-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] mb-2">Phase_Focus</h4>
                             <h3 className="text-2xl font-black tracking-tight mb-4">{week.topic}</h3>
                             <p className="text-sm text-[var(--muted-foreground)] font-medium leading-relaxed">{week.description}</p>
                          </div>

                          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                             {week.tasks?.map((task, tidx) => (
                                <div 
                                  key={tidx}
                                  className="group p-6 rounded-[2rem] bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--border-strong)] transition-all cursor-pointer relative overflow-hidden"
                                >
                                   <div className="flex justify-between items-start mb-4">
                                      <div className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                                        task.type === 'PROBLEM' ? 'bg-[var(--viz-gold)]/10 text-[var(--viz-gold)]' :
                                        task.type === 'CONCEPT' ? 'bg-[var(--viz-green)]/10 text-[var(--viz-green)]' :
                                        'bg-[var(--viz-lavender)]/10 text-[var(--viz-lavender)]'
                                      }`}>
                                         {task.type}
                                      </div>
                                      <div className="text-[8px] font-black text-[var(--muted-foreground)]/40 uppercase">{task.difficulty}</div>
                                   </div>
                                   <h5 className="text-sm font-black tracking-tight group-hover:text-[var(--primary)] transition-colors">{task.title}</h5>
                                   <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                      <ChevronRight size={16} className="text-[var(--primary)]" />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
