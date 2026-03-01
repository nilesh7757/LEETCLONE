/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, LogOut, Camera, Save, Loader2, 
  TrendingUp, Calendar, 
  Award, X, Sparkles, Zap,
  Terminal, Ghost, Shield
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import SkillRadar from "@/features/profile/components/HeroProfile/SkillRadar";

import Image from "next/image";

const ActivityCalendar = dynamic(() => import("react-activity-calendar").then(mod => {
  return mod.ActivityCalendar;
}), { ssr: false });

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
  rating: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    description: "",
    image: "",
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  const fetchStats = useCallback(async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/users/${userId}/performance`);
      setStats(data);
    } catch (error) {
      console.error("Failed to load performance stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

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
  }, [session, fetchStats]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/profile/update", formData);
      await update(formData);
      toast.success("Identity updated successfully");
    } catch (error) {
      toast.error("Failed to sync identity");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await axios.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success("Visual signature uploaded");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--viz-cyan)]" />
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const ratingValue = stats?.user?.rating || 1500;
  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (ratingValue >= 2400) { rankColor = "var(--viz-red)"; rankTitle = "Grandmaster"; }
  else if (ratingValue >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (ratingValue >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (ratingValue >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  const isMatrix = theme === "matrix";
  const isDracula = theme === "dracula";
  const isGOT = theme === "got";

  return (
    <div className={`min-h-screen w-full relative pb-20 overflow-x-hidden pt-8 transition-colors duration-500 ${isMatrix ? 'bg-black' : ''}`}>
      <AnimatePresence>
        {isMatrix && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        )}
        {isDracula && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} exit={{ opacity: 0 }} className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#ff0000_0%,_transparent_70%)]" />
        )}
        {isGOT && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_#38bdf8_0%,_transparent_50%)]" />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4 space-y-6"
          >
            <div className={`p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-2xl relative overflow-hidden`}>
                <div className="flex flex-col items-center">
                    <div className="relative mb-8 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse opacity-20 ${isMatrix ? 'bg-[#00ff41]' : isDracula ? 'bg-red-600' : isGOT ? 'bg-sky-400' : 'bg-cyan-400'}`} />
                        <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr relative z-10 ${isMatrix ? 'from-[#00ff41] to-black' : isDracula ? 'from-red-600 to-black' : isGOT ? 'from-sky-400 to-white' : 'from-cyan-400 to-purple-500'}`}>
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--background)] bg-[var(--card)] relative">
                                {formData.image ? (
                                    <Image src={formData.image} alt="Profile" fill className="object-cover group-hover:opacity-50 transition-all" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]"><UserCircle className="w-16 h-16 text-[var(--muted-foreground)]" /></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"><Camera className="w-8 h-8 text-white" /></div>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center gap-2 whitespace-nowrap z-20">
                            <Award size={14} style={{ color: rankColor }} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankTitle}</span>
                        </div>
                    </div>

                    <div className={`mb-8 flex items-center gap-3 ${isMatrix ? 'text-[#00ff41] font-mono' : isGOT ? 'font-serif' : ''}`}>
                        <h2 className="text-3xl font-black tracking-tighter">{formData.name || "UNIDENTIFIED_USER"}</h2>
                        {isMatrix && <Terminal size={20} />}
                        {isDracula && <Ghost size={20} className="text-red-600" />}
                        {isGOT && <Shield size={20} className="text-sky-400" />}
                    </div>

                    <form onSubmit={handleUpdate} className="w-full space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1 block">Identity_Alias</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-[var(--border)] py-2 text-[var(--foreground)] font-bold focus:border-[var(--primary)] outline-none transition-all" />
                            </div>
                            <div className="group">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1 block">Neural_Bio</label>
                                <input type="text" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-transparent border-b border-[var(--border)] py-2 text-[var(--foreground)] focus:border-[var(--primary)] outline-none transition-all" />
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 block">Matrix_Skills</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.skills.map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-xs font-bold border border-[var(--primary)]/20">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1 px-4 py-2 rounded-xl bg-[var(--background)]/50 border border-[var(--border)] text-sm outline-none focus:border-[var(--primary)]" placeholder="Inject Skill..." />
                                <button type="button" onClick={addSkill} className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--primary)] hover:border-[var(--primary)]"><Sparkles size={16} /></button>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="submit" disabled={loading} className="flex-1 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Commit Identity
                            </button>
                            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8 space-y-6"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Zap size={14} className="text-[var(--primary)]" fill="currentColor" /> Algorithm Radar
                    </h3>
                    <SkillRadar stats={stats?.user?.categoryStats || {}} theme={theme} />
                </div>
                
                <div className="space-y-6">
                    <StatCapsuleSmall label="Easy" count={stats?.user?.solvedEasy || 0} color={isMatrix ? "#00ff41" : "#10b981"} />
                    <StatCapsuleSmall label="Medium" count={stats?.user?.solvedMedium || 0} color={isMatrix ? "#00ff41" : "#f59e0b"} />
                    <StatCapsuleSmall label="Hard" count={stats?.user?.solvedHard || 0} color={isMatrix ? "#00ff41" : "#ef4444"} />
                </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Skill Trajectory</h3>
                        <div className="text-5xl font-black font-mono tracking-tighter">{ratingValue}</div>
                    </div>
                    <div className={`p-4 rounded-2xl ${isMatrix ? 'bg-[#00ff41]/10 text-[#00ff41]' : 'bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]'}`}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    {!loadingStats && stats && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.ratingHistory}>
                                <defs>
                                    <linearGradient id="ratingP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isMatrix ? "#00ff41" : isDracula ? "#ff0000" : "var(--viz-cyan)"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isMatrix ? "#00ff41" : isDracula ? "#ff0000" : "var(--viz-cyan)"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }} />
                                <Area type="monotone" dataKey="rating" stroke={isMatrix ? "#00ff41" : isDracula ? "#ff0000" : "var(--viz-cyan)"} strokeWidth={4} fill="url(#ratingP)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-8 flex items-center gap-2">
                    <Calendar size={14} /> Synaptic Transmission Log
                </h3>
                <div className="flex justify-center overflow-x-auto pb-4">
                    {!loadingStats && stats?.calendarData && (
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                dark: ['rgba(255,255,255,0.05)', isMatrix ? '#00ff41' : isDracula ? '#ff0000' : '#38bdf8'],
                                light: ['#f1f5f9', isMatrix ? '#00ff41' : '#0ea5e9']
                            }}
                            colorScheme={(theme === 'dark' || isMatrix || isDracula || isGOT ? 'dark' : 'light') as any}
                            blockSize={14}
                            blockMargin={5}
                            blockRadius={4}
                        />
                    )}
                </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCapsuleSmall({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="p-6 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:border-opacity-100 transition-all shadow-lg flex justify-between items-center">
            <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1">{label}</div>
                <div className="text-3xl font-black font-mono">{count}</div>
            </div>
            <div className="w-24 h-2 bg-[var(--background)] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '60%' }} className="h-full rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
        </div>
    );
}
