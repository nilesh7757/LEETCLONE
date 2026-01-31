"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Trophy, User as UserIcon, ChevronLeft, ChevronRight, Medal } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  rating: number;
  solvedCount: number;
}

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="font-mono text-[var(--foreground)]/60">#{rank}</span>;
  };

  return (
    <div className="w-full">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="w-full">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-3 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)] mb-4"
          >
            <Trophy className="w-8 h-8 text-[var(--accent-gradient-to)]" />
          </motion.div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Global Leaderboard</h1>
          <p className="text-[var(--foreground)]/60 max-w-xl mx-auto">
            Check out the top performers in our community. Solve problems, participate in contests, and climb the ranks!
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-xl backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--foreground)]/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider w-24">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-6 w-8 bg-[var(--foreground)]/10 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-[var(--foreground)]/10 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-[var(--foreground)]/10 rounded ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-12 bg-[var(--foreground)]/10 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  leaderboard.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-[var(--foreground)]/5 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankBadge(user.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group-hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--foreground)]/10 border border-[var(--card-border)]">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-[var(--foreground)]/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">{user.name}</div>
                            {user.rank <= 3 && (
                                <div className="text-xs text-[var(--accent-gradient-to)] font-medium">Top Contributor</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-mono font-bold text-[var(--foreground)]">{user.rating}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          {user.solvedCount}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--foreground)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-[var(--foreground)]/60">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--foreground)]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
