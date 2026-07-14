"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RotateCcw, Target, Sparkles, 
  HelpCircle, ChevronRight, CheckCircle2, Award, Info
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

export default function BinaryGuessGame() {
  const [targetNum, setTargetNum] = useState(0);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);
  const [guessVal, setGuessVal] = useState("");
  const [attempts, setAttempts] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"HIGH" | "LOW" | "CORRECT" | null>(null);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "ENDED">("START");
  const [score, setScore] = useState(0);

  const initGame = () => {
    setTargetNum(Math.floor(Math.random() * 100) + 1);
    setMinRange(1);
    setMaxRange(100);
    setAttempts([]);
    setGuessVal("");
    setFeedback(null);
    setGameState("PLAYING");
  };

  const handleGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (gameState !== "PLAYING") return;

    const parsed = parseInt(guessVal);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      toast.error("Please enter a valid number between 1 and 100");
      return;
    }

    if (attempts.includes(parsed)) {
      toast.error("You already guessed that number!");
      return;
    }

    const newAttempts = [...attempts, parsed];
    setAttempts(newAttempts);
    setGuessVal("");

    if (parsed === targetNum) {
      setFeedback("CORRECT");
      const optimalLimit = 7;
      const count = newAttempts.length;
      
      // Points calculation: Optimal is <= 7 guesses (O(log N) complexity)
      let finalScore = 0;
      if (count <= optimalLimit) {
        finalScore = 100 - (count - 1) * 10; // 100 max, decrements slightly
      } else {
        finalScore = Math.max(10, 50 - (count - optimalLimit) * 5); // penalty for sub-optimal
      }

      setScore(finalScore);
      setGameState("ENDED");
      
      // Save score to DB
      axios.post("/api/arcade/score", {
        gameId: "BINARY_GUESS",
        score: finalScore
      }).then(() => {
        toast.success(`Optimal search confirmed! +${Math.floor(finalScore / 10)} AP`);
      }).catch(err => {
        console.error("Score save error", err);
      });

    } else if (parsed > targetNum) {
      setFeedback("HIGH");
      setMaxRange(prev => Math.min(prev, parsed - 1));
      setTimeout(() => setFeedback(null), 800);
    } else {
      setFeedback("LOW");
      setMinRange(prev => Math.max(prev, parsed + 1));
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/arcade" className="p-3 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Target size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">O(log N) Searcher</span>
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {gameState === "START" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <Target size={80} className="text-emerald-400 relative z-10 mx-auto" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase">Binary Node Guess</h1>
                <p className="text-[var(--muted-foreground)] font-medium max-w-sm mx-auto leading-relaxed text-sm">
                  We&apos;ve hidden a target value between <strong>1 and 100</strong>. Can you locate it in <strong>7 guesses or fewer</strong> using optimal binary search?
                </p>
                <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-2xl text-xs text-[var(--muted-foreground)] flex items-start gap-3 max-w-sm mx-auto text-left">
                  <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Optimal Binary Search halves the range each step. 7 guesses is the mathematical maximum limit needed to find any number up to 100 ($2^7 = 128$).</span>
                </div>
              </div>
              <button 
                onClick={initGame}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Launch Search
              </button>
            </motion.div>
          )}

          {gameState === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Range Board */}
              <div className="p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] text-center relative overflow-hidden">
                <div className="absolute top-2 left-4 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Current Search Boundaries</div>
                <div className="flex justify-center items-center gap-8 py-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[var(--muted-foreground)]/60 uppercase">Min</span>
                    <div className="text-5xl font-black font-mono text-blue-400">{minRange}</div>
                  </div>
                  <div className="h-8 w-[2px] bg-[var(--border)]" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[var(--muted-foreground)]/60 uppercase">Max</span>
                    <div className="text-5xl font-black font-mono text-red-400">{maxRange}</div>
                  </div>
                </div>
              </div>

              {/* Guesses Status */}
              <div className="flex justify-between items-center px-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Attempts</span>
                  <div className="text-2xl font-black font-mono">{attempts.length} <span className="text-xs text-[var(--muted-foreground)]/60">/ 7 Limit</span></div>
                </div>
                <div className="flex gap-1.5 max-w-[60%] flex-wrap justify-end">
                  {attempts.map((att, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg text-xs font-bold font-mono text-[var(--muted-foreground)]">
                      {att}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleGuess} className="flex gap-4">
                <input 
                  type="number"
                  value={guessVal}
                  onChange={(e) => setGuessVal(e.target.value)}
                  placeholder="Enter guess (1-100)..."
                  min={minRange}
                  max={maxRange}
                  className="flex-1 px-6 py-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-lg font-black font-mono outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!guessVal}
                  className="px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Guess <ChevronRight size={16} />
                </button>
              </form>

              {/* Feedback Message */}
              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {feedback === "HIGH" && (
                    <motion.div key="high" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 font-bold uppercase tracking-widest text-sm">
                      ▼ Too High! Lower your query boundary.
                    </motion.div>
                  )}
                  {feedback === "LOW" && (
                    <motion.div key="low" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-blue-400 font-bold uppercase tracking-widest text-sm">
                      ▲ Too Low! Elevate your query boundary.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {gameState === "ENDED" && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-10"
            >
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full" />
                  <Award size={72} className="text-emerald-400 relative z-10 mx-auto" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Target Located!</h1>
                <p className="text-[var(--muted-foreground)] font-medium">The target node value was indeed <span className="text-emerald-400 font-bold text-lg font-mono">{targetNum}</span>.</p>
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                <div className="p-6 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Total Guesses</div>
                  <div className="text-4xl font-black font-mono">{attempts.length}</div>
                </div>
                <div className="p-6 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">AP Earned</div>
                  <div className="text-4xl font-black font-mono text-emerald-500">+{Math.floor(score / 10)} AP</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl max-w-sm mx-auto text-xs text-emerald-400 font-medium">
                {attempts.length <= 7 
                  ? "🎉 Amazing! You maintained an O(log N) search complexity successfully!" 
                  : "💡 Try to select the exact midpoint of your active range next time to guarantee O(log N) performance!"
                }
              </div>

              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={initGame}
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Re-Initialize
                </button>
                <Link 
                  href="/arcade"
                  className="px-8 py-4 bg-[var(--foreground)]/5 text-[var(--foreground)] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--foreground)]/10 transition-all text-xs"
                >
                  Return to Arcade Hub
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
