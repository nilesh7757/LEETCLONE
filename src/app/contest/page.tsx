"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Clock, User, Trophy } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "Upcoming" | "Active" | "Ended";
  participantsCount: number;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  problems: {
    id: string;
    title: string;
    difficulty: string;
  }[];
}

export default function ContestListPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axios.get("/api/contest");
        setContests(data.contests);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
        toast.error("Failed to load contests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">Contests</h1>
          {session?.user && ( // Only show "Create Contest" button if logged in
            <Link
              href="/contest/create"
              className="px-6 py-3 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Create Contest
            </Link>
          )}
        </div>

        {contests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20 text-[var(--foreground)]/60 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-xl"
          >
            <Trophy className="w-12 h-12 text-[var(--foreground)]/40 mx-auto mb-4" />
            <p className="text-lg">No contests found. Be the first to create one!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <Link href={`/contest/${contest.id}`} className="absolute inset-0 z-0" aria-label={`View ${contest.title}`} />
                <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md backdrop-blur-sm flex flex-col justify-between h-full group-hover:border-[var(--foreground)]/20 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-[var(--foreground)]">
                        {contest.title}
                      </h2>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contest.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : contest.status === "Upcoming"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {contest.status}
                      </span>
                    </div>
                    <p className="text-[var(--foreground)]/70 text-sm mb-4 line-clamp-2">
                      {contest.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/60 mb-2 relative z-10">
                      <User className="w-3 h-3" />
                      <span>Created by: </span>
                      <Link 
                        href={`/profile/${contest.creator?.id}`} 
                        className="hover:underline text-[var(--foreground)] hover:text-[var(--accent-gradient-to)] transition-colors"
                      >
                        {contest.creator?.name || "Anonymous"}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/60 mb-4">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(contest.startTime).toLocaleString()} -{" "}
                        {new Date(contest.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--foreground)]/80 mb-4">
                      Problems: {contest.problems.length}
                      {contest.problems.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-[var(--foreground)]/70 mt-1">
                          {contest.problems.map((p) => (
                            <li key={p.id}>{p.title} ({p.difficulty})</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center border-t border-[var(--card-border)] pt-4 relative z-10">
                    <span className="text-sm text-[var(--foreground)]/80 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {contest.participantsCount} Participants
                    </span>
                    <div
                      className="px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {contest.status === "Upcoming" && "Register"}
                      {contest.status === "Active" && "Join Contest"}
                      {contest.status === "Ended" && "View Results"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center space-x-2 text-[var(--foreground)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-2 border-[var(--foreground)]/50 border-t-[var(--foreground)] rounded-full"
      />
      <span>Loading contests...</span>
    </div>
  );
}
