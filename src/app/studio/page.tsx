"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Target, Trophy, ChevronRight, 
  LayoutTemplate, Zap, Clock, Globe, ShieldCheck,
  Users, Layers, ArrowRight, Settings, PlusCircle,
  FileText, Activity, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface DraftUnit {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  updatedAt: string;
  verificationStatus: string;
  type: string;
  slug: string;
}

interface ContestUnit {
  id: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  creatorId: string;
  problems: { id: string }[];
}

export default function StudioDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  
  const [problems, setProblems] = useState<DraftUnit[]>([]);
  const [contests, setContests] = useState<ContestUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problems" | "contests">("problems");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    
    const fetchData = async () => {
      try {
        const [problemsRes, contestsRes] = await Promise.all([
          axios.get("/api/problems?tab=mine&foundry=true"),
          axios.get("/api/contest") // Need to filter for "mine" on server or client
        ]);
        setProblems(problemsRes.data.problems);
        // Assuming contest api returns all for now, filter if needed
        setContests(contestsRes.data.contests.filter((c: ContestUnit) => c.creatorId === session?.user?.id));
      } catch (err) {
        toast.error("Failed to sync studio data");
      } finally {
        setIsLoading(false);
      }
    };
    if (status === "authenticated") fetchData();
  }, [status, router, session]);

  const initializeProblem = async () => {
    const loadingToast = toast.loading("Initializing problem...");
    try {
      const { data } = await axios.post("/api/problems/create", {
        title: "Untitled Problem",
        slug: `draft-${Date.now()}`,
        difficulty: "Medium",
        category: "General",
        description: "Write your problem statement...",
        problemType: "CODING",
        timeLimit: 2,
        memoryLimit: 256,
        isPublic: false,
        source: "STUDIO",
        referenceSolution: "// write your solution here"
      });
      router.push(`/studio/problems/${data.problem.id}`);
    } catch (err) {
      toast.error("Failed to create problem");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const filteredProblems = problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredContests = contests.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-widest text-[#52525b]">Entering Studio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#e1e1e1] font-sans selection:bg-[#3b82f6]/30 pb-32">
      {/* 1. STUDIO HEADER */}
      <div className="border-b border-white/5 bg-[#080808] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6]">
                 <LayoutTemplate size={24} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-xl font-black uppercase tracking-tight text-white">Creator Studio</h1>
                 <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-widest">Unified Management Hub</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#3b82f6] transition-colors" />
                 <input 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search your work..."
                    className="bg-black border border-white/5 rounded-xl py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-[#3b82f6]/30 w-80 transition-all"
                 />
              </div>
              <div className="h-8 w-px bg-white/5" />
              {activeTab === "problems" ? (
                 <button onClick={initializeProblem} className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#2563eb] transition-all shadow-xl active:scale-95">
                    <Plus size={16} /> New Problem
                 </button>
              ) : (
                 <Link href="/arena/launchpad" className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#3b82f6] hover:text-[var(--foreground)] transition-all shadow-xl active:scale-95">
                    <Plus size={16} /> New Contest
                 </Link>
              )}
           </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-8 flex items-center gap-10">
           <button 
              onClick={() => setActiveTab("problems")}
              className={`h-12 text-[10px] font-bold uppercase tracking-widest relative transition-all ${activeTab === "problems" ? "text-white" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
           >
              My Problems
              {activeTab === "problems" && <motion.div layoutId="studio-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />}
           </button>
           <button 
              onClick={() => setActiveTab("contests")}
              className={`h-12 text-[10px] font-bold uppercase tracking-widest relative transition-all ${activeTab === "contests" ? "text-white" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
           >
              My Contests
              {activeTab === "contests" && <motion.div layoutId="studio-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />}
           </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-12">
         <AnimatePresence mode="wait">
            {activeTab === "problems" ? (
               <motion.div key="problems" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProblems.length === 0 ? (
                     <EmptyState icon={<Target size={40} />} title="No Problems Found" description="Start creating professional problems to build your bank." action={initializeProblem} actionLabel="Create First Problem" />
                  ) : (
                     filteredProblems.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} />)
                  )}
               </motion.div>
            ) : (
               <motion.div key="contests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContests.length === 0 ? (
                     <EmptyState icon={<Trophy size={40} />} title="No Contests Found" description="Organize contests for your community or friends." href="/arena/launchpad" actionLabel="Create First Contest" />
                  ) : (
                     filteredContests.map((c, i) => <ContestCard key={c.id} contest={c} index={i} />)
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </main>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
  href?: string;
  actionLabel: string;
}

function EmptyState({ icon, title, description, action, href, actionLabel }: EmptyStateProps) {
   return (
      <div className="col-span-full py-40 flex flex-col items-center justify-center text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
         <div className="p-6 bg-white/5 rounded-3xl mb-8 text-[#262626]">{icon}</div>
         <h3 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h3>
         <p className="text-[#52525b] text-sm max-w-sm mb-10">{description}</p>
         {href ? (
            <Link href={href} className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3b82f6] hover:text-[var(--foreground)] transition-all shadow-xl active:scale-95">
               {actionLabel}
            </Link>
         ) : (
            <button onClick={action} className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3b82f6] hover:text-[var(--foreground)] transition-all shadow-xl active:scale-95">
               {actionLabel}
            </button>
         )}
      </div>
   );
}

function ProblemCard({ problem, index }: { problem: DraftUnit, index: number }) {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
         <Link href={`/studio/problems/${problem.id}`} className="group block h-full">
            <div className="p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 group-hover:border-[#3b82f6]/30 group-hover:bg-[#111] flex flex-col h-full shadow-xl">
               <div className="flex justify-between items-start mb-10">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                     problem.verificationStatus === 'STABLE' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                     {problem.verificationStatus}
                  </div>
                  <div className="text-[#262626] group-hover:text-[#3b82f6] transition-colors"><Target size={18} /></div>
               </div>
               <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#3b82f6] transition-colors line-clamp-2">{problem.title}</h3>
               <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-[#52525b] mb-12">
                  <span className={problem.difficulty === 'Easy' ? 'text-green-500' : problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}>{problem.difficulty}</span>
                  <div className="w-1 h-1 rounded-full bg-white/5" />
                  <span>{problem.category}</span>
               </div>
               <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#262626]">{new Date(problem.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                     Edit <ArrowRight size={14} />
                  </div>
               </div>
            </div>
         </Link>
      </motion.div>
   );
}

function ContestCard({ contest, index }: { contest: ContestUnit, index: number }) {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
         <Link href={`/studio/contests/${contest.id}`} className="group block h-full">
            <div className="p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/5 transition-all duration-500 group-hover:border-[#3b82f6]/30 group-hover:bg-[#111] flex flex-col h-full shadow-xl">
               <div className="flex justify-between items-start mb-10">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                     contest.status === 'LIVE' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                     {contest.status}
                  </div>
                  <div className="text-[#262626] group-hover:text-[#3b82f6] transition-colors"><Trophy size={18} /></div>
               </div>
               <h3 className="text-2xl font-bold tracking-tight text-white mb-4 group-hover:text-[#3b82f6] transition-colors">{contest.title}</h3>
               <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="space-y-1">
                     <span className="text-[8px] font-bold text-[#262626] uppercase tracking-widest flex items-center gap-2"><Layers size={10} /> Problems</span>
                     <p className="text-xs font-mono font-bold text-[#52525b]">{contest.problems.length} Units</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[8px] font-bold text-[#262626] uppercase tracking-widest flex items-center gap-2"><Clock size={10} /> Starts</span>
                     <p className="text-xs font-mono font-bold text-[#52525b]">{new Date(contest.startTime).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#262626]">#{contest.id.slice(0, 8)}</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                     Manage <ArrowRight size={14} />
                  </div>
               </div>
            </div>
         </Link>
      </motion.div>
   );
}
