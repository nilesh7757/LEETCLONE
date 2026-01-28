"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Plus, Search, Edit3, ArrowRight } from "lucide-react";

export default function SegmentTreeVisualizer({ speed = 500 }: { speed?: number }) {
  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15]); // Power of 2 for perfect tree usually
  const [tree, setTree] = useState<number[]>([]);
  const [highlightNodes, setHighlightNodes] = useState<number[]>([]); // Tree indices
  const [activeRange, setActiveRange] = useState<[number, number] | null>(null); // [L, R] query
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Inputs
  const [queryL, setQueryL] = useState("2");
  const [queryR, setQueryR] = useState("5");
  const [updateIdx, setUpdateIdx] = useState("3");
  const [updateVal, setUpdateVal] = useState("10");

  useEffect(() => {
    buildTree();
  }, [array]);

  const buildTree = () => {
    // Size of tree: 2*2^ceil(log2(n)) - 1, roughly 4*n
    const n = array.length;
    const t = new Array(4 * n).fill(0);
    
    const build = (node: number, start: number, end: number) => {
        if (start === end) {
            t[node] = array[start];
        } else {
            const mid = Math.floor((start + end) / 2);
            build(2 * node, start, mid);
            build(2 * node + 1, mid + 1, end);
            t[node] = t[2 * node] + t[2 * node + 1];
        }
    };
    
    build(1, 0, n - 1);
    setTree(t);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runQuery = async () => {
    if (isAnimating) return;
    const l = parseInt(queryL);
    const r = parseInt(queryR);
    if (isNaN(l) || isNaN(r) || l > r || l < 0 || r >= array.length) {
        setStatus("Invalid Range");
        return;
    }

    setIsAnimating(true);
    setStatus(`Query Sum [${l}, ${r}]...`);
    setActiveRange([l, r]);
    setHighlightNodes([]);
    
    const relevantNodes: number[] = [];

    const query = async (node: number, start: number, end: number, l: number, r: number): Promise<number> => {
        // Highlight current node being visited
        setHighlightNodes(prev => [...prev, node]);
        await sleep(speed);

        if (r < start || end < l) {
            // Out of range
            return 0;
        }
        if (l <= start && end <= r) {
            // Completely inside
            relevantNodes.push(node);
            setStatus(`Node [${start}-${end}] fully in range. Adding ${tree[node]}.`);
            // Keep it highlighted as "contributor"
            return tree[node];
        }
        
        const mid = Math.floor((start + end) / 2);
        const p1 = await query(2 * node, start, mid, l, r);
        const p2 = await query(2 * node + 1, mid + 1, end, l, r);
        return p1 + p2;
    };

    const sum = await query(1, 0, array.length - 1, l, r);
    setStatus(`Total Sum: ${sum}`);
    setHighlightNodes(relevantNodes); // Only show contributors at end
    await sleep(speed * 2);
    
    setActiveRange(null);
    setHighlightNodes([]);
    setIsAnimating(false);
  };

  const runUpdate = async () => {
    if (isAnimating) return;
    const idx = parseInt(updateIdx);
    const val = parseInt(updateVal);
    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= array.length) return;

    setIsAnimating(true);
    setStatus(`Updating arr[${idx}] to ${val}...`);
    
    // Update array first for visual consistency
    const newArr = [...array];
    newArr[idx] = val;
    setArray(newArr);
    
    const update = async (node: number, start: number, end: number, idx: number, val: number) => {
        setHighlightNodes(prev => [...prev, node]);
        await sleep(speed);

        if (start === end) {
            tree[node] = val;
            setStatus(`Leaf updated to ${val}`);
            setTree([...tree]);
            await sleep(speed);
            return;
        }
        
        const mid = Math.floor((start + end) / 2);
        if (start <= idx && idx <= mid) {
            await update(2 * node, start, mid, idx, val);
        } else {
            await update(2 * node + 1, mid + 1, end, idx, val);
        }
        
        tree[node] = tree[2 * node] + tree[2 * node + 1];
        setStatus(`Updating Parent sum: ${tree[2*node]} + ${tree[2*node+1]} = ${tree[node]}`);
        setTree([...tree]);
        await sleep(speed);
    };

    await update(1, 0, array.length - 1, idx, val);
    
    setStatus("Update Complete");
    setHighlightNodes([]);
    setIsAnimating(false);
  };

  // Helper to layout tree nodes
  const getRenderNodes = () => {
      const n = array.length;
      const nodes = [];
      const queue = [{ node: 1, start: 0, end: n - 1, x: 400, y: 50, width: 800 }];
      
      while (queue.length > 0) {
          const { node, start, end, x, y, width } = queue.shift()!;
          if (node >= tree.length || tree[node] === undefined) continue;

          nodes.push({ node, val: tree[node], start, end, x, y });

          if (start !== end) {
              const mid = Math.floor((start + end) / 2);
              queue.push({ node: 2 * node, start, end: mid, x: x - width / 4, y: y + 80, width: width / 2 });
              queue.push({ node: 2 * node + 1, start: mid + 1, end, x: x + width / 4, y: y + 80, width: width / 2 });
          }
      }
      return nodes;
  };

  const renderNodes = getRenderNodes();

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Segment Tree</h2>
          <p className="text-sm text-[var(--foreground)]/60">Range Sum Query (RSQ)</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
            {/* Query Controls */}
            <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-2 rounded-lg border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-[var(--foreground)]/40">QUERY</span>
                <input value={queryL} onChange={e=>setQueryL(e.target.value)} className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
                <span className="text-xs">-</span>
                <input value={queryR} onChange={e=>setQueryR(e.target.value)} className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
                <button onClick={runQuery} disabled={isAnimating} className="p-1.5 bg-blue-500 text-white rounded hover:opacity-90"><Search size={14}/></button>
            </div>

            {/* Update Controls */}
            <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-2 rounded-lg border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-[var(--foreground)]/40">UPDATE</span>
                <input value={updateIdx} onChange={e=>setUpdateIdx(e.target.value)} placeholder="Idx" className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
                <span className="text-xs">=</span>
                <input value={updateVal} onChange={e=>setUpdateVal(e.target.value)} placeholder="Val" className="w-8 p-1 text-center rounded bg-[var(--card-bg)] text-xs" />
                <button onClick={runUpdate} disabled={isAnimating} className="p-1.5 bg-green-500 text-white rounded hover:opacity-90"><Edit3 size={14}/></button>
            </div>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] overflow-hidden">
         <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono border border-white/10 text-white">
             {status}
         </div>

         <svg className="absolute inset-0 w-[800px] h-[400px] pointer-events-none">
             {renderNodes.map((n) => {
                 const leftChild = renderNodes.find(child => child.node === 2 * n.node);
                 const rightChild = renderNodes.find(child => child.node === 2 * n.node + 1);
                 
                 return (
                     <React.Fragment key={`lines-${n.node}`}>
                         {leftChild && <line x1={n.x} y1={n.y} x2={leftChild.x} y2={leftChild.y} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />}
                         {rightChild && <line x1={n.x} y1={n.y} x2={rightChild.x} y2={rightChild.y} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />}
                     </React.Fragment>
                 );
             })}
         </svg>

         {renderNodes.map((n) => {
             const isHighlighted = highlightNodes.includes(n.node);
             // Check if this node represents a range completely inside active query
             // This is a visual approximation for 'contribution'
             
             return (
                 <motion.div
                    key={n.node}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ 
                        scale: isHighlighted ? 1.1 : 1,
                        backgroundColor: isHighlighted ? "#3b82f6" : "var(--card-bg)",
                        borderColor: isHighlighted ? "#60a5fa" : "var(--card-border)",
                    }}
                    className={`absolute flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 shadow-lg z-10`}
                    style={{ left: n.x - 24, top: n.y - 24 }}
                 >
                     <span className="font-bold text-xs">{n.val}</span>
                     <span className="text-[8px] text-[var(--foreground)]/50">[{n.start}-{n.end}]</span>
                 </motion.div>
             );
         })}
      </div>
      
      {/* Array View */}
      <div className="flex justify-center gap-1">
          {array.map((val, i) => (
              <div key={i} className="flex flex-col items-center">
                  <div className={`w-10 h-10 border border-[var(--card-border)] flex items-center justify-center font-bold text-sm rounded-lg
                      ${activeRange && i >= activeRange[0] && i <= activeRange[1] ? "bg-blue-500/20 border-blue-500 text-blue-400" : ""}
                  `}>
                      {val}
                  </div>
                  <span className="text-[9px] text-[var(--foreground)]/40 mt-1">{i}</span>
              </div>
          ))}
      </div>
    </div>
  );
}