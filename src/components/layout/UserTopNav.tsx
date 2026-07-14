"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import NotificationBell from "../ui/NotificationBell";
import StreakWidget from "./StreakWidget";

export default function UserTopNav() {
  const { status } = useSession();
  const [dailySlug, setDailySlug] = useState<string>("");

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
          className="hover:scale-105 transition-transform duration-200"
        >
          <StreakWidget />
        </Link>
      )}

      <div className="h-8 w-[1px] bg-[var(--border)] hidden sm:block" />

      <div className="flex items-center gap-3">
        {status === "authenticated" && <NotificationBell />}
        <ThemeToggle />
      </div>
    </div>
  );
}