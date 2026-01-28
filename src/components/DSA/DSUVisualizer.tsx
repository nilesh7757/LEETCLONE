"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Link, Search, ArrowRight } from "lucide-react";

export default function DSUVisualizer({ speed = 600 }: { speed?: number }) {
  const [parent, setParent] = useState<number[]>([]);
  const [rank, setRank] = useState<number[]>([]);
  const [highlightNodes, setHighlightNodes] = useState<number[]>([]);
  const [activePath, setActivePath] = useState<number[]>([]); // Path for finding
  const [message, setMessage] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Inputs
  const [nodeU, setNodeU] = useState("0");
  const [nodeV, setNodeV] = useState("1");

  useEffect(() => {
    reset();
  }, []);

  const reset = () => {
    const p = Array.from({ length: 8 }, (_, i) => i);
    const r = new Array(8).fill(0);
    setParent(p);
    setRank(r);
    setHighlightNodes([]);
    setActivePath([]);
    setMessage("Ready");
    setIsAnimating(false);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Find with Path Compression visualization
  const find = async (i: number): Promise<number> => {
    setActivePath(prev => [...prev, i]);
    setHighlightNodes([i]);
    setMessage(`Finding parent of ${i}...`);
    await sleep(speed);

    if (parent[i] !== i) {
        setMessage(`${i} is not root. Going to parent ${parent[i]}`);
        const root = await find(parent[i]);
        
        // Path Compression Visual
        if (parent[i] !== root) {
            setMessage(`Path Compression: Pointing ${i} directly to ${root}`);
            const newParent = [...parent]; // Need fresh ref if using state, but here we mutate local for algo then update state?
            // Correct approach: update state to trigger re-render of arrow
            setParent(prev => {
                const next = [...prev];
                next[i] = root;
                return next;
            });
            await sleep(speed);
        }
        return root;
    } else {
        setMessage(`${i} is a root!`);
        return i;
    }
  };

  // Wrapper for Find Button
  const handleFind = async () => {
      if (isAnimating) return;
      const u = parseInt(nodeU);
      if (isNaN(u) || u < 0 || u >= 8) return;
      
      setIsAnimating(true);
      setActivePath([]);
      await find(u);
      setHighlightNodes([]);
      setActivePath([]);
      setMessage("Find Complete");
      setIsAnimating(false);
  };

  const handleUnion = async () => {
      if (isAnimating) return;
      const u = parseInt(nodeU);
      const v = parseInt(nodeV);
      if (isNaN(u) || isNaN(v) || u < 0 || u >= 8 || v < 0 || v >= 8) return;

      setIsAnimating(true);
      setMessage(`Union(${u}, ${v}) started.`);
      
      const rootU = await find(u);
      setActivePath([]); // Clear visuals from first find
      const rootV = await find(v);
      setActivePath([]);

      if (rootU !== rootV) {
          setMessage(`Roots differ (${rootU} != ${rootV}). Merging...`);
          await sleep(speed);
          
          setParent(prev => {
              const next = [...prev];
              // Union by Rank
              if (rank[rootU] < rank[rootV]) {
                  next[rootU] = rootV;
                  setMessage(`${rootU} points to ${rootV}`);
              } else if (rank[rootU] > rank[rootV]) {
                  next[rootV] = rootU;
                  setMessage(`${rootV} points to ${rootU}`);
              } else {
                  next[rootV] = rootU;
                  setRank(r => {
                      const nr = [...r];
                      nr[rootU]++;
                      return nr;
                  });
                  setMessage(`${rootV} points to ${rootU} (Rank increased)`);
              }
              return next;
          });
          await sleep(speed);
      } else {
          setMessage(`Already in same set (Root ${rootU}).`);
      }
      
      setIsAnimating(false);
      setHighlightNodes([]);
  };

  // Nodes visualization logic
  // We need to calculate positions based on the tree structure
  const getLayout = () => {
      const positions: {x: number, y: number}[] = new Array(8).fill({x:0, y:0});
      const levels: number[] = new Array(8).fill(0);
      
      // Calculate depth for Y position
      for(let i=0; i<8; i++) {
          let curr = i;
          let d = 0;
          while(parent[curr] !== curr && d < 10) {
              curr = parent[curr];
              d++;
          }
          levels[i] = d;
      }

      // Group by root to separate trees visually
      const roots = Array.from(new Set(parent.map((_, i) => {
          let curr = i;
          while(parent[curr] !== curr) curr = parent[curr];
          return curr;
      }))).sort((a, b) => a - b);
      
      const widthPerTree = 800 / (roots.length || 1);
      
      roots.forEach((r, rootIdx) => {
          const centerX = (rootIdx * widthPerTree) + widthPerTree/2;
          
          // Get all nodes in this set
          const setNodes = parent.map((_, i) => {
              let curr = i;
              while(parent[curr] !== curr) curr = parent[curr];
              return curr === r ? i : -1;
          }).filter(x => x !== -1);

          // Group by level to distribute X
          const nodesByLevel: {[key: number]: number[]} = {};
          setNodes.forEach(n => {
              const l = levels[n];
              if(!nodesByLevel[l]) nodesByLevel[l] = [];
              nodesByLevel[l].push(n);
          });

          setNodes.forEach((nodeId) => {
              const lvl = levels[nodeId];
              const nodesInThisLevel = nodesByLevel[lvl];
              const indexInLevel = nodesInThisLevel.indexOf(nodeId);
              const levelWidth = Math.min(widthPerTree, nodesInThisLevel.length * 60);
              const startX = centerX - levelWidth / 2;
              const xStep = nodesInThisLevel.length > 1 ? levelWidth / (nodesInThisLevel.length - 1) : 0;
              
              const xPos = nodesInThisLevel.length === 1 ? centerX : startX + indexInLevel * xStep;

              positions[nodeId] = {
                  x: xPos, 
                  y: 50 + lvl * 70
              };
          });
      });
      return positions;
  };

  const layout = getLayout();

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Disjoint Set Union (DSU)</h2>
          <p className="text-sm text-[var(--foreground)]/60">Union-Find with Path Compression</p>
        </div>
        
        <div className="flex gap-2 items-center bg-[var(--foreground)]/5 p-2 rounded-lg border border-[var(--card-border)]">
            <input value={nodeU} onChange={e=>setNodeU(e.target.value)} className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
            <span className="text-xs font-bold text-[var(--foreground)]/40">U / V</span>
            <input value={nodeV} onChange={e=>setNodeV(e.target.value)} className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
            
            <button onClick={handleFind} disabled={isAnimating} className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-bold hover:opacity-90 flex gap-1">
                <Search size={14}/> Find(U)
            </button>
            <button onClick={handleUnion} disabled={isAnimating} className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs font-bold hover:opacity-90 flex gap-1">
                <Link size={14}/> Union(U,V)
            </button>
            <button onClick={reset} disabled={isAnimating} className="p-1.5 hover:bg-[var(--foreground)]/10 rounded"><RotateCcw size={16}/></button>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] overflow-hidden">
         <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono border border-white/10 text-white">
             {message}
         </div>

         <svg className="absolute inset-0 w-[800px] h-[400px] pointer-events-none">
             {parent.map((p, i) => {
                 if (p === i) return null; // Root points to self, don't draw loop
                 const start = layout[i];
                 const end = layout[p];
                 return (
                     <motion.line
                        key={`link-${i}-${p}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                        stroke="var(--foreground)"
                        strokeWidth="2"
                        strokeOpacity={0.2}
                        markerEnd="url(#arrowhead)"
                     />
                 );
             })}
             <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="var(--foreground)" opacity="0.4" />
                </marker>
             </defs>
         </svg>

         {parent.map((_, i) => (
             <motion.div
                key={i}
                layout
                animate={{
                    x: layout[i].x - 20,
                    y: layout[i].y - 20,
                    scale: highlightNodes.includes(i) ? 1.2 : 1,
                    backgroundColor: highlightNodes.includes(i) ? "#3b82f6" : "var(--card-bg)",
                    borderColor: highlightNodes.includes(i) ? "#60a5fa" : "var(--card-border)",
                }}
                className="absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shadow-lg z-10 text-sm"
             >
                 {i}
             </motion.div>
         ))}
      </div>
    </div>
  );
}