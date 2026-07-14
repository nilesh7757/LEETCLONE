"use client";

import React, { useMemo } from 'react';
import { UserCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const SkillRadar = dynamic(() => import("./SkillRadar"), { ssr: false });

interface UserRatingCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
}

export default function UserRatingCard({ user, stats }: UserRatingCardProps) {
  const rating = user?.rating || 0;
  
  let rankColor = "var(--muted-foreground)";
  let rankTitle = "Unrated";
  if (rating >= 2400) { rankColor = "var(--viz-red)"; rankTitle = "Grandmaster"; }
  else if (rating >= 2000) { rankColor = "var(--viz-amber)"; rankTitle = "Master"; }
  else if (rating >= 1600) { rankColor = "var(--viz-cyan)"; rankTitle = "Expert"; }
  else if (rating >= 1200) { rankColor = "var(--viz-emerald)"; rankTitle = "Pupil"; }
  else if (rating > 0) { rankColor = "var(--viz-slate)"; rankTitle = "Newbie"; }

  const totalSolved = (stats?.user?.solvedEasy || 0) + (stats?.user?.solvedMedium || 0) + (stats?.user?.solvedHard || 0);

  const categoryStats = useMemo(() => stats?.user?.categoryStats || {}, [stats?.user?.categoryStats]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categoryStats)
      .map(([key, val]) => ({ name: key, value: Number(val) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [categoryStats]);

  return (
    <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Col 1: Developer Info (4 cols) */}
      <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--background)] relative shrink-0">
            {user?.image ? (
              <Image src={user.image} alt={user.name || ""} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">{user?.name || "Developer"}</h2>
            <div className="flex items-center gap-2 mt-1.5 justify-center lg:justify-start">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--foreground)]/5 border border-[var(--border)]" style={{ color: rankColor }}>
                {rankTitle}
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">Rating: {rating}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-[var(--border)]" />

        {/* Stats breakdown */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--muted-foreground)] font-medium">Problems Solved</span>
            <span className="font-mono font-bold text-[var(--foreground)]">{totalSolved}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-[var(--foreground)]/5 border border-[var(--border)]">
            {totalSolved > 0 ? (
              <>
                <div className="h-full bg-emerald-500" style={{ width: `${((stats?.user?.solvedEasy || 0) / totalSolved) * 100}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${((stats?.user?.solvedMedium || 0) / totalSolved) * 100}%` }} />
                <div className="h-full bg-red-500" style={{ width: `${((stats?.user?.solvedHard || 0) / totalSolved) * 100}%` }} />
              </>
            ) : (
              <div className="h-full w-full bg-[var(--muted)]" />
            )}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
            <span className="text-emerald-500">{stats?.user?.solvedEasy || 0} Easy</span>
            <span className="text-amber-500">{stats?.user?.solvedMedium || 0} Med</span>
            <span className="text-red-500">{stats?.user?.solvedHard || 0} Hard</span>
          </div>
        </div>
      </div>

      {/* Col 2: Skill Radar Visual (4 cols) */}
      <div className="lg:col-span-4 flex items-center justify-center">
        {stats?.user?.categoryStats ? (
          <SkillRadar stats={stats.user.categoryStats} />
        ) : (
          <div className="text-xs text-[var(--muted-foreground)] font-mono">Radar visualization loading...</div>
        )}
      </div>

      {/* Col 3: Focus & Strengths (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-4">Focus Areas</h3>
          {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[var(--foreground)]">{cat.name}</span>
                    <span className="text-[var(--muted-foreground)] font-mono">{cat.value} solved</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (cat.value / 15) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)] font-mono">Solve problems to build algorithms focus profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
