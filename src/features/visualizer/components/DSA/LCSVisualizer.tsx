"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, ChevronLeft, ChevronRight, Zap, 
  Type, Database, Trophy, Cpu, Plus, CornerRightDown, ArrowUpLeft
} from "lucide-react";

/**
 * --- Configuration ---
 */
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-cyan)",
  green: "var(--viz-deep-purple)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-purple)",
  muted: "rgba(255,255,255,0.1)"
};

const STR1 = "BATMAN";
const STR2 = "CATWOMAN";

interface DPStep {
  dp: number[][];
  i: number; 
  j: number;  
  message: string;
  step: string;
  activeLine: number; 
  decision: "MATCH" | "MISMATCH" | "NONE";
  dependencies: [number, number][]; 
  logs: string[];
}

export default function LCSVisualizer({ speed = 800 }: { speed?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [s1, setS1] = useState(STR1);
  const [s2, setS2] = useState(STR2);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const history = useMemo(() => {
    const m = s1.length;
    const n = s2.length;
    const steps: DPStep[] = [];
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    let logs: string[] = [];

    const record = (msg: string, step: string, i: number, j: number, line: number, dec: DPStep['decision'], deps: [number, number][]) => {
      steps.push({
        dp: dp.map(r => [...r]),
        i: i,
        j: j,
        message: msg,
        step: step,
        activeLine: line,
        decision: dec,
        dependencies: deps,
        logs: [...logs]
      });
    };

    const addLog = (l: string) => { logs = [l, ...logs]; };

    addLog("Initializing DP Tensor (LCS Grid).");
    record("Initializing DP table. Row 0 and Col 0 are 0.", "INIT", 0, 0, 0, "NONE", []);

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        addLog(`Comparing '${s1[i-1]}' (S1[${i-1}]) with '${s2[j-1]}' (S2[${j-1}]).`);
        record(`Evaluating cell [${i}, ${j}]...`, "EVALUATE", i, j, 1, "NONE", []);

        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = 1 + dp[i-1][j-1];
          addLog(`Characters match! Adding 1 to diagonal: ${dp[i][j]}.`);
          record(`Match found: '${s1[i-1]}'. Inherit diagonal + 1.`, "COMMIT_MATCH", i, j, 2, "MATCH", [[i-1, j-1]]);
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
          addLog(`Mismatch. Taking Max(Top: ${dp[i-1][j]}, Left: ${dp[i][j-1]}).`);
          record(`Mismatch. Inherit maximum from top or left.`, "COMMIT_MISMATCH", i, j, 3, "MISMATCH", [[i-1, j], [i, j-1]]);
        }
      }
    }

    addLog(`Optimal LCS Length: ${dp[m][n]}.`);
    record(`DP Complete. LCS length is ${dp[m][n]}.`, "COMPLETE", m, n, -1, "NONE", []);

    return steps;
  }, [s1, s2]);

  // --- Playback Engine ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || { 
    dp: Array.from({ length: s1.length + 1 }, () => new Array(s2.length + 1).fill(0)),
    i: 0,
    j: 0,
    message: "Initializing Protocol...",
    step: "BOOT",
    activeLine: 0,
    decision: "NONE",
    dependencies: [],
    logs: []
  };

  const generateNewStrings = () => {
    const chars = "ABCDE";
    const getRandomStr = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setS1(getRandomStr(6));
    setS2(getRandomStr(7));
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="p-4 md:p-8 bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--viz-cyan)]/10 rounded-xl text-[var(--viz-cyan)]">
                    <Type size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Longest Common Subsequence</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">DP Matrix Manifold</p>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={generateNewStrings} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"><RotateCcw size={18}/></button>
             <button 
                onClick={() => { if (currentIndex >= history.length - 1) setCurrentIndex(0); setIsPlaying(!isPlaying); }} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${isPlaying ? "bg-muted text-foreground" : "bg-[var(--viz-cyan)] text-black hover:scale-105"}`}
             >
                {isPlaying ? <><Pause size={16} fill="currentColor"/> PAUSE</> : <><Play size={16} fill="currentColor"/> RUN</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative p-6 bg-muted/30 rounded-[2rem]  overflow-hidden shadow-inner flex flex-col items-center">
                <div className="absolute top-6 left-6 z-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentStep.step}
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-card/80  backdrop-blur-md rounded-full shadow-sm"
                        >
                            <Zap size={12} className="text-[var(--viz-cyan)]" fill="var(--viz-cyan)" />
                            <span className="text-[9px] font-black font-mono text-[var(--viz-cyan)] uppercase tracking-widest">{currentStep.step}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="relative z-10 w-full overflow-x-auto pb-2 custom-scrollbar">
                    <div className="min-w-fit flex flex-col items-start mx-auto">
                        <div className="flex mb-2">
                            <div className="w-20" /> 
                            <div className="w-10 h-8 flex items-center justify-center font-mono text-[9px] font-black uppercase tracking-tight text-muted-foreground/30 border-b border-r border-border/50">
                                Ø
                            </div>
                            {s2.split("").map((char, c) => (
                                <div key={`col-${c}`} className={`w-10 h-8 flex items-center justify-center font-mono text-xs font-black uppercase tracking-tight transition-colors ${currentStep.j === c + 1 ? "text-[var(--viz-amber)]" : "text-muted-foreground/30"}`}>
                                    {char}
                                </div>
                            ))}
                        </div>

                        {currentStep.dp.map((row, r) => (
                            <div key={`row-${r}`} className="flex mb-1">
                                <div className={`w-20 h-10 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-tight transition-colors border-r border-border/50 ${currentStep.i === r ? "text-[var(--viz-cyan)] bg-[var(--viz-cyan)]/5" : "text-muted-foreground/30"}`}>
                                    {r === 0 ? "Ø" : s1[r-1]}
                                </div>
                                {row.map((val, c) => {
                                    const isCurrent = r === currentStep.i && c === currentStep.j;
                                    const depIndex = currentStep.dependencies.findIndex(([dr, dc]) => dr === r && dc === c);
                                    const isMatchDep = depIndex === 0 && currentStep.decision === "MATCH";
                                    const isMismatchDep = depIndex !== -1 && currentStep.decision === "MISMATCH";
                                    
                                    return (
                                        <div key={`${r}-${c}`} className="w-10 h-10 flex items-center justify-center relative">
                                            <motion.div
                                                initial={false}
                                                animate={{ 
                                                    scale: isCurrent ? 1.15 : (isMatchDep || isMismatchDep) ? 1.1 : 1,
                                                    backgroundColor: isCurrent ? `${MANIM_COLORS.blue}20` : 
                                                                     isMatchDep ? `${MANIM_COLORS.green}15` : 
                                                                     isMismatchDep ? `${MANIM_COLORS.purple}15` : "transparent",
                                                    borderColor: isCurrent ? MANIM_COLORS.blue : 
                                                                 isMatchDep ? MANIM_COLORS.green : 
                                                                 isMismatchDep ? MANIM_COLORS.purple : "var(--border)",
                                                    opacity: (r > currentStep.i || (r === currentStep.i && c > currentStep.j)) ? 0.3 : 1
                                                }}
                                                className="w-8 h-8 border rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shadow-sm z-10"
                                            >
                                                <span className={isCurrent ? "text-[var(--viz-cyan)]" : isMatchDep ? "text-[var(--viz-deep-purple)]" : isMismatchDep ? "text-[var(--viz-purple)]" : "text-muted-foreground"}>{val}</span>
                                            </motion.div>
                                            
                                            {isCurrent && currentStep.decision !== 'NONE' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1.5 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute -top-4 text-[7px] font-black text-[var(--viz-amber)] z-20"
                                                >
                                                    {currentStep.decision === 'MATCH' ? 'MATCH' : 'MAX'}
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-[500px]">
                    <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "MATCH" ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)]/40 shadow-[0_0_15px_var(--viz-deep-purple)22]" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-[var(--viz-deep-purple)] tracking-widest flex items-center gap-2">
                                <ArrowUpLeft size={10} /> Match found
                            </span>
                            {currentStep.decision === "MATCH" && <Trophy size={12} className="text-[var(--viz-deep-purple)]" />}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                            <p className="opacity-50">1 + Diagonal Value</p>
                            <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                                <span>1 + DP[{currentStep.i-1}][{currentStep.j-1}]</span>
                                <span className="text-[var(--viz-deep-purple)] font-bold text-sm">
                                    {currentStep.i > 0 && currentStep.j > 0 ? 1 + currentStep.dp[currentStep.i-1][currentStep.j-1] : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`p-3 rounded-xl border transition-all ${currentStep.decision === "MISMATCH" ? "bg-[var(--viz-purple)]/10 border-[var(--viz-purple)]/40 shadow-[0_0_15px_var(--viz-purple)22]" : "bg-card/50 border-border opacity-40"}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-[var(--viz-purple)] tracking-widest flex items-center gap-2">
                                <CornerRightDown size={10} /> Mismatch
                            </span>
                            {currentStep.decision === "MISMATCH" && <Trophy size={12} className="text-[var(--viz-purple)]" />}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                            <p className="opacity-50">Max of Top / Left</p>
                            <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] shadow-sm p-1.5 rounded">
                                <span className="truncate max-w-[120px]">
                                    Max({currentStep.i > 0 ? currentStep.dp[currentStep.i-1][currentStep.j] : 0}, {currentStep.j > 0 ? currentStep.dp[currentStep.i][currentStep.j-1] : 0})
                                </span>
                                <span className="text-[var(--viz-purple)] font-bold text-sm">
                                    {currentStep.i > 0 && currentStep.j > 0 
                                        ? Math.max(currentStep.dp[currentStep.i-1][currentStep.j], currentStep.dp[currentStep.i][currentStep.j-1]) 
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-6 bg-muted/20  rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Database size={14}/> Active Probe
                    </h3>
                    <AnimatePresence mode="wait">
                        {currentStep.i > 0 && currentStep.j > 0 ? (
                            <motion.div 
                                key={`${currentStep.i}-${currentStep.j}`} 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                className="flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border/50">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black">String 1</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black font-mono text-[var(--viz-cyan)]">{s1[currentStep.i-1]}</span>
                                        <span className="text-[9px] text-muted-foreground/40 font-mono">idx:{currentStep.i-1}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border/50">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black">String 2</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black font-mono text-[var(--viz-amber)]">{s2[currentStep.j-1]}</span>
                                        <span className="text-[9px] text-muted-foreground/40 font-mono">idx:{currentStep.j-1}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-[10px] italic text-muted-foreground/30 text-center">
                                Seeding Base Case...
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 bg-muted/20  rounded-[2rem] flex-1 min-h-[200px]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={14}/> State Machine
                    </h3>
                    <div className="space-y-2 font-mono text-[9px]">
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 1 ? "bg-[var(--viz-cyan)]/10 border-[var(--viz-cyan)] text-[var(--viz-cyan)]" : "border-transparent text-muted-foreground/40"}`}>
                            1. Compare S1[i-1] == S2[j-1]
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 2 ? "bg-[var(--viz-deep-purple)]/10 border-[var(--viz-deep-purple)] text-[var(--viz-deep-purple)]" : "border-transparent text-muted-foreground/40"}`}>
                            2. Match: 1 + DP[i-1][j-1]
                        </div>
                        <div className={`p-2 rounded-lg border transition-all ${currentStep.activeLine === 3 ? "bg-[var(--viz-purple)]/10 border-[var(--viz-purple)] text-[var(--viz-purple)]" : "border-transparent text-muted-foreground/40"}`}>
                            3. Mismatch: Max(Top, Left)
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 p-6 bg-muted/30  rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[var(--viz-amber)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        Step {currentIndex + 1} / {history.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider h-4">
                <div className="absolute w-full h-1 bg-background/20 rounded-full" />
                <motion.div 
                    className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_var(--viz-cyan)44]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }}
                />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
            </div>
            
            <div className="flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex} 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="px-4 py-2 rounded-lg bg-card /50 text-[10px] font-mono text-[var(--viz-amber)] text-center max-w-2xl"
                    >
                        {currentStep.message}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        <div className="px-4 md:px-10 py-6 bg-muted/10 /50 rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-cyan)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Active Cell</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-deep-purple)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Match Path</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-[var(--viz-purple)]" /><span className="text-[9px] font-bold uppercase tracking-wider">Mismatch Path</span></div>
        </div>

      </div>
    </div>
  );
}


