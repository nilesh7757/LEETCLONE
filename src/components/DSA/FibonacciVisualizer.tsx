"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, ChevronRight } from "lucide-react";

export default function FibonacciVisualizer({ speed = 500 }: { speed?: number }) {
  const [n, setN] = useState(8);
  const [dp, setDp] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const init = () => {
    setDp(new Array(n + 1).fill(null));
    setCurrentIndex(-1);
    setIsAutoPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    init();
  }, [n]);

  const stepForward = () => {
    if (currentIndex >= n) {
      setIsAutoPlaying(false);
      return;
    }

    const nextIdx = currentIndex + 1;
    setDp((prev) => {
      const nextDp = [...prev];
      if (nextIdx === 0) nextDp[0] = 0;
      else if (nextIdx === 1) nextDp[1] = 1;
      else {
        nextDp[nextIdx] = (nextDp[nextIdx - 1] ?? 0) + (nextDp[nextIdx - 2] ?? 0);
      }
      return nextDp;
    });
    setCurrentIndex(nextIdx);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        if (currentIndex < n) {
          stepForward();
        } else {
          setIsAutoPlaying(false);
        }
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAutoPlaying, currentIndex, n, speed]);

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Fibonacci DP</h2>
          <p className="text-sm text-[var(--foreground)]/60">Bottom-Up Tabulation</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 mb-1">N (MAX 15)</span>
              <input 
                type="number" 
                value={n} 
                onChange={(e) => setN(Math.min(15, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm"
              />
           </div>
           <div className="flex gap-2 h-10 mt-5">
              <button onClick={init} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg"><RotateCcw size={18}/></button>
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)} 
                className={`flex items-center gap-2 px-4 rounded-lg font-bold text-xs ${isAutoPlaying ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500 text-white'}`}
              >
                {isAutoPlaying ? <Pause size={14}/> : <Play size={14}/>}
                {isAutoPlaying ? "PAUSE" : "PLAY"}
              </button>
              <button 
                onClick={stepForward} 
                disabled={isAutoPlaying || currentIndex >= n}
                className="p-2 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg disabled:opacity-30"
              >
                <SkipForward size={18}/>
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {dp.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--foreground)]/30">dp[{i}]</span>
            <motion.div
              initial={false}
              animate={{ 
                scale: currentIndex === i ? 1.1 : 1,
                borderColor: currentIndex === i ? "#3b82f6" : val !== null ? "#10b981" : "var(--card-border)",
                backgroundColor: currentIndex === i ? "rgba(59, 130, 246, 0.1)" : "transparent"
              }}
              className="w-12 h-12 border-2 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
            >
              {val ?? "?"}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] font-mono text-xs">
        <div className="text-blue-400 mb-2">// Recurrence Relation</div>
        <div className="flex items-center gap-2">
          <span className={currentIndex > 1 ? "text-green-500 font-bold" : "text-[var(--foreground)]/40"}>
            dp[i] = dp[i-1] + dp[i-2]
          </span>
          <AnimatePresence>
            {currentIndex > 1 && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-blue-500"
              >
                <ChevronRight size={14} className="inline"/> {dp[currentIndex-1]} + {dp[currentIndex-2]} = {dp[currentIndex]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}