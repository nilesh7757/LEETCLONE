"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Binary, Database, Trophy, Cpu, Search, LayoutGrid
} from "lucide-react";

interface SieveStep {
  primes: boolean[];
  currentP: number | null;
  currentMultiple: number | null;
  message: string;
  step: "INIT" | "FOUND_PRIME" | "ELIMINATE" | "COMPLETE";
}

export default function SieveVisualizer({ speed = 400 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const limit = 50;
  const history = useMemo(() => {
    const steps: SieveStep[] = [];
    const isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    steps.push({
      primes: [...isPrime],
      currentP: null,
      currentMultiple: null,
      message: "Initializing Sieve of Eratosthenes. 0 and 1 are not prime.",
      step: "INIT"
    });

    for (let p = 2; p * p <= limit; p++) {
      if (isPrime[p]) {
        steps.push({
          primes: [...isPrime],
          currentP: p,
          currentMultiple: null,
          message: `Found prime ${p}. Eliminating all its multiples starting from ${p * p}.`,
          step: "FOUND_PRIME"
        });

        for (let i = p * p; i <= limit; i += p) {
          if (isPrime[i]) {
            isPrime[i] = false;
            steps.push({
              primes: [...isPrime],
              currentP: p,
              currentMultiple: i,
              message: `Marking ${i} as composite (multiple of ${p}).`,
              step: "ELIMINATE"
            });
          }
        }
      }
    }

    steps.push({
      primes: [...isPrime],
      currentP: null,
      currentMultiple: null,
      message: "Sieve Protocol Complete. Remaining values are primes.",
      step: "COMPLETE"
    });

    return steps;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentIndex(p => {
          if (p >= history.length - 1) { setIsPlaying(false); return p; }
          return p + 1;
        });
      }, speed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0];

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar relative flex flex-col min-h-[350px] md:min-h-[550px] w-full">
        <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)]">
                    <Binary size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Sieve of Eratosthenes</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Number Theory Prime Extraction</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => { setCurrentIndex(0); setIsPlaying(false); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-cyan)] text-black hover:scale-105"}`}>
                    {isPlaying ? "PAUSE" : "RUN"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            <div className="lg:col-span-12 relative p-3 md:p-6 bg-muted/30 rounded-[2rem] flex flex-wrap gap-2 items-center justify-center">
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md rounded-full shadow-sm border border-border/50">
                        <Zap size={12} className="text-[var(--viz-cyan)]" fill="var(--viz-cyan)" />
                        <span className="text-[9px] font-black font-mono text-[var(--viz-cyan)] uppercase tracking-widest">{currentStep.step}</span>
                    </div>
                </div>

                {currentStep.primes.map((isP: boolean, i: number) => {
                    const isCurrentP = currentStep.currentP === i;
                    const isMultiple = currentStep.currentMultiple === i;
                    
                    return (
                        <motion.div
                            key={i}
                            animate={{ 
                                scale: (isCurrentP || isMultiple) ? 1.2 : 1,
                                opacity: isP || isCurrentP ? 1 : 0.3,
                                borderColor: isCurrentP ? "var(--viz-cyan)" : isMultiple ? "var(--viz-rose)" : "var(--border)",
                                backgroundColor: isCurrentP ? "var(--viz-cyan)22" : isMultiple ? "var(--viz-rose)22" : "var(--card)"
                            }}
                            className="w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-sm relative"
                        >
                            <span className="text-xs font-black font-mono">{i}</span>
                            {!isP && i > 1 && !isCurrentP && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-0.5 bg-rose-500/40 rotate-45" />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>

        <div className="mt-4 p-3 md:p-6 bg-muted/30 rounded-[2.5rem] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Sieve Progress</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentIndex(Math.min(history.length - 1, currentIndex + 1))} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="text-center text-[11px] font-mono text-[var(--viz-amber)] bg-card/50 py-2 rounded-xl border border-border/50">
                {currentStep.message}
            </div>
        </div>
      </div>
    </div>
  );
}


