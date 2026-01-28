"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, RotateCcw } from "lucide-react";

class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  x: number = 0;
  y: number = 0;

  constructor(value: number) {
    this.value = value;
  }
}

export default function BSTVisualizer({ speed = 600 }: { speed?: number }) {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [nodesToRender, setNodesToRender] = useState<{node: TreeNode, px: number, py: number, x: number, y: number}[]>([]);

  const insert = (val: number) => {
    if (!root) {
      const newRoot = new TreeNode(val);
      setRoot(newRoot);
      return;
    }
    
    let curr = root;
    while (true) {
      if (val < curr.value) {
        if (!curr.left) {
          curr.left = new TreeNode(val);
          break;
        }
        curr = curr.left;
      } else if (val > curr.value) {
        if (!curr.right) {
          curr.right = new TreeNode(val);
          break;
        }
        curr = curr.right;
      } else break; // No duplicates for visualization
    }
    setRoot({...root}); // Trigger re-render
  };

  const calculatePositions = (node: TreeNode | null, x: number, y: number, offset: number, parentX: number | null = null, parentY: number | null = null): any[] => {
    if (!node) return [];
    
    const current = { node, x, y, px: parentX ?? x, py: parentY ?? y };
    const left = calculatePositions(node.left, x - offset, y + 80, offset / 2, x, y);
    const right = calculatePositions(node.right, x + offset, y + 80, offset / 2, x, y);
    
    return [current, ...left, ...right];
  };

  useEffect(() => {
    setNodesToRender(calculatePositions(root, 400, 40, 180));
  }, [root]);

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val)) insert(val);
    setInputValue("");
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    let curr = root;
    while (curr) {
      setHighlighted(curr.value);
      await new Promise(r => setTimeout(r, speed));
      if (val === curr.value) break;
      curr = val < curr.value ? curr.left : curr.right;
    }
    setTimeout(() => setHighlighted(null), speed * 1.5);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">BST Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">Binary Search Tree Operations</p>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Val"
            className="w-16 px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm"
          />
          <button onClick={handleInsert} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20"><Plus size={18}/></button>
          <button onClick={handleSearch} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><Search size={18}/></button>
          <button onClick={() => setRoot(null)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><RotateCcw size={18}/></button>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-[var(--foreground)]/5 rounded-xl border border-dashed border-[var(--card-border)] overflow-auto">
        <svg className="absolute inset-0 w-[800px] h-[400px] pointer-events-none">
          {nodesToRender.map(({ x, y, px, py }, i) => (
            <motion.line
              key={`line-${i}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={px} y1={py} x2={x} y2={y}
              stroke="currentColor"
              className="text-[var(--foreground)]/20"
              strokeWidth="2"
            />
          ))}
        </svg>

        {nodesToRender.map(({ node, x, y }) => (
          <motion.div
            key={node.value}
            layout
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1, 
              left: x - 20, 
              top: y - 20,
              backgroundColor: highlighted === node.value ? "#3b82f6" : "var(--background)",
              borderColor: highlighted === node.value ? "#3b82f6" : "var(--card-border)",
              color: highlighted === node.value ? "white" : "var(--foreground)"
            }}
            className="absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg z-10"
          >
            {node.value}
          </motion.div>
        ))}
        
        {!root && (
          <div className="flex items-center justify-center h-full text-[var(--foreground)]/20 italic">
            Tree is empty. Add a value to start.
          </div>
        )}
      </div>
    </div>
  );
}