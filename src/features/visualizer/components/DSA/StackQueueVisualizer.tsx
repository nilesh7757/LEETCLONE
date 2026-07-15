"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, Hash, 
  Plus, Trash2, 
  ChevronsRight, ChevronsDown,
  Activity, Layout, ChevronLeft, ChevronRight
} from "lucide-react";

const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-lime)",
  green: "var(--viz-green)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lime)"
};

interface DataItem {
  id: string;
  value: number;
}

interface HistoryStep {
  items: DataItem[];
  message: string;
  step: string;
  logs: string[];
}

export default function StackQueueVisualizer({ speed = 800 }: { speed?: number }) {
  const [mode, setMode] = useState<"STACK" | "QUEUE">("STACK");
  const [items, setItems] = useState<DataItem[]>([]);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recordOperation = (type: 'ADD' | 'REMOVE') => {
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    const currentItems = [...items];

    const record = (msg: string, step: string) => {
      steps.push({
        items: [...currentItems],
        message: msg,
        step: step,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    if (type === 'ADD') {
      const val = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 99) + 1;
      if (isNaN(val)) return;
      const newItem: DataItem = { id: `item-${Date.now()}`, value: val };

      addLog(`Value ${val} ready to insert.`);
      record(`Preparing to ${mode === 'STACK' ? 'push' : 'enqueue'} ${val}.`, "PREPARE");

      currentItems.push(newItem);
      addLog(`${val} added to ${mode === 'STACK' ? 'top of stack' : 'rear of queue'}.`);
      record(`${val} ${mode === 'STACK' ? 'pushed onto stack' : 'enqueued'} successfully.`, mode === 'STACK' ? "PUSH" : "ENQUEUE");

      setItems(currentItems);
      setInputValue("");
    } else {
      if (currentItems.length === 0) return;
      const target = mode === 'STACK' ? currentItems[currentItems.length - 1] : currentItems[0];

      addLog(`${mode === 'STACK' ? 'Top' : 'Front'} element is ${target.value}.`);
      record(`Removing ${mode === 'STACK' ? 'top' : 'front'} element: ${target.value}.`, "TARGET");

      if (mode === 'STACK') {
        currentItems.pop();
      } else {
        currentItems.shift();
      }

      addLog(`${target.value} removed from ${mode === 'STACK' ? 'stack' : 'queue'}.`);
      record(`${target.value} ${mode === 'STACK' ? 'popped' : 'dequeued'}. Size is now ${currentItems.length}.`, mode === 'STACK' ? "POP" : "DEQUEUE");

      setItems(currentItems);
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || { items, message: "Ready. Use the buttons below to operate.", step: "IDLE", logs: [] };
  }, [history, currentIndex, items]);

  const activeColor = mode === 'STACK' ? MANIM_COLORS.blue : MANIM_COLORS.green;

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: activeColor }}>
            {mode === 'STACK' ? 'Stack' : 'Queue'} <span className="text-[var(--muted-foreground)]/40">Visualizer</span>
          </h2>
          <div className="flex bg-[var(--muted)] p-1 rounded-lg w-fit">
            <button onClick={() => { setMode("STACK"); setItems([]); setHistory([]); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "STACK" ? "bg-[var(--viz-lime)] text-black" : "text-[var(--muted-foreground)]/40"}`}>LIFO Stack</button>
            <button onClick={() => { setMode("QUEUE"); setItems([]); setHistory([]); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "QUEUE" ? "bg-[var(--viz-green)] text-black" : "text-[var(--muted-foreground)]/40"}`}>FIFO Queue</button>
          </div>
        </div>
        <button onClick={() => { setItems([]); setHistory([]); setCurrentIndex(0); }} className="p-2.5 bg-[var(--muted)] hover:bg-[var(--foreground)]/5 rounded-xl transition-all text-[var(--muted-foreground)]">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ── Controls row (outside canvas) ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">Value</span>
        <input
          type="number" value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && recordOperation('ADD')}
          placeholder="Random"
          className="w-16 bg-[var(--muted)]/50 rounded-lg text-center text-xs font-mono py-1.5 focus:outline-none border border-[var(--border)]"
        />
        <button onClick={() => recordOperation('ADD')} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-bold uppercase tracking-wide rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={12} /> {mode === 'STACK' ? 'Push' : 'Enqueue'}
        </button>
        <button onClick={() => recordOperation('REMOVE')} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-wide rounded-lg hover:bg-[var(--muted)]/80 hover:text-[var(--foreground)] transition-all">
          <Trash2 size={12} /> {mode === 'STACK' ? 'Pop' : 'Dequeue'}
        </button>

        {/* Stats inline */}
        <div className="ml-auto flex items-center gap-4 text-[10px] font-mono">
          <span className="text-[var(--muted-foreground)]">Size: <strong>{currentStep.items.length}</strong></span>
          {mode === 'STACK' ? (
            <span className="text-[var(--viz-lime)]">Top: <strong>{currentStep.items.length > 0 ? currentStep.items[currentStep.items.length - 1].value : '—'}</strong></span>
          ) : (
            <>
              <span className="text-[var(--viz-rose)]">Front: <strong>{currentStep.items.length > 0 ? currentStep.items[0].value : '—'}</strong></span>
              <span className="text-[var(--viz-green)]">Rear: <strong>{currentStep.items.length > 0 ? currentStep.items[currentStep.items.length - 1].value : '—'}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* ── Visual Canvas (no overflow issues) ── */}
      <div className="relative w-full min-h-[300px] md:min-h-[420px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden flex items-center justify-center p-6 md:p-12 shadow-inner">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        <AnimatePresence mode="wait">
          {mode === "STACK" ? (
            /* STACK VISUAL */
            <div key="stack-container" className="relative flex flex-col items-center">
              <div className="w-36 sm:w-48 h-[300px] md:h-[360px] border-x-4 border-b-4 border-dashed border-[var(--border)]/50 rounded-b-3xl bg-[var(--background)]/20 flex flex-col-reverse justify-start items-center p-3 gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--viz-lime)]/5 to-transparent pointer-events-none" />
                <AnimatePresence mode="popLayout">
                  {currentStep.items.map((item: DataItem, index: number) => (
                    <motion.div
                      key={item.id} layout
                      initial={{ y: -200, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -200, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-full h-10 md:h-12 rounded-xl border border-[var(--viz-lime)]/30 bg-[var(--background)] shadow-lg flex items-center justify-center relative z-10"
                    >
                      <span className="text-sm font-bold font-mono text-[var(--viz-lime)]">{item.value}</span>
                      {index === currentStep.items.length - 1 && (
                        <div className="absolute -right-10 text-[9px] font-bold text-[var(--viz-lime)]">← TOP</div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentStep.items.length === 0 && (
                  <span className="text-[9px] font-black text-[var(--muted-foreground)]/30 uppercase tracking-widest absolute bottom-4">Empty</span>
                )}
              </div>
              <div className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/30">LIFO Stack</div>
            </div>
          ) : (
            /* QUEUE VISUAL */
            <div key="queue-container" className="relative w-full max-w-lg flex flex-col items-center gap-6">
              <div className="relative w-full h-20 md:h-24 border-y-4 border-dashed border-[var(--border)]/50 bg-[var(--background)]/20 flex items-center justify-end px-3 gap-2 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-l from-[var(--viz-green)]/5 to-transparent pointer-events-none" />
                <AnimatePresence mode="popLayout">
                  {currentStep.items.map((item: DataItem, index: number) => (
                    <motion.div
                      key={item.id} layout
                      initial={{ x: 80, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -80, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="min-w-[48px] md:min-w-[60px] h-12 md:h-14 rounded-xl border border-[var(--viz-green)]/30 bg-[var(--background)] shadow-lg flex items-center justify-center relative z-10 flex-shrink-0"
                    >
                      <span className="text-sm font-bold font-mono text-[var(--viz-green)]">{item.value}</span>
                      {index === 0 && (
                        <div className="absolute -top-7 text-[8px] font-bold text-[var(--viz-rose)] flex flex-col items-center leading-none">
                          FRONT<ChevronsDown size={10} />
                        </div>
                      )}
                      {index === currentStep.items.length - 1 && index !== 0 && (
                        <div className="absolute -bottom-7 text-[8px] font-bold text-[var(--viz-green)] flex flex-col items-center leading-none">
                          <ChevronsUp size={10} />REAR
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentStep.items.length === 0 && (
                  <span className="absolute text-[9px] font-black text-[var(--muted-foreground)]/30 uppercase tracking-widest">Empty</span>
                )}
              </div>
              <div className="flex items-center justify-between w-full text-[9px] font-bold text-[var(--muted-foreground)]/30 uppercase tracking-widest px-1">
                <span className="flex items-center gap-1"><ChevronsRight size={12} /> Dequeue (Front)</span>
                <span className="flex items-center gap-1">Enqueue (Rear) <ChevronsRight size={12} /></span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]/30">FIFO Queue</div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Step message (below canvas, not overlapping) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs font-mono font-medium" style={{ color: activeColor }}>{currentStep.message}</p>
      </div>

      {/* ── Log panel (below canvas) ── */}
      {currentStep.logs.length > 0 && (
        <div className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
            <Layout size={10} /> Step Log
          </span>
          <div className="flex flex-row flex-wrap gap-x-4 gap-y-1">
            {currentStep.logs.slice(0, 4).map((log: string, i: number) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-mono text-[var(--muted-foreground)]/60 leading-tight">
                <span style={{ color: activeColor }} className="mr-1">›</span>{log}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrubber + Step nav ── */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} style={{ color: activeColor }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex === 0}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex >= (history.length || 1) - 1}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
          <div className="absolute h-1 rounded-full transition-all"
            style={{ width: `${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}%`, backgroundColor: activeColor }} />
          <input type="range" min="0" max={Math.max((history.length || 1) - 1, 0)} value={currentIndex}
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-6 opacity-0 cursor-pointer z-10" />
          <div className="absolute w-1.5 h-4 rounded-full pointer-events-none transition-all"
            style={{ left: `calc(${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}% - 3px)`, backgroundColor: activeColor }} />
        </div>
      </div>
    </div>
  );
}

interface LucideProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function ChevronsLeft({ size = 12, ...props }: LucideProps) { 
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>;
}
function ChevronsUp({ size = 12, ...props }: LucideProps) { 
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></svg>;
}
