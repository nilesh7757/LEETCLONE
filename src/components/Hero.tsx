"use client";

import { 
  ArrowRight, Trophy, Sparkles, Code2, Terminal,
  Github, Twitter, Mail, Zap
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import IDEShowcase from "@/components/IDEShowcase";

// Card Tier definition type
type CardTier = "bronze" | "silver" | "gold" | "inform" | "icon" | "toty";

interface CardStats {
  alg: number;
  spd: number;
  str: number;
  db: number;
  sql: number;
  ai: number;
}

export default function Hero() {

  // Selected Tier in detail showcase
  const [selectedDetailTier, setSelectedDetailTier] = useState<CardTier>("toty");

  // Platform stats counter
  const [activeUsers, setActiveUsers] = useState(1420);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-[var(--foreground)] overflow-x-hidden pt-20 md:pt-28 pb-20 px-4">
      {/* Background radial glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1400px] h-[600px] bg-gradient-to-b from-[#8F44F0]/10 via-[#740DF6]/5 to-transparent rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(143,68,240,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(143,68,240,0.02)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none" />

      {/* Hero Section - Above the Fold Landing */}
      <section className="max-w-7xl mx-auto mb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center">
            <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#8F44F0]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-black">
                Phase 1 Mastery Protocol Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-7xl font-black tracking-tight leading-[0.95] mb-8 uppercase text-left">
              ELEVATE YOUR CODE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44F0] via-[#c084fc] to-[#60a5fa]">
                OWN THE LEADERBOARD.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#a1a1aa] max-w-2xl mb-10 leading-relaxed text-left">
              Join a state-of-the-art competitive programming workbench. Build algorithmic consistency, track micro-complexities in real-time, get guidance from your built-in AI Coach, and challenge friends globally.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-start">
              <Link
                href="/problems"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#8F44F0] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(143,68,240,0.4)] active:scale-95 group text-sm uppercase tracking-wider"
              >
                Start Practicing 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/arena"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md active:scale-95 text-sm uppercase tracking-wider"
              >
                Enter Arena 
                <Trophy className="w-4 h-4 text-[#eab308]" />
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg border-t border-white/5 pt-8 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">1000+</div>
                <div className="text-[10px] text-[#a1a1aa] uppercase font-black tracking-widest mt-1">Challenges</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#8F44F0] flex items-center gap-1.5">
                  {mounted ? activeUsers : 1420}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] inline-block animate-pulse" />
                </div>
                <div className="text-[10px] text-[#a1a1aa] uppercase font-black tracking-widest mt-1">Live Online</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">2.0s</div>
                <div className="text-[10px] text-[#a1a1aa] uppercase font-black tracking-widest mt-1">Max Runtime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Unified Glassmorphic IDE Showcase Panel */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[380px] w-full max-w-lg lg:mx-0 mx-auto">
            <div className="absolute -inset-10 bg-[#8F44F0]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
            <div className="w-full h-full min-h-[380px] bg-[#0e0e11] rounded-3xl shadow-2xl overflow-hidden relative">
              <IDEShowcase />
            </div>
          </div>

        </div>
      </section>

      {/* Feature Glimpses Capsule Row */}
      <section className="max-w-7xl mx-auto mb-32 border-y border-white/5 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2">
            <span className="text-[#8F44F0] font-black text-xs uppercase tracking-widest block mb-1">01. Coder Tiers</span>
            <span className="text-[10px] text-[#a1a1aa] uppercase font-bold">FUT-Style attributes</span>
          </div>
          <div className="p-2">
            <span className="text-[#eab308] font-black text-xs uppercase tracking-widest block mb-1">02. H2H Arena</span>
            <span className="text-[10px] text-[#a1a1aa] uppercase font-bold">Multiplayer matching</span>
          </div>
          <div className="p-2">
            <span className="text-blue-400 font-black text-xs uppercase tracking-widest block mb-1">03. AI Coach</span>
            <span className="text-[10px] text-[#a1a1aa] uppercase font-bold">Error debugging hints</span>
          </div>
          <div className="p-2">
            <span className="text-green-400 font-black text-xs uppercase tracking-widest block mb-1">04. Sandbox IDE</span>
            <span className="text-[10px] text-[#a1a1aa] uppercase font-bold">Online workspace engine</span>
          </div>
        </div>
      </section>

      {/* Zig-Zag Puzzles detailed features representation */}
      <section className="max-w-7xl mx-auto space-y-40 mb-32">

        {/* Feature 1: Coder Cards & Creator (Left: Text, Right: Compact Card + Selector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8F44F0]/10 border border-[#8F44F0]/20 text-[#c084fc]">
              <Trophy size={12} />
              <span className="text-[10px] uppercase font-black tracking-widest">Ultimate Coder Tiers</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white leading-none">
              DYNAMIC FUT CODER CARDS
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed">
              Every solved problem, contest rating, and streak feeds into your interactive coder card. Climb through six visual tiers from Bronze up to Team of the Year (TOTY) and share your credentials dynamically.
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
              <div>
                <h4 className="text-[9px] text-[#71717a] uppercase font-black tracking-widest">Bronze</h4>
                <div className="text-xs font-bold text-white">Novice entry</div>
              </div>
              <div>
                <h4 className="text-[9px] text-[#71717a] uppercase font-black tracking-widest font-mono">Gold</h4>
                <div className="text-xs font-bold text-white">100+ Solved</div>
              </div>
              <div>
                <h4 className="text-[9px] text-[#71717a] uppercase font-black tracking-widest">TOTY</h4>
                <div className="text-xs font-bold text-white">Top 10 Global</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center justify-center gap-6">
            <CodingCard 
              name="LEETCLONE"
              role={selectedDetailTier === "toty" ? "TOTY" : selectedDetailTier.toUpperCase()}
              rating={
                selectedDetailTier === "toty" ? 99 : 
                selectedDetailTier === "icon" ? 92 : 
                selectedDetailTier === "inform" ? 86 : 
                selectedDetailTier === "gold" ? 82 : 
                selectedDetailTier === "silver" ? 73 : 62
              }
              tier={selectedDetailTier}
              stats={
                selectedDetailTier === "toty" ? { alg: 99, spd: 98, str: 99, db: 96, sql: 95, ai: 99 } :
                selectedDetailTier === "icon" ? { alg: 93, spd: 91, str: 90, db: 92, sql: 88, ai: 94 } :
                selectedDetailTier === "inform" ? { alg: 87, spd: 84, str: 89, db: 80, sql: 78, ai: 85 } :
                selectedDetailTier === "gold" ? { alg: 82, spd: 79, str: 80, db: 75, sql: 72, ai: 78 } :
                selectedDetailTier === "silver" ? { alg: 71, spd: 68, str: 72, db: 65, sql: 60, ai: 66 } :
                { alg: 60, spd: 55, str: 58, db: 52, sql: 45, ai: 50 }
              }
              interactive={true}
            />

            <div className="flex flex-wrap justify-center gap-2">
              {(["bronze", "silver", "gold", "inform", "icon", "toty"] as CardTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedDetailTier(t)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedDetailTier === t
                      ? "bg-[#8F44F0] text-white border-transparent"
                      : "bg-white/5 border-white/10 text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 2: Head-To-Head Arena (Left: Visual Mock, Right: Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eab308]/10 border border-[#eab308]/20 text-[#fef08a]">
              <Trophy size={12} />
              <span className="text-[10px] uppercase font-black tracking-widest">High-Intensity Battle</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white leading-none">
              REAL-TIME MULTIPLAYER ARENA
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed">
              Match up against developers globally in timed coding faceoffs. Solve algorithms under extreme pressure, edge case checks, and earn rating points to upgrade your player attributes.
            </p>
            <div className="border-t border-white/5 pt-6 flex gap-8">
              <div>
                <span className="block text-2xl font-black text-white">Podium</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Top rank bragging rights</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-[#eab308]">Interactive</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Live sockets sync</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 flex justify-center">
            {/* Arena Podium Visual Mockup */}
            <div className="p-6 bg-[#111]/80 border border-white/5 rounded-3xl w-full max-w-sm flex flex-col gap-6 shadow-2xl relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest border-b border-white/5 pb-3 flex justify-between">
                <span>Contest Bracket</span>
                <span className="text-[#eab308] font-bold">Rankings</span>
              </div>
              <div className="flex justify-between items-end gap-3 h-32 pt-4 relative">
                {/* 2nd place */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-white mb-2">91 OVR</span>
                  <div className="w-full bg-white/5 h-16 rounded-t-xl flex items-center justify-center text-[#71717a] border border-white/5">
                    2
                  </div>
                </div>
                {/* 1st place */}
                <div className="flex-1 flex flex-col items-center">
                  <Trophy size={18} className="text-[#eab308] mb-2 animate-bounce" />
                  <div className="w-full bg-[#8F44F0]/20 h-24 rounded-t-xl flex flex-col items-center justify-center text-white border border-[#8F44F0]/30 relative shadow-[0_0_20px_rgba(143,68,240,0.15)]">
                    <span className="font-black text-lg">1</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#8F44F0]">Champion</span>
                  </div>
                </div>
                {/* 3rd place */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-white mb-2">84 OVR</span>
                  <div className="w-full bg-white/5 h-12 rounded-t-xl flex items-center justify-center text-[#71717a] border border-white/5">
                    3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: AI Code Coach (Left: Text, Right: Chat Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#93c5fd]">
              <Sparkles size={12} />
              <span className="text-[10px] uppercase font-black tracking-widest">Built-in Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white leading-none">
              GEMINI AI CODE COACH
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed">
              Stagnating on a hard algorithm or hit by compile errors? Get instant, context-aware optimizations, visual algorithm hints, and complex trace suggestions from your built-in AI Coach.
            </p>
            <div className="border-t border-white/5 pt-6 flex gap-8">
              <div>
                <span className="block text-2xl font-black text-white">Hint system</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Step-by-step guidance</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-blue-400">Optimize</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Complexity reducer</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* AI Coach Mini Chat Bubble Mock */}
            <div className="p-5 bg-[#111]/80 border border-[#8F44F0]/20 rounded-3xl w-full max-w-sm flex flex-col gap-4 shadow-2xl relative">
              <div className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#8F44F0]" />
                <span>Coach Gemini Chat</span>
              </div>
              
              <div className="space-y-3 text-[11px] font-mono leading-relaxed">
                {/* User message */}
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 max-w-[85%] self-start text-[#a1a1aa]">
                  <span className="text-white block font-bold text-[9px] uppercase tracking-wider mb-1">User</span>
                  How do I reduce nested loop time complexity?
                </div>
                {/* AI response */}
                <div className="bg-[#8F44F0]/10 rounded-2xl p-3 border border-[#8F44F0]/20 max-w-[90%] ml-auto text-white">
                  <span className="text-purple-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Coach Gemini</span>
                  Use a HashMap to store values. That reduces the complexity from <span className="text-red-400">O(N²)</span> to <span className="text-green-400">O(N)</span>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: High-Speed Sandbox (Left: Code Editor Mock, Right: Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[#a7f3d0]">
              <Code2 size={12} />
              <span className="text-[10px] uppercase font-black tracking-widest">Fast Execution</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white leading-none">
              COMPILATION WORKBENCH
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed">
              Code seamlessly inside a Monaco-powered sandbox editor. Execute complex custom inputs instantly, run compiler test checks, and view results with inline code error markers.
            </p>
            <div className="border-t border-white/5 pt-6 flex gap-8">
              <div>
                <span className="block text-2xl font-black text-white">Monaco</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">Standard features</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-green-400">Piston</span>
                <span className="text-[10px] text-[#71717a] uppercase font-bold">High speed runners</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 flex justify-center">
            {/* Sandbox Mini Editor Window */}
            <div className="p-4 bg-[#111]/80 border border-white/5 rounded-3xl w-full max-w-sm flex flex-col gap-4 shadow-2xl relative font-mono">
              <div className="flex justify-between items-center text-[10px] text-[#a1a1aa] border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5"><Terminal size={10} /> solution.js</span>
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[8px] font-bold tracking-widest">Run Finished</span>
              </div>
              <div className="text-[11px] text-[#71717a] space-y-2 py-2">
                <div><span className="text-[#8F44F0]">const</span> solve = (arr) =&gt; &#123;</div>
                <div className="pl-3">let map = <span className="text-yellow-400">new</span> <span className="text-blue-400">Map</span>();</div>
                <div className="pl-3">return arr.reduce((acc, val) =&gt; &#123;</div>
                <div className="pl-6 text-purple-400">acc.set(val, (acc.get(val) || 0) + 1);</div>
                <div className="pl-6 text-[#a1a1aa]">return acc;</div>
                <div className="pl-3">&#125;, map);</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>
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
      // Compact size: w-56, h-80 (320px)
      className={`relative w-56 h-[320px] rounded-[2rem] border-2 ${styleSet.bg} ${styleSet.border} ${styleSet.glow} p-4 flex flex-col justify-between overflow-hidden transition-all duration-300 select-none`}
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
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>STR</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.str}</span>
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>DB</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.db}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>SQL</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.sql}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`uppercase font-black text-[8px] ${styleSet.statLabelColor}`}>AI</span>
              <span className={tier === "icon" ? "text-stone-900 font-extrabold" : "text-white font-extrabold"}>{stats.ai}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Tier Crest */}
      <div className="flex justify-center items-center pb-1 relative z-10">
        <span className={`text-[8px] font-black tracking-[0.2em] uppercase bg-black/40 px-2 py-0.5 rounded-full border border-white/5 ${styleSet.accentColor}`}>
          {tier === "toty" ? "TOTY" : tier}
        </span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808]/80 backdrop-blur-md py-16 mt-32 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 px-4">
        {/* Left Column - Branding */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8F44F0]/10 flex items-center justify-center border border-[#8F44F0]/20">
              <Code2 className="w-4 h-4 text-[#8F44F0]" />
            </div>
            <span className="text-lg font-black tracking-widest text-white uppercase">LEETCLONE</span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-xs">
            Unleash your inner coding potential on the ultimate sandbox. Owned by NILESH.
          </p>
          <div className="flex items-center gap-3 pt-2 text-[#71717a]">
            <a href="https://github.com/nilesh7757" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="GitHub">
              <Github size={16} />
            </a>
            <a href="https://x.com/Programmer7757" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Twitter / X">
              <Twitter size={16} />
            </a>
            <a href="mailto:nileshmori7757@gmail.com" className="hover:text-white transition-colors" title="Email Contact">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Column 2 - Platform Links */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Platform</h4>
          <ul className="space-y-2 text-xs text-[#a1a1aa] font-bold">
            <li><Link href="/problems" className="hover:text-white transition-colors">Problems</Link></li>
            <li><Link href="/arena" className="hover:text-white transition-colors">Multiplayer Arena</Link></li>
            <li><Link href="/profile" className="hover:text-white transition-colors">Performance Dashboard</Link></li>
            <li><Link href="/study-plans" className="hover:text-white transition-colors">Study Blocks</Link></li>
          </ul>
        </div>

        {/* Column 3 - Resources */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Resources</h4>
          <ul className="space-y-2 text-xs text-[#a1a1aa] font-bold">
            <li><Link href="/problems" className="hover:text-white transition-colors">AI Coach Guidance</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">DSA Sheets</Link></li>
            <li><Link href="/architect" className="hover:text-white transition-colors">System Design Blocks</Link></li>
            <li><a href="https://takeuforward.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Striver SDE Sheet</a></li>
          </ul>
        </div>

        {/* Column 4 - Profiles & Legal */}
        <div>
          <h4 className="text-[10px] text-[#71717a] font-black uppercase tracking-[0.2em] mb-4">Coder Info</h4>
          <ul className="space-y-2 text-xs text-[#a1a1aa] font-bold">
            <li><a href="https://codeforces.com/profile/nileshm7757" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Codeforces Profile</a></li>
            <li><a href="https://leetcode.com/u/nileshmori7757" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LeetCode Profile</a></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <span className="text-[10px] text-[#71717a] uppercase font-black tracking-widest text-center sm:text-left">
          © 2026 LEETCLONE. ALL RIGHTS RESERVED.
        </span>
        <span className="text-[10px] text-[#71717a] uppercase font-black tracking-widest text-center sm:text-right flex items-center gap-1">
          CRAFTED WITH <Zap size={10} className="text-[#8F44F0]" /> BY NILESH
        </span>
      </div>
    </footer>
  );
}

