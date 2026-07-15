"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  Search, ChevronLeft, ChevronRight, Zap, GitBranch,
  ArrowUp, Activity, Plus, Trash2
} from "lucide-react";

const MANIM_COLORS = { 
  text: "var(--foreground)", 
  background: "var(--card)",
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  gold: "var(--viz-cyan)",
  red: "var(--viz-rose)",
  purple: "var(--viz-lavender)"
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

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

  const calculateLayout = React.useCallback((root: BSTNode | null) => {
    const visualNodes: VisualNode[] = [];
    const traverse = (node: BSTNode | null, x: number, y: number, offset: number, parentId: string | null) => {
      if (!node) return;
      visualNodes.push({ id: node.id, value: node.value, x, y, parentId, status: 'idle' });
      const nextOffset = Math.max(offset * 0.55, 30);
      traverse(node.left, x - offset, y + 80, nextOffset, node.id);
      traverse(node.right, x + offset, y + 80, nextOffset, node.id);
    };
    traverse(root, dimensions.width / 2, 80, dimensions.width / 3.5, null);
    return visualNodes;
  }, [dimensions.width]);

  const recordOperation = (type: 'INSERT' | 'SEARCH' | 'DELETE', val: number) => {
    if (isNaN(val)) return;
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];
    let workingRoot = treeRoot ? JSON.parse(JSON.stringify(treeRoot)) : null;

    const record = (root: BSTNode | null, msg: string, step: string, hId: string | null, status: VisualNode['status'] = 'comparing') => {
      const layout = calculateLayout(root);
      const frameNodes = layout.map(n => ({ ...n, status: n.id === hId ? status : 'idle' }));
      steps.push({ nodes: frameNodes, message: msg, step, highlightedId: hId, logs: [...currentLogs] });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    if (type === 'INSERT') {
      addLog(`Starting insert for value ${val}.`);
      if (!workingRoot) {
        workingRoot = new BSTNode(val);
        addLog(`Tree is empty. ${val} becomes the root.`);
        record(workingRoot, `Tree was empty. ${val} is now the root.`, "INSERT_ROOT", workingRoot.id, 'found');
      } else {
        let curr = workingRoot;
        while (curr) {
          record(workingRoot, `Visiting node ${curr.value}. Comparing with ${val}.`, "COMPARE", curr.id);
          if (val < curr.value) {
            record(workingRoot, `${val} < ${curr.value} — going left.`, "GO_LEFT", curr.id);
            if (!curr.left) {
              curr.left = new BSTNode(val);
              addLog(`Inserted ${val} as left child of ${curr.value}.`);
              record(workingRoot, `Empty spot found. Inserted ${val} to the left of ${curr.value}.`, "INSERTED", curr.left.id, 'found');
              break;
            }
            curr = curr.left;
          } else if (val > curr.value) {
            record(workingRoot, `${val} > ${curr.value} — going right.`, "GO_RIGHT", curr.id);
            if (!curr.right) {
              curr.right = new BSTNode(val);
              addLog(`Inserted ${val} as right child of ${curr.value}.`);
              record(workingRoot, `Empty spot found. Inserted ${val} to the right of ${curr.value}.`, "INSERTED", curr.right.id, 'found');
              break;
            }
            curr = curr.right;
          } else {
            addLog(`Value ${val} already exists in the tree.`);
            record(workingRoot, `${val} already exists in the tree. No insert needed.`, "DUPLICATE", curr.id, 'found');
            break;
          }
        }
      }
      setTreeRoot(workingRoot);
    } else if (type === 'SEARCH') {
      addLog(`Searching for ${val}.`);
      let curr = workingRoot;
      while (curr) {
        record(workingRoot, `Checking node ${curr.value}. Is it ${val}?`, "COMPARE", curr.id);
        if (val === curr.value) {
          addLog(`Found ${val}!`);
          record(workingRoot, `Found it! ${val} is here.`, "FOUND", curr.id, 'found');
          break;
        }
        if (val < curr.value) {
          record(workingRoot, `${val} < ${curr.value} — searching left subtree.`, "GO_LEFT", curr.id);
          curr = curr.left;
        } else {
          record(workingRoot, `${val} > ${curr.value} — searching right subtree.`, "GO_RIGHT", curr.id);
          curr = curr.right;
        }
        if (!curr) {
          addLog(`${val} not found in the tree.`);
          record(workingRoot, `Search complete. ${val} is not in the tree.`, "NOT_FOUND", null);
        }
      }
    } else if (type === 'DELETE') {
      addLog(`Deleting node ${val}.`);
      let curr = workingRoot;
      while (curr) {
        record(workingRoot, `Looking for ${val} to delete... checking ${curr.value}.`, "COMPARE", curr.id);
        if (val === curr.value) {
          record(workingRoot, `Found ${val}. Removing node and restructuring tree.`, "DELETING", curr.id, 'discarded');
          const deleteNode = (root: BSTNode | null, v: number): BSTNode | null => {
            if (!root) return null;
            if (v < root.value) root.left = deleteNode(root.left, v);
            else if (v > root.value) root.right = deleteNode(root.right, v);
            else {
              if (!root.left) return root.right;
              if (!root.right) return root.left;
              let minNode = root.right;
              while (minNode.left) minNode = minNode.left;
              root.value = minNode.value;
              root.right = deleteNode(root.right, minNode.value);
            }
            return root;
          };
          workingRoot = deleteNode(workingRoot, val);
          addLog(`Node ${val} removed. Tree restructured.`);
          record(workingRoot, `Node ${val} deleted. Tree restructured.`, "DELETED", null);
          break;
        }
        curr = val < curr.value ? curr.left : curr.right;
        if (!curr) record(workingRoot, `${val} not found. Nothing to delete.`, "NOT_FOUND", null);
      }
      setTreeRoot(workingRoot);
    }

    setHistory(steps);
    setCurrentIndex(0);
    setIsPlaying(true);
    setInputValue("");
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

  const defaultNodes = useMemo(() => calculateLayout(treeRoot), [treeRoot, calculateLayout]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || {
      nodes: defaultNodes,
      message: "Enter a value and press Insert, Search, or Delete.",
      step: "IDLE",
      highlightedId: null,
      logs: []
    };
  }, [history, currentIndex, defaultNodes]);

  const viewTransform = useMemo(() => {
    if (currentStep.nodes.length === 0) return { x: 0, y: 0, scale: 1 };
    const PADDING = 80;
    const NODE_RADIUS = 30;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    currentStep.nodes.forEach(node => {
      minX = Math.min(minX, node.x); maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y); maxY = Math.max(maxY, node.y);
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
    return {
      x: dimensions.width / 2 - treeCenterX * newScale,
      y: dimensions.height / 2 - treeCenterY * newScale,
      scale: newScale
    };
  }, [currentStep.nodes, dimensions]);

  const getLineCoords = (u: VisualNode, v: VisualNode) => {
    const dx = v.x - u.x, dy = v.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = 24;
    return { x1: u.x + (dx / dist) * r, y1: u.y + (dy / dist) * r, x2: v.x - (dx / dist) * r, y2: v.y - (dy / dist) * r };
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header + Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl">
            <input
              type="number" value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && recordOperation('INSERT', parseInt(inputValue))}
              placeholder="VAL"
              className="w-10 bg-transparent text-center font-mono text-xs font-bold text-[var(--viz-cyan)] focus:outline-none placeholder:text-[var(--muted-foreground)]/20"
            />
          </div>
          <button onClick={() => recordOperation('INSERT', parseInt(inputValue))} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-green)]/10 hover:bg-[var(--viz-green)]/20 rounded-xl text-[var(--viz-green)] transition-all text-[10px] font-bold uppercase cursor-pointer" title="Insert"><Plus size={12}/> Insert</button>
          <button onClick={() => recordOperation('SEARCH', parseInt(inputValue))} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-lime)]/10 hover:bg-[var(--viz-lime)]/20 rounded-xl text-[var(--viz-lime)] transition-all text-[10px] font-bold uppercase cursor-pointer" title="Search"><Search size={12}/> Search</button>
          <button onClick={() => recordOperation('DELETE', parseInt(inputValue))} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--viz-rose)]/10 hover:bg-[var(--viz-rose)]/20 rounded-xl text-[var(--viz-rose)] transition-all text-[10px] font-bold uppercase cursor-pointer" title="Delete"><Trash2 size={12}/> Delete</button>
          <button onClick={() => { setTreeRoot(null); setHistory([]); setCurrentIndex(0); }} className="p-2.5 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-red-500 transition-all cursor-pointer"><RotateCcw size={14}/></button>
        </div>

        {/* Method Badge */}
        <div className="px-3 py-1.5 bg-[var(--muted)]/20 border border-[var(--border)]/40 rounded-xl text-[10px] font-mono text-[var(--muted-foreground)] font-bold tracking-tight">
          Binary Search Tree (BST)
        </div>
      </div>


      {/* ── Tree info bar ── */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[10px] font-mono">
        <span className="text-[var(--muted-foreground)]/50">Nodes: <strong className="text-[var(--viz-lavender)]">{currentStep.nodes.length}</strong></span>
        <span className="text-[var(--muted-foreground)]/50">Step: <strong className="text-[var(--viz-cyan)]">{currentStep.step}</strong></span>
        {currentStep.nodes.length > 0 && (
          <span className="text-[var(--muted-foreground)]/50">Root: <strong className="text-[var(--viz-green)]">{currentStep.nodes.find(n => !n.parentId)?.value ?? '—'}</strong></span>
        )}
      </div>

      {/* ── Visual Canvas (no overflow) ── */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[350px] md:min-h-[520px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner"
      >
        {/* Grid backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Empty state */}
        {currentStep.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <GitBranch size={32} className="text-[var(--viz-lavender)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Tree is empty</span>
              <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">Insert a value to begin</span>
            </div>
          </div>
        )}

        {/* Step badge */}
        <AnimatePresence>
          {currentStep.step !== "IDLE" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--viz-lavender)]/10 border border-[var(--viz-lavender)]/30 rounded-full z-30">
              <Zap size={10} className="text-[var(--viz-lavender)]" />
              <span className="text-[9px] font-black font-mono text-[var(--viz-lavender)] uppercase tracking-widest">{currentStep.step}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tree (auto-fit, no scroll) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          animate={{ x: viewTransform.x, y: viewTransform.y, scale: viewTransform.scale }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          style={{ transformOrigin: "0px 0px" }}
        >
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {currentStep.nodes.map(node => {
              if (!node.parentId) return null;
              const parent = currentStep.nodes.find(n => n.id === node.parentId);
              if (!parent) return null;
              const { x1, y1, x2, y2 } = getLineCoords(parent, node);
              return (
                <motion.line key={`link-${node.id}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="currentColor" className="text-[var(--muted-foreground)]/20"
                  strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {currentStep.nodes.map(node => {
              const isH = node.status === 'comparing';
              const isF = node.status === 'found';
              const isD = node.status === 'discarded';
              return (
                <motion.div key={node.id}
                  initial={{ x: node.x - 24, y: node.y - 24, scale: 0 }}
                  animate={{
                    x: node.x - 24, y: node.y - 24,
                    backgroundColor: isF ? MANIM_COLORS.green : isH ? MANIM_COLORS.blue : isD ? MANIM_COLORS.red : "var(--card)",
                    borderColor: isF ? MANIM_COLORS.green : isH ? MANIM_COLORS.blue : isD ? MANIM_COLORS.red : "var(--border)",
                    scale: isF || isH || isD ? 1.2 : 1,
                    boxShadow: isF ? `0 0 30px ${MANIM_COLORS.green}44` : isH ? `0 0 20px ${MANIM_COLORS.blue}33` : isD ? `0 0 20px ${MANIM_COLORS.red}33` : "none"
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 25 }}
                  className="absolute w-12 h-12 border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
                >
                  <span className={`text-sm font-black ${isF || isH || isD ? "text-black" : "text-[var(--foreground)]"}`}>{node.value}</span>
                  {isH && (
                    <motion.div layoutId="ptr" className="absolute -top-8 flex flex-col items-center">
                      <ArrowUp size={14} className="text-[var(--viz-lavender)]" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Step message (below canvas) ── */}
      <div className="w-full px-4 py-2.5 bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl text-center">
        <p className="text-xs text-[var(--viz-cyan)] font-mono font-medium">{currentStep.message}</p>
      </div>

      {/* ── Step log (below canvas) ── */}
      {currentStep.logs.length > 0 && (
        <div className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl px-4 py-3 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50 flex items-center gap-1.5">
            <Activity size={10} /> Step Log
          </span>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-1">
            {currentStep.logs.slice(0, 4).map((log, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-mono text-[var(--muted-foreground)]/60 leading-tight">
                <span className="text-[var(--viz-lavender)] mr-1">»</span>{log}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrubber + nav ── */}
      <div className="flex flex-col gap-3 w-full p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--viz-lavender)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Step {currentIndex + 1} of {history.length || 1}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex === 0}><ChevronLeft size={18} /></button>
            <button onClick={() => { setIsPlaying(false); setCurrentIndex(Math.min((history.length || 1) - 1, currentIndex + 1)); }} className="p-1.5 hover:bg-[var(--accent)] rounded-lg text-[var(--muted-foreground)]/40 transition-all" disabled={currentIndex >= (history.length || 1) - 1}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <div className="absolute w-full h-1 bg-[var(--muted)]/30 rounded-full" />
          <div className="absolute h-1 bg-[var(--viz-lavender)] rounded-full transition-all"
            style={{ width: `${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}%` }} />
          <input type="range" min="0" max={Math.max((history.length || 1) - 1, 0)} value={currentIndex}
            onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }}
            className="w-full h-6 opacity-0 cursor-pointer z-10" />
          <div className="absolute w-1.5 h-4 bg-[var(--viz-cyan)] rounded-full pointer-events-none transition-all"
            style={{ left: `calc(${(currentIndex / Math.max((history.length || 1) - 1, 1)) * 100}% - 3px)` }} />
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="px-4 py-4 bg-[var(--muted)]/10 rounded-2xl border border-[var(--border)]/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-green)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Found / Inserted</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Comparing</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Deleting</span></div>
        <div className="flex items-center gap-2"><GitBranch size={12} className="text-[var(--muted-foreground)]/20" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">BST Edge</span></div>
      </div>
    </div>
  );
}
