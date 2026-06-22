"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, ChevronRight, 
  Terminal,
  LayoutTemplate, Zap,
  AlertCircle, RefreshCcw, LayoutGrid
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)]/30 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16"> 
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
               <div className="p-2.5 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)] border border-[var(--primary)]/20">
                  <LayoutGrid size={20} />
               </div>
               <span className="text-[10px] font-black tracking-[0.3em] text-[var(--muted-foreground)] uppercase">Architect Dashboard</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-[var(--foreground)] mb-4">
                Problem <span className="text-[var(--primary)] italic">Architect</span>
              </h1>
              <p className="text-base text-[var(--muted-foreground)] leading-relaxed">
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
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-[var(--foreground)]/10 hover:border-[var(--border-strong)] active:scale-95"
            >
              <LayoutTemplate className="w-4 h-4 text-[var(--primary)]" />
              Creator Studio
            </Link>

            <button
              onClick={initializeProblem}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:opacity-90 shadow-xl shadow-[var(--primary)]/20 active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Create Problem
            </button>
          </motion.div>

          {/* BACKGROUND GLOW */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
           <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
              <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Filter your drafts..."
                 className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-6 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]/40 focus:bg-[var(--background)] transition-all placeholder:text-[var(--muted-foreground)]"
              />
           </div>

           <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
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
              className="py-24 text-center rounded-[32px] bg-[var(--card)] border border-[var(--border)] border-dashed"
            >
               <AlertCircle className="w-12 h-12 text-rose-500/40 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Sync Error Detected</h3>
               <p className="text-sm text-[var(--muted-foreground)] mb-8 max-w-sm mx-auto">{error}</p>
               <button 
                  onClick={fetchDrafts}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all active:scale-95"
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
              className="py-32 text-center rounded-[32px] bg-[var(--card)] border border-[var(--border)] border-dashed"
            >
               <div className="w-20 h-20 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mx-auto mb-8 border border-[var(--border)]">
                  <Terminal size={32} className="text-[var(--muted-foreground)]/30" />
               </div>
               <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No Drafts Found</h3>
               <p className="text-sm text-[var(--muted-foreground)] mb-10 max-w-xs mx-auto">
                  {"You haven't initialized any problem packages yet. Ready to build something great?"}
               </p>
               <button 
                  onClick={initializeProblem}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all shadow-xl shadow-[var(--foreground)]/5 active:scale-95"
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
        <div className="p-8 rounded-[32px] bg-[var(--card)] border border-[var(--border)] transition-all duration-500 hover:border-[var(--primary)]/30 hover:bg-[var(--card)]/80 flex flex-col h-full relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-8 z-10">
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
              isVerified 
              ? "bg-[var(--viz-green)]/10 text-[var(--viz-green)] border-[var(--viz-green)]/20" 
              : "bg-[var(--viz-gold)]/10 text-[var(--viz-gold)] border-[var(--viz-gold)]/20"
            }`}>
              {isVerified ? "Verified" : "Development"}
            </div>
            <div className={`transition-all duration-500 ${isVerified ? "text-[var(--viz-green)]" : "text-[var(--muted-foreground)]/30 group-hover:text-[var(--primary)]"}`}>
              <Zap size={18} fill={isVerified ? "currentColor" : "none"} className={isVerified ? "animate-pulse" : ""} />
            </div>
          </div>

          <div className="mb-8 z-10">
            <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
               {draft.title.replace(/_/g, ' ')}
            </h3>
            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-black uppercase tracking-widest ${
                 draft.difficulty === 'Easy' ? "text-[var(--viz-green)]" : 
                 draft.difficulty === 'Medium' ? "text-[var(--viz-gold)]" : "text-[var(--viz-red)]"
               }`}>
                  {draft.difficulty}
               </span>
               <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/10" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                  {draft.category}
               </span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between z-10">
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-widest">Last Modified</span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                   {new Date(draft.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                Architect <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </div>
          </div>

          {/* CARD DECORATION */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-[var(--primary)]/[0.05] transition-colors duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-8 rounded-[32px] bg-[var(--card)] border border-[var(--border)] flex flex-col h-[280px]">
      <div className="flex justify-between items-start mb-8">
        <div className="w-20 h-5 bg-[var(--foreground)]/5 rounded-lg animate-pulse" />
        <div className="w-5 h-5 bg-[var(--foreground)]/5 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="w-3/4 h-8 bg-[var(--foreground)]/5 rounded-xl animate-pulse" />
        <div className="w-1/2 h-4 bg-[var(--foreground)]/5 rounded-lg animate-pulse" />
      </div>
      <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between">
        <div className="w-24 h-4 bg-[var(--foreground)]/5 rounded animate-pulse" />
        <div className="w-16 h-4 bg-[var(--foreground)]/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
