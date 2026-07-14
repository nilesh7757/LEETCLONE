/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, LogOut, Camera, Save, Loader2, 
  TrendingUp, Calendar, Trophy,
  Award, X, Sparkles, Zap, Rocket,
  Github, CheckCircle2, AlertCircle
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import dynamic from 'next/dynamic';
import { useTheme } from "next-themes";
import SkillRadar from "@/features/profile/components/HeroProfile/SkillRadar";
import UserRatingCard from "@/features/profile/components/HeroProfile/UserRatingCard";
import Image from "next/image";

const ActivityCalendar = dynamic(() => import("react-activity-calendar").then(mod => {
  return mod.ActivityCalendar;
}), { ssr: false });

const RatingHistoryChart = dynamic(() => import("@/features/profile/components/RatingHistoryChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--foreground)]/5 animate-pulse rounded-2xl" />
});

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
    countryCode: "",
  });

  const [skillInput, setSkillInput] = useState("");

  const fetchStats = useCallback(async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/users/${userId}/performance`);
      setStats(data);
    } catch (err) {
      console.error("Failed to load performance stats:", err);
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
        countryCode: (user as any).countryCode || "IN",
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
      await axios.put("/api/profile/update", formData);
      await axios.put("/api/profile/update-omni-usernames", {
        githubUsername: formData.githubUsername,
        leetcodeUsername: formData.leetcodeUsername,
        codeforcesUsername: formData.codeforcesUsername,
        codechefUsername: formData.codechefUsername,
        atcoderUsername: formData.atcoderUsername,
      });

      await update({
        ...session?.user,
        ...formData
      });

      toast.success("Identity updated successfully");
      return true;
    } catch {
      toast.error("Failed to sync identity");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOmni = async () => {
    setSyncing(true);
    const saveSuccess = await handleUpdate();
    if (!saveSuccess) {
        setSyncing(false);
        return;
    }

    try {
      const { data } = await axios.post("/api/profile/sync-omni");
      
      setLocalOmniData({
        powerLevel: data.powerLevel,
        advice: data.advice,
        description: data.title,
        externalStats: data.externalStats,
        githubUsername: formData.githubUsername,
        leetcodeUsername: formData.leetcodeUsername,
        codeforcesUsername: formData.codeforcesUsername
      });

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
    } catch {
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
    } catch {
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
  
  const aiFeedback = localOmniData?.advice ?? (session?.user as SessionUser)?.aiProfileFeedback;
  const devTitle = localOmniData?.description ?? (session?.user as any)?.description ?? "Code Rookie";
  const powerLevel = localOmniData?.powerLevel ?? (session?.user as SessionUser)?.devPowerLevel ?? 0;
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
    <div className="min-h-screen w-full relative pb-12 overflow-x-hidden pt-6 select-none bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: IDENTITY PROFILE & platforms GRID */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4 space-y-6"
          >
            {/* AVATAR & BASIC DETAILS CARD */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--primary)]/5 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex flex-col items-center">
                    <div className="relative mb-6 group cursor-pointer animate-pulse" onClick={() => fileInputRef.current?.click()}>
                        <div className="absolute inset-0 rounded-full blur-xl opacity-25 bg-[var(--primary)]" />
                        <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr relative z-10 from-[var(--primary)] to-[var(--viz-cyan)]">
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-[var(--background)] bg-[var(--card)] relative">
                                {formData.image ? (
                                    <Image src={formData.image} alt="Profile" fill className="object-cover group-hover:opacity-50 transition-all" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]"><UserCircle className="w-12 h-12 text-[var(--muted-foreground)]" /></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"><Camera className="w-6 h-6 text-white" /></div>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-md flex items-center gap-1.5 whitespace-nowrap z-20">
                            <Award size={10} style={{ color: rankColor }} />
                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{rankTitle}</span>
                        </div>
                    </div>

                    <div className="text-center space-y-1 mb-6">
                        <h2 className="text-2xl font-black tracking-tight">{formData.name || "UNIDENTIFIED_USER"}</h2>
                        <div className="flex items-center justify-center gap-1.5">
                           <span className="text-[9px] font-black font-mono px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 uppercase">
                              PL {powerLevel}
                           </span>
                           <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                              {devTitle}
                           </span>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} className="w-full space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/60 mb-1 block ml-0.5">Identity_Alias</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/60 mb-1 block ml-0.5">Neural_Bio</label>
                                <input type="text" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:border-[var(--primary)]/50 outline-none transition-all" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/60 mb-2 block ml-0.5">Matrix_Skills</label>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {formData.skills.map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-[9px] font-black uppercase border border-[var(--primary)]/20">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs outline-none focus:border-[var(--primary)]/50" placeholder="Inject Skill..." />
                                <button type="button" onClick={addSkill} className="p-2 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg text-[var(--primary)] hover:border-[var(--primary)]/40 transition-all cursor-pointer"><Sparkles size={12} /></button>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold text-[9px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Profile
                            </button>
                            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer">
                                <LogOut size={12} />
                            </button>
                        </div>
                    </form>

                    <div className="w-full mt-4 pt-4 border-t border-[var(--border)]/30 flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Global Score</span>
                        <div className="flex items-center gap-1 text-amber-500 font-mono text-xs font-black">
                            <Zap size={11} fill="currentColor" />
                            <span>{arcadePoints} GS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEURAL OMNI SYNC NODES GRID */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                        <Rocket size={14} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/65">Identity Nodes</span>
                       <span className="text-xs font-black text-[var(--foreground)] tracking-tight">Platform Connections</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* GITHUB NODE */}
                    <div className={`p-4 rounded-2xl border transition-all ${isPlatformConnected('github') ? 'border-emerald-500/25 bg-emerald-500/[0.01]' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2">
                                <Github size={14} className={isPlatformConnected('github') ? 'text-emerald-500' : 'text-[var(--muted-foreground)]/40'} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">GitHub</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPlatformConnected('github') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--foreground)]/5 text-[var(--muted-foreground)]/45'}`}>
                                {isPlatformConnected('github') ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        <input 
                            type="text" placeholder="Username" value={formData.githubUsername} 
                            onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono focus:border-[var(--primary)]/50 outline-none transition-all mb-2"
                        />
                        {isPlatformConnected('github') && (externalStats?.github || localOmniData?.externalStats?.github) && (
                            <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                                <span>Repos: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.github || externalStats?.github).publicRepos}</strong></span>
                                <span>Followers: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.github || externalStats?.github).followers}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* LEETCODE NODE */}
                    <div className={`p-4 rounded-2xl border transition-all ${isPlatformConnected('leetcode') ? 'border-amber-500/25 bg-amber-500/[0.01]' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={isPlatformConnected('leetcode') ? 'text-amber-500' : 'text-[var(--muted-foreground)]/40'} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">LeetCode</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPlatformConnected('leetcode') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-[var(--foreground)]/5 text-[var(--muted-foreground)]/45'}`}>
                                {isPlatformConnected('leetcode') ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        <input 
                            type="text" placeholder="Username" value={formData.leetcodeUsername} 
                            onChange={(e) => setFormData({...formData, leetcodeUsername: e.target.value})}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono focus:border-[var(--primary)]/50 outline-none transition-all mb-2"
                        />
                        {isPlatformConnected('leetcode') && (externalStats?.leetcode || localOmniData?.externalStats?.leetcode) && (
                            <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                                <span>Solved: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.leetcode || externalStats?.leetcode).totalSolved}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* CODEFORCES NODE */}
                    <div className={`p-4 rounded-2xl border transition-all ${isPlatformConnected('codeforces') ? 'border-blue-500/25 bg-blue-500/[0.01]' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2">
                                <Award size={14} className={isPlatformConnected('codeforces') ? 'text-blue-500' : 'text-[var(--muted-foreground)]/40'} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">Codeforces</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPlatformConnected('codeforces') ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-[var(--foreground)]/5 text-[var(--muted-foreground)]/45'}`}>
                                {isPlatformConnected('codeforces') ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        <input 
                            type="text" placeholder="Username" value={formData.codeforcesUsername} 
                            onChange={(e) => setFormData({...formData, codeforcesUsername: e.target.value})}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono focus:border-[var(--primary)]/50 outline-none transition-all mb-2"
                        />
                        {isPlatformConnected('codeforces') && (externalStats?.codeforces || localOmniData?.externalStats?.codeforces) && (
                            <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                                <span>Rating: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.codeforces || externalStats?.codeforces).rating}</strong></span>
                                <span>Rank: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.codeforces || externalStats?.codeforces).rank}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* CODECHEF NODE */}
                    <div className={`p-4 rounded-2xl border transition-all ${isPlatformConnected('codechef') ? 'border-amber-700/25 bg-amber-700/[0.01]' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-600 font-bold text-[8px]">C</div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">CodeChef</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPlatformConnected('codechef') ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20' : 'bg-[var(--foreground)]/5 text-[var(--muted-foreground)]/45'}`}>
                                {isPlatformConnected('codechef') ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        <input 
                            type="text" placeholder="Username" value={formData.codechefUsername} 
                            onChange={(e) => setFormData({...formData, codechefUsername: e.target.value})}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono focus:border-[var(--primary)]/50 outline-none transition-all mb-2"
                        />
                        {isPlatformConnected('codechef') && (externalStats?.codechef || localOmniData?.externalStats?.codechef) && (
                            <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                                <span>Rating: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.codechef || externalStats?.codechef).rating}</strong></span>
                                <span>Stars: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.codechef || externalStats?.codechef).stars}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* ATCODER NODE */}
                    <div className={`p-4 rounded-2xl border transition-all ${isPlatformConnected('atcoder') ? 'border-slate-500/25 bg-slate-500/[0.01]' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-center mb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-400/20 flex items-center justify-center text-slate-400 font-bold text-[8px]">A</div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">AtCoder</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPlatformConnected('atcoder') ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' : 'bg-[var(--foreground)]/5 text-[var(--muted-foreground)]/45'}`}>
                                {isPlatformConnected('atcoder') ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                        <input 
                            type="text" placeholder="Username" value={formData.atcoderUsername} 
                            onChange={(e) => setFormData({...formData, atcoderUsername: e.target.value})}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono focus:border-[var(--primary)]/50 outline-none transition-all mb-2"
                        />
                        {isPlatformConnected('atcoder') && (externalStats?.atcoder || localOmniData?.externalStats?.atcoder) && (
                            <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                                <span>Rating: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.atcoder || externalStats?.atcoder).rating}</strong></span>
                                <span>Highest: <strong className="text-[var(--foreground)]">{(localOmniData?.externalStats?.atcoder || externalStats?.atcoder).maxRating}</strong></span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={handleSyncOmni}
                        disabled={syncing}
                        className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                            syncing ? 'bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)] border-[var(--viz-cyan)]/25' : 'bg-white text-black border-white shadow-md hover:opacity-90 active:scale-95'
                        }`}
                    >
                        {syncing ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />} 
                        {syncing ? "Synchronizing Platforms..." : "Sync Platforms"}
                    </button>
                </div>
            </div>
          </motion.div>
          
          {/* RIGHT COLUMN: GRAPHS & METRICS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8 space-y-6"
          >
            {/* Neural Coach Assessment */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/50 mb-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500 animate-pulse" /> Neural Coach Assessment
                </h3>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={aiFeedback}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-semibold leading-relaxed text-[var(--foreground)]/80 whitespace-pre-wrap"
                    >
                        {aiFeedback || "Awaiting neural synchronization to provide placement intelligence..."}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Developer Statistics Dashboard */}
            <div className="flex justify-center w-full">
                <UserRatingCard user={session?.user} stats={stats} />
            </div>

            {/* Grid Progress Capsules (Without Radar) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCapsuleSmall label="Easy" count={stats?.user?.solvedEasy || 0} color="#10b981" />
                <StatCapsuleSmall label="Medium" count={stats?.user?.solvedMedium || 0} color="#f59e0b" />
                <StatCapsuleSmall label="Hard" count={stats?.user?.solvedHard || 0} color="#ef4444" />
            </div>

            {/* Trajectory Area Chart */}
            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/50 mb-1">Skill Trajectory</h3>
                        <div className="text-3xl font-black font-mono tracking-tight">{ratingValue}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--viz-cyan)]/10 text-[var(--viz-cyan)]">
                        <TrendingUp size={16} />
                    </div>
                </div>
                <div className="h-[200px] w-full">
                    {!loadingStats && stats && stats.ratingHistory.length > 0 ? (
                        <RatingHistoryChart data={stats.ratingHistory} />
                    ) : !loadingStats && stats ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                            <TrendingUp size={24} className="opacity-20 mb-2" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Compete in contests to build your trajectory</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Activity Calendar */}
            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md overflow-hidden">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/50 mb-6 flex items-center gap-2">
                    <Calendar size={12} /> Synaptic Transmission Log
                </h3>
                <div className="flex justify-center overflow-x-auto pb-2 custom-scrollbar">
                    {!loadingStats && stats?.calendarData && (
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                dark: ['rgba(255,255,255,0.05)', '#38bdf8'],
                                light: ['#f1f5f9', '#0ea5e9']
                            }}
                            colorScheme={(theme === 'dark' ? 'dark' : 'light') as any}
                            blockSize={12}
                            blockMargin={4}
                            blockRadius={3}
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
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-opacity-100 transition-all shadow-sm flex flex-col gap-2 relative">
            <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 mb-1">{label}</div>
                <div className="text-xl font-black font-mono leading-none">{count}</div>
            </div>
            <div className="w-full h-1 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, count * 5)}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}
