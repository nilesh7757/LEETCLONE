"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, Mail, LogOut, Globe, Camera, Save, Loader2, 
  TrendingUp, Calendar, ShieldCheck, AlertTriangle, Ban, 
  CheckCircle, Award, X, Sparkles, Zap, Hash, Target, PenTool 
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

import Image from "next/image";

const ActivityCalendar = dynamic<any>(() => import("react-activity-calendar").then(mod => (mod as any).ActivityCalendar || (mod as any).default), { ssr: false });

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
  rating: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
}

interface PerformanceStats {
  user: UserStats;
  ratingHistory: RatingHistory[];
  calendarData: CalendarData[];
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  website?: string | null;
  description?: string | null;
  skills?: string[];
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Stats Data
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<CalendarData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    description: "",
    image: "",
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (session?.user) {
      const user = session.user as SessionUser;
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        website: user.website || "",
        description: user.description || "",
        image: user.image || "",
        skills: user.skills || [],
      });
      fetchStats(user.id);
    }
  }, [session]);

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (formData.skills.includes(skillInput.trim())) {
      setSkillInput("");
      return;
    }
    setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const fetchStats = async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/users/${userId}/performance`);
      setStats(data);
    } catch (error) {
      console.error("Failed to load performance stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put("/api/profile/update", formData);
      await update(formData); // Update local session
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to update profile");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Error uploading image");
      } else {
        toast.error("Error uploading image");
      }
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-cyan)]" />
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const warnings = stats?.user?.warnings || 0;
  const isBanned = stats?.user?.isBanned || false;
  
  // Rank Logic
  const rating = stats?.user?.rating || 1500;
  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (rating >= 2400) { rankColor = "var(--viz-rose)"; rankTitle = "Grandmaster"; }
  else if (rating >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (rating >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (rating >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  return (
    <div className="min-h-screen w-full relative pb-20 overflow-x-hidden pt-8">
      {/* Deep Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[var(--background)]">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[var(--viz-cyan)]/5 rounded-full blur-[150px] opacity-40" />
         <div className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-[var(--viz-purple)]/5 rounded-full blur-[150px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Identity Editor */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="lg:col-span-5 xl:col-span-4 space-y-6"
          >
            {/* Identity Card */}
            <div className="relative p-8 rounded-[2.5rem] bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] overflow-hidden shadow-2xl">
                {/* Top Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--viz-cyan)]/10 to-transparent opacity-50" />
                
                <div className="relative flex flex-col items-center">
                    {/* Avatar Uploader */}
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--viz-cyan)] to-[var(--viz-purple)] opacity-20 blur-xl animate-pulse" />
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[var(--viz-cyan)] to-[var(--viz-purple)] relative z-10 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--card)] bg-[var(--card)] relative">
                                {formData.image ? (
                                    <Image 
                                        src={formData.image} 
                                        alt="Profile" 
                                        fill
                                        className="object-cover transition-opacity group-hover:opacity-50" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)] group-hover:opacity-50 transition-opacity">
                                        <UserCircle className="w-16 h-16 text-[var(--muted-foreground)]" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-[var(--foreground)]" />
                                </div>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        
                        {/* Rank Badge */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center gap-2 whitespace-nowrap z-20">
                            <Award size={14} style={{ color: rankColor }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankTitle}</span>
                        </div>
                    </div>

                    {/* Email Display */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--background)]/50 border border-[var(--border)] mb-6">
                        <Mail size={12} className="text-[var(--muted-foreground)]" />
                        <span className="text-xs font-mono text-[var(--muted-foreground)]">{session?.user?.email}</span>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleUpdate} className="w-full space-y-5">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1 block group-focus-within:text-[var(--viz-cyan)] transition-colors">Identity</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-[var(--foreground)] font-bold focus:border-[var(--viz-cyan)] focus:outline-none transition-colors placeholder:text-[var(--muted-foreground)]/30"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1 block group-focus-within:text-[var(--viz-cyan)] transition-colors">Headline</label>
                                <input
                                    type="text"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-[var(--foreground)] font-medium focus:border-[var(--viz-cyan)] focus:outline-none transition-colors placeholder:text-[var(--muted-foreground)]/30"
                                    placeholder="Software Engineer..."
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1 block group-focus-within:text-[var(--viz-cyan)] transition-colors">Neural Link</label>
                                <div className="flex items-center gap-2 border-b border-[var(--border)] py-2 focus-within:border-[var(--viz-cyan)] transition-colors">
                                    <Globe size={14} className="text-[var(--muted-foreground)]" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full bg-transparent text-[var(--foreground)] font-mono text-sm focus:outline-none placeholder:text-[var(--muted-foreground)]/30"
                                        placeholder="https://your-portfolio.io"
                                    />
                                </div>
                            </div>
                            <div className="group pt-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2 block group-focus-within:text-[var(--viz-cyan)] transition-colors">About</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-2xl bg-[var(--background)]/30 border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--viz-cyan)] focus:outline-none resize-none transition-all"
                                    placeholder="Tell us about your coding journey..."
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 block">Skill Matrix</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <AnimatePresence>
                                    {formData.skills.map((skill) => (
                                        <motion.span 
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] rounded-lg text-xs font-bold border border-[var(--viz-cyan)]/20"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Add skill..."
                                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--background)]/30 border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--viz-cyan)] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--viz-cyan)] text-[var(--viz-cyan)] rounded-xl transition-all"
                                >
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-[var(--background)] bg-[var(--foreground)] rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--foreground-rgb),0.2)]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Configuration
                            </button>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          </motion.div>

          {/* RIGHT PANEL: Stats Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="lg:col-span-7 xl:col-span-8 space-y-6"
          >
            {/* Rating Graph */}
            <div className="p-8 rounded-[2.5rem] bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={16} className="text-[var(--viz-cyan)]" fill="currentColor" />
                            <h3 className="text-xs font-black text-[var(--viz-cyan)] uppercase tracking-widest">Rating Trajectory</h3>
                        </div>
                        <div className="text-4xl font-black text-[var(--foreground)] tracking-tight font-mono">{rating}</div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative z-10">
                    {loadingStats ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-cyan)]" />
                        </div>
                    ) : stats?.ratingHistory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.ratingHistory}>
                                <defs>
                                    <linearGradient id="ratingGradientProfile" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#ratingGradientProfile)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                            <TrendingUp size={40} className="mb-4" />
                            <p className="text-sm font-medium">No contest data available.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Solved Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--viz-emerald)]/10 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-xl bg-[var(--viz-emerald)]/10 text-[var(--viz-emerald)]">
                                <CheckCircle size={18} />
                            </div>
                            <span className="text-2xl font-black font-mono text-[var(--foreground)]">{stats?.user?.solvedEasy || 0}</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[var(--viz-emerald)]">Easy Solved</div>
                    </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--viz-amber)]/10 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-xl bg-[var(--viz-amber)]/10 text-[var(--viz-amber)]">
                                <Target size={18} />
                            </div>
                            <span className="text-2xl font-black font-mono text-[var(--foreground)]">{stats?.user?.solvedMedium || 0}</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[var(--viz-amber)]">Medium Solved</div>
                    </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--viz-rose)]/10 to-transparent opacity-50" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-xl bg-[var(--viz-rose)]/10 text-[var(--viz-rose)]">
                                <Award size={18} />
                            </div>
                            <span className="text-2xl font-black font-mono text-[var(--foreground)]">{stats?.user?.solvedHard || 0}</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[var(--viz-rose)]">Hard Solved</div>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="p-8 rounded-[2.5rem] bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[var(--viz-purple)]" />
                        <h3 className="text-xs font-black text-[var(--viz-purple)] uppercase tracking-widest">Neural Activity</h3>
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
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-purple)]" />
                        </div>
                    ) : stats?.calendarData?.length > 0 ? (
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                light: ['var(--muted)', 'var(--viz-purple)'],
                                dark: ['rgba(255,255,255,0.05)', '#d8b4fe'],
                            }}
                            colorScheme={theme === 'dark' ? 'dark' : 'light'}
                            blockSize={14}
                            blockMargin={4}
                            fontSize={10}
                            blockRadius={4}
                            renderBlock={(block: React.ReactElement, activity: CalendarData) => (
                                React.cloneElement(block, {
                                    onMouseEnter: () => setHoveredDay(activity),
                                    onMouseLeave: () => setHoveredDay(null),
                                    style: { 
                                        fill: activity.count > 0 ? `rgba(var(--viz-purple-rgb), ${Math.min(1, 0.3 + (activity.level * 0.15))})` : undefined,
                                        stroke: activity.count > 0 ? `rgba(var(--viz-purple-rgb), 0.5)` : 'transparent',
                                        strokeWidth: 1
                                    }
                                } as any)
                            )}
                        />
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                            <Calendar size={32} className="mb-2" />
                            <p className="text-xs">No transmission data recorded.</p>
                        </div>
                    )}
                </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}