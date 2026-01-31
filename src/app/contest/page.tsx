"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Clock, 
  User, 
  Trophy, 
  Calendar, 
  Search, 
  ArrowRight, 
  Loader2, 
  Target 
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "Upcoming" | "Active" | "Ended";
  participantsCount: number;
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

export default function ContestListPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axios.get("/api/contest");
        setContests(data.contests);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
        toast.error("Failed to load contests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--viz-gold)]/40" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]/40">Synchronizing Manifolds</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-12 pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--viz-gold)]/10 rounded-xl text-[var(--viz-gold)] shadow-sm">
              <Trophy size={24} />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-[var(--muted-foreground)]/40 uppercase">Competitive Protocols</span>
          </div>
          <h1 className="text-5xl font-light tracking-tight text-[var(--foreground)]">
            Active <span className="text-[var(--viz-gold)] font-medium">Contests</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl font-light leading-relaxed">
            Test your neural efficiency against global operators. Optimize your logic under temporal constraints.
          </p>
        </div>
        
        {session?.user && (
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/contest/create"
              className="flex items-center gap-2 px-8 py-4 bg-[var(--viz-gold)] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-[var(--viz-gold)]/30"
            >
              <Plus className="w-4 h-4" />
              Initialize Contest
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {contests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-[var(--card)] rounded-[3rem] shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
            <Trophy className="w-20 h-20 text-[var(--muted-foreground)]/10 mx-auto mb-6" />
            <h2 className="text-2xl font-light text-[var(--foreground)] mb-3 uppercase tracking-tighter">Event Queue Empty</h2>
            <p className="text-[var(--muted-foreground)]/60 font-mono text-sm uppercase tracking-widest">No active competitive manifolds detected in current unit.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contests.map((contest, index) => (
              <ContestCard key={contest.id} contest={contest} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ContestCard({ contest, index }: { contest: Contest; index: number }) {
  const statusColor = 
    contest.status === "Active" ? "var(--viz-green)" : 
    contest.status === "Upcoming" ? "var(--viz-blue)" : 
    "var(--viz-red)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative h-full"
    >
      <Link 
        href={`/contest/${contest.id}`} 
        className="bg-[var(--card)] rounded-[2.5rem] p-8 flex flex-col justify-between h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-gold)]/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern" />
        
        <div>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-light tracking-tight text-[var(--foreground)] group-hover:text-[var(--viz-gold)] transition-colors line-clamp-1">
              {contest.title}
            </h2>
            <span
              className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border"
              style={{ backgroundColor: `${statusColor}10`, color: statusColor, borderColor: `${statusColor}20` }}
            >
              {contest.status}
            </span>
          </div>

          <p className="text-[var(--muted-foreground)] text-sm mb-8 line-clamp-2 font-light leading-relaxed">
            {contest.description || "Experimental protocol awaiting implementation details."}
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-[10px] font-mono font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">
              <User className="w-3.5 h-3.5 text-[var(--viz-gold)]/60" />
              <span>Operator: </span>
              <span className="text-[var(--foreground)] group-hover:text-[var(--viz-gold)] transition-colors">{contest.creator?.name || "Anonymous"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-mono font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-[var(--viz-gold)]/60" />
              <span>Window: </span>
              <span className="text-[var(--foreground)]/80">
                {new Date(contest.startTime).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono font-black text-[var(--muted-foreground)]/40 uppercase tracking-widest">
              <Target className="w-3.5 h-3.5 text-[var(--viz-gold)]/60" />
              <span>Vectors: </span>
              <span className="text-[var(--foreground)]/80">{contest.problems.length} Analytical Tasks</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[var(--primary)]/10 flex justify-between items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[18px] font-black text-[var(--foreground)] font-mono">{contest.participantsCount}</span>
            <span className="text-[8px] uppercase font-black text-[var(--muted-foreground)]/40 tracking-[0.2em]">Participants</span>
          </div>
          
          <div className="px-6 py-2.5 bg-[var(--muted)] text-[var(--foreground)]/60 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[var(--viz-gold)] group-hover:text-black transition-all shadow-sm">
            {contest.status === "Upcoming" ? "Register" : contest.status === "Active" ? "Join Entry" : "View Results"}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}