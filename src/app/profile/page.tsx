/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, LogOut, Camera, Save, Loader2, 
  TrendingUp, Calendar, 
  Award, X, Sparkles, Zap, Rocket,
  Github, CheckCircle2, AlertCircle
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
  arcadePoints?: number;
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  codeforcesUsername?: string | null;
  codechefUsername?: string | null;
  atcoderUsername?: string | null;
  devPowerLevel?: number;
  aiProfileFeedback?: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Local overrides for immediate UI update after sync
  const [localOmniData, setLocalOmniData] = useState<{
    powerLevel?: number;
    advice?: string;
    description?: string;
    externalStats?: any;
    githubUsername?: string;
    leetcodeUsername?: string;
    codeforcesUsername?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    description: "",
    image: "",
    skills: [] as string[],
    githubUsername: "",
    leetcodeUsername: "",
    codeforcesUsername: "",
    codechefUsername: "",
    atcoderUsername: "",
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
        githubUsername: user.githubUsername || "",
        leetcodeUsername: user.leetcodeUsername || "",
        codeforcesUsername: user.codeforcesUsername || "",
        codechefUsername: user.codechefUsername || "",
        atcoderUsername: user.atcoderUsername || "",
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

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // 1. Save general profile
      await axios.put("/api/profile/update", formData);
      
      // 2. Save usernames
      await axios.put("/api/profile/update-omni-usernames", {
        githubUsername: formData.githubUsername,
        leetcodeUsername: formData.leetcodeUsername,
        codeforcesUsername: formData.codeforcesUsername,
        codechefUsername: formData.codechefUsername,
        atcoderUsername: formData.atcoderUsername,
      });

      // 3. Force update session
      await update({
        ...session?.user,
        ...formData
      });

      toast.success("Identity updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to sync identity");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOmni = async () => {
    // PRE-SYNC: Automatically save the current usernames
    setSyncing(true);
    const saveSuccess = await handleUpdate();
    if (!saveSuccess) {
        setSyncing(false);
        return;
    }

    try {
      const { data } = await axios.post("/api/profile/sync-omni");
      
      // Update local state for immediate feedback
      setLocalOmniData({
        powerLevel: data.powerLevel,
        advice: data.advice,
        description: data.title,
        externalStats: data.externalStats,
        githubUsername: formData.githubUsername,
        leetcodeUsername: formData.leetcodeUsername,
        codeforcesUsername: formData.codeforcesUsername
      });

      // Refresh session one more time with full synced data
      await update({
          ...session?.user,
          devPowerLevel: data.powerLevel,
          aiProfileFeedback: data.advice,
          description: data.title,
          externalStats: data.externalStats
      });

      toast.success("Neural Synchronization Complete", {
        description: `New Power Level: ${data.powerLevel}`
      });
    } catch (error) {
      toast.error("Synchronization Failed");
    } finally {
      setSyncing(false);
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
  const arcadePoints = (session?.user as SessionUser)?.arcadePoints || 0;
  
  // Logic for display: Prefer local synced data, then session data, then default 0
  const powerLevel = localOmniData?.powerLevel ?? (session?.user as SessionUser)?.devPowerLevel ?? 0;
  const aiFeedback = localOmniData?.advice ?? (session?.user as SessionUser)?.aiProfileFeedback;
  const devTitle = localOmniData?.description ?? (session?.user as any)?.description;
  const externalStats = localOmniData?.externalStats ?? (session?.user as any)?.externalStats;

  const isPlatformConnected = (platform: 'github' | 'leetcode' | 'codeforces' | 'codechef' | 'atcoder') => {
    const user = session?.user as any;
    if (platform === 'github') return !!(localOmniData?.githubUsername || user?.githubUsername);
    if (platform === 'leetcode') return !!(localOmniData?.leetcodeUsername || user?.leetcodeUsername);
    if (platform === 'codeforces') return !!(localOmniData?.codeforcesUsername || user?.codeforcesUsername);
    if (platform === 'codechef') return !!(formData.codechefUsername || user?.codechefUsername);
    if (platform === 'atcoder') return !!(formData.atcoderUsername || user?.atcoderUsername);
    return false;
  };

  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (ratingValue >= 2400) { rankColor = "var(--viz-red)"; rankTitle = "Grandmaster"; }
  else if (ratingValue >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (ratingValue >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (ratingValue >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  return (
    <div className={`min-h-screen w-full relative pb-20 overflow-x-hidden pt-8 transition-colors duration-500`}>
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
                        <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse opacity-20 bg-cyan-400`} />
                        <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr relative z-10 from-cyan-400 to-purple-500`}>
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

                    <div className={`mb-8 flex items-center gap-3`}>
                        <h2 className="text-3xl font-black tracking-tighter">{formData.name || "UNIDENTIFIED_USER"}</h2>
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

                    <div className="w-full mt-6 pt-6 border-t border-[var(--border)]">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 block">Arcade_Stats</label>
                        <div className="flex items-center gap-3 p-4 bg-[var(--viz-amber)]/10 text-[var(--viz-amber)] rounded-2xl border border-[var(--viz-amber)]/20">
                            <Zap className="w-5 h-5 fill-current" />
                            <div className="text-left">
                                <div className="text-xs font-bold">Arcade Points</div>
                                <div className="text-[10px] opacity-70">{arcadePoints} AP Collected</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full mt-6 pt-6 border-t border-[var(--border)]">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 block">Neural_Omni_Sync</label>
                        <div className="space-y-4">
                            {/* GITHUB */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-[#52525b] uppercase tracking-tighter">GitHub_Node</span>
                                    {isPlatformConnected('github') && <CheckCircle2 size={10} className="text-emerald-500" />}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border transition-all ${isPlatformConnected('github') ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[var(--border)]'}`}>
                                    <Github size={12} className={isPlatformConnected('github') ? 'text-emerald-500' : 'text-[#52525b]'} />
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.githubUsername} 
                                        onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
                                        className="bg-transparent border-none outline-none text-xs w-full font-mono"
                                    />
                                </div>
                                {isPlatformConnected('github') && (externalStats?.github || localOmniData?.externalStats?.github) && (
                                    <div className="px-3 text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest flex gap-3">
                                        <span>Repos: {(localOmniData?.externalStats?.github || externalStats?.github).publicRepos}</span>
                                        <span>Followers: {(localOmniData?.externalStats?.github || externalStats?.github).followers}</span>
                                    </div>
                                )}
                            </div>

                            {/* LEETCODE */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-[#52525b] uppercase tracking-tighter">LeetCode_Node</span>
                                    {isPlatformConnected('leetcode') && <CheckCircle2 size={10} className="text-emerald-500" />}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border transition-all ${isPlatformConnected('leetcode') ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[var(--border)]'}`}>
                                    <Zap size={12} className={isPlatformConnected('leetcode') ? 'text-amber-500' : 'text-[#52525b]'} />
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.leetcodeUsername} 
                                        onChange={(e) => setFormData({...formData, leetcodeUsername: e.target.value})}
                                        className="bg-transparent border-none outline-none text-xs w-full font-mono"
                                    />
                                </div>
                                {isPlatformConnected('leetcode') && (externalStats?.leetcode || localOmniData?.externalStats?.leetcode) && (
                                    <div className="px-3 text-[9px] font-bold text-amber-500/60 uppercase tracking-widest flex gap-3">
                                        <span>Solved: {(localOmniData?.externalStats?.leetcode || externalStats?.leetcode).totalSolved}</span>
                                    </div>
                                )}
                            </div>

                            {/* CODEFORCES */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-[#52525b] uppercase tracking-tighter">Codeforces_Node</span>
                                    {isPlatformConnected('codeforces') && <CheckCircle2 size={10} className="text-emerald-500" />}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border transition-all ${isPlatformConnected('codeforces') ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[var(--border)]'}`}>
                                    <Award size={12} className={isPlatformConnected('codeforces') ? 'text-blue-500' : 'text-[#52525b]'} />
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.codeforcesUsername} 
                                        onChange={(e) => setFormData({...formData, codeforcesUsername: e.target.value})}
                                        className="bg-transparent border-none outline-none text-xs w-full font-mono"
                                    />
                                </div>
                                {isPlatformConnected('codeforces') && (externalStats?.codeforces || localOmniData?.externalStats?.codeforces) && (
                                    <div className="px-3 text-[9px] font-bold text-blue-500/60 uppercase tracking-widest flex gap-3">
                                        <span>Rating: {(localOmniData?.externalStats?.codeforces || externalStats?.codeforces).rating}</span>
                                    </div>
                                )}
                            </div>

                            {/* CODECHEF */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-[#52525b] uppercase tracking-tighter">CodeChef_Node</span>
                                    {isPlatformConnected('codechef') && <CheckCircle2 size={10} className="text-emerald-500" />}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border transition-all ${isPlatformConnected('codechef') ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[var(--border)]'}`}>
                                    <div className="w-3 h-3 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-600 font-bold text-[8px]">C</div>
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.codechefUsername} 
                                        onChange={(e) => setFormData({...formData, codechefUsername: e.target.value})}
                                        className="bg-transparent border-none outline-none text-xs w-full font-mono"
                                    />
                                </div>
                                {isPlatformConnected('codechef') && (externalStats?.codechef || localOmniData?.externalStats?.codechef) && (
                                    <div className="px-3 text-[9px] font-bold text-amber-600/60 uppercase tracking-widest flex gap-3">
                                        <span>Rating: {(localOmniData?.externalStats?.codechef || externalStats?.codechef).rating}</span>
                                    </div>
                                )}
                            </div>

                            {/* ATCODER */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-[#52525b] uppercase tracking-tighter">Atcoder_Node</span>
                                    {isPlatformConnected('atcoder') && <CheckCircle2 size={10} className="text-emerald-500" />}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border transition-all ${isPlatformConnected('atcoder') ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[var(--border)]'}`}>
                                    <div className="w-3 h-3 rounded-full bg-slate-400/20 flex items-center justify-center text-slate-400 font-bold text-[8px]">A</div>
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={formData.atcoderUsername} 
                                        onChange={(e) => setFormData({...formData, atcoderUsername: e.target.value})}
                                        className="bg-transparent border-none outline-none text-xs w-full font-mono"
                                    />
                                </div>
                                {isPlatformConnected('atcoder') && (externalStats?.atcoder || localOmniData?.externalStats?.atcoder) && (
                                    <div className="px-3 text-[9px] font-bold text-slate-400/60 uppercase tracking-widest flex gap-3">
                                        <span>Rating: {(localOmniData?.externalStats?.atcoder || externalStats?.atcoder).rating}</span>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSyncOmni}
                                disabled={syncing}
                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                                    syncing ? 'bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] border-[var(--viz-cyan)]/20' : 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95'
                                }`}
                            >
                                {syncing ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />} 
                                {syncing ? "SYNCING_NEURAL_STREAMS..." : "SYNC_ALL_PLATFORMS"}
                            </button>
                            
                            {!isPlatformConnected('github') && !isPlatformConnected('leetcode') && !isPlatformConnected('codeforces') && (
                                <p className="text-[9px] text-amber-500/50 flex items-center gap-1.5 px-1 font-bold uppercase italic tracking-tighter">
                                    <AlertCircle size={10} /> Link accounts & save changes first
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Rocket size={80} className="text-blue-400" />
                    </div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Dev Power Level</h3>
                    <motion.div 
                        key={powerLevel}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-7xl font-black tracking-tighter mb-4"
                    >
                        {powerLevel}
                    </motion.div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            {devTitle || "UNRANKED_CANDIDATE"}
                        </div>
                        {externalStats?.consistency && (
                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                externalStats.consistency.status === 'ELITE_MOMENTUM' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                externalStats.consistency.status === 'STEADY' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                externalStats.consistency.status === 'INCONSISTENT' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
                            }`}>
                                <Zap size={10} fill="currentColor" />
                                {externalStats.consistency.status.replace('_', ' ')}: {externalStats.consistency.recentSolved7Days} SOLVED (7D)
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" /> Neural Coach Assessment
                    </h3>
                    <AnimatePresence mode="wait">
                        <motion.p 
                            key={aiFeedback}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm font-medium leading-relaxed italic text-[var(--foreground)]/80"
                        >
                            {aiFeedback || "Awaiting neural synchronization to provide placement intelligence..."}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Zap size={14} className="text-[var(--primary)]" fill="currentColor" /> Algorithm Radar
                    </h3>
                    <SkillRadar stats={stats?.user?.categoryStats || {}} theme={theme} />
                </div>
                
                <div className="space-y-6">
                    <StatCapsuleSmall label="Easy" count={stats?.user?.solvedEasy || 0} color="#10b981" />
                    <StatCapsuleSmall label="Medium" count={stats?.user?.solvedMedium || 0} color="#f59e0b" />
                    <StatCapsuleSmall label="Hard" count={stats?.user?.solvedHard || 0} color="#ef4444" />
                </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Skill Trajectory</h3>
                        <div className="text-5xl font-black font-mono tracking-tighter">{ratingValue}</div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]`}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    {!loadingStats && stats && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.ratingHistory}>
                                <defs>
                                    <linearGradient id="ratingP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--viz-cyan)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--viz-cyan)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }} />
                                <Area type="monotone" dataKey="rating" stroke="var(--viz-cyan)" strokeWidth={4} fill="url(#ratingP)" />
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
