"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Timer, Trophy, RotateCcw, 
  ArrowLeft, ChevronRight, CheckCircle2, XCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

const CHALLENGES = [
  { algorithm: "Binary Search", complexity: "O(log N)" },
  { algorithm: "Merge Sort", complexity: "O(N log N)" },
  { algorithm: "Quick Sort (Average)", complexity: "O(N log N)" },
  { algorithm: "Bubble Sort", complexity: "O(N²)" },
  { algorithm: "Hash Table Lookup", complexity: "O(1)" },
  { algorithm: "Array Access", complexity: "O(1)" },
  { algorithm: "Dijkstra (Matrix)", complexity: "O(V²)" },
  { algorithm: "Recursive Fibonacci", complexity: "O(2^N)" },
  { algorithm: "Linear Search", complexity: "O(N)" },
  { algorithm: "N-Queens", complexity: "O(N!)" },
  { algorithm: "DFS (Adjacency List)", complexity: "O(V + E)" },
  { algorithm: "BFS (Adjacency List)", complexity: "O(V + E)" },
  { algorithm: "Heap Push/Pop", complexity: "O(log N)" },
  { algorithm: "Matrix Multiplication (Naive)", complexity: "O(N³)" },
  { algorithm: "Traveling Salesman (DP)", complexity: "O(N² 2^N)" }
];

const OPTIONS = ["O(1)", "O(log N)", "O(N)", "O(N log N)", "O(N²)", "O(V + E)", "O(2^N)", "O(N!)"];

export default function BigOBlitz() {
  const [challenges, setChallenges] = useState<typeof CHALLENGES>(CHALLENGES);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "ENDED">("START");
  const [feedback, setFeedback] = useState<"CORRECT" | "WRONG" | null>(null);
  const [highScore, setScoreState] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAiChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/arcade/generate", { gameId: "BLITZ" });
      if (res.data && Array.isArray(res.data.challenges) && res.data.challenges.length > 0) {
        setChallenges(res.data.challenges);
        setIsAiGenerated(true);
      }
    } catch (err) {
      console.warn("Bypassed AI question generation, using local cache", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAiChallenges();
  }, [fetchAiChallenges]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setCurrentIdx(0);
    setGameState("PLAYING");
  };

  const endGame = useCallback(async () => {
    setGameState("ENDED");
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      await axios.post("/api/arcade/score", {
        gameId: "BLITZ",
        score: score
      });
      toast.success("Score recorded!");
    } catch (error) {
      console.error("Failed to save score", error);
    }

    // Pre-fetch a fresh batch of challenges in the background for the next run
    void fetchAiChallenges();
  }, [score, fetchAiChallenges]);

  useEffect(() => {
    if (gameState === "PLAYING" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeout(() => {
        void endGame();
      }, 0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, timeLeft, endGame]);

  const handleAnswer = (option: string) => {
    if (gameState !== "PLAYING") return;

    if (option === challenges[currentIdx]?.complexity) {
      setScore(s => s + 10);
      setFeedback("CORRECT");
      setTimeout(() => {
        setFeedback(null);
        setCurrentIdx((prev) => (prev + 1) % challenges.length);
      }, 300);
    } else {
      setTimeLeft(t => Math.max(0, t - 3));
      setFeedback("WRONG");
      setTimeout(() => setFeedback(null), 300);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        feedback === 'CORRECT' ? 'bg-emerald-500/5' : feedback === 'WRONG' ? 'bg-red-500/5' : ''
      }`} />

      <div className="max-w-xl w-full relative z-10">
        {/* NAV */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/arcade" className="p-3 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
                <Zap size={18} fill="currentColor" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Big-O Blitz</span>
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {gameState === "START" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full" />
                 <Zap size={80} className="text-amber-400 relative z-10 mx-auto" fill="currentColor" />
              </div>
              <div>
                {isAiGenerated && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-purple-400 font-bold uppercase tracking-widest animate-pulse mb-3">
                    <Sparkles size={14} /> AI-Generated Session
                  </div>
                )}
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Ready for a Speedrun?</h1>
                <p className="text-[var(--muted-foreground)] font-medium max-w-sm mx-auto leading-relaxed">
                  Match 15 algorithms with their Big-O complexity. Each wrong answer costs 3 seconds!
                </p>
              </div>
              <button 
                onClick={startGame}
                disabled={isLoading}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {isLoading ? "Generating Mission..." : "Start Mission"}
              </button>
            </motion.div>
          )}

          {gameState === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Current Score</div>
                    <div className="text-5xl font-black font-mono">{score}</div>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                       <Timer size={14} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : ''} /> Time Registry
                    </div>
                    <div className={`text-5xl font-black font-mono ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                       00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-white'}`} 
                />
              </div>

              <motion.div 
                key={currentIdx}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-12 rounded-[3rem] bg-[var(--card)] border-2 text-center transition-all duration-300 ${
                    feedback === 'CORRECT' ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 
                    feedback === 'WRONG' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-shake' : 
                    'border-[var(--border)]'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-4">Challenge Node</div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{challenges[currentIdx]?.algorithm}</h2>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--foreground)]/10 transition-all text-sm font-black font-mono active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === "ENDED" && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <Trophy size={64} className="text-amber-400 mx-auto" />
                <h1 className="text-5xl font-black tracking-tighter uppercase">Mission Terminated</h1>
                <p className="text-[var(--muted-foreground)] font-medium">Session successfully synced to the mainframe.</p>
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                 <div className="p-6 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Final Score</div>
                    <div className="text-4xl font-black font-mono">{score}</div>
                 </div>
                 <div className="p-6 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Reward</div>
                    <div className="text-4xl font-black font-mono text-emerald-500">+{Math.floor(score/10)}</div>
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={startGame}
                  className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw size={20} /> Re-Initialize
                </button>
                <Link 
                  href="/arcade"
                  className="px-12 py-5 bg-[var(--foreground)]/5 text-[var(--foreground)] font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-[var(--foreground)]/10 transition-all"
                >
                  Return to Hub
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
