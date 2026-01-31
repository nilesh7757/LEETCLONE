"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu, Type
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

interface VisualNode {
  id: string;
  char: string;
  x: number;
  y: number;
  parentId: string | null;
  isEndOfWord: boolean;
  status: 'idle' | 'highlighted' | 'active' | 'success' | 'miss';
}

interface HistoryStep {
  nodes: VisualNode[];
  message: string;
  step: string;
  highlightedId: string | null;
  logs: string[];
  activeWord: string;
}

class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord: boolean = false;
  char: string;
  id: string;

  constructor(char: string) {
    this.char = char;
    this.id = `node-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function TrieVisualizer({ speed = 800 }: { speed?: number }) {
  const rootRef = useRef<TrieNode>(new TrieNode("*"));
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Coordinate Sync
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Layout Algorithm ---
  const getLayout = useCallback((root: TrieNode) => {
    const visualNodes: VisualNode[] = [];
    const traverse = (node: TrieNode, x: number, y: number, offset: number, parentId: string | null) => {
      visualNodes.push({ id: node.id, char: node.char, x, y, parentId, isEndOfWord: node.isEndOfWord, status: 'idle' });
      const children = Object.keys(node.children).sort();
      const count = children.length;
      if (count === 0) return;
      
      // Calculate spacing based on offset, but clamp it to prevent extreme spread
      const spacing = offset * 2 / Math.max(count - 1, 1);
      
      let startX = x - offset;
      if (count === 1) startX = x;
      
      children.forEach((char, i) => {
        const childX = count === 1 ? x : startX + i * spacing;
        traverse(node.children[char], childX, y + 80, offset * 0.45, node.id);
      });
    };
    traverse(root, dimensions.width / 2, 60, dimensions.width / 4, null);
    return visualNodes;
  }, [dimensions.width]);

  // --- Core Logic ---
  const recordOperation = (type: 'INSERT' | 'SEARCH', rawWord: string) => {
    if (!rawWord) return;
    const word = rawWord.toUpperCase().trim().slice(0, 10);
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    const root = rootRef.current; // Modifying ref directly for persistence in this simplistic model

    // Reconstruction helper
    const record = (msg: string, step: string, hId: string | null, statusOverride?: Record<string, VisualNode['status']>) => {
      const layout = getLayout(root);
      const frameNodes = layout.map(n => ({
        ...n,
        status: statusOverride?.[n.id] || (n.id === hId ? 'active' : n.status)
      }));
      steps.push({
        nodes: frameNodes,
        message: msg,
        step: step,
        highlightedId: hId,
        logs: [...currentLogs],
        activeWord: word
      });
    };

    const addLog = (l: string) => currentLogs = [l, ...currentLogs];

    if (type === 'INSERT') {
      addLog(`Initiating storage protocol for "${word}".`);
      let curr = root;
      record(`Scanning root manifold for insertion of "${word}".`, "START", curr.id);
      
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children[char]) {
          curr.children[char] = new TrieNode(char);
          addLog(`Allocated memory for bit '${char}'.`);
          record(`Character '${char}' not found. Allocating new memory cell.`, "ALLOCATE", curr.children[char].id);
        } else {
          addLog(`Bit '${char}' located in current manifold.`);
          record(`Prefix match: '${char}' already exists in the hierarchy.`, "MATCH", curr.children[char].id);
        }
        curr = curr.children[char];
      }
      curr.isEndOfWord = true;
      addLog(`Word "${word}" successfully committed.`);
      record(`Terminal bit for "${word}" successfully committed.`, "TERMINAL", curr.id, { [curr.id]: 'success' });
    } else {
        addLog(`Querying manifold for word "${word}".`);
        let curr = root;
        let found = true;
        record(`Starting search protocol for "${word}".`, "QUERY_START", curr.id);
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (!curr.children[char]) {
                addLog(`Manifold mismatch at character '${char}'.`);
                record(`Bit '${char}' is missing from the manifold. Search aborted.`, "MISS", curr.id, { [curr.id]: 'miss' });
                found = false; break;
            }
            curr = curr.children[char];
            record(`Bit match: '${char}' located. Ascending to next level.`, "SCAN", curr.id);
        }
        if (found) {
            if (curr.isEndOfWord) {
                addLog(`Word "${word}" resolved in memory.`);
                record(`Success. Word "${word}" successfully resolved.`, "RESOLVED", curr.id, { [curr.id]: 'success' });
            } else {
                addLog(`Prefix matched, but no terminal bit for "${word}".`);
                record(`Prefix match found, but terminal bit is absent.`, "PREFIX_ONLY", curr.id);
            }
        }
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
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

  const defaultNodes = useMemo(() => getLayout(rootRef.current), [rootRef.current, getLayout]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
      nodes: defaultNodes, 
      message: "System idle. Input word to initialize memory flow.", 
      step: "IDLE", 
      highlightedId: null, 
      logs: [],
      activeWord: ""
    };
  }, [history, currentIndex, defaultNodes]);

  // --- Dynamic Fit-to-Screen Logic ---
  useEffect(() => {
    if (currentStep.nodes.length === 0) {
        setViewTransform({ x: 0, y: 0, scale: 1 });
        return;
    }

    const PADDING = 80;
    const NODE_RADIUS = 30; 
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    currentStep.nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    minX -= NODE_RADIUS; maxX += NODE_RADIUS;
    minY -= NODE_RADIUS; maxY += NODE_RADIUS;

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    const availWidth = dimensions.width - PADDING;
    const availHeight = dimensions.height - PADDING;

    let newScale = Math.min(availWidth / treeWidth, availHeight / treeHeight);
    newScale = Math.min(Math.max(newScale, 0.1), 1.1);

    const treeCenterX = minX + treeWidth / 2;
    const treeCenterY = minY + treeHeight / 2;
    
    const containerCenterX = dimensions.width / 2;
    const containerCenterY = dimensions.height / 2;

    const newX = containerCenterX - (treeCenterX * newScale);
    const newY = containerCenterY - (treeCenterY * newScale);
    
    setViewTransform({ x: newX, y: newY, scale: newScale });

  }, [currentStep.nodes, dimensions]);

  const getLineCoords = (u: VisualNode, v: VisualNode) => {
    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const radius = 24;
    return {
        x1: u.x + (dx / dist) * radius,
        y1: u.y + (dy / dist) * radius,
        x2: v.x - (dx / dist) * radius,
        y2: v.y - (dy / dist) * radius
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 bg-card border border-border rounded-3xl shadow-2xl font-sans text-foreground relative overflow-hidden">
        {/* Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {/* Header UI */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-[#58C4DD]">
              Trie <span className="text-muted-foreground/40">Lemma Analyzer</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Prefix Memory Manifold</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <input 
                    type="text" value={inputValue} 
                    onChange={e => setInputValue(e.target.value.toUpperCase())}
                    placeholder="KEY"
                    className="w-20 bg-transparent text-center font-mono text-sm font-bold text-[#f59e0b] focus:outline-none placeholder:text-muted-foreground/20"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => recordOperation('INSERT', inputValue)} className="p-2 hover:bg-[#83C167]/10 rounded-xl text-[#83C167] transition-all" title="Insert"><Plus size={20}/></button>
              <button onClick={() => recordOperation('SEARCH', inputValue)} className="p-2 hover:bg-[#58C4DD]/10 rounded-xl text-[#58C4DD] transition-all" title="Search"><Search size={20}/></button>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={() => { rootRef.current = new TrieNode("*"); setHistory([]); setCurrentIndex(0); }} className="p-2 hover:bg-red-500/10 rounded-xl text-muted-foreground/40 hover:text-red-500 transition-all"><RotateCcw size={20}/></button>
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div ref={containerRef} className="lg:col-span-3 relative min-h-[520px] bg-muted/40 rounded-[2.5rem] border border-border overflow-hidden shadow-inner flex flex-col items-center justify-center">
                
                {/* Logic Step Badge */}
                <AnimatePresence>
                    {currentStep.step !== "IDLE" && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-10 flex items-center gap-2 px-4 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30">
                            <Zap size={12} className="text-[#58C4DD]" />
                            <span className="text-[9px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.2em]">{currentStep.step}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Explanation Box */}
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-12 w-full max-w-[400px] px-10 text-center z-30">
                        <div className="p-4 bg-card/80 border border-border rounded-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] text-[#f59e0b] font-mono italic uppercase tracking-tighter">{currentStep.message}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Scalable Container for Tree */}
                <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    animate={{ 
                        x: viewTransform.x, 
                        y: viewTransform.y, 
                        scale: viewTransform.scale 
                    }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    style={{ transformOrigin: "0px 0px" }}
                >
                    {/* SVG Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                        {currentStep.nodes.map(node => {
                            if (!node.parentId) return null;
                            const parent = currentStep.nodes.find(n => n.id === node.parentId);
                            if (!parent) return null;
                            const { x1, y1, x2, y2 } = getLineCoords(parent, node);
                            return (
                                <motion.line
                                    key={`link-${node.id}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="currentColor"
                                    className="text-muted-foreground/10"
                                    strokeWidth="2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    <div className="absolute inset-0 w-full h-full pointer-events-auto">
                        {currentStep.nodes.map(node => {
                            const isA = node.status === 'active';
                            const isS = node.status === 'success';
                            const isM = node.status === 'miss';
                            const isRoot = node.char === '*';

                            return (
                                <motion.div
                                    key={node.id}
                                    initial={{ x: node.x - 24, y: node.y - 24, scale: 0 }}
                                    animate={{ 
                                        x: node.x - 24, 
                                        y: node.y - 24,
                                        backgroundColor: isS ? MANIM_COLORS.green : isA ? MANIM_COLORS.blue : isM ? MANIM_COLORS.red : "var(--card)",
                                        borderColor: isS ? MANIM_COLORS.green : isA ? MANIM_COLORS.blue : isM ? MANIM_COLORS.red : "var(--border)",
                                        scale: isS || isA || isM ? 1.2 : 1,
                                        boxShadow: isS ? `0 0 30px ${MANIM_COLORS.green}44` : isA ? `0 0 20px ${MANIM_COLORS.blue}33` : isM ? `0 0 20px ${MANIM_COLORS.red}33` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="absolute w-12 h-12 border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
                                >
                                    <span className={`text-sm font-black ${isS || isA || isM ? "text-black" : "text-foreground"}`}>{isRoot ? "●" : node.char}</span>
                                    {node.isEndOfWord && !isRoot && (
                                        <div className="absolute -bottom-2 w-2 h-2 rounded-full bg-[#83C167] shadow-[0_0_10px_#83C167]" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Sidebar: Memory Log */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Bit Stream
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2 py-0.5"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Bit stream empty...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Type size={14}/> Word Buffer
                    </h3>
                    <div className="flex gap-1 justify-center">
                        {currentStep.activeWord.split('').map((char, i) => (
                            <div key={i} className="w-6 h-8 bg-card border border-border rounded flex items-center justify-center font-mono text-xs font-black text-[#f59e0b]">
                                {char}
                            </div>
                        ))}
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
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40 transition-all">
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronLeft size={18} /></button>
                    <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-background/10 rounded-lg text-muted-foreground/40"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="relative flex items-center group/slider">
                <div className="absolute w-full h-1 bg-background/10 rounded-full" />
                <div className="absolute h-1 bg-[#58C4DD] rounded-full shadow-[0_0_10px_#58C4DD44]" style={{ width: `${(currentIndex / ((history.length || 1) - 1 || 1)) * 100}%` }} />
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

      {/* Legend */}
      <div className="px-10 py-6 bg-muted/20 border border-border rounded-[2.5rem] flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#83C167]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Resolution</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Active Probe</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Memory Miss</span></div>
         <div className="flex items-center gap-3"><Cpu size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Prefix Manifold</span></div>
      </div>
    </div>
  );
}