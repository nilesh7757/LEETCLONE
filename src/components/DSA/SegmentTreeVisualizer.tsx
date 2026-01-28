"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight, ChevronLeft, GitMerge, MousePointer2, Search, Cpu, Edit3, Hammer, Target } from "lucide-react";

// --- Types & Constants ---
const MANIM_COLORS = {
  blue: "#58C4DD",
  green: "#83C167",
  gold: "#FFFF00",
  red: "#FC6255",
  background: "#1C1C1C",
  text: "#FFFFFF"
};

interface VisualNode {
  id: string;
  nodeIdx: number;
  value: number;
  start: number;
  end: number;
  x: number;
  y: number;
  parentId: string | null;
  status: 'idle' | 'highlighted' | 'contributing' | 'updating';
  visible: boolean;
}

interface HistoryStep {
  nodes: VisualNode[];
  explanation: string;
  activeStep: string | null;
  highlightedId: string | null;
  activeRange: [number, number] | null;
  queryResult?: number | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export default function SegmentTreeVisualizer({ speed = 800 }: { speed?: number }) {
  const [arrayInput, setArrayInput] = useState("1, 3, 5, 7, 9, 11, 13, 15");
  const [arrayData, setArrayData] = useState([1, 3, 5, 7, 9, 11, 13, 15]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opHistory, setOpHistory] = useState<HistoryStep[]>([]);
  
  // Inputs
  const [queryL, setQueryL] = useState("2");
  const [queryR, setQueryR] = useState("5");
  const [updateIdx, setUpdateIdx] = useState("3");
  const [updateVal, setUpdateVal] = useState("10");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update array from input
  const handleArrayUpdate = () => {
    const nums = arrayInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) {
      setArrayData(nums);
      setOpHistory([]);
      setCurrentIndex(0);
    }
  };

  // 1. Layout Engine
  const getLayout = (tree: (number | null)[], n: number) => {
    const visualNodes: VisualNode[] = [];
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    const calculate = (node: number, start: number, end: number, x: number, y: number, offset: number, parentId: string | null) => {
      const id = `node-${node}`;
      const rawVal = tree[node];
      const isVisible = rawVal !== null;
      const val = rawVal ?? 0;
      
      visualNodes.push({ 
        id, 
        nodeIdx: node, 
        value: val, 
        start, 
        end, 
        x, 
        y, 
        parentId, 
        status: 'idle',
        visible: isVisible 
      });

      if (isVisible) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
      }

      if (start !== end) {
        const mid = Math.floor((start + end) / 2);
        calculate(2 * node, start, mid, x - offset, y + 100, offset * 0.5, id);
        calculate(2 * node + 1, mid + 1, end, x + offset, y + 100, offset * 0.5, id);
      }
    };

    calculate(1, 0, n - 1, 0, 0, 240, null);
    // If no nodes visible, provide default bounds to prevent collapse
    if (minX === 0 && maxX === 0) { minX = -100; maxX = 100; minY = 0; maxY = 300; }
    return { nodes: visualNodes, bounds: { minX, maxX, minY, maxY } };
  };

  const currentTree = useMemo(() => {
    const n = arrayData.length;
    const t = new Array(4 * n).fill(0);
    const build = (node: number, start: number, end: number) => {
      if (start === end) t[node] = arrayData[start];
      else {
        const mid = Math.floor((start + end) / 2);
        build(2 * node, start, mid);
        build(2 * node + 1, mid + 1, end);
        t[node] = t[2 * node] + t[2 * node + 1];
      }
    };
    build(1, 0, n - 1);
    return t;
  }, [arrayData]);

  // Helper to gather tree info for animation
  const analyzeTree = (n: number) => {
      const leaves: { node: number, arrayIdx: number }[] = [];
      const internal: { node: number, depth: number }[] = [];
      
      const traverse = (node: number, start: number, end: number, depth: number) => {
          if (start === end) {
              leaves.push({ node, arrayIdx: start });
          } else {
              internal.push({ node, depth });
              const mid = Math.floor((start + end) / 2);
              traverse(2 * node, start, mid, depth + 1);
              traverse(2 * node + 1, mid + 1, end, depth + 1);
          }
      };
      
      traverse(1, 0, n - 1, 0);
      return { leaves, internal };
  };

  // 2. Operation Recording
  const recordOperation = (type: 'QUERY' | 'UPDATE' | 'BUILD') => {
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    const n = arrayData.length;
    const tempTree: (number | null)[] = type === 'BUILD' ? new Array(4 * n).fill(null) : [...currentTree];

    const record = (msg: string, step: string | null, hId: string | null, activeR: [number, number] | null, statusOverrides?: Record<number, string>, result?: number) => {
      const layout = getLayout(tempTree, n);
      const frameNodes = layout.nodes.map(node => ({
        ...node,
        status: (statusOverrides?.[node.nodeIdx] as VisualNode['status']) || (node.id === hId ? 'highlighted' : 'idle')
      }));
      steps.push({
        nodes: frameNodes,
        explanation: msg,
        activeStep: step,
        highlightedId: hId,
        activeRange: activeR,
        queryResult: result,
        bounds: layout.bounds
      });
    };

    if (type === 'BUILD') {
        const { leaves, internal } = analyzeTree(n);
        record("Initializing Memory Manifold from Array Data...", "INIT", null, null);
        leaves.sort((a, b) => a.arrayIdx - b.arrayIdx);
        for (const leaf of leaves) {
            tempTree[leaf.node] = arrayData[leaf.arrayIdx];
            const statuses: Record<number, string> = { [leaf.node]: 'contributing' };
            record(`Placing Array Block [${leaf.arrayIdx}]: Value ${arrayData[leaf.arrayIdx]}`, "PLACE_LEAF", `node-${leaf.node}`, [leaf.arrayIdx, leaf.arrayIdx], statuses);
        }
        const levels = new Map<number, number[]>();
        internal.forEach(item => {
            if (!levels.has(item.depth)) levels.set(item.depth, []);
            levels.get(item.depth)!.push(item.node);
        });
        const sortedDepths = Array.from(levels.keys()).sort((a, b) => b - a);
        for (const depth of sortedDepths) {
            const nodesInLevel = levels.get(depth)!.sort((a, b) => a - b);
            for (const node of nodesInLevel) {
                const leftVal = tempTree[2 * node] ?? 0;
                const rightVal = tempTree[2 * node + 1] ?? 0;
                tempTree[node] = leftVal + rightVal;
                const statuses: Record<number, string> = { 
                    [node]: 'updating',
                    [2 * node]: 'highlighted',
                    [2 * node + 1]: 'highlighted'
                };
                record(`Calculating Node ${node} (Depth ${depth}): ${leftVal} + ${rightVal} = ${tempTree[node]}`, "MERGE", `node-${node}`, null, statuses);
            }
        }
        record("Segment Tree construction complete. Structure fully coherent.", "COMPLETE", null, null);
    }
    else if (type === 'QUERY') {
      const l = parseInt(queryL); const r = parseInt(queryR);
      if (isNaN(l) || isNaN(r) || l > r || l < 0 || r >= n) return;
      const statuses: Record<number, string> = {};
      const query = (node: number, start: number, end: number): number => {
        record(`Evaluating range [${start}, ${end}] for Query [${l}, ${r}].`, "QUERY_RECURSE", `node-${node}`, [l, r], statuses);
        if (r < start || end < l) {
          record(`Range [${start}, ${end}] is disjoint from [${l}, ${r}]. Returning 0.`, "OUT_OF_BOUNDS", `node-${node}`, [l, r], statuses);
          return 0;
        }
        if (l <= start && end <= r) {
          statuses[node] = 'contributing';
          record(`Range [${start}, ${end}] is completely within [${l}, ${r}]. Adding node value ${tempTree[node] ?? 0}.`, "LEAF_MATCH", `node-${node}`, [l, r], statuses);
          return tempTree[node] ?? 0;
        }
        const mid = Math.floor((start + end) / 2);
        return query(2 * node, start, mid) + query(2 * node + 1, mid + 1, end);
      };
      const total = query(1, 0, n - 1);
      record(`Query sequence finalized. Result manifold sum: ${total}.`, "QUERY_COMPLETE", null, [l, r], statuses, total);
    } 
    else if (type === 'UPDATE') {
      const idx = parseInt(updateIdx); const val = parseInt(updateVal);
      if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= n) return;
      const statuses: Record<number, string> = {};
      const update = (node: number, start: number, end: number): void => {
        statuses[node] = 'updating';
        record(`Traversing to index ${idx}. Current node range: [${start}, ${end}].`, "UPDATE_DESCEND", `node-${node}`, null, statuses);
        if (start === end) {
          tempTree[node] = val;
          record(`Leaf node reached. Updating memory cell to ${val}.`, "UPDATE_LEAF", `node-${node}`, null, statuses);
          return;
        }
        const mid = Math.floor((start + end) / 2);
        if (idx <= mid) update(2 * node, start, mid);
        else update(2 * node + 1, mid + 1, end);
        const leftVal = tempTree[2 * node] ?? 0;
        const rightVal = tempTree[2 * node + 1] ?? 0;
        tempTree[node] = leftVal + rightVal;
        record(`Back-propagating sum: ${leftVal} + ${rightVal} = ${tempTree[node]}.`, "UPDATE_ASCEND", `node-${node}`, null, statuses);
      };
      update(1, 0, n - 1);
      setArrayData(prev => { const next = [...prev]; next[idx] = val; return next; });
      record(`Manifold update complete. System state consistent.`, "UPDATE_DONE", null, null, statuses);
    }
    setOpHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= opHistory.length - 1) {
            setIsPlaying(false); return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, opHistory.length, speed]);

  const currentStep = opHistory[currentIndex] || { 
    nodes: getLayout(currentTree, arrayData.length).nodes, 
    explanation: "Segment Tree initialized. Ready for Range Sum Queries.", 
    activeStep: null, 
    highlightedId: null,
    activeRange: null,
    bounds: getLayout(currentTree, arrayData.length).bounds
  };

  const canvasW = 800;
  const canvasH = 500;
  const treeW = currentStep.bounds.maxX - currentStep.bounds.minX;
  const treeH = currentStep.bounds.maxY - currentStep.bounds.minY;
  const treeCenterX = (currentStep.bounds.minX + currentStep.bounds.maxX) / 2;
  const scale = Math.min( (canvasW - 120) / Math.max(treeW, 100), (canvasH - 180) / Math.max(treeH, 100), 1 );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-2xl font-sans text-white relative overflow-hidden group">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 relative z-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-[#58C4DD]">Segment Tree <span className="text-white/20 italic">Lemma</span></h2>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Auto-Scaling RSQ Engine</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-white/30">
                <span className="text-[9px] font-black font-mono text-white/20 uppercase ml-2">Array</span>
                <input value={arrayInput} onChange={e=>setArrayInput(e.target.value)} onBlur={handleArrayUpdate} className="w-32 bg-transparent text-center font-mono text-xs font-bold text-white focus:outline-none" placeholder="1, 2, 3..." />
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-white/30">
               <button onClick={() => recordOperation('BUILD')} className="p-2 bg-white text-black rounded-xl active:scale-90 shadow-lg flex items-center gap-2 px-4 font-bold text-xs"><Hammer size={14} strokeWidth={3}/> BUILD TREE</button>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-[#58C4DD]/30">
                <span className="text-[9px] font-black font-mono text-white/20 uppercase ml-2">Query</span>
                <input value={queryL} onChange={e=>setQueryL(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[#58C4DD] focus:outline-none" />
                <span className="text-white/20">-</span>
                <input value={queryR} onChange={e=>setQueryR(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[#58C4DD] focus:outline-none" />
                <button onClick={() => recordOperation('QUERY')} className="p-2 bg-[#58C4DD] text-black rounded-xl active:scale-90 shadow-lg"><Search size={14} strokeWidth={3}/></button>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner group transition-all hover:border-[#83C167]/30">
                <span className="text-[9px] font-black font-mono text-white/20 uppercase ml-2">Update</span>
                <input value={updateIdx} onChange={e=>setUpdateIdx(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[#83C167] focus:outline-none" />
                <span className="text-white/20">=</span>
                <input value={updateVal} onChange={e=>setUpdateVal(e.target.value)} className="w-8 bg-transparent text-center font-mono text-xs font-bold text-[#83C167] focus:outline-none" />
                <button onClick={() => recordOperation('UPDATE')} className="p-2 bg-[#83C167] text-black rounded-xl active:scale-90 shadow-lg"><Edit3 size={14} strokeWidth={3}/></button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[550px] bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <motion.div animate={{ scale: scale, x: -treeCenterX * scale, y: -450 * scale + (canvasH / 2) }} transition={{ type: "spring", stiffness: 80, damping: 25 }} className="relative w-full h-full flex items-center justify-center">
                <svg className="absolute pointer-events-none overflow-visible w-full h-full" style={{ zIndex: 10 }}>
                    {currentStep.nodes.map((node) => {
                        if (!node.parentId) return null;
                        const parent = currentStep.nodes.find(n => n.id === node.parentId);
                        if (!parent || !node.visible || !parent.visible) return null;
                        return (
                            <motion.line key={`edge-${node.id}`} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} stroke={MANIM_COLORS.blue} strokeWidth="2" strokeLinecap="round" />
                        );
                    })}
                </svg>
                <div className="relative z-20">
                    {currentStep.nodes.map((node) => {
                        const isHighlighted = currentStep.highlightedId === node.id;
                        const isContributing = node.status === 'contributing';
                        const isUpdating = node.status === 'updating';
                        return (
                            <motion.div key={node.id} layout initial={{ scale: 0, opacity: 0 }} animate={{ x: node.x, y: node.y, opacity: node.visible ? 1 : 0, scale: isHighlighted || isContributing || isUpdating ? 1.15 : 1, borderColor: isContributing ? MANIM_COLORS.green : isUpdating ? MANIM_COLORS.red : isHighlighted ? MANIM_COLORS.gold : MANIM_COLORS.blue, boxShadow: isContributing ? `0 0 40px ${MANIM_COLORS.green}66` : isUpdating ? `0 0 40px ${MANIM_COLORS.red}66` : isHighlighted ? `0 0 30px ${MANIM_COLORS.gold}44` : "none" }} className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-[2.5px] rounded-2xl flex flex-col items-center justify-center font-mono bg-[#111111] z-20 shadow-xl" style={{ color: isContributing ? MANIM_COLORS.green : isUpdating ? MANIM_COLORS.red : isHighlighted ? MANIM_COLORS.gold : "white" }} >
                                <span className="text-base font-bold">{node.value}</span>
                                <span className="text-[7px] opacity-30 mt-0.5">[{node.start}-{node.end}]</span>
                                {isHighlighted && (
                                    <motion.div layoutId="node-pointer" className="absolute -top-14 flex flex-col items-center gap-1">
                                        <div className="text-[#FFFF00]"><MousePointer2 size={16} fill="currentColor" className="rotate-[225deg]" /></div>
                                        <span className="text-[8px] font-black text-[#FFFF00] tracking-widest bg-black/40 px-1.5 rounded-full border border-yellow-500/20">SCAN</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-10 w-full flex flex-col items-center gap-4 z-40 pointer-events-none">
                    {currentStep.queryResult !== undefined && currentStep.queryResult !== null && (
                        <div className="px-6 py-3 bg-[#FFFF00] text-black font-black text-xl rounded-2xl shadow-[0_0_30px_#FFFF0044] border-2 border-white/20 uppercase tracking-widest flex items-center gap-3">
                            <Target size={24} />
                            Result: {currentStep.queryResult}
                        </div>
                    )}
                    <div className="p-5 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl max-w-[400px] text-center">
                        <p className="text-[10px] text-[#FFFF00] font-mono leading-relaxed italic uppercase tracking-tighter opacity-80">{currentStep.explanation}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
            <AnimatePresence>
                {currentStep.activeStep && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute top-8 left-8 flex items-center gap-3 px-5 py-2 bg-[#58C4DD]/10 border border-[#58C4DD]/30 rounded-full z-30 shadow-lg backdrop-blur-md">
                        <Cpu size={14} className="text-[#58C4DD]" />
                        <span className="text-[10px] font-black font-mono text-[#58C4DD] uppercase tracking-[0.25em]">{currentStep.activeStep}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
            <div className="md:col-span-8 p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col gap-4 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 text-[#FFFF00]">
                        <GitMerge size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Step {currentIndex + 1} of {opHistory.length || 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all border border-white/5">{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
                        <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-white/5 rounded-xl text-white/40 transition-all active:scale-90"><ChevronLeft size={20} /></button>
                        <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((opHistory.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-white/5 rounded-xl text-white/40 transition-all active:scale-90"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="relative flex items-center group/slider">
                    <div className="absolute w-full h-1 bg-white/10 rounded-full left-0" />
                    <div className="absolute h-1 bg-[#58C4DD] rounded-full" style={{ width: `${(currentIndex / ((opHistory.length || 1) - 1 || 1)) * 100}%` }} />
                    <input type="range" min="0" max={(opHistory.length || 1) - 1} value={currentIndex} onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }} className="w-full h-6 opacity-0 cursor-pointer z-10" />
                    <motion.div className="absolute w-2 h-6 bg-[#FFFF00] rounded-full shadow-[0_0_15px_#FFFF00] pointer-events-none" animate={{ left: `calc(${(currentIndex / ((opHistory.length || 1) - 1 || 1)) * 100}% - 4px)` }} />
                </div>
            </div>
            <div className="md:col-span-4 p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-sm shadow-xl flex flex-col gap-3">
                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2">Memory Manifold (Array)</span>
                <div className="flex flex-wrap gap-1 justify-center">
                    {arrayData.map((val, i) => {
                        const inRange = currentStep.activeRange && i >= currentStep.activeRange[0] && i <= currentStep.activeRange[1];
                        return (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-8 h-8 border-[1.5px] rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-300 ${inRange ? "bg-[#58C4DD]/20 border-[#58C4DD] text-[#58C4DD] shadow-[0_0_10px_rgba(88,196,221,0.2)]" : "border-white/10 text-white/20"}`}> {val} </div>
                                <span className="text-[7px] font-mono opacity-20 mt-1">{i}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
