"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import NotificationBell from "../ui/NotificationBell";
import { motion } from "framer-motion";

export default function UserTopNav() {
  const { data: session, status } = useSession();
  const [dailySlug, setDailySlug] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [solvedToday, setSolvedToday] = useState<boolean>(false);

  useEffect(() => {
    const fetchStreak = async () => {
      if (status === "authenticated") {
        try {
          const { data } = await axios.get("/api/profile/streak");
          setStreak(data.streak);
          setSolvedToday(data.solvedToday);
        } catch (error) {
          console.error("Failed to fetch streak", error);
        }
      }
    };
    fetchStreak();
  }, [status]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const { data } = await axios.get("/api/problems/daily");
        if (data.problem?.slug) {
          setDailySlug(data.problem.slug);
        }
      } catch (error) {
        console.error("Failed to fetch daily problem", error);
      }
    };
    fetchDaily();
  }, []);

  return (
    <div className="flex items-center gap-3 sm:gap-6 p-4 md:p-6 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-auto">
      {status === "authenticated" && (
        <Link
          href={dailySlug ? `/problems/${dailySlug}` : "/problems"}
          className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--foreground)]/5"
        >
          <div className={`relative flex items-center justify-center transition-all duration-500 ${solvedToday ? "text-[var(--viz-gold)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"}`}>
             <Flame className={`w-5 h-5 ${solvedToday ? "fill-[var(--viz-gold)] drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"}`} />
          </div>
          <span className={`text-sm font-bold font-mono transition-colors ${solvedToday ? "text-[var(--viz-gold)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"}`}>
            {streak}
          </span>
        </Link>
      )}

      <div className="h-8 w-[1px] bg-[var(--border)] hidden sm:block" />

      <div className="flex items-center gap-3">
        {status === "authenticated" && <NotificationBell />}
        <ThemeToggle direction="down" />
      </div>
    </div>
  );
}