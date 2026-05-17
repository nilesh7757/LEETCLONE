"use client";

import { motion } from "framer-motion";
import { 
  Zap, Target, Code2, Layout, 
  Trophy, Star, Play, Lock, 
  Gamepad2, Sparkles, Rocket,
  User, Medal
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";

const GAMES = [
  {
    id: "blitz",
    title: "Big-O Blitz",
    description: "Match algorithms with their complexities in this high-speed sorting race.",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    difficulty: "Easy",
    points: "50 AP",
    href: "/arcade/blitz",
    status: "READY"
  },
  {
    id: "bug-sniper",
    title: "Bug Sniper",
    description: "Identify and eliminate syntax bugs before the clock runs out.",
    icon: Target,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    difficulty: "Medium",
    points: "100 AP",
    href: "/arcade/bug-sniper",
    status: "READY"
  },
  {
    id: "clash",
    title: "Code Clash",
    description: "1v1 real-time race to solve standard algorithmic patterns.",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    difficulty: "Hard",
    points: "250 AP",
    href: "/arcade/clash",
    status: "DEVELOPING"
  },
  {
    id: "architect",
    title: "Architecture Builder",
    description: "Drag-and-drop components to build a system that scales to 1M users.",
    icon: Layout,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    difficulty: "Expert",
    points: "500 AP",
    href: "/arcade/architect",
    status: "DEVELOPING"
  }
];

interface LeaderboardUser {
  id: string;
  name: string;
  image?: string;
  arcadePoints: number;
}

export default function ArcadeHub() {
  const { data: session } = useSession();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    const fetchLB = async () => {
      try {
        const { data } = await axios.get("/api/arcade/leaderboard");
        setLeaderboard(data);
      } catch (error) {} finally {
        setLoadingLB(false);
      }
    };
    fetchLB();
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 overflow-hidden relative">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                <Gamepad2 size={24} />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase">Neural Arcade</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              MASTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">THE FLOW</span>
            </h1>
            <p className="text-[#a1a1aa] max-w-xl font-medium leading-relaxed">
              Gamified training for technical interviews. Compete, earn Arcade Points (AP), and reach the top of the Global Leaderboard.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#52525b] mb-2">
                <Rocket size={14} className="text-amber-500" /> Current AP
              </div>
              <div className="text-4xl font-black font-mono">{(session?.user as { arcadePoints?: number })?.arcadePoints || 0}</div>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#52525b] mb-2">
                <Trophy size={14} className="text-blue-500" /> Global Rank
              </div>
              <div className="text-4xl font-black font-mono">#--</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* GAMES GRID */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {GAMES.map((game) => (
              <motion.div
                key={game.id}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`group relative p-8 rounded-[3rem] bg-[#0a0a0a] border ${game.border} hover:bg-[#111] transition-all duration-500 overflow-hidden cursor-pointer`}
              >
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${game.bg}`} />
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className={`p-5 rounded-3xl ${game.bg} ${game.color} border ${game.border} shadow-2xl`}>
                      <game.icon size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-[#a1a1aa]`}>
                        {game.difficulty}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${game.bg} ${game.color}`}>
                        {game.points}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-3xl font-black tracking-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/40 transition-all">
                      {game.title}
                    </h3>
                    <p className="text-[#52525b] text-sm font-medium leading-relaxed mb-8 max-w-md group-hover:text-[#a1a1aa] transition-colors">
                      {game.description}
                    </p>

                    <div className="flex items-center gap-4">
                      {game.status === "READY" ? (
                        <Link 
                          href={game.href}
                          className={`px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95`}
                        >
                          Initiate Sequence <Play size={16} fill="currentColor" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 text-[#262626] font-black text-xs uppercase tracking-[0.2em]">
                          <Lock size={16} /> Encryption Ongoing
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* LEADERBOARD SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Trophy size={80} className="text-amber-500" />
                </div>
                
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#52525b] mb-8 flex items-center gap-2">
                   <Medal size={16} className="text-amber-500" /> Hall of Fame
                </h3>

                <div className="space-y-6">
                   {loadingLB ? (
                      [1,2,3,4,5].map(i => (
                         <div key={i} className="flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="w-10 h-10 rounded-full bg-white/5" />
                            <div className="flex-1 space-y-2">
                               <div className="h-3 w-24 bg-white/5 rounded" />
                               <div className="h-2 w-12 bg-white/5 rounded" />
                            </div>
                         </div>
                      ))
                   ) : leaderboard.length === 0 ? (
                      <div className="text-center py-8">
                         <div className="text-[10px] font-black uppercase tracking-widest text-[#262626]">No Data Indexed</div>
                      </div>
                   ) : (
                      leaderboard.map((user, i) => (
                         <div key={user.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="relative">
                                  <div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${
                                     i === 0 ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                                     i === 1 ? 'border-slate-400' : 
                                     i === 2 ? 'border-amber-700' : 'border-white/5'
                                  }`}>
                                     {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : <User size={16} className="m-auto mt-2 text-[#52525b]" />}
                                  </div>
                                  <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
                                     i === 0 ? 'bg-amber-500 text-black' : 
                                     i === 1 ? 'bg-slate-400 text-black' : 
                                     i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-[#52525b]'
                                  }`}>
                                     {i + 1}
                                  </div>
                               </div>
                               <div>
                                  <div className="text-sm font-black tracking-tight group-hover:text-blue-500 transition-colors">{user.name}</div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-[#52525b]">Tier 00{i + 1} Candidate</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-sm font-black font-mono text-white">{user.arcadePoints}</div>
                               <div className="text-[8px] font-black uppercase tracking-tighter text-blue-500/50">Arcade_Points</div>
                            </div>
                         </div>
                      ))
                   )}
                </div>

                <Link href="/leaderboard" className="mt-12 block w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#52525b] hover:text-white border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                   Open Global Index
                </Link>
             </div>

             <div className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-black tracking-tight mb-2 flex items-center gap-2">
                   <Sparkles size={20} className="text-blue-400" /> Daily Challenge
                </h3>
                <p className="text-sm text-blue-100/60 font-medium mb-4">Complete 3 mini-games today to earn <span className="text-white font-bold">+100 AP</span> bonus.</p>
                <div className="flex gap-1">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-400 w-0" />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* BOTTOM DECORATION */}
        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-[#111] flex items-center justify-center text-[10px] font-bold text-[#52525b]">U{i}</div>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b]">
              <span className="text-white">1,248</span> Active Challengers Now
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <Sparkles size={16} />
             </div>
             <span className="text-[10px] font-black tracking-widest text-[#52525b] uppercase">AI Powered Challenges</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
