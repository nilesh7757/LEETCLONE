"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, ChevronLeft, ChevronRight, Zap, 
  ArrowRight, Plus, Trash2, Search, Hash, Activity
} from "lucide-react";

// Manim-inspired Palette
const COLORS = { 
  blue: "var(--viz-cyan)",
  green: "var(--viz-green)",
  gold: "var(--viz-amber)",
  red: "var(--viz-rose)",
  purple: "var(--viz-purple)",
  muted: "rgba(255,255,255,0.1)"
};

interface LLNode {
  id: string;
  value: number;
}

interface ListStep {
  nodes: LLNode[];
  activeId: string | null;     // Node being processed
  highlightIds: string[];      // Nodes involved in operation (e.g. traversal path)
  phase: "IDLE" | "TRAVERSE" | "FOUND" | "INSERT" | "DELETE" | "NOT_FOUND";
  message: string;
}

export default function LinkedListVisualizer({ speed = 800 }: { speed?: number }) {
  // --- State ---
  const [list, setList] = useState<LLNode[]>([
    { id: 'n-1', value: 10 },
    { id: 'n-2', value: 20 },
    { id: 'n-3', value: 30 }
  ]);
  const [history, setHistory] = useState<ListStep[]>([{
    nodes: [
      { id: 'n-1', value: 10 },
      { id: 'n-2', value: 20 },
      { id: 'n-3', value: 30 }
    ],
    activeId: null,
    highlightIds: [],
    phase: "IDLE",
    message: "Linked List Ready."
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateHistory = (steps: ListStep[], finalState: LLNode[]) => {
    setList(finalState);
    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
  };

  // --- Operations ---
  const pushBack = React.useCallback(() => {
    const val = parseInt(inputValue) || Math.floor(Math.random() * 99);
    const steps: ListStep[] = [];
    const currentNodes = [...list]; 
    const newNode = { id: `n-${Date.now()}`, value: val };

    // 1. Traversal
    for (let i = 0; i < currentNodes.length; i++) {
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i+1).map(n => n.id),
            phase: "TRAVERSE",
            message: `Traversing list... visiting node ${i + 1} of ${currentNodes.length}`
        });
    }

    // 2. Insertion
    const newNodes = [...currentNodes, newNode];
    steps.push({
        nodes: newNodes,
        activeId: newNode.id,
        highlightIds: [],
        phase: "INSERT",
        message: `New node [${val}] created and appended to the tail pointer.`
    });

    // 3. Idle
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: `Node [${val}] added. List size is now ${newNodes.length}.`
    });

    updateHistory(steps, newNodes);
  }, [inputValue, list]);

  const popBack = React.useCallback(() => {
    if (list.length === 0) return;
    const steps: ListStep[] = [];
    const currentNodes = [...list];

    // 1. Traversal to end
    for (let i = 0; i < currentNodes.length; i++) {
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i+1).map(n => n.id),
            phase: "TRAVERSE",
            message: i === currentNodes.length - 1 ? `Tail found at index ${i}.` : `Traversing... at node ${i + 1}.`
        });
    }

    // 2. Deletion
    const target = currentNodes[currentNodes.length - 1];
    const newNodes = currentNodes.slice(0, -1);
    
    steps.push({
        nodes: currentNodes, 
        activeId: target.id,
        highlightIds: [target.id],
        phase: "DELETE",
        message: `Removing tail node [${target.value}]. Updating previous node's pointer to NULL.`
    });

    // 3. Final State
    steps.push({
        nodes: newNodes,
        activeId: null,
        highlightIds: [],
        phase: "IDLE",
        message: `Node [${target.value}] deleted. List size is now ${newNodes.length}.`
    });

    updateHistory(steps, newNodes);
  }, [list]);

  const search = React.useCallback(() => {
    let val = parseInt(inputValue);
    if (isNaN(val)) {
      if (list.length > 0) {
        val = list[Math.floor(Math.random() * list.length)].value;
      } else {
        val = Math.floor(Math.random() * 99);
      }
    }
    const steps: ListStep[] = [];
    const currentNodes = [...list];
    let found = false;

    for (let i = 0; i < currentNodes.length; i++) {
        const isMatch = currentNodes[i].value === val;
        steps.push({
            nodes: currentNodes,
            activeId: currentNodes[i].id,
            highlightIds: currentNodes.slice(0, i).map(n => n.id),
            phase: isMatch ? "FOUND" : "TRAVERSE",
            message: isMatch ? `Found! Value ${val} matches at index ${i}.` : `Node [${currentNodes[i].value}] does not match. Moving to next.`
        });
        if (isMatch) {
            found = true;
            break;
        }
    }

    if (!found) {
        steps.push({
            nodes: currentNodes,
            activeId: null,
            highlightIds: [],
            phase: "NOT_FOUND",
            message: `Value ${val} not found in the list.`
        });
    } else {
         steps.push({
            nodes: currentNodes,
            activeId: null,
            highlightIds: [],
            phase: "IDLE",
            message: "Search complete."
        });
    }

    updateHistory(steps, currentNodes);
  }, [inputValue, list]);

  // --- Playback Engine ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, history.length, speed]);

  const currentStep = history[currentIndex] || history[0] || {
    nodes: [],
    activeId: null,
    highlightIds: [],
    phase: "IDLE",
    message: "Ready"
  };

  // --- Visual Helpers ---
  const activeColor = 
    currentStep.phase === "FOUND" ? COLORS.green :
    currentStep.phase === "DELETE" ? COLORS.red :
    currentStep.phase === "INSERT" ? COLORS.purple :
    currentStep.phase === "TRAVERSE" ? COLORS.gold :
    COLORS.blue;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl font-mono text-[10px]">
            <span className="text-[9px] font-black text-[var(--muted-foreground)]/60 uppercase">Data</span>
            <input 
              type="number" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)}
              placeholder="Random"
              className="w-14 bg-transparent font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none text-center placeholder:text-muted-foreground/30"
            />
          </div>

          <button onClick={pushBack} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-green)]/10 hover:bg-[var(--viz-green)]/20 rounded-xl text-[var(--viz-green)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Push Back">
            <Plus size={12} /> Add
          </button>
          <button onClick={popBack} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-rose)]/10 hover:bg-[var(--viz-rose)]/20 rounded-xl text-[var(--viz-rose)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Pop Back">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={search} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-cyan)]/10 hover:bg-[var(--viz-cyan)]/20 rounded-xl text-[var(--viz-cyan)] transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer" title="Search">
            <Search size={12} /> Find
          </button>

          <button 
            onClick={() => { setList([]); setHistory([{ nodes: [], activeId: null, highlightIds: [], phase: "IDLE", message: "List cleared." }]); setCurrentIndex(0); }} 
            className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Clear List"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Visual Canvas (Horizontal List) */}
      <div className="relative w-full h-[180px] md:h-[220px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner flex items-center justify-center p-4">
        {/* Phase Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[var(--card)]/80 backdrop-blur-md shadow-sm" style={{ borderColor: `${activeColor}40` }}>
            <Zap size={10} fill={activeColor} className="text-transparent" />
            <span className="text-[9px] font-black uppercase tracking-widest font-mono animate-pulse" style={{ color: activeColor }}>{currentStep.phase}</span>
          </div>
        </div>

        {/* Empty state */}
        {currentStep.nodes.length === 0 && (
          <div className="flex flex-col items-center gap-3 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Empty List</span>
            <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">Add a node to get started</span>
          </div>
        )}

        {/* Node Row — horizontally scrollable */}
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-start md:justify-center relative z-20">
          <div className="flex items-center gap-x-0 p-4 min-w-max mt-4">
            <AnimatePresence mode="popLayout">
              {currentStep.nodes.map((node, i) => {
                const isActive = node.id === currentStep.activeId;
                const isVisited = currentStep.highlightIds.includes(node.id);

                let nodeBg = "var(--card)";
                let nodeBorder = "var(--border)";
                let shadowColor = "none";

                if (isActive) {
                  nodeBg = `rgba(${activeColor === COLORS.green ? "var(--viz-green-rgb)" : activeColor === COLORS.red ? "var(--viz-red-rgb)" : activeColor === COLORS.gold ? "var(--viz-gold-rgb)" : "var(--viz-cyan-rgb)"}, 0.15)`;
                  nodeBorder = activeColor;
                  shadowColor = `0 0 25px ${activeColor}`;
                } else if (isVisited) {
                  nodeBg = "rgba(var(--viz-gold-rgb), 0.1)";
                  nodeBorder = "var(--viz-amber)";
                }

                return (
                  <React.Fragment key={node.id}>
                    {/* Node box */}
                    <motion.div
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isActive ? 1.12 : 1,
                        opacity: currentStep.phase === "DELETE" && isActive ? 0.4 : 1,
                        borderColor: nodeBorder,
                        backgroundColor: nodeBg,
                        boxShadow: shadowColor
                      }}
                      exit={{ scale: 0, opacity: 0, y: 20 }}
                      transition={{ type: "spring", stiffness: 150, damping: 20 }}
                      className="relative w-12 h-12 border-2 rounded-xl flex items-center justify-center bg-[var(--card)] z-10 flex-shrink-0 transition-colors duration-200"
                    >
                      <span className={`text-sm font-bold font-mono ${isActive ? "text-white font-black" : "text-[var(--foreground)]"}`}>{node.value}</span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      layout
                      className="flex items-center justify-center w-8 md:w-10 text-[var(--muted-foreground)]/20 flex-shrink-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ArrowRight size={16} strokeWidth={2.5} className="text-[var(--border)]" />
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            {/* NULL terminator */}
            {currentStep.nodes.length > 0 && (
              <motion.div layout className="w-10 h-10 rounded-xl border-2 border-dashed border-[var(--muted-foreground)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-black text-[var(--muted-foreground)]/30 font-mono">NULL</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Message Box */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center shadow-sm">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-bold tracking-tight">
          {currentStep.message}
        </p>
      </div>

      {/* Control Timeline */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--viz-cyan)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {currentIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min(history.length - 1, currentIndex + 1)); }} 
              className="p-1.5 hover:bg-[var(--accent)] border border-[var(--border)]/40 rounded-lg text-[var(--muted-foreground)] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center group/slider w-full h-6">
          <div className="absolute w-full h-1 bg-[var(--border)] rounded-full" />
          <div 
            className="absolute h-1 bg-[var(--viz-cyan)] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
            style={{ width: `${(currentIndex / (history.length - 1 || 1)) * 100}%` }} 
          />
          <input 
            type="range" 
            min="0" 
            max={history.length - 1} 
            value={currentIndex} 
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute w-2.5 h-2.5 bg-[var(--foreground)] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none group-hover/slider:scale-125 transition-transform"
            style={{ left: `calc(${(currentIndex / (history.length - 1 || 1)) * 100}% - 5px)` }}
          />
        </div>
      </div>
    </div>
  );
}
