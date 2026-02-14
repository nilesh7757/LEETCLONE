"use client";

import { motion } from "framer-motion";
import { 
  UserCircle, Globe, Calendar, TrendingUp, ShieldCheck, 
  Ban, Star, MessageSquare, Zap, 
  Target, Award, Hash 
} from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FollowsModal from "@/features/profile/components/Profile/FollowsModal";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

import Image from 'next/image';
import { useCallback } from "react";

const ActivityCalendar = dynamic(() => import("react-activity-calendar").then(mod => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = mod as any;
  return m.ActivityCalendar || m.default;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}), { ssr: false }) as any;

let socket: Socket;

interface RatingHistory {
  date: string;
  rating: number;
}

interface CalendarData {
  date: string;
  count: number;
  level: number;
}

interface UserStats {
  warnings: number;
  isBanned: boolean;
  followersCount: number;
  followingCount: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
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
  };
}

export default function PublicProfileClient({ user }: PublicProfileClientProps) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<CalendarData | null>(null);
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [friendStatus, setFriendStatus] = useState<"NONE" | "FOLLOWING" | "SELF">("NONE");
  const [activeModal, setActiveModal] = useState<"followers" | "following" | null>(null);

  // Socket Init
  useEffect(() => {
    socket = io("http://localhost:3001", { transports: ["websocket"] });
    return () => {
        socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user.id) return;
      try {
        const { data } = await axios.get(`/api/users/${user.id}/performance`);
        setStats(data);
      } catch (error) {
        console.error("Failed to load performance stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user.id]);

  const checkFriendStatus = useCallback(async () => {
    try {
        const { data } = await axios.get(`/api/friends/status/${user.id}`);
        setFriendStatus(data.status);
    } catch (error) {
        console.error("Check status failed", error);
    }
  }, [user.id]);

  useEffect(() => {
    if (session?.user && user.id !== session.user.id) {
        checkFriendStatus();
    } else if (session?.user?.id === user.id) {
        setFriendStatus("SELF");
    }
  }, [session, user.id, checkFriendStatus]);

  const handleFollow = async () => {
    try {
        const { data } = await axios.post("/api/friends/add", { targetId: user.id });
        setFriendStatus("FOLLOWING");

        if (data.notification) {
            socket.emit("send_notification", { recipientId: user.id, notification: data.notification });
        }
    } catch (error) {
        console.error("Follow failed", error);
    }
  };

  const handleUnfollow = async () => {
    try {
        await axios.post("/api/friends/remove", { targetId: user.id });
        setFriendStatus("NONE");
    } catch (error) {
        console.error("Unfollow failed", error);
    }
  };

  const handleMessage = async () => {
      try {
          const { data } = await axios.post("/api/chat", { participantId: user.id });
          router.push(`/chat/${data.conversationId}`);
      } catch (error) {
          console.error("Start chat failed", error);
      }
  };

  const warnings = stats?.user?.warnings || 0;
  const isBanned = stats?.user?.isBanned || false;
  
  // Rank Logic Simulation
  const rating = user.rating || 0;
  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (rating >= 2400) { rankColor = "var(--viz-rose)"; rankTitle = "Grandmaster"; }
  else if (rating >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (rating >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (rating >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else if (rating > 0) { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  return (
    <div className="min-h-screen w-full relative pb-20 overflow-x-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--viz-cyan)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--viz-purple)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Identity Module */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Identity Card */}
            <div className="relative p-8 rounded-[2.5rem] bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] overflow-hidden group hover:shadow-2xl hover:shadow-[var(--viz-cyan)]/5 transition-all duration-500">
                {/* Top Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--viz-cyan)]/10 to-transparent opacity-50" />
                
                <div className="relative flex flex-col items-center">
                    {/* Avatar Ring */}
                    <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--viz-cyan)] to-[var(--viz-purple)] opacity-20 blur-xl animate-pulse" />
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[var(--viz-cyan)] to-[var(--viz-purple)] relative">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--card)] bg-[var(--card)] relative">
                                {user.image ? (
                                    <Image 
                                        src={user.image} 
                                        alt={user.name || "User profile"} 
                                        fill
                                        className="object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]">
                                        <UserCircle className="w-16 h-16 text-[var(--muted-foreground)]" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Rank Badge */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center gap-2 whitespace-nowrap">
                            <Award size={14} style={{ color: rankColor }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankTitle}</span>
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight mb-2 text-center">{user.name}</h1>
                    {user.bio && <p className="text-[var(--muted-foreground)] text-sm text-center font-medium max-w-[80%] leading-relaxed">{user.bio}</p>}

                    {/* Social Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full mt-8">
                        <div 
                            onClick={() => setActiveModal("followers")}
                            className="flex flex-col items-center p-3 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--viz-cyan)]/30 cursor-pointer transition-colors"
                        >
                            <span className="text-xl font-black text-[var(--foreground)]">{stats?.user?.followersCount || 0}</span>
                            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Followers</span>
                        </div>
                        <div 
                            onClick={() => setActiveModal("following")}
                            className="flex flex-col items-center p-3 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--viz-cyan)]/30 cursor-pointer transition-colors"
                        >
                            <span className="text-xl font-black text-[var(--foreground)]">{stats?.user?.followingCount || 0}</span>
                            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Following</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {friendStatus !== "SELF" && (
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                onClick={handleMessage}
                                className="py-2.5 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <MessageSquare size={14} /> Message
                            </button>
                            
                            {friendStatus === "NONE" ? (
                                <button
                                    onClick={handleFollow}
                                    className="py-2.5 px-4 bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] border border-[var(--viz-cyan)]/20 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-[var(--viz-cyan)]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Star size={14} /> Follow
                                </button>
                            ) : (
                                <button
                                    onClick={handleUnfollow}
                                    className="py-2.5 px-4 bg-[var(--viz-amber)]/10 text-[var(--viz-amber)] border border-[var(--viz-amber)]/20 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-[var(--viz-amber)]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Star size={14} fill="currentColor" /> Following
                                </button>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-col w-full gap-3 mt-8 pt-6 border-t border-[var(--border)]">
                        <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                            <Calendar size={14} />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.website && (
                            <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--viz-cyan)] transition-colors">
                                <Globe size={14} />
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="truncate">{user.website}</a>
                            </div>
                        )}
                        {/* Account Health Pill */}
                        {!loadingStats && (
                            <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${isBanned ? 'bg-red-500/5 border-red-500/20 text-red-500' : warnings > 0 ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' : 'bg-green-500/5 border-green-500/20 text-green-500'}`}>
                                {isBanned ? <Ban size={12} /> : <ShieldCheck size={12} />}
                                {isBanned ? "Banned" : warnings > 0 ? "Warning Issued" : "Good Standing"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {user.description && (
                <div className="p-6 rounded-[2rem] bg-[var(--card)]/30 border border-[var(--border)] backdrop-blur-sm">
                    <h3 className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Hash size={12} /> About
                    </h3>
                    <p className="text-sm text-[var(--foreground)]/80 leading-relaxed whitespace-pre-wrap font-light">
                        {user.description}
                    </p>
                </div>
            )}
          </motion.div>

          {/* RIGHT COLUMN: Stats Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Rating Graph */}
            <div className="p-8 rounded-[2.5rem] bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={16} className="text-[var(--viz-cyan)]" fill="currentColor" />
                            <h3 className="text-xs font-black text-[var(--viz-cyan)] uppercase tracking-widest">Rating Trajectory</h3>
                        </div>
                        <div className="text-4xl font-black text-[var(--foreground)] tracking-tight font-mono">{user.rating}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-[var(--muted-foreground)] mb-1">Max Rating</div>
                        <div className="text-xl font-bold text-[var(--foreground)] font-mono">
                            {stats?.ratingHistory?.reduce((max: number, curr: RatingHistory) => Math.max(max, curr.rating), user.rating) || user.rating}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative z-10">
                    {loadingStats ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-[var(--viz-cyan)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (stats?.ratingHistory?.length ?? 0) > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats!.ratingHistory}>
                                <defs>
                                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--viz-cyan)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--viz-cyan)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="var(--muted-foreground)" 
                                    tick={{fontSize: 10, fill: 'var(--muted-foreground)'}} 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis 
                                    stroke="var(--muted-foreground)" 
                                    tick={{fontSize: 10, fill: 'var(--muted-foreground)'}} 
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['dataMin - 100', 'dataMax + 100']}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--card)', 
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--foreground)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: 'var(--viz-cyan)', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'var(--muted-foreground)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rating" 
                                    stroke="var(--viz-cyan)" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#ratingGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                            <TrendingUp size={40} className="mb-4" />
                            <p className="text-sm font-medium">Not enough data points yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Solved Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCapsule 
                    label="Easy" 
                    count={stats?.user?.solvedEasy || 0} 
                    total={50} // Placeholder max
                    color="var(--viz-emerald)" 
                    icon={Target}
                />
                <StatCapsule 
                    label="Medium" 
                    count={stats?.user?.solvedMedium || 0} 
                    total={50} 
                    color="var(--viz-amber)" 
                    icon={Zap}
                />
                <StatCapsule 
                    label="Hard" 
                    count={stats?.user?.solvedHard || 0} 
                    total={50} 
                    color="var(--viz-rose)" 
                    icon={Flame} // Assuming Flame imported, else define
                />
            </div>

            {/* Heatmap */}
            <div className="p-8 rounded-[2.5rem] bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[var(--viz-purple)]" />
                        <h3 className="text-xs font-black text-[var(--viz-purple)] uppercase tracking-widest">Submission Matrix</h3>
                    </div>
                    {hoveredDay && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-mono font-bold text-[var(--foreground)] bg-[var(--background)]/50 px-3 py-1 rounded-full border border-[var(--border)]"
                        >
                            {new Date(hoveredDay.date).toLocaleDateString()} : <span className="text-[var(--viz-purple)]">{hoveredDay.count}</span>
                        </motion.div>
                    )}
                </div>

                <div className="w-full overflow-x-auto pb-2 flex justify-center">
                    {loadingStats ? (
                        <div className="py-12">
                            <div className="w-8 h-8 border-4 border-[var(--viz-purple)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (stats?.calendarData?.length ?? 0) > 0 ? (
                        <ActivityCalendar 
                            data={stats!.calendarData}
                            theme={{
                                light: ['var(--muted)', 'var(--viz-purple)'],
                                dark: ['rgba(255,255,255,0.05)', '#d8b4fe'],
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            colorScheme={(theme === 'dark' ? 'dark' : 'light') as any}
                            blockSize={14}
                            blockMargin={4}
                            fontSize={10}
                            blockRadius={4}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            renderBlock={(block: any, activity: any) => (
                                React.cloneElement(block, {
                                    onMouseEnter: () => setHoveredDay(activity),
                                    onMouseLeave: () => setHoveredDay(null),
                                    style: { 
                                        fill: activity.count > 0 ? `rgba(var(--viz-purple-rgb), ${Math.min(1, 0.3 + (activity.level * 0.15))})` : undefined,
                                        stroke: activity.count > 0 ? `rgba(var(--viz-purple-rgb), 0.5)` : 'transparent',
                                        strokeWidth: 1
                                    }
                                })
                            )}
                        />
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                            <Calendar size={32} className="mb-2" />
                            <p className="text-xs">No activity recorded.</p>
                        </div>
                    )}
                </div>
            </div>

          </motion.div>
        </div>
      </div>
      
      {activeModal && (
        <FollowsModal 
            userId={user.id} 
            type={activeModal} 
            onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
}

function StatCapsule({ label, count, total, color, icon: Icon }: { label: string, count: number, total: number, color: string, icon: React.ElementType }) {
    return (
        <Link href={`/problems?difficulty=${label}`} className="group relative p-6 rounded-[2rem] bg-[var(--card)]/50 backdrop-blur-md border border-[var(--border)] hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--background)]/50 group-hover:to-transparent rounded-[2rem] transition-all" />
            <div className="relative flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] group-hover:border-[color:var(--c)] transition-colors" style={{ '--c': color } as React.CSSProperties}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div className="text-2xl font-black font-mono text-[var(--foreground)]">{count}</div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                    <span>{label}</span>
                    <span style={{ color }}>{Math.min(100, Math.round((count / Math.max(count + 10, total)) * 100))}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, (count / Math.max(count + 10, total)) * 100)}%` }}
                        className="h-full rounded-full shadow-[0_0_10px_currentColor]"
                        style={{ backgroundColor: color, color }}
                    />
                </div>
            </div>
        </Link>
    );
}

// Helper icons
function Flame(props: React.SVGProps<SVGSVGElement>) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.243-2.143.5-3.5a6 6 0 0 1 3 3.5z"/></svg>;
}
