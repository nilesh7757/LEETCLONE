"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Sparkles, Hash, Link as LinkIcon, 
  Search, Info, ChevronLeft, ChevronRight, Zap, GitBranch,
  Layers, ArrowUp, MousePointer2, Network, Share2, StepForward,
  TrendingUp, Activity, Layout, Plus, Trash2, Cpu
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
  value: number;
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'highlighted' | 'found' | 'comparing' | 'discarded';
}

interface HistoryStep {
  nodes: VisualNode[];
  message: string;
  step: string;
  highlightedId: string | null;
  logs: string[];
}

class BSTNode {
  value: number;
  id: string;
  left: BSTNode | null = null;
  right: BSTNode | null = null;

  constructor(value: number) {
    this.value = value;
    this.id = `node-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function BSTVisualizer({ speed = 800 }: { speed?: number }) {
  const [treeRoot, setTreeRoot] = useState<BSTNode | null>(null);
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

  // Tree Layout Algorithm (Stable coordinates)
  const calculateLayout = React.useCallback((root: BSTNode | null) => {
    const visualNodes: VisualNode[] = [];
    // Start traverse with wider initial offset to separate subtrees better
    const traverse = (node: BSTNode | null, x: number, y: number, offset: number, parentId: string | null) => {
      if (!node) return;
      visualNodes.push({ id: node.id, value: node.value, x, y, parentId, status: 'idle' });
      // Reduce offset factor slightly less aggressively to prevent overlap
      const nextOffset = Math.max(offset * 0.55, 30); 
      traverse(node.left, x - offset, y + 80, nextOffset, node.id);
      traverse(node.right, x + offset, y + 80, nextOffset, node.id);
    };
    traverse(root, dimensions.width / 2, 80, dimensions.width / 3.5, null);
    return visualNodes;
  }, [dimensions.width]); // Removed full 'dimensions' obj dependency, just width is enough

  const recordOperation = (type: 'INSERT' | 'SEARCH' | 'DELETE', val: number) => {
    if (isNaN(val)) return;
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    let workingRoot = treeRoot ? JSON.parse(JSON.stringify(treeRoot)) : null; // Deep copy for sim

    // Reconstruction helper
    const record = (root: BSTNode | null, msg: string, step: string, hId: string | null, status: VisualNode['status'] = 'comparing') => {
      const layout = calculateLayout(root);
      const frameNodes = layout.map(n => ({
        ...n,
        status: n.id === hId ? status : 'idle'
      }));
      steps.push({
        nodes: frameNodes,
        message: msg,
        step: step,
        highlightedId: hId,
        logs: [...currentLogs]
      });
    };

    const addLog = (l: string) => currentLogs = [l, ...currentLogs];

    if (type === 'INSERT') {
      addLog(`Initializing insertion for value ${val}.`);
      if (!workingRoot) {
        workingRoot = new BSTNode(val);
        addLog(`BST empty. Allocated root for ${val}.`);
        record(workingRoot, `Allocated root manifold for value ${val}.`, "INIT_ROOT", workingRoot.id, 'found');
      } else {
        let curr = workingRoot;
        let parent = null;
        while (curr) {
          record(workingRoot, `Evaluating node ${curr.value}.`, "TRAVERSE", curr.id);
          parent = curr;
          if (val < curr.value) {
            record(workingRoot, `${val} < ${curr.value}: Descending LEFT manifold.`, "DESCEND_L", curr.id);
            if (!curr.left) {
              curr.left = new BSTNode(val);
              addLog(`Linked ${val} to left of ${curr.value}.`);
              record(workingRoot, `Terminal located. Linking ${val} to left of ${curr.value}.`, "LINK", curr.left.id, 'found');
              break;
            }
            curr = curr.left;
          } else if (val > curr.value) {
            record(workingRoot, `${val} > ${curr.value}: Descending RIGHT manifold.`, "DESCEND_R", curr.id);
            if (!curr.right) {
              curr.right = new BSTNode(val);
              addLog(`Linked ${val} to right of ${curr.value}.`);
              record(workingRoot, `Terminal located. Linking ${val} to right of ${curr.value}.`, "LINK", curr.right.id, 'found');
              break;
            }
            curr = curr.right;
          } else {
            addLog(`Value ${val} already exists in hierarchy.`);
            record(workingRoot, `Value ${val} already exists in the memory manifold.`, "DUPLICATE", curr.id, 'found');
            break;
          }
        }
      }
      setTreeRoot(workingRoot);
    } else if (type === 'SEARCH') {
        addLog(`Searching for target ${val}.`);
        let curr = workingRoot;
        while (curr) {
          record(workingRoot, `Comparing target ${val} with node ${curr.value}.`, "SCAN", curr.id);
          if (val === curr.value) {
            addLog(`Target ${val} resolved.`);
            record(workingRoot, `Resolution successful. Target ${val} located.`, "FOUND", curr.id, 'found');
            break;
          }
          if (val < curr.value) {
            record(workingRoot, `${val} < ${curr.value}: Moving to left child.`, "SEARCH_L", curr.id);
            curr = curr.left;
          } else {
            record(workingRoot, `${val} > ${curr.value}: Moving to right child.`, "SEARCH_R", curr.id);
            curr = curr.right;
          }
          if (!curr) {
            addLog(`Target ${val} not found in hierarchy.`);
            record(workingRoot, `Traversal complete. Target ${val} does not exist in this manifold.`, "NOT_FOUND", null);
          }
        }
    } else if (type === 'DELETE') {
        addLog(`Initiating deletion for ${val}.`);
        let curr = workingRoot;
        while (curr) {
            record(workingRoot, `Locating ${val} for deletion...`, "SCAN", curr.id);
            if (val === curr.value) {
                record(workingRoot, `Target ${val} isolated. Reconstructing manifold...`, "ISOLATED", curr.id, 'discarded');
                // Basic deletion logic for state update
                const deleteNode = (root: any, v: number): any => {
                    if (!root) return null;
                    if (v < root.value) root.left = deleteNode(root.left, v);
                    else if (v > root.value) root.right = deleteNode(root.right, v);
                    else {
                        if (!root.left) return root.right;
                        if (!root.right) return root.left;
                        let min = root.right;
                        while (min.left) min = min.left;
                        root.value = min.value;
                        root.right = deleteNode(root.right, min.value);
                    }
                    return root;
                };
                workingRoot = deleteNode(workingRoot, val);
                addLog(`Node ${val} removed. Manifold re-balanced.`);
                record(workingRoot, `Node ${val} purged. Hierarchy re-balanced.`, "PURGED", null);
                break;
            }
            curr = val < curr.value ? curr.left : curr.right;
            if (!curr) record(workingRoot, `Target ${val} not found. Deletion aborted.`, "ABORT", null);
        }
        setTreeRoot(workingRoot);
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

  const defaultNodes = useMemo(() => calculateLayout(treeRoot), [treeRoot, calculateLayout]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || { 
      nodes: defaultNodes, 
      message: "System idle. Input value to initialize manifold.", 
      step: "IDLE", 
      highlightedId: null, 
      logs: [] 
    };
  }, [history, currentIndex, defaultNodes]);

  // --- Dynamic Fit-to-Screen Logic ---
  useEffect(() => {
    if (currentStep.nodes.length === 0) {
        setViewTransform({ x: 0, y: 0, scale: 1 });
        return;
    }

    const PADDING = 80;
    const NODE_RADIUS = 30; // 24px + border/shadow
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    currentStep.nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    // Add buffer
    minX -= NODE_RADIUS;
    maxX += NODE_RADIUS;
    minY -= NODE_RADIUS;
    maxY += NODE_RADIUS;

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    // Available viewport
    const availWidth = dimensions.width - PADDING;
    const availHeight = dimensions.height - PADDING;

    // Calculate Scale
    // We clamp scale at 1.1 to avoid zooming in too much on single nodes, and min at 0.1
    let newScale = Math.min(availWidth / treeWidth, availHeight / treeHeight);
    newScale = Math.min(Math.max(newScale, 0.1), 1.1);

    // Calculate Translation to Center
    // We want the center of the tree (midX, midY) to align with the center of the container (dimW/2, dimH/2)
    // Since we use transform-origin: 0 0, we need to shift:
    // x = centerContainer - (minX * scale) - (treeWidth * scale) / 2
    
    const treeCenterX = minX + treeWidth / 2;
    const treeCenterY = minY + treeHeight / 2;
    
    const containerCenterX = dimensions.width / 2;
    const containerCenterY = dimensions.height / 2;

    const newX = containerCenterX - (treeCenterX * newScale);
    const newY = containerCenterY - (treeCenterY * newScale);
    
    setViewTransform({ x: newX, y: newY, scale: newScale });

  }, [currentStep.nodes, dimensions]);


  // SVG Edge Calculation
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
              BST <span className="text-muted-foreground/40">Lemma Analysis</span>
            </h2>
            <div className="flex items-center gap-3">
               <div className="h-1 w-12 bg-[#58C4DD] rounded-full" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30">Binary Search Tree Visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-2 rounded-2xl border border-border shadow-inner">
            <div className="flex items-center gap-2 px-3 border-r border-border">
                <input 
                    type="number" value={inputValue} 
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Val"
                    className="w-12 bg-transparent text-center font-mono text-sm font-bold text-[#f59e0b] focus:outline-none placeholder:text-muted-foreground/20"
                />
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="p-2 hover:bg-[#83C167]/10 rounded-xl text-[#83C167] transition-all" title="Insert"><Plus size={20}/></button>
              <button onClick={() => recordOperation('SEARCH', parseInt(inputValue))} className="p-2 hover:bg-[#58C4DD]/10 rounded-xl text-[#58C4DD] transition-all" title="Search"><Search size={20}/></button>
              <button onClick={() => recordOperation('DELETE', parseInt(inputValue))} className="p-2 hover:bg-[#FC6255]/10 rounded-xl text-[#FC6255] transition-all" title="Delete"><Trash2 size={20}/></button>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={() => { setTreeRoot(null); setHistory([]); setCurrentIndex(0); }} className="p-2 hover:bg-red-500/10 rounded-xl text-muted-foreground/40 hover:text-red-500 transition-all"><RotateCcw size={20}/></button>
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

                {/* Status Explanation */}
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
                                    className="text-muted-foreground/20"
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
                            const isH = node.status === 'comparing';
                            const isF = node.status === 'found';
                            const isD = node.status === 'discarded';

                            return (
                                <motion.div
                                    key={node.id}
                                    initial={{ x: node.x - 24, y: node.y - 24, scale: 0 }}
                                    animate={{ 
                                        x: node.x - 24, 
                                        y: node.y - 24,
                                        backgroundColor: isF ? MANIM_COLORS.green : isH ? MANIM_COLORS.blue : isD ? MANIM_COLORS.red : "var(--card)",
                                        borderColor: isF ? MANIM_COLORS.green : isH ? MANIM_COLORS.blue : isD ? MANIM_COLORS.red : "var(--border)",
                                        scale: isF || isH || isD ? 1.2 : 1,
                                        boxShadow: isF ? `0 0 30px ${MANIM_COLORS.green}44` : isH ? `0 0 20px ${MANIM_COLORS.blue}33` : isD ? `0 0 20px ${MANIM_COLORS.red}33` : "none"
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                                    className="absolute w-12 h-12 border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
                                >
                                    <span className={`text-sm font-black ${isF || isH || isD ? "text-black" : "text-foreground"}`}>{node.value}</span>
                                    {isH && (
                                        <motion.div layoutId="ptr" className="absolute -top-10 flex flex-col items-center">
                                            <ArrowUp size={14} className="text-[#58C4DD]" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Sidebar: Resolution Log */}
            <div className="flex flex-col gap-6">
                <div className="p-6 bg-muted border border-border rounded-[2rem] flex flex-col gap-4 flex-1 h-[300px] overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Execution Flow
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                        <AnimatePresence>
                            {currentStep.logs.map((log, i) => (
                                <motion.div
                                    key={`log-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono text-muted-foreground/60 flex gap-2 border-l-2 border-border pl-2"
                                >
                                    <span className="text-[#58C4DD]">»</span>
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentStep.logs.length === 0 && <span className="text-[9px] italic text-muted-foreground/20 text-center py-8">Awaiting input...</span>}
                    </div>
                </div>

                <div className="p-6 bg-muted border border-border rounded-[2rem]">
                    <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={14}/> Node Specs
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-muted-foreground/40 uppercase">Total Nodes</span>
                            <span className="text-[#58C4DD] font-black">{currentStep.nodes.length}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-muted-foreground/40 uppercase">Memory State</span>
                            <span className="text-[#83C167] font-black uppercase">Optimized</span>
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
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Target Resolution</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#58C4DD]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Comparing</span></div>
         <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#FC6255]" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Isolated/Purged</span></div>
         <div className="flex items-center gap-3"><GitBranch size={14} className="text-muted-foreground/20" /><span className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-widest">Binary Hierarchy</span></div>
      </div>
    </div>
  );
}