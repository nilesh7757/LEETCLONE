/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, TrendingUp, 
  Zap, Award, Target, MessageSquare, Shield, Rocket, Sparkles, Github
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FollowsModal from "@/features/profile/components/Profile/FollowsModal";
import { io, Socket } from "socket.io-client";
import SkillRadar from "@/features/profile/components/HeroProfile/SkillRadar";

import Image from 'next/image';

const ActivityCalendar = dynamic(() => import("react-activity-calendar").then(mod => {
  return mod.ActivityCalendar;
}), { ssr: false });

let socket: Socket;

interface RatingHistory {
  date: string;
  rating: number;
}

interface CalendarData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface UserStats {
  warnings: number;
  isBanned: boolean;
  followersCount: number;
  followingCount: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  categoryStats: Record<string, number>;
}

interface PerformanceStats {
  user: UserStats;
  ratingHistory: RatingHistory[];
  calendarData: CalendarData[];
}

interface PublicProfileClientProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    website: string | null;
    description: string | null;
    rating: number;
    createdAt: Date;
    email: string | null;
    githubUsername?: string | null;
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
    devPowerLevel?: number;
    aiProfileFeedback?: string | null;
    externalStats?: any;
  };
}

export default function PublicProfileClient({ user }: PublicProfileClientProps) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [friendStatus, setFriendStatus] = useState<"NONE" | "FOLLOWING" | "SELF">("NONE");
  const [activeModal, setActiveModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    socket = io("http://localhost:3001", { transports: ["websocket"] });
    return () => { socket.disconnect(); };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!user.id) return;
    try {
      const { data } = await axios.get(`/api/users/${user.id}/performance`);
      setStats(data);
    } catch (err) {
      console.error("Failed to load performance stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const checkFriendStatus = useCallback(async () => {
    try {
        const { data } = await axios.get(`/api/friends/status/${user.id}`);
        setFriendStatus(data.status);
    } catch {}
  }, [user.id]);

  useEffect(() => {
    if (session?.user && user.id !== session.user.id) checkFriendStatus();
    else if (session?.user?.id === user.id) setFriendStatus("SELF");
  }, [session, user.id, checkFriendStatus]);

  const handleFollow = async () => {
    try {
        const { data } = await axios.post("/api/friends/add", { targetId: user.id });
        setFriendStatus("FOLLOWING");
        if (data.notification) socket.emit("send_notification", { recipientId: user.id, notification: data.notification });
    } catch {}
  };

  const rating = user.rating || 0;
  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (rating >= 2400) { rankColor = "var(--viz-red)"; rankTitle = "Grandmaster"; }
  else if (rating >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (rating >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (rating >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else if (rating > 0) { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  const externalStats = user.externalStats;

  return (
    <div className={`min-h-screen w-full relative pb-20 overflow-x-hidden transition-colors duration-500`}>
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
        >
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse opacity-20 bg-cyan-400`} />
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr relative from-cyan-400 to-purple-500`}>
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--background)] bg-[var(--card)] relative">
                            {user.image ? (
                                <Image src={user.image} alt={user.name || ""} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]">
                                    <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-[var(--muted-foreground)]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className={`text-4xl md:text-6xl font-black tracking-tighter`}>{user.name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankTitle}</span>
                        <span className="text-[var(--muted-foreground)] text-xs font-mono">NODE_ID: {user.id.slice(0, 8)}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                {friendStatus !== "SELF" && (
                    <>
                        <button onClick={handleFollow} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-[var(--foreground)] text-[var(--background)]`}>
                            {friendStatus === "FOLLOWING" ? "Tracking" : "Follow Target"}
                        </button>
                        <button onClick={() => router.push('/chat')} className="p-4 rounded-2xl bg-[var(--card)] border border(--border) hover:border-[var(--primary)] transition-all">
                            <MessageSquare size={20} />
                        </button>
                    </>
                )}
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Rocket size={80} className="text-blue-400" />
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Dev Power Level</h3>
                <div className="text-6xl font-black tracking-tighter mb-4">{user.devPowerLevel || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block text-blue-400">
                    {user.description || "UNRANKED_CANDIDATE"}
                </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" /> Neural Coach Assessment
                </h3>
                <p className="text-sm font-medium leading-relaxed italic text-[var(--foreground)]/80">
                    {user.aiProfileFeedback || "This candidate has not yet synchronized their neural profile."}
                </p>
            </div>

            {/* EXTERNAL NODES STATS */}
            <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-6">Neural_Nodes_Status</h3>
                <div className="space-y-4">
                    {user.githubUsername && (
                        <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <Github size={16} className="text-emerald-500" />
                                <span className="text-xs font-bold font-mono">{user.githubUsername}</span>
                            </div>
                            {externalStats?.github && (
                                <div className="text-[10px] font-black text-emerald-500 uppercase">{externalStats.github.publicRepos} Repos</div>
                            )}
                        </div>
                    )}
                    {user.leetcodeUsername && (
                        <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-amber-500" />
                                <span className="text-xs font-bold font-mono">{user.leetcodeUsername}</span>
                            </div>
                            {externalStats?.leetcode && (
                                <div className="text-[10px] font-black text-amber-500 uppercase">{externalStats.leetcode.totalSolved} Solved</div>
                            )}
                        </div>
                    )}
                    {user.codeforcesUsername && (
                        <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <Award size={16} className="text-blue-500" />
                                <span className="text-xs font-bold font-mono">{user.codeforcesUsername}</span>
                            </div>
                            {externalStats?.codeforces && (
                                <div className="text-[10px] font-black text-blue-500 uppercase">{externalStats.codeforces.rating} Rating</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-2xl relative"
          >
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Elo Trajectory</h3>
                    <div className="text-5xl font-black font-mono tracking-tighter">{user.rating}</div>
                </div>
                <div className={`p-4 rounded-2xl bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]`}>
                    <TrendingUp size={24} />
                </div>
            </div>
            
            <div className="h-[250px] w-full mt-4">
                {!loadingStats && stats && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.ratingHistory}>
                            <defs>
                                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--viz-cyan)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--viz-cyan)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }} />
                            <Area type="monotone" dataKey="rating" stroke="var(--viz-cyan)" strokeWidth={4} fill="url(#ratingGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
          </motion.div>

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCapsule label="Low Level" count={stats?.user?.solvedEasy || 0} color="#10b981" icon={Target} />
                <StatCapsule label="Mid Level" count={stats?.user?.solvedMedium || 0} color="#f59e0b" icon={Zap} />
                <StatCapsule label="High Level" count={stats?.user?.solvedHard || 0} color="#ef4444" icon={Award} />
                <div className="p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden flex flex-col justify-center">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Neural Mastery</h4>
                    <SkillRadar stats={stats?.user?.categoryStats || {}} theme={theme} />
                </div>
          </div>

          <motion.div className="lg:col-span-12 p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-8 flex items-center gap-2">
                    <TrendingUp size={14} /> Chronological Activity
                </h3>
                <div className="flex justify-center overflow-x-auto pb-4">
                    {!loadingStats && stats?.calendarData && (
                         
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                dark: ['rgba(255,255,255,0.05)', '#38bdf8'],
                                light: ['#f1f5f9', '#0ea5e9']
                            }}
                             
                            colorScheme={(theme === 'dark' ? 'dark' : 'light') as any}
                            blockSize={14}
                            blockMargin={5}
                            blockRadius={4}
                        />
                    )}
                </div>
          </motion.div>

        </div>
      </div>
      
      {activeModal && (
        <FollowsModal userId={user.id} type={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

function StatCapsule({ label, count, color, icon: Icon }: { label: string, count: number, color: string, icon: React.ElementType }) {
    return (
        <div className="group p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] hover:border-opacity-100 transition-all duration-500 hover:-translate-y-2 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] group-hover:scale-110 transition-transform">
                    <Icon size={20} style={{ color }} />
                </div>
                <div className="text-4xl font-black font-mono">{count}</div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    <span>{label}</span>
                    <span style={{ color }}>ACTV_SCORE</span>
                </div>
                <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} className="h-full rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: color }} />
                </div>
            </div>
        </div>
    );
}
