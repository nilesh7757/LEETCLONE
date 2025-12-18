"use client";

import { motion } from "framer-motion";
import { UserCircle, Globe, Calendar, TrendingUp, Mail, ShieldCheck, AlertTriangle, Ban, Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FollowsModal from "@/components/Profile/FollowsModal";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

const ActivityCalendar = dynamic<any>(() => import("react-activity-calendar").then(mod => (mod as any).ActivityCalendar || (mod as any).default), { ssr: false });

let socket: Socket;

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
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
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
      try {
        const { data } = await axios.get(`/api/users/${user.id}/stats`);
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user.id]);

  useEffect(() => {
    if (session?.user && user.id !== session.user.id) {
        checkFriendStatus();
    } else if (session?.user?.id === user.id) {
        setFriendStatus("SELF");
    }
  }, [session, user.id]);

  const checkFriendStatus = async () => {
    try {
        const { data } = await axios.get(`/api/friends/status/${user.id}`);
        setFriendStatus(data.status);
    } catch (error) {
        console.error("Check status failed", error);
    }
  };

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
  const health = isBanned ? 0 : Math.max(0, 100 - (warnings * 33));

  let healthColor = "bg-green-500";
  let healthText = "Good Standing";
  let HealthIcon = ShieldCheck;

  if (isBanned) {
      healthColor = "bg-red-500";
      healthText = "Account Banned";
      HealthIcon = Ban;
  } else if (warnings === 1) {
      healthColor = "bg-yellow-500";
      healthText = "Warning Issued";
      HealthIcon = AlertTriangle;
  } else if (warnings >= 2) {
      healthColor = "bg-orange-500";
      healthText = "At Risk";
      HealthIcon = AlertTriangle;
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 xl:col-span-4 p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md h-fit"
        >
            <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--card-border)] bg-[var(--card-bg)] shadow-inner">
                    {user.image ? (
                    <img
                        src={user.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserCircle className="w-16 h-16 text-[var(--foreground)]/40" />
                    </div>
                    )}
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">{user.name || "Anonymous"}</h1>
                    {user.bio && <p className="text-[var(--foreground)]/60 mt-1">{user.bio}</p>}
                </div>

                <div className="flex justify-center gap-8 w-full py-4 border-y border-[var(--card-border)] my-6">
                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveModal("followers")}>
                        <div className="text-xl font-bold text-[var(--foreground)]">{stats?.user?.followersCount || 0}</div>
                        <div className="text-xs text-[var(--foreground)]/60 uppercase tracking-wide font-medium">Followers</div>
                    </div>
                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveModal("following")}>
                        <div className="text-xl font-bold text-[var(--foreground)]">{stats?.user?.followingCount || 0}</div>
                        <div className="text-xs text-[var(--foreground)]/60 uppercase tracking-wide font-medium">Following</div>
                    </div>
                </div>

                {/* Actions */}
                {friendStatus !== "SELF" && (
                    <div className="w-full grid grid-cols-2 gap-3">
                        <button
                            onClick={handleMessage}
                            className="py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Message
                        </button>
                        
                        {friendStatus === "NONE" ? (
                            <button
                                onClick={handleFollow}
                                className="py-2 px-4 bg-[var(--background)] border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--foreground)]/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <Star className="w-4 h-4" /> Follow
                            </button>
                        ) : (
                            <button
                                onClick={handleUnfollow}
                                className="py-2 px-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg font-medium hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Star className="w-4 h-4 fill-current" /> Following
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                 {/* Account Health Section - Visible publicly? Maybe purely stats based. Let's show it. */}
                {!loadingStats && (
                    <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <HealthIcon className={`w-5 h-5 ${isBanned ? 'text-red-500' : warnings > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                                <span className="font-semibold text-sm text-[var(--foreground)]">Account Health</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBanned ? 'bg-red-500/10 text-red-500' : warnings > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                                {healthText}
                            </span>
                        </div>
                        <div className="w-full bg-[var(--foreground)]/10 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${healthColor}`} 
                                style={{ width: `${health}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {user.website && (
                    <div className="flex items-center gap-3 text-[var(--foreground)]/80">
                        <Globe className="w-5 h-5 text-[var(--foreground)]/40" />
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-gradient-to)] transition-colors truncate">
                            {user.website}
                        </a>
                    </div>
                )}
                
                <div className="flex items-center gap-3 text-[var(--foreground)]/80">
                    <Calendar className="w-5 h-5 text-[var(--foreground)]/40" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US')}</span>
                </div>

                {user.description && (
                    <div className="pt-6 border-t border-[var(--card-border)]">
                        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">About</h3>
                        <p className="text-[var(--foreground)]/70 text-sm leading-relaxed whitespace-pre-wrap">
                            {user.description}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Right Panel: Stats & Graphs */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 xl:col-span-8 space-y-8"
        >
            {/* Rating Graph Card */}
            <div className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Contest Rating</h3>
                        <p className="text-sm text-[var(--foreground)]/60">Current Rating: <span className="font-mono font-bold text-[var(--accent-gradient-to)]">{user.rating}</span></p>
                    </div>
                </div>
                
                <div className="h-[300px] w-full">
                    {loadingStats ? (
                        <div className="h-full flex items-center justify-center text-[var(--foreground)]/40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : stats?.ratingHistory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.ratingHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.5} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="var(--foreground)" 
                                    opacity={0.5} 
                                    tick={{fontSize: 12}} 
                                    tickMargin={10}
                                />
                                <YAxis 
                                    stroke="var(--foreground)" 
                                    opacity={0.5} 
                                    tick={{fontSize: 12}}
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--card-bg)', 
                                        borderColor: 'var(--card-border)',
                                        borderRadius: '8px',
                                        color: 'var(--foreground)'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    labelStyle={{ color: 'var(--foreground)', marginBottom: '5px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="rating" 
                                    stroke="var(--foreground)" 
                                    strokeWidth={2} 
                                    dot={{ r: 4, fill: 'var(--card-bg)', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-[var(--foreground)]/40 border-2 border-dashed border-[var(--card-border)] rounded-xl">
                            <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                            <p>No contest history yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Solved Problems Breakdown Card */}
            <div className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)]">Solved Problems</h3>
                            <p className="text-sm text-[var(--foreground)]/60">Total Solved: <span className="font-mono font-bold text-[var(--foreground)]">{stats?.user?.solvedCount || 0}</span></p>
                        </div>
                    </div>
                    <Link 
                        href="/problems" 
                        className="text-sm text-blue-500 hover:underline font-medium"
                    >
                        View all problems
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DifficultyProgress 
                        label="Easy" 
                        count={stats?.user?.solvedEasy || 0} 
                        color="bg-green-500" 
                        difficulty="Easy"
                    />
                    <DifficultyProgress 
                        label="Medium" 
                        count={stats?.user?.solvedMedium || 0} 
                        color="bg-yellow-500" 
                        difficulty="Medium"
                    />
                    <DifficultyProgress 
                        label="Hard" 
                        count={stats?.user?.solvedHard || 0} 
                        color="bg-red-500" 
                        difficulty="Hard"
                    />
                </div>
            </div>

            {/* Contribution Calendar Card */}
            <div className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Submission Heatmap</h3>
                        <p className="text-sm text-[var(--foreground)]/60">Coding activity over the last year</p>
                    </div>
                </div>

                <div className="flex justify-center overflow-x-auto pb-2">
                    {loadingStats ? (
                         <div className="py-12 flex items-center justify-center text-[var(--foreground)]/40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : stats?.calendarData?.length > 0 ? (
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                            }}
                            colorScheme={theme === 'dark' ? 'dark' : 'light'}
                            blockSize={12}
                            blockMargin={4}
                            fontSize={12}
                            style={{ color: 'var(--foreground)' }}
                        />
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--foreground)]/40 border-2 border-dashed border-[var(--card-border)] rounded-xl">
                            <Calendar className="w-10 h-10 mb-2 opacity-50" />
                            <p>No activity yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
      </div>
      
      {activeModal && (
        <FollowsModal 
            userId={user.id} 
            type={activeModal} 
            onClose={() => setActiveModal(null)} 
        />
      )}
    </main>
      );
  }
  
  function DifficultyProgress({ label, count, color, difficulty }: { label: string, count: number, color: string, difficulty: string }) {
      // We don't have the max count easily here, let's assume a reasonable max for visual or just show the count
      // A better way would be to show progress relative to total problems in DB, but for now just showing count is good.
      return (
          <Link href={`/problems?difficulty=${difficulty}`} className="block group">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]/60 group-hover:text-[var(--foreground)] transition-colors">{label}</span>
                  <span className="text-lg font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{count}</span>
              </div>
              <div className="w-full h-2 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / 50) * 100)}%` }} // Arbitrary 50 for visualization
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
                  />
              </div>
          </Link>
      );
  }
  
  function Loader2({ className }: { className?: string }) {    return (
      <svg
        className={`animate-spin ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
}
