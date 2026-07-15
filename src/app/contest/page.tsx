"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Clock, Trophy, Target, ChevronRight, Sparkles, 
  Cpu, Activity, History, ShieldCheck, Zap, Globe, Users, 
  Lock, Calendar, FileText, Rocket, LayoutTemplate
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

interface Arena {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "Upcoming" | "Active" | "Ended";
  participantsCount: number;
  isOfficial: boolean;
  isRated: boolean;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  problems: {
    id: string;
    title: string;
    difficulty: string;
  }[];
}

export default function ArenaDashboard() {
  const { data: session } = useSession();
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHub, setActiveHub] = useState<"ELITE" | "COLLECTIVE">("ELITE");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "ENDED">("ALL");

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const { data } = await axios.get("/api/contest");
        setArenas(data.contests);
      } catch (error) {
        toast.error("Telemetry Sync Failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArenas();
  }, []);

  const filteredArenas = arenas.filter(a => {
    if (activeHub === "ELITE" && !a.isOfficial) return false;
    if (activeHub === "COLLECTIVE" && a.isOfficial) return false;
    if (filter === "ALL") return true;
    return a.status.toUpperCase() === filter;
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-[1px] border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Syncing Arena Matrix...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-x-hidden pb-32">
      {/* 1. ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '100px 100px', perspective: '1200px', transform: 'rotateX(65deg) translateY(-10%)', transformOrigin: 'top' }} />
         <div className={`absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[160px] animate-pulse transition-colors duration-1000 ${activeHub === 'ELITE' ? "bg-[var(--viz-gold)]/5" : "bg-[var(--primary)]/5"}`} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10"> 
        {/* 2. DASHBOARD HUD */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4 group">
               <div className={`p-3 rounded-2xl shadow-inner transition-all duration-500 border group-hover:rotate-12 ${activeHub === 'ELITE' ? "bg-[var(--viz-gold)]/10 text-[var(--viz-gold)] border-[var(--viz-gold)]/20" : "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"}`}>
                  {activeHub === 'ELITE' ? <Trophy size={28} /> : <Users size={28} />}
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-[var(--muted-foreground)] uppercase">Contest Center</span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase mt-[-2px] ${activeHub === 'ELITE' ? "text-[var(--viz-gold)]" : "text-[var(--primary)]"}`}>{activeHub === 'ELITE' ? "Official Contests" : "Community Contests"}</span>
               </div>
            </div>

            <div className="space-y-2">
               <h1 className="text-7xl font-bold tracking-tighter text-[var(--foreground)] leading-none">
                 The <span className={`italic transition-colors duration-500 ${activeHub === 'ELITE' ? "text-[var(--viz-gold)]" : "text-[var(--primary)]"}`}>Contests</span>
               </h1>
               <p className="text-xl text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
                  {activeHub === 'ELITE' 
                    ? "Official contests with standard difficulty and global rating impact."
                    : "Community contests created by users and peers."}
               </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/studio"
              className={`flex items-center gap-3 px-10 py-5 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all hover:scale-105 shadow-2xl active:scale-95 ${activeHub === 'ELITE' ? "hover:bg-[var(--viz-gold)] hover:text-[var(--background)]" : "hover:bg-[var(--primary)] hover:text-[var(--background)]"}`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Creator Studio
            </Link>
          </div>
        </div>

        {/* 3. DUAL-HUB TABS */}
        <div className="flex items-center gap-2 p-1.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-3xl w-fit mb-12 backdrop-blur-3xl">
           <button onClick={() => setActiveHub("ELITE")} className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative overflow-hidden ${activeHub === 'ELITE' ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {activeHub === 'ELITE' && <motion.div layoutId="hub-active" className="absolute inset-0 bg-[var(--viz-gold)]/10 border-b-2 border-[var(--viz-gold)]" />}
              <ShieldCheck size={16} className={activeHub === 'ELITE' ? "text-[var(--viz-gold)]" : ""} />
              <span className="relative z-10">Official</span>
           </button>
           <button onClick={() => setActiveHub("COLLECTIVE")} className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative overflow-hidden ${activeHub === 'COLLECTIVE' ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {activeHub === 'COLLECTIVE' && <motion.div layoutId="hub-active" className="absolute inset-0 bg-[var(--primary)]/10 border-b-2 border-[var(--primary)]" />}
              <Globe size={16} className={activeHub === 'COLLECTIVE' ? "text-[var(--primary)]" : ""} />
              <span className="relative z-10">Community</span>
           </button>
        </div>

        {/* 4. ARENA FILTERS */}
        <div className="flex items-center gap-4 mb-16 overflow-x-auto no-scrollbar pb-4">
           {[
              { id: 'ALL', label: 'All Contests', icon: Activity },
              { id: 'ACTIVE', label: 'Live', icon: Zap },
              { id: 'UPCOMING', label: 'Upcoming', icon: Clock },
              { id: 'ENDED', label: 'Past', icon: History }
           ].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id as "ALL" | "ACTIVE" | "UPCOMING" | "ENDED")} className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0 ${filter === t.id ? "bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border-strong)] shadow-xl" : "bg-[var(--foreground)]/[0.01] text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02]"}`}>
                 <t.icon size={14} className={filter === t.id ? (activeHub === 'ELITE' ? "text-[var(--viz-gold)]" : "text-[var(--primary)]") : ""} />
                 {t.label}
              </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArenas.length === 0 ? (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full py-40 text-center rounded-3xl bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern pointer-events-none" />
                  <Activity className="w-20 h-20 text-[var(--muted-foreground)]/10 mx-auto mb-8" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">No contests found.</p>
               </motion.div>
            ) : (
               filteredArenas.map((arena, i) => (
                  <ArenaCard key={arena.id} arena={arena} index={i} accentColor={activeHub === 'ELITE' ? 'var(--viz-gold)' : 'var(--primary)'} />
               ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function ArenaCard({ arena, index, accentColor }: { arena: Arena; index: number; accentColor: string }) {
  const statusConfig = {
    Active: { color: "var(--viz-green)", bg: "rgba(var(--viz-green-rgb), 0.1)", label: "Live" },
    Upcoming: { color: "var(--primary)", bg: "rgba(var(--viz-purple-rgb), 0.1)", label: "Upcoming" },
    Ended: { color: "var(--viz-red)", bg: "rgba(var(--viz-red-rgb), 0.1)", label: "Ended" },
  }[arena.status];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} layout>
      <Link href={`/contest/${arena.id}`} className="group block h-full">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col h-full transition-all duration-500 hover:bg-[var(--foreground)]/[0.03] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${statusConfig.color}4D, transparent)` }} />
          
          <div className="flex justify-between items-start mb-10">
             <div className="p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl transition-all" style={{ color: accentColor }}><Trophy size={20} style={{ color: accentColor }} /></div>
             <span className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-[var(--border)]" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>{statusConfig.label}</span>
          </div>

          <div className="flex-1 space-y-4 mb-10">
             <h2 className="text-3xl font-bold tracking-tighter text-[var(--foreground)] group-hover:text-current transition-colors leading-tight" style={{ color: accentColor }}>{arena.title}</h2>
             <p className="text-[var(--muted-foreground)] text-sm font-light leading-relaxed line-clamp-2">{arena.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="p-4 bg-[var(--background)]/40 rounded-2xl border border-[var(--border)] space-y-1">
                <span className="text-[8px] font-bold text-[var(--muted-foreground)]/30 uppercase flex items-center gap-2 tracking-widest"><Target size={10} style={{ color: accentColor }} /> Problems</span>
                <p className="text-xs font-mono font-bold text-[var(--muted-foreground)]">{arena.problems.length} Problems</p>
             </div>
             <div className="p-4 bg-[var(--background)]/40 rounded-2xl border border-[var(--border)] space-y-1">
                <span className="text-[8px] font-bold text-[var(--muted-foreground)]/30 uppercase flex items-center gap-2 tracking-widest"><Calendar size={10} style={{ color: accentColor }} /> Date</span>
                <p className="text-xs font-mono font-bold text-[var(--muted-foreground)]">{new Date(arena.startTime).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="mt-auto pt-8 border-t border-[var(--border)] flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--foreground)]/5 flex items-center justify-center text-[10px] font-bold" style={{ color: accentColor }}>{arena.participantsCount}</div>
               <span className="text-[8px] uppercase font-bold text-[var(--muted-foreground)]/30 tracking-widest">Participants</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-2 transition-all duration-500" style={{ color: accentColor }}>
               {arena.status === "Upcoming" ? "Enter" : arena.status === "Active" ? "Join" : "View"}
               <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
