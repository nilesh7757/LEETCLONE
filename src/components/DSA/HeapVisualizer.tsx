"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function HeapVisualizer({ speed = 600 }: { speed?: number }) {
  const [heap, setHeap] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [swapIndices, setSwapIndices] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setHeap([10, 20, 15, 30, 40]);
  }, []);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const insert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || isAnimating) return;
    setIsAnimating(true);
    setInputValue("");
    setStatus(`Inserting ${val}...`);

    const newHeap = [...heap, val];
    setHeap(newHeap);
    await sleep(speed);

    // Bubble Up
    let idx = newHeap.length - 1;
    while (idx > 0) {
        const parentIdx = Math.floor((idx - 1) / 2);
        
        setHighlightIndices([idx, parentIdx]);
        setStatus(`Comparing ${newHeap[idx]} with parent ${newHeap[parentIdx]}`);
        await sleep(speed);

        if (newHeap[idx] < newHeap[parentIdx]) {
            setStatus("Child < Parent. Swapping!");
            setSwapIndices([idx, parentIdx]);
            await sleep(speed / 2);
            
            [newHeap[idx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[idx]];
            setHeap([...newHeap]);
            await sleep(speed);
            
            setSwapIndices(null);
            idx = parentIdx;
        } else {
            setStatus("Heap property satisfied.");
            break;
        }
    }

    setHighlightIndices([]);
    setStatus("Ready");
    setIsAnimating(false);
  };

  const extractMin = async () => {
    if (heap.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setStatus("Extracting Min (Root)...");

    const newHeap = [...heap];
    const min = newHeap[0];
    const last = newHeap.pop();

    if (newHeap.length === 0) {
        setHeap([]);
        setIsAnimating(false);
        setStatus("Empty");
        return;
    }

    // Move last to root
    newHeap[0] = last!;
    setHeap([...newHeap]);
    setStatus(`Moved last element (${last}) to root.`);
    await sleep(speed);

    // Bubble Down
    let idx = 0;
    while (true) {
        const leftIdx = 2 * idx + 1;
        const rightIdx = 2 * idx + 2;
        let smallest = idx;

        if (leftIdx < newHeap.length) {
            setHighlightIndices([smallest, leftIdx]);
            await sleep(speed / 2);
            if (newHeap[leftIdx] < newHeap[smallest]) smallest = leftIdx;
        }
        
        if (rightIdx < newHeap.length) {
            setHighlightIndices([smallest, rightIdx]);
            await sleep(speed / 2);
            if (newHeap[rightIdx] < newHeap[smallest]) smallest = rightIdx;
        }

        if (smallest !== idx) {
            setStatus(`Swapping with smaller child ${newHeap[smallest]}`);
            setSwapIndices([idx, smallest]);
            await sleep(speed / 2);

            [newHeap[idx], newHeap[smallest]] = [newHeap[smallest], newHeap[idx]];
            setHeap([...newHeap]);
            await sleep(speed);
            setSwapIndices(null);
            
            idx = smallest;
        } else {
            break;
        }
    }

    setHighlightIndices([]);
    setStatus("Ready");
    setIsAnimating(false);
  };

  // Helper to layout tree nodes
  const getTreeNodes = () => {
      if (heap.length === 0) return [];
      const nodes = [];
      const queue = [{ idx: 0, x: 400, y: 50, width: 800 }];
      
      while (queue.length > 0) {
          const { idx, x, y, width } = queue.shift()!;
          nodes.push({ idx, val: heap[idx], x, y });

          const leftIdx = 2 * idx + 1;
          const rightIdx = 2 * idx + 2;
          const slice = width / 2;

          if (leftIdx < heap.length) {
              queue.push({ idx: leftIdx, x: x - slice/2, y: y + 70, width: slice });
          }
          if (rightIdx < heap.length) {
              queue.push({ idx: rightIdx, x: x + slice/2, y: y + 70, width: slice });
          }
      }
      return nodes;
  };

  const treeNodes = getTreeNodes();

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Min-Heap</h2>
          <p className="text-sm text-[var(--foreground)]/60">Priority Queue Visualization</p>
        </div>
        
        <div className="flex gap-2">
            <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Val"
                className="w-16 px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm"
                disabled={isAnimating}
            />
            <button onClick={insert} disabled={isAnimating} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20"><Plus size={18}/></button>
            <button onClick={extractMin} disabled={isAnimating} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={18}/></button>
            <button onClick={() => setHeap([])} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg"><RotateCcw size={18}/></button>
        </div>
      </div>

      <div className="relative w-full h-[350px] bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] overflow-hidden">
         <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono border border-white/10 text-white">
             {status}
         </div>

         <svg className="absolute inset-0 w-[800px] h-[350px] pointer-events-none">
             {treeNodes.map((node) => {
                 const leftIdx = 2 * node.idx + 1;
                 const rightIdx = 2 * node.idx + 2;
                 const children = [];
                 
                 // Find child coords
                 const leftChild = treeNodes.find(n => n.idx === leftIdx);
                 const rightChild = treeNodes.find(n => n.idx === rightIdx);

                 if (leftChild) children.push(leftChild);
                 if (rightChild) children.push(rightChild);

                 return children.map(child => (
                     <line 
                        key={`${node.idx}-${child.idx}`}
                        x1={node.x} y1={node.y} x2={child.x} y2={child.y}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="2"
                     />
                 ));
             })}
         </svg>

         {treeNodes.map((node) => {
             const isHighlighted = highlightIndices.includes(node.idx);
             const isSwapped = swapIndices?.includes(node.idx);
             
             return (
                 <motion.div
                    key={node.idx}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ 
                        scale: isHighlighted ? 1.2 : 1,
                        x: node.x - 20,
                        y: node.y - 20,
                        backgroundColor: isSwapped ? "#ef4444" : isHighlighted ? "#facc15" : "var(--card-bg)",
                        borderColor: isSwapped ? "#f87171" : isHighlighted ? "#fde047" : "var(--card-border)",
                    }}
                    className="absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg z-10 text-[var(--foreground)]"
                 >
                     {node.val}
                 </motion.div>
             );
         })}
      </div>

      {/* Array View */}
      <div className="flex gap-1 overflow-x-auto p-2 border border-[var(--card-border)] rounded-xl bg-[var(--foreground)]/5">
          {heap.map((val, i) => (
              <div key={i} className="flex flex-col items-center min-w-[30px]">
                  <span className="text-[8px] text-[var(--foreground)]/40">{i}</span>
                  <div className={`w-8 h-8 rounded border border-[var(--card-border)] flex items-center justify-center text-xs font-bold
                      ${highlightIndices.includes(i) ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" : ""}
                  `}>
                      {val}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}