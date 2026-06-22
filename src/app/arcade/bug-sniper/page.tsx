"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Timer, Trophy, RotateCcw, 
  ArrowLeft, Bug, Search, CheckCircle2,
  Crosshair, XCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { Editor } from "@monaco-editor/react";

const BUGS = [
  {
    language: "javascript",
    title: "The Infinite Loop",
    code: `function findElement(arr, target) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === target) return i;
    // Missing increment
  }
  return -1;
}`,
    bugLine: 4,
    hint: "The loop variable never changes.",
    fix: "i++"
  },
  {
    language: "cpp",
    title: "Dangling Reference",
    code: `int* getLocal() {
  int x = 10;
  return &x;
  // Returning address of local variable
}`,
    bugLine: 3,
    hint: "Local variables are destroyed when function returns.",
    fix: "static int x = 10;"
  },
  {
    language: "javascript",
    title: "Equality Mistake",
    code: `function isEven(num) {
  if (num % 2 = 0) {
    return true;
  }
  return false;
}`,
    bugLine: 2,
    hint: "Assignment vs Comparison.",
    fix: "num % 2 === 0"
  },
  {
    language: "javascript",
    title: "Array Indexing",
    code: `function lastElement(arr) {
  return arr[arr.length];
}`,
    bugLine: 2,
    hint: "Arrays are zero-indexed.",
    fix: "arr[arr.length - 1]"
  }
];

export default function BugSniper() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "ENDED">("START");
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setCurrentIdx(0);
    setGameState("PLAYING");
    setSelectedLine(null);
  };

  const endGame = useCallback(async () => {
    setGameState("ENDED");
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      await axios.post("/api/arcade/score", {
        gameId: "BUG_SNIPER",
        score: score
      });
    } catch (error) {
      console.error("Failed to save score", error);
    }
  }, [score]);

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

  const handleLineClick = (line: number) => {
    if (gameState !== "PLAYING") return;
    
    setSelectedLine(line);
    if (line === BUGS[currentIdx].bugLine) {
      setIsCorrect(true);
      setScore(s => s + 50);
      toast.success("BUG_ELIMINATED", { icon: <Crosshair className="text-emerald-500" /> });
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedLine(null);
        if (currentIdx + 1 < BUGS.length) {
          setCurrentIdx(prev => prev + 1);
        } else {
          endGame();
        }
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeLeft(t => Math.max(0, t - 5));
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedLine(null);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col p-6 md:p-12 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        {/* NAV */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <Link href="/arcade" className="p-3 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-all border border-[var(--border)]">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                <Target size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Bug Sniper v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Time_Remaining</div>
                <div className={`text-2xl font-black font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</div>
            </div>
            <div className="w-px h-8 bg-[var(--foreground)]/10" />
            <div className="text-right">
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Eliminations</div>
                <div className="text-2xl font-black font-mono text-emerald-500">{score}</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === "START" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
               <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
                  <div className="w-32 h-32 bg-[var(--card)] border-4 border-red-500/30 rounded-full flex items-center justify-center relative z-10">
                     <Bug size={60} className="text-red-500" />
                  </div>
               </div>
               <div className="space-y-4">
                  <h1 className="text-6xl font-black tracking-tighter uppercase italic">Seek & Destroy</h1>
                  <p className="text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
                    Identify the bug in each code snippet. Click the line containing the error. Precision is rewarded; false positives cost time.
                  </p>
               </div>
               <button 
                onClick={startGame}
                className="group relative px-12 py-5 bg-red-600 text-white font-black uppercase tracking-[0.4em] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all hover:scale-105 active:scale-95"
               >
                 <div className="absolute inset-0 bg-[var(--foreground)]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 <span className="relative flex items-center gap-3">Engage Target <Crosshair size={20} /></span>
               </button>
            </motion.div>
          )}

          {gameState === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden flex-1 relative flex flex-col">
                <div className="px-6 py-4 bg-[var(--card)] border-b border-[var(--border)] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{BUGS[currentIdx].language} {"//"} {BUGS[currentIdx].title}</span>
                    </div>
                    <div className="text-[10px] font-black text-red-500/50 italic tracking-widest">MALFUNCTION_DETECTED</div>
                </div>
                
                <div className="flex-1 relative bg-[var(--card)]">
                   <Editor
                     height="100%"
                     theme="vs-dark"
                     language={BUGS[currentIdx].language}
                     value={BUGS[currentIdx].code}
                     options={{
                       readOnly: true,
                       fontSize: 16,
                       fontFamily: 'JetBrains Mono',
                       minimap: { enabled: false },
                       lineNumbers: 'on',
                       glyphMargin: false,
                       folding: false,
                       lineDecorationsWidth: 0,
                       lineNumbersMinChars: 3,
                       scrollBeyondLastLine: false,
                     }}
                     onMount={(editor) => {
                        editor.onMouseDown((e) => {
                           if (e.target.position) {
                             handleLineClick(e.target.position.lineNumber);
                           }
                        });
                     }}
                   />

                   {/* OVERLAYS FOR FEEDBACK */}
                   <AnimatePresence>
                     {isCorrect === true && (
                       <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center"
                       >
                         <CheckCircle2 size={120} className="text-emerald-500 opacity-20" />
                       </motion.div>
                     )}
                     {isCorrect === false && (
                       <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-500/10 pointer-events-none flex items-center justify-center"
                       >
                         <XCircle size={120} className="text-red-500 opacity-20" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <div className="p-6 bg-[var(--card)] border-t border-[var(--border)] flex gap-4">
                   <div className="p-3 bg-red-500/5 rounded-xl text-red-500">
                      <Search size={18} />
                   </div>
                   <div className="flex-1">
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Intelligence_Report</div>
                      <p className="text-sm font-medium text-[var(--muted-foreground)] italic">{BUGS[currentIdx].hint}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "ENDED" && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
               <Trophy size={80} className="text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
               <div className="space-y-4">
                  <h1 className="text-6xl font-black tracking-tighter uppercase">Extraction Complete</h1>
                  <p className="text-[var(--muted-foreground)] text-lg font-medium">Final Score: <span className="text-[var(--foreground)] font-black">{score} AP</span></p>
               </div>
               <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                  <button 
                    onClick={startGame}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                  >
                    <RotateCcw size={18} /> Restart Operation
                  </button>
                  <Link href="/arcade" className="w-full py-4 bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--foreground)]/10 transition-all flex items-center justify-center gap-3">
                    Back to Command Center
                  </Link>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AMBIENT EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan { animation: scan 4s linear infinite; }
      `}</style>
    </div>
  );
}
