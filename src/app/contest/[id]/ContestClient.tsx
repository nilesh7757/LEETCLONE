"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, User, AlertTriangle, CheckCircle, Lock, Link as LinkIcon } from "lucide-react"; // Added LinkIcon
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client"; // Import socket.io-client


interface ContestClientProps {
  contest: any;
  isRegistered: boolean;
  userId?: string;
}

export default function ContestClient({ contest, isRegistered: initialIsRegistered, userId }: ContestClientProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [isRegistering, setIsRegistering] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState<"Upcoming" | "Active" | "Ended">("Upcoming");
  const [activeTab, setActiveTab] = useState<"problems" | "leaderboard">("problems");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  // Removed accessCode state
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      // Only fetch if not connected via socket, or for initial load
      if (!socketClient || !socketClient.connected) {
        const { data } = await axios.get(`/api/contest/${contest.id}/leaderboard`);
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
  };

  // Socket.io for real-time leaderboard
  const [socketClient, setSocketClient] = useState<any>(null);

  useEffect(() => {
    const socket = io("http://localhost:3001"); // Connect to your socket.io server

    socket.on("connect", () => {
      console.log("Connected to Socket.io server from ContestClient");
      socket.emit("join_contest", contest.id);
    });

    socket.on("leaderboard_update", (data) => {
      if (data.contestId === contest.id) {
        console.log("Received leaderboard update:", data.leaderboard);
        setLeaderboard(data.leaderboard);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server from ContestClient");
    });

    setSocketClient(socket);

    return () => {
      if (socket) {
        socket.emit("leave_contest", contest.id); // Optional: inform server leaving room
        socket.disconnect();
      }
    };
  }, [contest.id]); // Re-run if contest.id changes


  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      if (now < start) {
        setStatus("Upcoming");
        setTimeLeft(formatDuration(start - now));
      }
      else if (now >= start && now < end) {
        setStatus("Active");
        setTimeLeft(formatDuration(end - now));
      }
      else {
        setStatus("Ended");
        setTimeLeft("Ended");
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [contest]);

  // Anti-cheat: Focus Detection
  useEffect(() => {
    if (status === "Active" && isRegistered) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          toast.warning("Warning: You left the contest page! This has been recorded.", {
            duration: 5000,
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          });
          // TODO: Send this event to the server to flag the user
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, [status, isRegistered]);

  const handleRegister = async () => {
    console.log("Register button clicked. UserId:", userId, "ContestId:", contest.id);

    if (!userId) {
      toast.error("Please login to register");
      router.push("/login");
      return;
    }

    setIsRegistering(true);
    try {
      await axios.post("/api/contest/register", { contestId: contest.id }); // Removed accessCode from payload
      setIsRegistered(true);
      toast.success("Successfully registered for the contest!");
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error(error.response?.data?.error || "Failed to register");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyLink = () => {
    const contestLink = `${window.location.origin}/contest/${contest.id}`;
    navigator.clipboard.writeText(contestLink);
    toast.success("Contest link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <span className={`px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block ${
            status === "Active" ? "bg-green-500/20 text-green-400" :
            status === "Upcoming" ? "bg-blue-500/20 text-blue-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {status === "Active" ? "Live Now" : status}
          </span>
        </motion.div>
        
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            {contest.title}
            <button
                onClick={handleCopyLink}
                className="ml-4 p-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:border-[var(--accent-gradient-to)] transition-all"
                title="Copy Contest Link"
            >
                <LinkIcon className="w-5 h-5" />
            </button>
        </h1>
        <p className="text-[var(--foreground)]/60 max-w-2xl mx-auto mb-8">
          {contest.description}
        </p>

        <div className="flex items-center justify-center gap-8 text-[var(--foreground)]/80">
          <div className="flex flex-col items-center">
            <span className="text-xs text-[var(--foreground)]/50 uppercase tracking-wider">Time Remaining</span>
            <span className="text-2xl font-mono font-bold">{timeLeft}</span>
          </div>
          <div className="w-px h-10 bg-[var(--card-border)]" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-[var(--foreground)]/50 uppercase tracking-wider">Participants</span>
            <span className="text-2xl font-mono font-bold">{contest.registrations?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center justify-center mb-12 relative z-50 pointer-events-auto gap-4">
        {/* Removed accessCode input field */}
        {!isRegistered ? (
          userId ? (
            <button
              type="button"
              onClick={() => {
                console.log("Button element clicked directly");
                handleRegister();
              }}
              disabled={status === "Ended" || isRegistering}
              className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRegistering ? (
                <>
                   <div className="w-5 h-5 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
                   Registering...
                </>
              ) : status === "Ended" ? (
                <>
                  <Lock className="w-5 h-5" /> Contest Ended
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" /> Register for Contest
                </>
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <User className="w-5 h-5" /> Login to Register
            </Link>
          )
        ) : (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/20">
            <CheckCircle className="w-5 h-5" /> You are registered
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "problems" 
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" 
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "leaderboard" 
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" 
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {activeTab === "problems" ? (
      /* Problems List */
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex justify-between items-center">
          <h3 className="font-semibold text-[var(--foreground)]">Problems</h3>
          {!isRegistered && status !== "Ended" && <Lock className="w-4 h-4 text-[var(--foreground)]/40" />}
        </div>

        <div className="divide-y divide-[var(--card-border)]">
          {contest.problems.map((problem: any, index: number) => {
            const isClickable = isRegistered || status === "Ended";
            const rowContent = (
              <div className="p-6 flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className="text-[var(--foreground)]/40 font-mono w-6">{index + 1}.</span>
                  <div>
                    <h4 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent-gradient-to)] transition-colors">
                      {problem.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      problem.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                      problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                {isClickable ? (
                  <div
                    className="px-4 py-2 text-sm border border-[var(--card-border)] rounded-lg group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-colors"
                  >
                    Solve Problem
                  </div>
                ) : (
                  <span className="text-sm text-[var(--foreground)]/40 italic">Register to view</span>
                )}
              </div>
            );

            return isClickable ? (
              <Link key={problem.id} href={`/problems/${problem.slug}?contestId=${contest.id}`}>
                {rowContent}
              </Link>
            ) : (
              <div key={problem.id}>{rowContent}</div>
            );
          })}
        </div>
      </motion.div>
      ) : (
        /* Leaderboard */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[var(--card-border)]">
            <h3 className="font-semibold text-[var(--foreground)]">Standings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-xs text-[var(--foreground)]/50 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Rank</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[var(--foreground)]/40">
                      No participants yet.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr key={entry.user.id} className="hover:bg-[var(--foreground)]/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold ${
                          entry.rank === 1 ? "text-yellow-500" :
                          entry.rank === 2 ? "text-gray-400" :
                          entry.rank === 3 ? "text-amber-700" :
                          "text-[var(--foreground)]/60"
                        }`}>
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <Link href={`/profile/${entry.user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10 overflow-hidden flex items-center justify-center">
                               {entry.user.image ? (
                                   <img src={entry.user.image} alt={entry.user.name} className="w-full h-full object-cover" />
                               ) : (
                                   <User className="w-4 h-4 text-[var(--foreground)]/40" />
                               )}
                            </div>
                            <span className="font-medium text-[var(--foreground)] group-hover:underline">{entry.user.name || "Anonymous"}</span>
                         </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[var(--accent-gradient-to)] font-bold">
                        {entry.score}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms < 0) return "00:00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
