"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Flame } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import NotificationBell from "../ui/NotificationBell";

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
    <div className="flex items-center gap-2 sm:gap-4 p-4">
      {status === "authenticated" && (
        <Link
          href={dailySlug ? `/problems/${dailySlug}` : "/problems"}
          className={`flex items-center gap-2 px-2 py-1.5 transition-all duration-300 ${
            solvedToday
              ? "text-orange-600 dark:text-orange-400"
              : "text-[var(--foreground)]/60"
          }`}
        >
          <Flame
            className={`w-5 h-5 ${
              solvedToday ? "fill-orange-500 text-orange-500" : ""
            }`}
          />
          <span className="text-sm font-bold">{streak}</span>
        </Link>
      )}

      <div className="flex items-center gap-2">
        {status === "authenticated" && <NotificationBell />}
        <ThemeToggle direction="down" />
      </div>
    </div>
  );
}
