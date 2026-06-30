"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RotateCcw, Keyboard, Sparkles, 
  ChevronRight, Trophy, Zap, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

const SNIPPETS = [
  "while (left <= right) {\n  const mid = Math.floor((left + right) / 2);\n  if (arr[mid] === target) return mid;\n}",
  "const memo = new Map();\nconst fib = (n) => {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n}",
  "const reverseList = (head) => {\n  let prev = null, curr = head;\n  while (curr) {\n    let next = curr.next;\n    curr.next = prev;\n  }\n}",
  "const dfs = (node) => {\n  if (!node || visited.has(node)) return;\n  visited.add(node);\n  for (const neighbor of node.neighbors) dfs(neighbor);\n}"
];

export default function CodeTyperGame() {
  const [snippet, setSnippet] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "ENDED">("START");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorsCount, setErrorsCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initGame = () => {
    const randomIdx = Math.floor(Math.random() * SNIPPETS.length);
    setSnippet(SNIPPETS[randomIdx]);
    setInputVal("");
    setErrorsCount(0);
    setAccuracy(100);
    setWpm(0);
    setGameState("PLAYING");
    setStartTime(Date.now());
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputVal(val);

    // Calculate accuracy & errors
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== snippet[i]) {
        errors++;
      }
    }
    setErrorsCount(errors);
    const acc = Math.max(0, Math.round(((val.length - errors) / Math.max(1, val.length)) * 100));
    setAccuracy(acc);

    // Check game end conditions
    if (val === snippet) {
      const now = Date.now();
      setEndTime(now);
      setGameState("ENDED");

      // Calculate final stats
      const timeInMinutes = (now - startTime) / 60000;
      const calculatedWpm = Math.round((snippet.split(" ").length) / timeInMinutes);
      setWpm(calculatedWpm);

      // Points: combination of WPM and accuracy
      const finalScore = Math.min(100, Math.round((calculatedWpm * 0.8) + (acc * 0.2)));
      
      // Save score
      axios.post("/api/arcade/score", {
        gameId: "CODE_TYPER",
        score: finalScore
      }).then(() => {
        toast.success(`Speed typing completed! WPM: ${calculatedWpm} | +${Math.floor(finalScore / 10)} AP`);
      }).catch(err => {
        console.error("Score save error", err);
      });
    }
  };

  const renderSnippet = () => {
    return snippet.split("").map((char, index) => {
      let color = "text-[var(--foreground)]/40";
      let isCursor = index === inputVal.length;

      if (index < inputVal.length) {
        color = inputVal[index] === char ? "text-emerald-400 font-bold" : "text-red-400 bg-red-400/10 font-bold underline";
      }

      return (
        <span key={index} className={`relative ${color} font-mono text-sm leading-relaxed transition-all`}>
          {isCursor && (
            <motion.span 
              layoutId="cursor"
              className="absolute left-0 bottom-0 top-0 w-[2px] bg-purple-500 animate-pulse"
              transition={{ duration: 0.1 }}
            />
          )}
          {char === "\n" ? <br /> : char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-25%] right-[-25%] w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[-25%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/arcade" className="p-3 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Keyboard size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Syntax Racer</span>
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
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <Keyboard size={80} className="text-purple-400 relative z-10 mx-auto" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase">Syntax Racer</h1>
                <p className="text-[var(--muted-foreground)] font-medium max-w-sm mx-auto leading-relaxed text-sm">
                  Warm up your fingers for coding! Type the programming syntax snippet correctly and cleanly as fast as possible to verify your WPM (Words Per Minute).
                </p>
              </div>
              <button 
                onClick={initGame}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                Start Race
              </button>
            </motion.div>
          )}

          {gameState === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Display Board */}
              <div className="p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] relative overflow-hidden select-none min-h-[160px] flex items-center justify-start text-left">
                <div className="absolute top-2 left-4 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Target Syntax Snippet</div>
                <div className="font-mono text-sm tracking-wide w-full break-all whitespace-pre-wrap">
                  {renderSnippet()}
                </div>
              </div>

              {/* Live Metrics */}
              <div className="flex justify-between items-center px-4">
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Accuracy</span>
                    <div className={`text-xl font-black font-mono ${accuracy < 90 ? 'text-red-400' : 'text-emerald-400'}`}>{accuracy}%</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Errors</span>
                    <div className="text-xl font-black font-mono text-[var(--foreground)]">{errorsCount}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-[var(--muted-foreground)]/60 animate-pulse">
                  ⌨️ Keep typing...
                </div>
              </div>

              {/* Hidden/Transparent Textarea for typing */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputVal}
                  onChange={handleInputChange}
                  placeholder="Focus here and type the code above..."
                  className="w-full h-32 p-4 bg-[var(--card)]/10 border border-[var(--border)] rounded-2xl font-mono text-sm text-[var(--foreground)] focus:border-purple-500/40 outline-none resize-none transition-all shadow-inner"
                  style={{ caretColor: 'transparent' }}
                  spellCheck="false"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                />
                {/* Warning message if there are active errors */}
                {errorsCount > 0 && (
                  <div className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle size={12} /> Correct the spelling errors to advance!
                  </div>
                )}
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
                  <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full" />
                  <Trophy size={72} className="text-purple-400 relative z-10 mx-auto" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Race Completed!</h1>
                <p className="text-[var(--muted-foreground)] font-medium">Your typing metrics have been successfully calibrated.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="p-5 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">WPM</div>
                  <div className="text-3xl font-black font-mono text-purple-400">{wpm}</div>
                </div>
                <div className="p-5 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Accuracy</div>
                  <div className="text-3xl font-black font-mono text-emerald-400">{accuracy}%</div>
                </div>
                <div className="p-5 bg-[var(--foreground)]/5 rounded-3xl border border-[var(--border)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">AP Reward</div>
                  <div className="text-3xl font-black font-mono text-amber-400">+{Math.floor((wpm * 0.8 + accuracy * 0.2) / 10)} AP</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={initGame}
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Racer Restart
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
