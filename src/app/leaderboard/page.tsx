"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  User as UserIcon, ChevronLeft, ChevronRight, 
  Medal, Crown, Zap, Flame 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  rating: number;
  solvedCount: number;
}

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return (
    <div className="relative">
      <div className="absolute inset-0 bg-[var(--viz-amber)] blur-xl opacity-60 animate-pulse" />
      <Crown className="w-10 h-10 text-[var(--viz-amber)] relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" fill="currentColor" />
    </div>
  );
  if (rank === 2) return <Medal className="w-8 h-8 text-[var(--viz-slate)] drop-shadow-lg" />;
  if (rank === 3) return <Medal className="w-8 h-8 text-[var(--viz-rose)] drop-shadow-lg" />;
  return <span className="font-mono text-sm font-bold text-muted-foreground/30">#{rank.toString().padStart(2, '0')}</span>;
};

const PodiumCard = ({ user, delay }: { user: LeaderboardUser; delay: number }) => {
  const isFirst = user.rank === 1;
  const colorVar = isFirst ? 'var(--viz-amber)' 
                 : user.rank === 2 ? 'var(--viz-slate)' 
                 : 'var(--viz-rose)';
  
  const height = isFirst ? 'h-80 md:h-96' : 'h-64 md:h-72';
  const width = isFirst ? 'w-full md:w-[320px]' : 'w-full md:w-[260px]';
  const zIndex = isFirst ? 20 : 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      className={`relative ${height} ${width} rounded-[3rem] bg-[var(--card)]/40 backdrop-blur-2xl overflow-visible flex flex-col items-center justify-end pb-8 hover:scale-105 transition-all duration-500 group`}
      style={{ zIndex }}
    >
      {/* Dynamic Glow Behind */}
      <div 
        className="absolute inset-0 rounded-[3rem] opacity-20 blur-2xl transition-all duration-700 group-hover:opacity-40 group-hover:blur-3xl"
        style={{ background: `radial-gradient(circle at bottom, ${colorVar}, transparent 80%)` }} 
      />
      
      {/* Border Gradient (Subtle) */}
      <div className="absolute inset-0 rounded-[3rem] border border-white/5 group-hover:border-white/10 transition-colors" />

      {/* Avatar Section */}
      <div className="absolute top-0 -translate-y-1/2">
         <div className="relative">
            {/* Ring */}
            <div className="absolute inset-[-4px] rounded-full opacity-60 blur-md animate-pulse" style={{ backgroundColor: colorVar }} />
            
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-2xl relative z-10 bg-[var(--background)]" style={{ borderColor: colorVar }}>
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-[var(--muted-foreground)]" />
                </div>
              )}
            </div>
            
            {/* Rank Badge Indicator */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[var(--card)] px-3 py-1 rounded-full border border-white/10 shadow-xl flex items-center gap-1">
                 <RankBadge rank={user.rank} />
            </div>
         </div>
      </div>

      {/* User Info */}
      <div className="text-center space-y-2 relative z-10 px-4 w-full mt-12">
        <Link href={`/profile/${user.id}`} className="block group-hover:-translate-y-1 transition-transform duration-300">
          <h3 className="font-black text-xl md:text-2xl text-[var(--foreground)] truncate px-2 tracking-tight">
            {user.name}
          </h3>
        </Link>
        
        {/* Stats Pill */}
        <div className="flex items-center justify-center gap-4 mt-4">
             <div className="flex flex-col items-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Rating</span>
                 <div className="text-lg font-black font-mono flex items-center gap-1" style={{ color: colorVar }}>
                     <Zap size={14} fill="currentColor" /> {user.rating}
                 </div>
             </div>
             <div className="w-[1px] h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Solved</span>
                 <div className="text-lg font-black font-mono text-[var(--viz-emerald)]">
                     {user.solvedCount}
                 </div>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page]);

  const fetchLeaderboard = async (pageNum: number) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/leaderboard?page=${pageNum}&limit=50`);
      setLeaderboard(data.leaderboard);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.filter(u => u.rank <= 3).sort((a, b) => a.rank - b.rank);
  const restList = leaderboard.filter(u => u.rank > 3);

  // Re-order top 3 for podium visualization: 2, 1, 3
  const podiumOrder = [];
  if (topThree.find(u => u.rank === 2)) podiumOrder.push(topThree.find(u => u.rank === 2)!);
  if (topThree.find(u => u.rank === 1)) podiumOrder.push(topThree.find(u => u.rank === 1)!);
  if (topThree.find(u => u.rank === 3)) podiumOrder.push(topThree.find(u => u.rank === 3)!);

  return (
    <div className="min-h-screen w-full relative overflow-hidden pb-32">
      {/* Deep Space Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[var(--background)]">
        <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-[var(--viz-amber)]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] right-[10%] w-[800px] h-[800px] bg-[var(--viz-cyan)]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '15s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        
        {/* Header - Minimalist */}
        <div className="flex flex-col items-center mb-24 space-y-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
            >
                <Flame size={12} className="text-[var(--viz-amber)]" fill="currentColor" /> Hall of Fame
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/20 text-center">
                LEGENDS
            </h1>
        </div>

        {/* Podium Section */}
        {!loading && page === 1 && podiumOrder.length > 0 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-12 mb-48 px-4 mt-20">
            {podiumOrder.map((user, idx) => (
              <PodiumCard key={user.id} user={user} delay={0.2 + idx * 0.15} />
            ))}
          </div>
        )}

        {/* Floating List Section */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 mt-20">
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--viz-cyan)] border-t-transparent rounded-full animate-spin" />
             </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {restList.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--viz-cyan-rgb), 0.03)" }}
                  transition={{ delay: idx * 0.01 }}
                  className="group relative flex items-center justify-between px-8 py-6 bg-[var(--card)]/30 backdrop-blur-md rounded-[3rem] transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                      <span className="font-mono font-bold text-[var(--muted-foreground)]/30 text-lg w-8 text-center">{user.rank}</span>
                      
                      <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 md:w-16 md:h-14 rounded-full overflow-hidden bg-[var(--muted)]/50 ring-2 ring-transparent group-hover:ring-[var(--viz-cyan)]/50 transition-all duration-500">
                              {user.image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                      <UserIcon size={24} className="text-[var(--muted-foreground)]" />
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <Link href={`/profile/${user.id}`} className="font-black text-[var(--foreground)] text-xl md:text-2xl tracking-tight group-hover:text-[var(--viz-cyan)] transition-colors">
                          {user.name}
                      </Link>
                  </div>

                  <div className="flex items-center gap-2 pr-4">
                      <Zap size={18} className="text-[var(--viz-cyan)]" fill="currentColor" />
                      <span className="font-mono font-black text-xl text-[var(--foreground)] tracking-tight">{user.rating}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination - Floating Pill */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
           <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-[var(--foreground)]/90 text-[var(--background)] backdrop-blur-xl shadow-2xl">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="hover:text-[var(--viz-cyan)] disabled:opacity-30 disabled:hover:text-inherit transition-colors text-[var(--background)]"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-mono text-xs font-black uppercase tracking-widest text-[var(--background)]">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="hover:text-[var(--viz-cyan)] disabled:opacity-30 disabled:hover:text-inherit transition-colors text-[var(--background)]"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
