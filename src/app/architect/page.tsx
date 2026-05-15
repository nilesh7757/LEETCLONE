"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, ChevronRight, 
  Trash2, Rocket, Terminal,
  LayoutTemplate, Code2, Binary, Fingerprint, Zap,
  CheckCircle2, AlertCircle, RefreshCcw, LayoutGrid
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
}

export default function ArchitectDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/problems?tab=mine&foundry=true");
      setDrafts(data.problems);
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize problem registry. Please check your connection.");
      toast.error("Registry Sync Failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchDrafts();
  }, [status, router, fetchDrafts]);

  const initializeProblem = async () => {
    const loadingToast = toast.loading("Initializing new problem package...");
    try {
      const { data } = await axios.post("/api/problems/create", {
        title: "UNTITLED_PROBLEM",
        slug: `problem-draft-${Date.now()}`,
        difficulty: "Medium",
        category: "Other",
        description: "Problem statement pending...",
        problemType: "CODING",
        timeLimit: 2,
        memoryLimit: 256,
        isPublic: false,
        source: "FORGE",
        referenceSolution: "// Implementation pending..."
      });
      toast.success("Problem initialized successfully");
      router.push(`/architect/id/${data.problem.id}`);
    } catch (err) {
      toast.error("Initialization failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const filteredDrafts = drafts.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020202] text-[#e1e1e1] font-sans selection:bg-[#3b82f6]/30 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16"> 
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
               <div className="p-2.5 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] border border-[#3b82f6]/20">
                  <LayoutGrid size={20} />
               </div>
               <span className="text-[10px] font-black tracking-[0.3em] text-[#52525b] uppercase">Architect Dashboard</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
                Problem <span className="text-[#3b82f6] italic">Architect</span>
              </h1>
              <p className="text-base text-[#71717a] leading-relaxed">
                Forge high-performance algorithmic challenges. Design constraints, verify solutions, 
                and publish your problems to the global registry.
              </p>
            </motion.div>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="flex flex-wrap items-center gap-4"
          >
            <Link
              href="/studio"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <LayoutTemplate className="w-4 h-4 text-[#3b82f6]" />
              Creator Studio
            </Link>

            <button
              onClick={initializeProblem}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-[#3b82f6] text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-[#2563eb] shadow-xl shadow-[#3b82f6]/20 active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Create Problem
            </button>
          </motion.div>

          {/* BACKGROUND GLOW */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3b82f6]/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
           <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-[#3b82f6] transition-colors" />
              <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Filter your drafts..."
                 className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#3b82f6]/40 focus:bg-[#0c0c0c] transition-all placeholder:text-[#3f3f46]"
              />
           </div>

           <div className="flex items-center gap-2 text-[10px] font-bold text-[#3f3f46] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
              {drafts.length} Total Problems
           </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
               {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 text-center rounded-[32px] bg-[#0a0a0a] border border-white/5 border-dashed"
            >
               <AlertCircle className="w-12 h-12 text-rose-500/40 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-white mb-2">Sync Error Detected</h3>
               <p className="text-sm text-[#52525b] mb-8 max-w-sm mx-auto">{error}</p>
               <button 
                  onClick={fetchDrafts}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all active:scale-95"
               >
                  <RefreshCcw size={14} />
                  Retry Connection
               </button>
            </motion.div>
          ) : filteredDrafts.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center rounded-[32px] bg-[#0a0a0a] border border-white/5 border-dashed"
            >
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <Terminal size={32} className="text-[#262626]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No Drafts Found</h3>
               <p className="text-sm text-[#52525b] mb-10 max-w-xs mx-auto">
                  You haven't initialized any problem packages yet. Ready to build something great?
               </p>
               <button 
                  onClick={initializeProblem}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
               >
                  <Plus size={16} />
                  Create Your First Problem
               </button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDrafts.map((draft, i) => (
                <ProblemCard key={draft.id} draft={draft} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ProblemCard({ draft, index }: { draft: DraftUnit; index: number }) {
  const isVerified = draft.verificationStatus === 'STABLE';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/architect/id/${draft.id}`} className="group block h-full">
        <div className="p-8 rounded-[32px] bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-[#3b82f6]/30 hover:bg-[#0c0c0c] flex flex-col h-full relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-8 z-10">
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
              isVerified 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}>
              {isVerified ? "Verified" : "Development"}
            </div>
            <div className={`transition-all duration-500 ${isVerified ? "text-emerald-500" : "text-[#1a1a1a] group-hover:text-[#3b82f6]"}`}>
              <Zap size={18} fill={isVerified ? "currentColor" : "none"} className={isVerified ? "animate-pulse" : ""} />
            </div>
          </div>

          <div className="mb-8 z-10">
            <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#3b82f6] transition-colors line-clamp-1">
               {draft.title.replace(/_/g, ' ')}
            </h3>
            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-black uppercase tracking-widest ${
                 draft.difficulty === 'Easy' ? "text-emerald-500" : 
                 draft.difficulty === 'Medium' ? "text-amber-500" : "text-rose-500"
               }`}>
                  {draft.difficulty}
               </span>
               <div className="w-1 h-1 rounded-full bg-white/10" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525b] group-hover:text-[#71717a] transition-colors">
                  {draft.category}
               </span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between z-10">
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-[#262626] uppercase tracking-widest">Last Modified</span>
                <span className="text-[10px] font-mono text-[#3f3f46] group-hover:text-[#71717a] transition-colors">
                   {new Date(draft.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3b82f6] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                Architect <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </div>
          </div>

          {/* CARD DECORATION */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-[#3b82f6]/[0.05] transition-colors duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-8 rounded-[32px] bg-[#0a0a0a] border border-white/5 flex flex-col h-[280px]">
      <div className="flex justify-between items-start mb-8">
        <div className="w-20 h-5 bg-white/5 rounded-lg animate-pulse" />
        <div className="w-5 h-5 bg-white/5 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="w-3/4 h-8 bg-white/5 rounded-xl animate-pulse" />
        <div className="w-1/2 h-4 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
        <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
