"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  ChevronLeft, ChevronRight, Crown, X,
  Zap, Activity, Cpu, Settings2, Sparkles
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
};

interface NQueensStep {
  board: number[][]; // 0: empty, 1: safe, 2: probing, 3: conflict
  col: number;
  message: string;
  step: "BOOT" | "PROBE" | "COMMIT" | "CONFLICT" | "BACKTRACK" | "COMPLETE";
  conflictSource: { r: number; c: number } | null;
  conflictPath: { r: number; c: number }[];
  logs: string[];
}

export default function NQueensVisualizer({ speed = 500 }: { speed?: number }) {
  const [n, setN] = useState(4);
  const [history, setHistory] = useState<NQueensStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Algorithm Simulation ---
  useEffect(() => {
    const steps: NQueensStep[] = [];
    let board = Array(n).fill(0).map(() => Array(n).fill(0));
    let currentLogs: string[] = [];

    const record = (msg: string, step: NQueensStep["step"], col: number, conf: {r:number,c:number}|null = null, path: {r:number,c:number}[] = []) => {
      currentLogs = [msg, ...currentLogs].slice(0, 10);
      steps.push({
        board: board.map(r => [...r]),
        message: msg,
        step: step,
        col,
        conflictSource: conf,
        conflictPath: path,
        logs: [...currentLogs]
      });
    };

    const solve = (col: number): boolean => {
        if (col >= n) {
          record("Global solution resolved.", "COMPLETE", col);
          return true;
        }
        for (let row = 0; row < n; row++) {
            board[row][col] = 2;
            record(`Evaluating coordinate (${row}, ${col})`, "PROBE", col);
            
            let conflict = null;
            // Check row
            for (let i = 0; i < col; i++) if (board[row][i] === 1) { conflict = {r: row, c: i}; break; }
            // Check upper diagonal
            if (!conflict) for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) { conflict = {r: i, c: j}; break; }
            // Check lower diagonal
            if (!conflict) for (let i = row + 1, j = col - 1; i < n && j >= 0; i++, j--) if (board[i][j] === 1) { conflict = {r: i, c: j}; break; }

            if (!conflict) {
                board[row][col] = 1;
                record(`State committed: No conflicts found.`, "COMMIT", col);
                if (solve(col + 1)) return true;
                board[row][col] = 2;
                record(`Recursive branch failed. Backtracking.`, "BACKTRACK", col);
                board[row][col] = 0;
            } else {
                board[row][col] = 3;
                record(`Conflict detected with queen at (${conflict.r}, ${conflict.c})`, "CONFLICT", col, conflict, [{r: row, c: col}, conflict]);
                board[row][col] = 0;
            }
        }
        return false;
    };

    solve(0);
    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [n]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
      board: Array(n).fill(0).map(() => Array(n).fill(0)), 
      message: "Initializing board...", 
      step: "BOOT", 
      col: 0, 
      conflictSource: null, 
      conflictPath: [],
      logs: []
    };
  }, [history, currentIndex, n]);

  return (
    <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
      {/* Grid Backdrop */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      
      {/* Header UI */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
            N-Queens <span className="text-muted-foreground/40">Recursive Lemma</span>
          </h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
             <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Backtracking State Visualizer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
          <div className="flex items-center gap-3 px-3 border-r border-border">
              <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Dimension</span>
              <div className="flex items-center bg-background/50 rounded-lg p-0.5 border border-border">
                <button onClick={() => setN(p => Math.max(4, p - 1))} className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">-</button>
                <span className="w-8 text-center font-mono text-sm font-bold text-[#f59e0b]">{n}</span>
                <button onClick={() => setN(p => Math.min(10, p + 1))} className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">+</button>
              </div>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => {
                if (currentIndex >= history.length - 1) setCurrentIndex(0);
                setIsPlaying(!isPlaying);
              }} 
              className={`p-2 rounded-xl transition-all ${
                isPlaying 
                ? "bg-[#FC6255]/10 text-[#FC6255]" 
                : "bg-[#83C167]/10 text-[#83C167]"
              }`}
              title={isPlaying ? "Pause" : "Start Simulation"}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} 
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all"
              title="Reset"
            >
              <RotateCcw size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chessboard Container */}
        <div className="lg:col-span-3 relative aspect-square max-w-[500px] mx-auto w-full bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex items-center justify-center p-6">
          
          {/* Logic Step Badge */}
          <AnimatePresence>
              {currentStep.step !== "BOOT" && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                      <Zap size={12} className="text-[#58C4DD]" />
                      <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Status Explanation */}
          <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-6 w-full max-w-[300px] px-6 text-center z-30">
                  <div className="p-3 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                      <p className="text-[9px] text-[#f59e0b] font-mono italic uppercase tracking-tighter leading-tight">{currentStep.message}</p>
                  </div>
              </motion.div>
          </AnimatePresence>

          <div className="relative w-full aspect-square border-2 border-border/40 rounded-xl overflow-hidden shadow-2xl grid" 
               style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {currentStep.board.map((row, r) => row.map((cell, c) => {
                  const isDarkSquare = (r + c) % 2 === 1;
                  const isInConflictPath = currentStep.conflictPath.some(p => p.r === r && p.c === c);
                  
                  return (
                      <div key={`${r}-${c}`} className={`relative flex items-center justify-center border-[0.5px] border-border/20 transition-colors duration-500
                          ${isDarkSquare ? "bg-muted/40" : "bg-card"}
                      `}>
                          <AnimatePresence mode="wait">
                              {cell === 1 && (
                                  <motion.div 
                                    initial={{ scale: 0, y: -8 }} 
                                    animate={{ scale: 1, y: 0 }} 
                                    exit={{ scale: 0 }} 
                                    className="relative z-10"
                                  >
                                      <Crown size={n > 8 ? 20 : 32} className="text-[#58C4DD]" fill="currentColor" />
                                      <motion.div 
                                        animate={{ opacity: [0.2, 0.5, 0.2] }} 
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-[#58C4DD]/20 blur-xl rounded-full" 
                                      />
                                  </motion.div>
                              )}
                              {cell === 2 && (
                                <motion.div 
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_15px_#f59e0b66]" 
                                />
                              )}
                              {cell === 3 && (
                                <motion.div 
                                  initial={{ scale: 0.5, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }} 
                                  className="text-[#FC6255] relative z-10 drop-shadow-[0_0_10px_#FC625544]"
                                >
                                  <X size={n > 8 ? 24 : 36} strokeWidth={3} />
                                </motion.div>
                              )}
                          </AnimatePresence>
                          {isInConflictPath && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-[#FC6255]/10 border border-[#FC6255]/30 z-0" 
                            />
                          )}
                      </div>
                  );
              }))}
          </div>
        </div>

        {/* Sidebar: Resolution Log */}
        <div className="flex flex-col gap-6">
            <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4 flex-1 h-[350px] overflow-hidden">
                <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                    <Activity size={14}/> Execution Flow
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                    <AnimatePresence>
                        {currentStep.logs.map((log, i) => (
                            <motion.div
                                key={`log-${currentIndex}-${i}`}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-[9px] font-mono flex gap-2 border-l-2 pl-2 ${i === 0 ? "text-[#58C4DD] border-[#58C4DD]" : "text-muted-foreground/40 border-border"}`}
                            >
                                <span className={i === 0 ? "text-[#58C4DD]" : "text-muted-foreground/20"}>»</span>
                                {log}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="p-6 bg-muted border border-border rounded-[2rem]">
                <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                    <Cpu size={14}/> State Metrics
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-muted-foreground/40 uppercase tracking-tighter">Current Col</span>
                        <span className="text-[#58C4DD] font-black">{currentStep.col}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-muted-foreground/40 uppercase tracking-tighter">Exploration</span>
                        <span className="text-[#83C167] font-black uppercase">Active</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-muted-foreground/40 uppercase tracking-tighter">Time Complexity</span>
                        <span className="text-[#f59e0b] font-black uppercase">O(N!)</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Scrubber UI */}
      <div className="mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                  <Hash size={14} className="text-[#f59e0b]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Lemma Sequence {currentIndex + 1} of {history.length || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                  <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
              </div>
          </div>

          <div className="relative flex items-center group/slider">
              <div className="absolute w-full h-1 bg-background/10 rounded-full" />
              <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / Math.max(1, (history.length - 1))) * 100}%` }} />
              <input 
                  type="range" min="0" max={Math.max(0, history.length - 1)} value={currentIndex} 
                  onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                  className="w-full h-6 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                  style={{ left: `calc(${(currentIndex / Math.max(1, (history.length - 1))) * 100}% - 3px)` }}
              />
          </div>
      </div>

      {/* Legend */}
      <div className="mt-8 px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Recursive Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Safe Placement</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Conflict Detected</span></div>
         <div className="flex items-center gap-3"><Sparkles size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Optimized Traversal</span></div>
      </div>
    </div>
  );
}

