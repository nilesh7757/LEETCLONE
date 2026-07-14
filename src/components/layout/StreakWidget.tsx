"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function StreakWidget() {
  const [streakData, setStreakData] = useState<{ streak: number; solvedToday: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/user/streak")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch streak");
        return res.json();
      })
      .then((data) => {
        setStreakData({
          streak: data.streak || 0,
          solvedToday: !!data.solvedToday,
        });
      })
      .catch((err) => {
        console.error("Error loading streak:", err);
      });
  }, []);

  if (!streakData) return null;

  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-full transition-all duration-350 cursor-default select-none"
      title={
        streakData.solvedToday 
          ? `Streak active! Day ${streakData.streak} completed.` 
          : "Solve a challenge today to continue your streak!"
      }
    >
      <Flame 
        size={14} 
        className={`transition-all duration-350 ${
          streakData.solvedToday 
            ? "text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" 
            : "text-[var(--muted-foreground)]"
        }`} 
      />
      <span className="text-[11px] font-mono font-bold leading-none text-[var(--foreground)]">
        {streakData.streak}
      </span>
    </div>
  );
}
