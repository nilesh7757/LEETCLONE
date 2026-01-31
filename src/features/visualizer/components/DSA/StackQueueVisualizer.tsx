"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Database,
  ArrowRight, ArrowDown, ChevronsRight, ChevronsDown
} from "lucide-react";

// Professional Palette
const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#f59e0b",
  red: "#FC6255",
  purple: "#9A72AC"
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
  const containerRef = useRef<HTMLDivElement>(null);

  const recordOperation = (type: 'ADD' | 'REMOVE') => {
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    let currentItems = [...items];

    const record = (msg: string, step: string) => {
      steps.push({
        items: [...currentItems],
        message: msg,
        step: step,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => currentLogs = [l, ...currentLogs];

    if (type === 'ADD') {
        const val = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 99) + 1;
        if (isNaN(val)) return;
        
        const newItem: DataItem = { id: `item-${Date.now()}`, value: val };
        addLog(`Allocating value ${val}.`);
        record(`Preparing to ${mode === 'STACK' ? 'Push' : 'Enqueue'} ${val}.`, "PREPARE");
        
        currentItems.push(newItem);
        addLog(`Value ${val} added to ${mode === 'STACK' ? 'Top' : 'Rear'}.`);
        record(`${val} successfully ${mode === 'STACK' ? 'Pushed' : 'Enqueued'}.`, mode === 'STACK' ? "PUSH" : "ENQUEUE");
        
        setItems(currentItems);
        setInputValue("");
    } else {
        if (currentItems.length === 0) return;
        
        const target = mode === 'STACK' ? currentItems[currentItems.length - 1] : currentItems[0];
        addLog(`Targeting ${target.value} for removal.`);
        record(`Identifying ${mode === 'STACK' ? 'Top' : 'Front'} element for removal.`, "TARGET");
        
        if (mode === 'STACK') {
            currentItems.pop();
        } else {
            currentItems.shift();
        }
        
        addLog(`Value ${target.value} removed.`);
        record(`${target.value} successfully ${mode === 'STACK' ? 'Popped' : 'Dequeued'}.`, mode === 'STACK' ? "POP" : "DEQUEUE");
        
        setItems(currentItems);
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  // Playback Control
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
    items: items, 
    message: "Buffer Ready.", 
    step: "IDLE", 
    logs: [] 
  };

  const activeColor = mode === 'STACK' ? MANIM_COLORS.blue : MANIM_COLORS.green;

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight" style={{ color: activeColor }}>
              {mode === 'STACK' ? 'Stack' : 'Queue'} <span className="text-muted-foreground/40">Visualizer</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 rounded-full" style={{ backgroundColor: activeColor }} />
               <div className="flex bg-muted p-1 rounded-lg border border-border">
                  <button onClick={() => { setMode("STACK"); setItems([]); setHistory([]); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "STACK" ? "bg-[#58C4DD] text-black" : "text-muted-foreground/40"}`}>LIFO Stack</button>
                  <button onClick={() => { setMode("QUEUE"); setItems([]); setHistory([]); }} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${mode === "QUEUE" ? "bg-[#83C167] text-black" : "text-muted-foreground/40"}`}>FIFO Queue</button>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => { setItems([]); setHistory([]); setCurrentIndex(0); }} className="p-3 bg-muted hover:bg-white/5 rounded-xl border border-border transition-all text-muted-foreground hover:text-foreground"><RotateCcw size={20}/></button>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="relative min-h-[500px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center p-12">
            
            {/* Controls Overlay */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="number" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="RND"
                        className="w-12 bg-muted/50 border border-border rounded-lg text-center text-xs font-mono py-1.5 focus:outline-none focus:border-foreground/50"
                    />
                    <button 
                        onClick={() => recordOperation('ADD')}
                        className="flex-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide py-2 px-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Plus size={12} /> {mode === 'STACK' ? 'Push' : 'Enqueue'}
                    </button>
                </div>
                <button 
                    onClick={() => recordOperation('REMOVE')}
                    className="w-full bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wide py-2 px-3 rounded-lg hover:bg-muted/80 hover:text-foreground transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={12} /> {mode === 'STACK' ? 'Pop' : 'Dequeue'}
                </button>
            </div>

            {/* Info Overlay */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-2 pointer-events-none max-w-[200px]">
                <div className="bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                            <Activity size={12} /> Buffer Specs
                    </span>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono border-b border-border/50 pb-1">
                            <span className="text-muted-foreground">Size</span>
                            <span className="font-bold">{currentStep.items.length}</span>
                        </div>
                        {mode === 'STACK' ? (
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-muted-foreground">Top</span>
                                <span className="font-bold text-[#58C4DD]">{currentStep.items.length > 0 ? currentStep.items[currentStep.items.length - 1].value : '-'}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-muted-foreground">Front</span>
                                    <span className="font-bold text-[#FC6255]">{currentStep.items.length > 0 ? currentStep.items[0].value : '-'}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-muted-foreground">Rear</span>
                                    <span className="font-bold text-[#83C167]">{currentStep.items.length > 0 ? currentStep.items[currentStep.items.length - 1].value : '-'}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Logs */}
                <div className="bg-card/90 backdrop-blur border border-border p-4 rounded-2xl shadow-sm max-h-[200px] overflow-hidden flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                            <Layout size={12} /> Log
                    </span>
                    <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
                        <AnimatePresence mode="popLayout">
                            {currentStep.logs.map((log, i) => (
                                <motion.div 
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/70 leading-tight"
                                >
                                    <span style={{ color: activeColor }} className="mr-1">›</span>{log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 flex items-center justify-center w-full">
                <AnimatePresence mode="wait">
                    {mode === "STACK" ? (
                        /* STACK VISUAL */
                        <div key="stack-container" className="relative">
                            <div className="w-48 h-[360px] border-x-4 border-b-4 border-dashed border-border/50 rounded-b-3xl bg-background/20 backdrop-blur-sm flex flex-col-reverse justify-start items-center p-4 gap-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#58C4DD]/5 to-transparent pointer-events-none" />
                                <AnimatePresence mode="popLayout">
                                    {currentStep.items.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ y: -400, opacity: 0, scale: 0.8 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ y: -400, opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="w-full h-12 rounded-xl border border-[#58C4DD]/30 bg-background shadow-lg flex items-center justify-center relative z-10"
                                        >
                                            <span className="text-sm font-bold font-mono text-[#58C4DD]">{item.value}</span>
                                            {index === currentStep.items.length - 1 && (
                                                <div className="absolute -right-12 text-[9px] font-bold text-[#58C4DD] flex items-center gap-1">
                                                    <ChevronsLeft />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="absolute -bottom-8 left-0 w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">LIFO Stack</div>
                        </div>
                    ) : (
                        /* QUEUE VISUAL */
                        <div key="queue-container" className="relative w-full max-w-[600px]">
                            <div className="w-full h-24 border-y-4 border-dashed border-border/50 bg-background/20 backdrop-blur-sm flex items-center justify-end px-4 gap-2 relative overflow-hidden rounded-xl">
                                <div className="absolute inset-0 bg-gradient-to-l from-[#83C167]/5 to-transparent pointer-events-none" />
                                <AnimatePresence mode="popLayout">
                                    {currentStep.items.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ x: 100, opacity: 0, scale: 0.8 }}
                                            animate={{ x: 0, opacity: 1, scale: 1 }}
                                            exit={{ x: -100, opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="min-w-[60px] h-14 rounded-xl border border-[#83C167]/30 bg-background shadow-lg flex items-center justify-center relative z-10"
                                        >
                                            <span className="text-sm font-bold font-mono text-[#83C167]">{item.value}</span>
                                            {index === 0 && (
                                                <div className="absolute -top-8 text-[9px] font-bold text-[#FC6255] flex flex-col items-center">
                                                    FRONT
                                                    <ChevronsDown size={12} />
                                                </div>
                                            )}
                                            {index === currentStep.items.length - 1 && (
                                                <div className="absolute -bottom-8 text-[9px] font-bold text-[#83C167] flex flex-col items-center">
                                                    <ChevronsUp size={12} />
                                                    REAR
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="absolute -bottom-10 left-0 w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">FIFO Queue</div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 text-muted-foreground/20">
                                <ChevronsRight size={24} />
                            </div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-muted-foreground/20">
                                <ChevronsRight size={24} />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Explanation Toast */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-8 w-full flex justify-center z-30 pointer-events-none">
                    <div className="px-6 py-3 bg-card/90 border border-border rounded-2xl backdrop-blur-md shadow-2xl max-w-[400px] text-center">
                        <p className="text-xs text-[#f59e0b] font-mono font-medium">{currentStep.message}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

        </div>

        {/* Timeline Scrubber */}
        <div className={`mt-8 p-6 bg-muted border border-border rounded-[2.5rem] flex flex-col gap-4 relative z-10 transition-opacity`}>
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Hash size={14} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Operation Sequence {currentIndex + 1} of {history.length || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 rounded-full shadow-[0_0_10px_rgba(88,196,221,0.3)]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%`, backgroundColor: activeColor }} />
                <input 
                    type="range" min="0" max={(history.length || 1) - 1} value={currentIndex} 
                    onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
                    className="w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute w-1.5 h-4 bg-[#f59e0b] rounded-full shadow-[0_0_15px_#f59e0b] pointer-events-none transition-all"
                    style={{ left: `calc(${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}% - 3px)` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function ChevronsLeft(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg> }
function ChevronsUp(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></svg> }