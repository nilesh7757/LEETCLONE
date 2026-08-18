"use client";

import { 
  ArrowRight, Trophy, Sparkles, Code2, Terminal,
  Github, Twitter, Mail, Zap, Brain, Users, Repeat
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import IDEShowcase from "@/components/IDEShowcase";

// Card Tier definition type
type CardTier = "bronze" | "silver" | "gold" | "inform" | "icon" | "toty";

interface CardStats {
  alg: number;
  spd: number;
  log: number;
  acc: number;
  opz: number;
  prs: number;
}

interface HeroProps {
  initialProblemsCount?: number;
  initialUserCount?: number;
}

export default function Hero({ initialProblemsCount, initialUserCount }: HeroProps) {
  // Platform stats counters
  const [problemsCount, setProblemsCount] = useState<number>(initialProblemsCount ?? 108);
  const [userCount, setUserCount] = useState<number>(initialUserCount ?? 17);

  useEffect(() => {
    // Fetch actual problems count from public API
    fetch("/api/problems?limit=1")
      .then(res => res.json())
      .then(data => {
        if (data?.totalCount !== undefined) {
          setProblemsCount(data.totalCount);
        }
      })
      .catch(err => console.error("Error fetching problems count:", err));

    // Fetch actual user count from public API
    fetch("/api/leaderboard?limit=1")
      .then(res => res.json())
      .then(data => {
        if (data?.pagination?.total !== undefined) {
          setUserCount(data.pagination.total);
        }
      })
      .catch(err => console.error("Error fetching user count:", err));
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden pt-20 md:pt-28 pb-20 px-4">
      {/* Background radial grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(143,68,240,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(143,68,240,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none" />

      {/* Hero Section - Above the Fold Landing */}
      <section className="max-w-7xl mx-auto mb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center">
            <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--input)] border border-[var(--border)] mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#8F44F0]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-black">
                ALGORITHMIC PERFORMANCE WORKSPACE ACTIVE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-7xl font-black tracking-tight leading-[0.95] mb-8 text-left">
              Elevate Your Code.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44F0] via-[#c084fc] to-[#60a5fa]">
                Master Your Craft.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mb-10 leading-relaxed text-left">
              An advanced algorithmic development workbench. Featuring real-time code execution, AI-assisted feedback, and 40+ interactive algorithm visualizers built for senior-level engineers.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-start">
              <Link
                href="/problems"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#8F44F0] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-[var(--primary-foreground)] font-bold rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 group text-sm tracking-wider font-semibold"
              >
                Start Practicing 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contest"
                className="w-full sm:w-auto px-8 py-4 bg-[var(--input)] text-[var(--foreground)] font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-all flex items-center justify-center gap-3 backdrop-blur-md active:scale-95 text-sm tracking-wider font-semibold"
              >
                Enter Contests 
                <Trophy className="w-4 h-4 text-[#eab308]" />
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg border-t border-[var(--border)] pt-8 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                  {problemsCount}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-widest mt-1">Curated Problems</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#8F44F0] flex items-center gap-1.5">
                  {userCount}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] inline-block animate-pulse" />
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-widest mt-1">Active Coders</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">40+</div>
                <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-widest mt-1">DSA Visualizers</div>
              </div>
            </div>
          </div>

          {/* Right Column - Unified Glassmorphic IDE Showcase Panel */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[380px] w-full max-w-lg lg:mx-0 mx-auto">
            <div className="w-full h-full min-h-[380px] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden relative">
              <IDEShowcase />
            </div>
          </div>

        </div>
      </section>

      {/* Bento Box Grid */}
      <section className="max-w-7xl mx-auto mb-32 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento 1: Advanced Execution Engine */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px] group shadow-sm hover:border-[var(--primary)]/40 transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-6 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0 border border-[var(--primary)]/20">
                <Terminal className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-[#8F44F0] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#8F44F0]/10 border border-[#8F44F0]/20">
                Sandboxed Engine
              </span>
            </div>
            <div className="space-y-2 z-10 max-w-xl">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Advanced Execution Engine
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Compile and run your C++, Python, JavaScript, and Java solutions with zero-latency. Utilizes Judge0, advanced web workers, and compiler tests to evaluate custom test cases instantly.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[var(--primary)]/[0.03] rounded-full blur-3xl group-hover:bg-[var(--primary)]/[0.08] transition-all duration-500 pointer-events-none" />
          </motion.div>

          {/* Bento 2: Socratic AI Coach */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px] group shadow-sm hover:border-purple-500/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-6 z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                AI Coach
              </span>
            </div>
            <div className="space-y-2 z-10">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Socratic AI Coach
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Get progressive prompts, logic hints, time/space complexity analysis, and custom case breakdowns from Gemini AI, designed to guide you without revealing the direct solution.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/[0.03] rounded-full blur-3xl group-hover:bg-blue-500/[0.08] transition-all duration-500 pointer-events-none" />
          </motion.div>

          {/* Bento 3: Multiplayer Arena */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px] group shadow-sm hover:border-amber-500/40 transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-6 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#eab308]/10 flex items-center justify-center text-[#eab308] shrink-0 border border-[#eab308]/20">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-[#eab308] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#eab308]/10 border border-[#eab308]/20">
                Real-Time
              </span>
            </div>
            <div className="space-y-2 z-10">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Multiplayer Arena
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Challenge global developers in Head-To-Head coding contests. Solve algorithms under match stress, check constraints, and secure top rankings on socket-synchronized leaderboards.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#eab308]/[0.03] rounded-full blur-3xl group-hover:bg-[#eab308]/[0.08] transition-all duration-500 pointer-events-none" />
          </motion.div>

          {/* Bento 4: Spaced Repetition System */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px] group shadow-sm hover:border-green-500/40 transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between gap-4 mb-6 z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0 border border-green-500/20">
                <Repeat className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                Spaced Retention
              </span>
            </div>
            <div className="space-y-2 z-10 max-w-xl">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Spaced Repetition System
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Lock in patterns for standard algorithm paradigms. Custom Anki-style review queues scan your coding velocity and edge case flags to suggest reviews right when your retention drops.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-green-500/[0.03] rounded-full blur-3xl group-hover:bg-green-500/[0.08] transition-all duration-500 pointer-events-none" />
          </motion.div>

        </div>
      </section>
      
      <Footer />
    </div>
  );
}

interface CodingCardComponentProps {
  name: string;
  role: string;
  rating: number;
  tier: CardTier;
  stats: CardStats;
  interactive?: boolean;
}

function CodingCard({ name, role, rating, tier, stats, interactive = false }: CodingCardComponentProps) {
  const [coords, setCoords] = useState({ x: 0.5, y: 0.5, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCoords({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0.5, y: 0.5, active: false });
  };

  const rotateX = coords.active ? (coords.y - 0.5) * -22 : 0;
  const rotateY = coords.active ? (coords.x - 0.5) * 22 : 0;
  const glowX = coords.active ? coords.x * 100 : 50;
  const glowY = coords.active ? coords.y * 100 : 50;

  // Render correct color presets based on card tier
  const getTierStyles = () => {
    switch (tier) {
      case "bronze":
        return {
          bg: "bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#1c1917]",
          border: "border-[#b45309]/50",
          glow: "shadow-[0_0_20px_rgba(180,83,9,0.3)]",
          accentColor: "text-[#d97706]",
          statLabelColor: "text-[#b45309]"
        };
      case "silver":
        return {
          bg: "bg-gradient-to-b from-[#3f3f46] via-[#18181b] to-[#09090b]",
          border: "border-[#a1a1aa]/50",
          glow: "shadow-[0_0_20px_rgba(161,161,170,0.3)]",
          accentColor: "text-[#d4d4d8]",
          statLabelColor: "text-[#71717a]"
        };
      case "gold":
        return {
          bg: "bg-gradient-to-b from-[#78350f] via-[#ca8a04] to-[#18181b]",
          border: "border-[#eab308]/60",
          glow: "shadow-[0_0_25px_rgba(234,179,8,0.35)]",
          accentColor: "text-[#fef08a]",
          statLabelColor: "text-[#ca8a04]"
        };
      case "inform":
        return {
          bg: "bg-gradient-to-b from-black via-zinc-900 to-black",
          border: "border-[#eab308]/50",
          glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]",
          accentColor: "text-[#eab308]",
          statLabelColor: "text-[#ca8a04]"
        };
      case "icon":
        return {
          bg: "bg-gradient-to-b from-[#fafaf9] via-[#e7e5e4] to-[#cbc9c7]",
          border: "border-[#d4af37]/70",
          glow: "shadow-[0_0_30px_rgba(212,175,55,0.45)]",
          accentColor: "text-[#854d0e]",
          statLabelColor: "text-[#a16207]"
        };
      case "toty":
      default:
        return {
          bg: "bg-gradient-to-b from-[#1e3a8a] via-[#020617] to-[#090d16]",
          border: "border-[#3b82f6]/70",
          glow: "shadow-[0_0_35px_rgba(59,130,246,0.5)]",
          accentColor: "text-[#60a5fa]",
          statLabelColor: "text-[#2563eb]"
        };
    }
  };

  const styleSet = getTierStyles();

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          // Trigger holographic shimmer on keyboard activation
          setCoords({ x: 0.5, y: 0.5, active: true });
          setTimeout(() => setCoords({ x: 0.5, y: 0.5, active: false }), 600);
        }
      }}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? `${name} coder card — ${role} tier` : undefined}
      // Compact size: w-56, h-80 (320px)
      className={`relative w-56 h-[320px] rounded-[2rem] border-2 ${styleSet.bg} ${styleSet.border} ${styleSet.glow} p-4 flex flex-col justify-between overflow-hidden transition-all duration-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F44F0] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]`}
      style={{
        transform: interactive ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${coords.active ? 1.03 : 1})` : "none",
        transition: coords.active ? "none" : "transform 0.5s ease, shadow 0.5s ease",
      }}
    >
      {/* Holographic shine */}
      {coords.active && interactive && (
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 50%), 
                         linear-gradient(${glowX + glowY}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 70%)`,
          }}
        />
      )}

      {/* Shards */}
      {tier === "toty" && (
        <div className="absolute inset-0 pointer-events-none opacity-20 -z-5">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-cyan-400 to-transparent blur-xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-blue-500 to-transparent blur-xl rounded-full" />
        </div>
      )}
      
      {/* Card Header Info */}
      <div className="flex justify-between items-start pt-2 relative z-10">
        <div className="flex flex-col items-center">
          <span className={`text-2xl font-extrabold tracking-tight leading-none ${tier === "icon" ? "text-stone-900" : "text-white"}`}>
            {rating}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${styleSet.accentColor}`}>
            {role}
          </span>
          <div className="w-5 h-3 bg-white/10 border border-white/10 rounded-sm mt-1.5 flex items-center justify-center font-mono text-[7px] text-white/65 uppercase tracking-tighter">
            IND
          </div>
        </div>

        {/* Coder Avatar (Smaller: w-20, h-20) */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-full overflow-hidden border ${
            tier === "toty" ? "border-blue-400" : 
            tier === "icon" ? "border-[#d4af37]" : 
            tier === "inform" ? "border-amber-500" : "border-white/10"
          } bg-white/5 flex items-center justify-center`}>
            <span className={`text-xl font-black ${tier === "icon" ? "text-stone-700" : "text-white/80"}`}>
              {name ? name.substring(0, 2) : "CD"}
            </span>
          </div>
          <div className={`absolute -bottom-1 -right-0.5 w-5.5 h-5.5 rounded-full flex items-center justify-center border ${
            tier === "toty" ? "bg-blue-600 border-blue-400 text-white" :
            tier === "icon" ? "bg-[#d4af37] border-white text-stone-900" :
            tier === "inform" ? "bg-amber-500 border-black text-black" : "bg-neutral-800 border-white/10 text-white"
          } shadow-md`}>
            <Trophy className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      {/* Middle Divider */}
      <div className="relative z-10 flex flex-col items-center mt-2">
        <div className={`w-full h-px ${
          tier === "icon" ? "bg-gradient-to-r from-transparent via-stone-400 to-transparent" : "bg-gradient-to-r from-transparent via-white/15 to-transparent"
        }`} />
      </div>

      {/* Coder Name */}
      <div className="text-center relative z-10 my-1">
        <h2 className={`text-lg font-black tracking-widest uppercase truncate px-2 ${
          tier === "icon" ? "text-stone-900" : "text-white"
        }`}>
          {name || "CODER"}
        </h2>
      </div>

      {/* Attribute Stats Block (More Compact) */}
      <div className="relative z-10 pb-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-w-[170px] mx-auto text-[10px] font-bold">
          {/* Col 1 */}
          <div className="space-y-0.5 border-r border-white/5 pr-3">
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>ALG</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.alg}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>SPD</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.spd}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>LOG</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.log}</span>
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>ACC</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.acc}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>OPZ</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.opz}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>PRS</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.prs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Tier Crest */}
      <div className="flex justify-center items-center pb-1 relative z-10">
        <span className={`text-[8px] font-black tracking-[0.2em] uppercase bg-black/40 px-2 py-0.5 rounded-full border border-white/5 ${styleSet.accentColor}`}>
          {tier === "toty" ? "MASTER" : 
           tier === "icon" ? "EXPERT" : 
           tier === "inform" ? "SPECIALIST" : 
           tier === "gold" ? "ADVANCED" : 
           tier === "silver" ? "INTERMEDIATE" : "NOVICE"}
        </span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md py-16 mt-32 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 px-4">
        {/* Left Column - Branding */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8F44F0]/10 flex items-center justify-center border border-[#8F44F0]/20">
              <Code2 className="w-4 h-4 text-[#8F44F0]" />
            </div>
            <span className="text-lg font-black tracking-widest text-[var(--foreground)] uppercase">LOGIQUEST</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs">
            Unleash your inner coding potential on the ultimate sandbox. Owned by NILESH.
          </p>
          <div className="flex items-center gap-3 pt-2 text-[#71717a]">
            <a href="https://github.com/nilesh7757" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors" title="GitHub">
              <Github size={16} />
            </a>
            <a href="https://x.com/Programmer7757" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors" title="Twitter / X">
              <Twitter size={16} />
            </a>
            <a href="mailto:nileshmori7757@gmail.com" className="hover:text-[var(--foreground)] transition-colors" title="Email Contact">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Column 2 - Platform Links */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Platform</h4>
          <ul className="space-y-2 text-xs text-[var(--muted-foreground)] font-bold">
            <li><Link href="/problems" className="hover:text-[var(--foreground)] transition-colors">Problems</Link></li>
            <li><Link href="/contest" className="hover:text-[var(--foreground)] transition-colors">Multiplayer Contests</Link></li>
            <li><Link href="/profile" className="hover:text-[var(--foreground)] transition-colors">Performance Dashboard</Link></li>
            <li><Link href="/study-plans" className="hover:text-[var(--foreground)] transition-colors">Study Blocks</Link></li>
          </ul>
        </div>

        {/* Column 3 - Resources */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Resources</h4>
          <ul className="space-y-2 text-xs text-[var(--muted-foreground)] font-bold">
            <li><Link href="/problems" className="hover:text-[var(--foreground)] transition-colors">AI Coach Guidance</Link></li>
            <li><Link href="/resources" className="hover:text-[var(--foreground)] transition-colors">DSA Sheets</Link></li>
            <li><Link href="/architect" className="hover:text-[var(--foreground)] transition-colors">System Design Blocks</Link></li>
            <li><a href="https://takeuforward.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">Striver SDE Sheet</a></li>
          </ul>
        </div>

        {/* Column 4 - Profiles & Legal */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Coder Info</h4>
          <ul className="space-y-2 text-xs text-[var(--muted-foreground)] font-bold">
            <li><a href="https://codeforces.com/profile/nileshm7757" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">Codeforces Profile</a></li>
            <li><a href="https://leetcode.com/u/nileshmori7757" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">LeetCode Profile</a></li>
            <li><Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-[var(--border)] mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <span className="text-[10px] text-[#71717a] uppercase font-black tracking-widest text-center sm:text-left">
          © 2026 LOGIQUEST. ALL RIGHTS RESERVED.
        </span>
        <span className="text-[10px] text-[#71717a] uppercase font-black tracking-widest text-center sm:text-right flex items-center gap-1">
          CRAFTED WITH <Zap size={10} className="text-[#8F44F0]" /> BY NILESH
        </span>
      </div>
    </footer>
  );
}
