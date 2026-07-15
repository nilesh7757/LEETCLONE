"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Pause, Hash, 
  Search, ChevronLeft, ChevronRight, Zap, 
  Plus, Type, Activity
} from "lucide-react";

const COLORS = { 
  blue: "var(--viz-lavender)",
  green: "var(--viz-green)",
  cyan: "var(--viz-cyan)",
  red: "var(--viz-rose)",
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

// ── Proper layout: assign x coords bottom-up, guarantee MIN_GAP between siblings ──
const NODE_RADIUS = 24;
const LEVEL_HEIGHT = 90;
const MIN_GAP = 56; // minimum px between sibling node centres

function computeLayout(root: TrieNode, containerWidth: number): VisualNode[] {
  const nodes: VisualNode[] = [];

  // Post-order: assign subtree width first, then centre parent over children
  function measure(node: TrieNode): number {
    const keys = Object.keys(node.children).sort();
    if (keys.length === 0) return NODE_RADIUS * 2;
    let total = 0;
    keys.forEach((k, i) => {
      total += measure(node.children[k]);
      if (i < keys.length - 1) total += MIN_GAP;
    });
    return Math.max(total, NODE_RADIUS * 2);
  }

  function place(node: TrieNode, left: number, y: number, parentId: string | null) {
    const width = measure(node);
    const x = left + width / 2;
    nodes.push({ id: node.id, char: node.char, x, y, parentId, isEndOfWord: node.isEndOfWord, status: 'idle' });

    const keys = Object.keys(node.children).sort();
    let cursor = left;
    keys.forEach(k => {
      const childW = measure(node.children[k]);
      place(node.children[k], cursor, y + LEVEL_HEIGHT, node.id);
      cursor += childW + MIN_GAP;
    });
  }

  // Centre the root in container
  const totalW = measure(root);
  const startX = Math.max(0, (containerWidth - totalW) / 2);
  place(root, startX, 60, null);
  return nodes;
}

export default function TrieVisualizer({ speed = 800 }: { speed?: number }) {
  const [treeRoot, setTreeRoot] = useState<TrieNode>(() => new TrieNode("*"));
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

  const getLayout = useCallback((root: TrieNode) => {
    return computeLayout(root, dimensions.width);
  }, [dimensions.width]);

  const recordOperation = (type: 'INSERT' | 'SEARCH', rawWord: string) => {
    if (!rawWord) return;
    const word = rawWord.toUpperCase().trim().slice(0, 12);
    setIsPlaying(false);
    const steps: HistoryStep[] = [];
    let currentLogs: string[] = [];

    const cloneTrie = (node: TrieNode): TrieNode => {
      const n = new TrieNode(node.char);
      n.id = node.id;
      n.isEndOfWord = node.isEndOfWord;
      Object.keys(node.children).forEach(key => { n.children[key] = cloneTrie(node.children[key]); });
      return n;
    };
    const root = cloneTrie(treeRoot);

    const record = (msg: string, step: string, hId: string | null, statusOverride?: Record<string, VisualNode['status']>) => {
      const layout = getLayout(root);
      const frameNodes = layout.map(n => ({
        ...n,
        status: statusOverride?.[n.id] || (n.id === hId ? 'active' : n.status)
      }));
      steps.push({ nodes: frameNodes, message: msg, step, highlightedId: hId, logs: [...currentLogs], activeWord: word });
    };

    const addLog = (l: string) => { currentLogs = [l, ...currentLogs]; };

    if (type === 'INSERT') {
      addLog(`Inserting word "${word}".`);
      let curr = root;
      record(`Starting insert of "${word}". At root.`, "START", curr.id);

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children[char]) {
          curr.children[char] = new TrieNode(char);
          addLog(`'${char}' not found — created new node.`);
          record(`'${char}' is new. Created node for it.`, "CREATE", curr.children[char].id);
        } else {
          addLog(`'${char}' already exists — following it.`);
          record(`'${char}' exists. Following existing path.`, "FOLLOW", curr.children[char].id);
        }
        curr = curr.children[char];
      }
      curr.isEndOfWord = true;
      addLog(`"${word}" fully inserted. Marked as complete word.`);
      record(`"${word}" inserted. End-of-word marker set.`, "DONE", curr.id, { [curr.id]: 'success' });
      setTreeRoot(root);
    } else {
      addLog(`Searching for "${word}".`);
      let curr = root;
      let found = true;
      record(`Searching for "${word}". Starting at root.`, "START", curr.id);

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children[char]) {
          addLog(`'${char}' not found — search failed.`);
          record(`'${char}' is missing. "${word}" is not in the trie.`, "NOT_FOUND", curr.id, { [curr.id]: 'miss' });
          found = false;
          break;
        }
        curr = curr.children[char];
        record(`Found '${char}'. Moving deeper (${i + 1}/${word.length}).`, "MATCH", curr.id);
      }
      if (found) {
        if (curr.isEndOfWord) {
          addLog(`"${word}" found!`);
          record(`"${word}" found in the trie.`, "FOUND", curr.id, { [curr.id]: 'success' });
        } else {
          addLog(`"${word}" is only a prefix, not a full word.`);
          record(`"${word}" is a prefix but not a complete word.`, "PREFIX_ONLY", curr.id);
        }
      }
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

  const defaultNodes = useMemo(() => getLayout(treeRoot), [treeRoot, getLayout]);

  const currentStep = useMemo(() => {
    return history[currentIndex] || {
      nodes: defaultNodes,
      message: "Enter a word and press Insert or Search.",
      step: "IDLE",
      highlightedId: null,
      logs: [],
      activeWord: ""
    };
  }, [history, currentIndex, defaultNodes]);

  // Auto-fit: pan/scale so the whole tree is always visible
  const viewTransform = useMemo(() => {
    if (currentStep.nodes.length === 0) return { x: 0, y: 0, scale: 1 };
    const PAD = 60;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    currentStep.nodes.forEach(n => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    minX -= NODE_RADIUS + PAD; maxX += NODE_RADIUS + PAD;
    minY -= NODE_RADIUS + PAD; maxY += NODE_RADIUS + PAD;
    const tw = maxX - minX, th = maxY - minY;
    let scale = Math.min((dimensions.width - PAD) / tw, (dimensions.height - PAD) / th);
    scale = Math.min(Math.max(scale, 0.1), 1.1);
    return {
      x: dimensions.width / 2 - (minX + tw / 2) * scale,
      y: dimensions.height / 2 - (minY + th / 2) * scale,
      scale
    };
  }, [currentStep.nodes, dimensions]);

  const getLineCoords = (u: VisualNode, v: VisualNode) => {
    const dx = v.x - u.x, dy = v.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = NODE_RADIUS;
    return { x1: u.x + (dx / dist) * r, y1: u.y + (dy / dist) * r, x2: v.x - (dx / dist) * r, y2: v.y - (dy / dist) * r };
  };

  return (
    <div className="flex flex-col gap-4 select-none font-sans w-full">

      {/* ── Header + Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--viz-lavender)]">Trie Visualizer</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]/40">Prefix Tree — Insert &amp; Search</p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--muted)] p-2 rounded-2xl shadow-inner flex-wrap">
          <div className="flex items-center gap-2 px-3 border-r border-[var(--border)]">
            <input
              type="text" value={inputValue}
              onChange={e => setInputValue(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && recordOperation('INSERT', inputValue)}
              placeholder="WORD"
              className="w-20 bg-transparent text-center font-mono text-sm font-bold text-[var(--viz-cyan)] focus:outline-none placeholder:text-[var(--muted-foreground)]/20"
            />
          </div>
          <div className="flex gap-1">
            <button onClick={() => recordOperation('INSERT', inputValue)} className="flex items-center gap-1 px-2 py-1.5 hover:bg-[var(--viz-green)]/10 rounded-xl text-[var(--viz-green)] transition-all text-[10px] font-bold uppercase" title="Insert"><Plus size={14}/> Insert</button>
            <button onClick={() => recordOperation('SEARCH', inputValue)} className="flex items-center gap-1 px-2 py-1.5 hover:bg-[var(--viz-lavender)]/10 rounded-xl text-[var(--viz-lavender)] transition-all text-[10px] font-bold uppercase" title="Search"><Search size={14}/> Search</button>
            <div className="w-px h-6 bg-[var(--border)] mx-1 self-center" />
            <button onClick={() => { setTreeRoot(new TrieNode("*")); setHistory([]); setCurrentIndex(0); }} className="p-1.5 hover:bg-red-500/10 rounded-xl text-[var(--muted-foreground)]/40 hover:text-red-500 transition-all"><RotateCcw size={16}/></button>
          </div>
        </div>
      </div>

      {/* ── Active word display ── */}
      {currentStep.activeWord && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <Type size={12} className="text-[var(--muted-foreground)]/40" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/40">Current Word</span>
          <div className="flex gap-1">
            {currentStep.activeWord.split('').map((char, i) => (
              <div key={i} className="w-6 h-7 bg-[var(--muted)]/50 rounded flex items-center justify-center font-mono text-xs font-black text-[var(--viz-cyan)]">
                {char}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Visual Canvas (no overflow, proper spacing) ── */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[350px] md:min-h-[520px] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)] overflow-hidden shadow-inner"
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        {/* Empty state */}
        {currentStep.nodes.length <= 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Type size={32} className="text-[var(--viz-lavender)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Trie is empty</span>
              <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">Insert a word to begin</span>
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

        {/* Auto-fit tree */}
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
                  stroke="currentColor" className="text-[var(--muted-foreground)]/15"
                  strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            {currentStep.nodes.map(node => {
              const isA = node.status === 'active';
              const isS = node.status === 'success';
              const isM = node.status === 'miss';
              const isRoot = node.char === '*';
              return (
                <motion.div key={node.id}
                  initial={{ x: node.x - NODE_RADIUS, y: node.y - NODE_RADIUS, scale: 0 }}
                  animate={{
                    x: node.x - NODE_RADIUS, y: node.y - NODE_RADIUS,
                    backgroundColor: isS ? COLORS.green : isA ? COLORS.blue : isM ? COLORS.red : "var(--card)",
                    borderColor: isS ? COLORS.green : isA ? COLORS.blue : isM ? COLORS.red : "var(--border)",
                    scale: isS || isA || isM ? 1.2 : 1,
                    boxShadow: isS ? `0 0 30px ${COLORS.green}44` : isA ? `0 0 20px ${COLORS.blue}33` : isM ? `0 0 20px ${COLORS.red}33` : "none"
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 25 }}
                  className="absolute border-2 rounded-full z-20 flex items-center justify-center font-mono shadow-lg"
                  style={{ width: NODE_RADIUS * 2, height: NODE_RADIUS * 2 }}
                >
                  <span className={`text-sm font-black ${isS || isA || isM ? "text-black" : "text-[var(--foreground)]"}`}>
                    {isRoot ? "●" : node.char}
                  </span>
                  {node.isEndOfWord && !isRoot && (
                    <div className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-[var(--viz-green)] shadow-[0_0_8px_var(--viz-green)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Step message (below canvas, not overlapping) ── */}
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
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-lavender)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Current Node</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[var(--viz-rose)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">Not Found</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--viz-green)]" /><span className="text-[9px] md:text-[10px] font-bold uppercase text-[var(--muted-foreground)]/30 tracking-widest">End of Word</span></div>
      </div>
    </div>
  );
}
