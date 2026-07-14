"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, User, CheckCircle2, 
  Lock, Clock, Target, 
  Cpu, Activity, ChevronRight,
  ShieldAlert, Zap, X, Loader2,
  Megaphone, List, Settings, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { socketClient } from "@/lib/socket-client";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
}

interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  creatorId: string;
  registrations?: unknown[];
  problems: Problem[];
}

interface LeaderboardEntry {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  rank: number;
  score: number;
  totalPenalty: number;
}

interface ContestClientProps {
  contest: Contest;
  isRegistered: boolean;
  userId?: string;
}

export default function ContestClient({ contest, isRegistered: initialIsRegistered, userId }: ContestClientProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [isRegistering, setIsRegistering] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState<"Upcoming" | "Active" | "Ended">("Upcoming");
  const [activeTab, setActiveTab] = useState<"problems" | "leaderboard" | "announcements">("problems");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isGhostMatch, setIsGhostMatch] = useState(false);
  const [ghostTarget, setGhostTarget] = useState<string | null>(null);

  const router = useRouter();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/contest/${contest.id}/leaderboard`);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error("Leaderboard Sync Failed", error);
    }
  }, [contest.id]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/contest/${contest.id}/announcements`);
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error("Announcements Fetch Failed", error);
    }
  }, [contest.id]);

  useEffect(() => {
    if (activeTab === "leaderboard") fetchLeaderboard();
    if (activeTab === "announcements") fetchAnnouncements();
  }, [activeTab, fetchLeaderboard, fetchAnnouncements]);

  // Real-time Announcements
  useEffect(() => {
    socketClient.connect();
    const socket = socketClient.socket;

    if (socket) {
      socket.on("contest_announcement", (data: { contestId: string, announcement: Announcement }) => {
        if (data.contestId === contest.id) {
          setAnnouncements(prev => [data.announcement, ...prev]);
          toast.info("New Announcement", {
             description: data.announcement.message,
             icon: <Megaphone className="text-[var(--primary)]" size={16} />,
             duration: 10000
          });
        }
      });

      socket.on("leaderboard_update", (data: { contestId: string, leaderboard: LeaderboardEntry[] }) => {
        if (data.contestId === contest.id) {
          setLeaderboard(data.leaderboard);
        }
      });
    }

    // Ghost Matchmaking Timeout Simulation
    let timeoutId: NodeJS.Timeout;
    if (isRegistered && status === "Active") {
      timeoutId = setTimeout(() => {
        const playersCount = (contest.registrations?.length || 0) || leaderboard.length;
        if (playersCount < 2) {
          setIsGhostMatch(true);
          setGhostTarget("Ghost_Master_01");
          toast("Live opponent not found. Matched against Ghost Replay.", {
            icon: <Cpu className="text-[var(--primary)]" size={16} />
          });
        }
      }, 5000);
    }

    return () => {
      if (socket) {
        socket.off("contest_announcement");
        socket.off("leaderboard_update");
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [contest.id, isRegistered, status, contest.registrations, leaderboard.length]);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      if (now < start) {
        setStatus("Upcoming");
        setTimeLeft(formatDuration(start - now));
      } else if (now >= start && now < end) {
        setStatus("Active");
        setTimeLeft(formatDuration(end - now));
      } else {
        setStatus("Ended");
        setTimeLeft("Ended");
      }
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [contest]);

  const handleRegister = async () => {
    if (!userId) {
      toast.error("Authentication required");
      return;
    }
    setIsRegistering(true);
    try {
      await axios.post("/api/contest/register", { contestId: contest.id });
      setIsRegistered(true);
      toast.success("Successfully registered for Arena");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Registration failed");
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const isCreator = userId === contest.creatorId;

  // Insert virtual ghost player in leaderboard standings if in ghost mode
  const displayLeaderboard = [...leaderboard];
  if (isGhostMatch && ghostTarget && !displayLeaderboard.some(entry => entry.user.name === ghostTarget)) {
    displayLeaderboard.push({
      user: {
        id: "ghost-id-01",
        name: ghostTarget,
        image: null
      },
      rank: displayLeaderboard.length + 1,
      score: 850,
      totalPenalty: 12
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
      {/* 1. ARENA HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full flex items-center gap-2">
                <Trophy size={14} className="text-[#f59e0b]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]">Elite Arena</span>
             </div>
             {status === "Active" && (
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Live</span>
                </div>
             )}
             {isGhostMatch && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">Ghost Player</span>
             )}
          </div>
          <h1 className="text-5xl font-black tracking-tight text-[var(--foreground)] uppercase italic">{contest.title}</h1>
          <p className="text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">{contest.description}</p>
        </div>

        <div className="flex flex-col items-end gap-6">
          {/* CONTROL CENTER LINK FOR CREATOR */}
          {isCreator && (
             <Link 
                href={`/arena/${contest.id}/manage`}
                className="flex items-center gap-3 px-6 py-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all group"
             >
                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                <div className="flex flex-col items-start">
                   <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Admin Access</span>
                   <span className="text-xs font-black uppercase">Command Center</span>
                </div>
                <ArrowRight size={16} className="ml-2" />
             </Link>
          )}

          <div className="flex items-center gap-8 bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2rem]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Time Remaining</span>
              <div className="flex items-center gap-2 text-2xl font-black font-mono text-[var(--foreground)]">
                <Clock size={20} className="text-[var(--primary)]" />
                {timeLeft}
              </div>
            </div>
            
            <div className="h-10 w-px bg-[var(--border)]" />

            {!isRegistered ? (
               <button 
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f59e0b] hover:text-[var(--foreground)] transition-all disabled:opacity-50"
               >
                 {isRegistering ? "Processing..." : "Join Arena"}
               </button>
            ) : (
               <div className="px-8 py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 size={16} /> Registered
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 mb-8 bg-[var(--foreground)]/5 p-1 rounded-2xl w-fit">
        {[
          { id: "problems", label: "Contest Units", icon: List },
          { id: "leaderboard", label: "Rankings", icon: Trophy },
          { id: "announcements", label: "Broadcasting", icon: Megaphone },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "problems" | "leaderboard" | "announcements")}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 relative ${
              activeTab === tab.id ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <tab.icon size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {tab.id === "announcements" && announcements.length > 0 && (
               <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full text-[8px] font-bold flex items-center justify-center text-[var(--foreground)] border-2 border-[var(--background)]">
                  {announcements.length}
               </div>
            )}
          </button>
        ))}
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "problems" ? (
             <motion.div 
               key="problems"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 gap-3 max-w-4xl"
             >
                {contest.problems.map((problem: Problem, index: number) => {
                   const isCreator = userId === contest.creatorId;
                   const hasStarted = status !== "Upcoming";
                   const hasEnded = status === "Ended";
                   const isLocked = !isCreator && (!hasStarted || (!isRegistered && !hasEnded));

                   return (
                      <div key={problem.id} className="group">
                         <Link 
                            href={isLocked ? "#" : `/problems/${problem.slug}?contestId=${contest.id}`}
                            className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
                               isLocked ? "bg-[var(--foreground)]/[0.01] border-[var(--border)] opacity-50 cursor-not-allowed" : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/30"
                            }`}
                         >
                            <div className="flex items-center gap-6">
                               <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{String.fromCharCode(65 + index)}</span>
                               </div>
                               <div className="space-y-1">
                                  <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{problem.title}</h3>
                                  <div className="flex items-center gap-3">
                                     <span className={`text-[8px] font-bold uppercase tracking-widest ${
                                        problem.difficulty === 'Easy' ? 'text-green-500' : problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                                     }`}>{problem.difficulty}</span>
                                     <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">{problem.category}</span>
                                  </div>
                               </div>
                            </div>
                            
                            {isLocked ? (
                               <Lock className="text-[var(--muted-foreground)]" size={18} />
                            ) : (
                               <ChevronRight className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-all" size={20} />
                            )}
                         </Link>
                      </div>
                   );
                })}
             </motion.div>
          ) : activeTab === "leaderboard" ? (
             <motion.div 
                key="leaderboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl bg-[var(--card)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-2xl"
             >
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-[var(--border)] text-[9px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
                               <th className="px-8 py-5">Rank</th>
                               <th className="px-8 py-5">User</th>
                               <th className="px-8 py-5 text-right">Score</th>
                               <th className="px-8 py-5 text-right">Penalty</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[var(--border)]">
                            {displayLeaderboard.length === 0 ? (
                               <tr>
                                  <td colSpan={4} className="px-8 py-20 text-center">
                                     <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] animate-pulse">Standings will be updated soon...</p>
                                  </td>
                               </tr>
                            ) : (
                               displayLeaderboard.map((entry) => (
                                  <tr key={entry.user.id} className="group hover:bg-[var(--foreground)]/[0.01] transition-all">
                                     <td className="px-8 py-4">
                                        <span className={`text-sm font-bold font-mono ${
                                           entry.rank === 1 ? "text-amber-500" :
                                           entry.rank === 2 ? "text-slate-400" :
                                           entry.rank === 3 ? "text-amber-700" : "text-[var(--muted-foreground)]"
                                        }`}>#{entry.rank}</span>
                                     </td>
                                     <td className="px-8 py-4">
                                        <Link href={entry.user.id === "ghost-id-01" ? "#" : `/profile/${entry.user.id}`} className="flex items-center gap-3 group/user">
                                           <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border)] overflow-hidden flex items-center justify-center relative">
                                              {entry.user.image ? <Image src={entry.user.image} alt="" fill className="object-cover" /> : <User className="w-4 h-4 text-[var(--muted-foreground)]" />}
                                           </div>
                                           <span className="text-sm font-bold text-[var(--foreground)] group-hover/user:text-[var(--primary)] transition-colors">{entry.user.name || "Unknown"}</span>
                                           {entry.user.name === ghostTarget && (
                                              <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">Ghost Player</span>
                                           )}
                                        </Link>
                                     </td>
                                     <td className="px-8 py-4 text-right font-mono text-lg font-bold text-[var(--primary)]">
                                        {entry.score}
                                     </td>
                                     <td className="px-8 py-4 text-right font-mono text-xs text-[var(--muted-foreground)]">
                                        {entry.totalPenalty}m
                                     </td>
                                  </tr>
                               ))
                            )}
                         </tbody>
                   </table>
                </div>
             </motion.div>
          ) : (
             <motion.div 
               key="announcements"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="max-w-4xl space-y-4"
             >
                {announcements.length === 0 ? (
                   <div className="py-24 text-center border-2 border-dashed border-[var(--border)] rounded-[2rem]">
                      <Megaphone size={32} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">No transmissions recorded for this Arena.</p>
                   </div>
                ) : (
                   announcements.map(a => (
                      <div key={a.id} className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl group hover:border-[var(--primary)]/30 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <Megaphone size={14} className="text-[var(--primary)]" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Transmission Recieved</span>
                            </div>
                            <span className="text-[9px] font-mono text-[var(--muted-foreground)]">{new Date(a.createdAt).toLocaleString()}</span>
                         </div>
                         <p className="text-sm text-[var(--foreground)] leading-relaxed group-hover:text-[var(--foreground)] transition-colors">{a.message}</p>
                      </div>
                   ))
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms / 1000) % 60);
  const d = Math.floor(ms / 86400000);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
