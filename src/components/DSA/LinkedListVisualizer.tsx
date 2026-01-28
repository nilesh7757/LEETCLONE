"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowRight, Play } from "lucide-react";

interface Node {
  id: number;
  value: number;
}

export default function LinkedListVisualizer({ speed = 600 }: { speed?: number }) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, value: 10 },
    { id: 2, value: 20 },
    { id: 3, value: 30 },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const addNode = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setNodes([...nodes, { id: Date.now(), value: val }]);
    setInputValue("");
  };

  const deleteNode = (id: number) => {
    setNodes(nodes.filter((node) => node.id !== id));
  };

  const simulateSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    for (let i = 0; i < nodes.length; i++) {
      setHighlighted(nodes[i].id);
      await new Promise((r) => setTimeout(r, speed));
      if (nodes[i].value === val) break;
    }
    setTimeout(() => setHighlighted(null), speed * 1.5);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Linked List Visualizer</h2>
          <p className="text-sm text-[var(--foreground)]/60">Singly Linked List Operations</p>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Value"
            className="w-20 px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addNode}
            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
            title="Add Node"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={simulateSearch}
            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
            title="Search Value"
          >
            <Play size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-y-8 min-h-[200px] p-4 bg-[var(--foreground)]/5 rounded-xl border border-dashed border-[var(--card-border)]">
        <AnimatePresence>
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  borderColor: highlighted === node.id ? "#3b82f6" : "var(--card-border)",
                  backgroundColor: highlighted === node.id ? "rgba(59, 130, 246, 0.1)" : "transparent"
                }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                className="relative flex items-center justify-center w-16 h-16 border-2 rounded-xl font-bold text-lg shadow-inner"
              >
                {node.value}
                <button
                  onClick={() => deleteNode(node.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ opacity: 1 }} // Force visible for simplicity in this version
                >
                  <Trash2 size={10} />
                </button>
                <div className="absolute -bottom-6 text-[10px] text-[var(--foreground)]/40 font-mono">
                  {index === 0 ? "HEAD" : index === nodes.length - 1 ? "TAIL" : `Node ${index}`}
                </div>
              </motion.div>
              
              {index < nodes.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="flex items-center text-blue-500/40"
                >
                  <ArrowRight size={24} className="mx-1" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
          
          {nodes.length === 0 && (
            <div className="w-full text-center text-[var(--foreground)]/30 italic">
              List is empty. Add a node to begin.
            </div>
          )}
          
          <motion.div className="flex items-center text-red-500/40 ml-2">
            <ArrowRight size={24} className="mx-1" />
            <span className="text-xs font-mono font-bold">NULL</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}