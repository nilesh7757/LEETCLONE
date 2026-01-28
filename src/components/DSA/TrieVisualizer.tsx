"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Plus, Search, Trash2 } from "lucide-react";

class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord: boolean = false;
  value: string; // The char
  
  constructor(value: string) {
    this.value = value;
  }
}

export default function TrieVisualizer({ speed = 500 }: { speed?: number }) {
  const [root, setRoot] = useState<TrieNode>(new TrieNode("")); // Root has empty string
  // Force update trigger
  const [version, setVersion] = useState(0); 
  const [inputValue, setInputValue] = useState("");
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]); // Array of node IDs/Paths
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [message, setMessage] = useState("Ready");
  const [isAnimating, setIsAnimating] = useState(false);

  // Pre-populate
  useEffect(() => {
    const r = new TrieNode("");
    ["CAT", "CAR", "DOG"].forEach(word => insertSync(r, word));
    setRoot(r);
    setVersion(v => v + 1);
  }, []);

  const insertSync = (node: TrieNode, word: string) => {
    let curr = node;
    for (const char of word) {
      if (!curr.children[char]) {
        curr.children[char] = new TrieNode(char);
      }
      curr = curr.children[char];
    }
    curr.isEndOfWord = true;
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleInsert = async () => {
    if (!inputValue || isAnimating) return;
    const word = inputValue.toUpperCase().slice(0, 6); // Limit length
    setIsAnimating(true);
    setMessage(`Inserting "${word}"...`);
    setInputValue("");
    setHighlightedPath([]);

    let curr = root;
    let pathId = "root";
    setActiveNode(pathId);
    await sleep(speed);

    for (const char of word) {
      pathId += `-${char}`;
      
      if (!curr.children[char]) {
        curr.children[char] = new TrieNode(char);
        setMessage(`Creating node '${char}'`);
        // Trigger render update for new node
        setVersion(v => v + 1);
        await sleep(speed);
      } else {
        setMessage(`Node '${char}' exists. Traversing.`);
      }
      
      curr = curr.children[char];
      setActiveNode(pathId);
      setHighlightedPath(prev => [...prev, pathId]);
      await sleep(speed);
    }

    curr.isEndOfWord = true;
    setMessage(`Marked '${word}' end as true.`);
    setVersion(v => v + 1);
    await sleep(speed);
    
    setActiveNode(null);
    setHighlightedPath([]);
    setMessage("Ready");
    setIsAnimating(false);
  };

  const handleSearch = async () => {
    if (!inputValue || isAnimating) return;
    const word = inputValue.toUpperCase();
    setIsAnimating(true);
    setMessage(`Searching for "${word}"...`);
    setHighlightedPath([]);

    let curr = root;
    let pathId = "root";
    setActiveNode(pathId);
    await sleep(speed);

    for (const char of word) {
      if (!curr.children[char]) {
        setMessage(`'${char}' not found. Word does not exist.`);
        setActiveNode(null);
        setIsAnimating(false);
        return;
      }
      pathId += `-${char}`;
      curr = curr.children[char];
      setActiveNode(pathId);
      setHighlightedPath(prev => [...prev, pathId]);
      await sleep(speed);
    }

    if (curr.isEndOfWord) {
        setMessage(`Found word "${word}"!`);
    } else {
        setMessage(`Prefix "${word}" exists, but not valid word.`);
    }
    await sleep(speed * 2);
    setActiveNode(null);
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  // BFS to flatten for rendering
  const getRenderNodes = () => {
    const levels: { node: TrieNode, id: string, x: number, y: number, parentX?: number, parentY?: number }[][] = [];
    
    // Custom layout logic needed for Trie
    // Simple approach: Assign ranges to children
    const queue: { node: TrieNode, id: string, x: number, y: number, width: number, parentX?: number, parentY?: number, depth: number }[] = [];
    queue.push({ node: root, id: "root", x: 400, y: 50, width: 800, depth: 0 });

    const nodes = [];

    while (queue.length > 0) {
        const item = queue.shift()!;
        nodes.push(item);

        const children = Object.keys(item.node.children).sort();
        const count = children.length;
        if (count === 0) continue;

        const slice = item.width / count;
        let startX = item.x - item.width / 2 + slice / 2;

        children.forEach((char, idx) => {
            queue.push({
                node: item.node.children[char],
                id: `${item.id}-${char}`,
                x: startX + idx * slice,
                y: item.y + 70,
                width: slice,
                parentX: item.x,
                parentY: item.y,
                depth: item.depth + 1
            });
        });
    }
    return nodes;
  };

  const renderNodes = getRenderNodes();

  return (
    <div className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Trie (Prefix Tree)</h2>
          <p className="text-sm text-[var(--foreground)]/60">Fast Prefix Lookup</p>
        </div>
        
        <div className="flex gap-2">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Word"
                maxLength={6}
                className="w-24 px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-sm uppercase"
                disabled={isAnimating}
            />
            <button onClick={handleInsert} disabled={isAnimating} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20"><Plus size={18}/></button>
            <button onClick={handleSearch} disabled={isAnimating} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><Search size={18}/></button>
            <button onClick={() => { setRoot(new TrieNode("")); setVersion(v=>v+1); }} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg"><RotateCcw size={18}/></button>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] overflow-hidden">
         {/* Status Bar */}
         <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono border border-white/10 text-white">
             {message}
         </div>

         <svg className="absolute inset-0 w-[800px] h-[400px] pointer-events-none">
             {renderNodes.map((node) => {
                 if (node.parentX === undefined) return null;
                 return (
                     <motion.line
                        key={`edge-${node.id}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        x1={node.parentX} y1={node.parentY} x2={node.x} y2={node.y}
                        stroke={highlightedPath.includes(node.id) ? "#3b82f6" : "var(--foreground)"}
                        strokeWidth={highlightedPath.includes(node.id) ? 3 : 1}
                        strokeOpacity={0.2}
                        transition={{ duration: 0.3 }}
                     />
                 );
             })}
         </svg>

         {renderNodes.map((item) => {
             const isActive = activeNode === item.id;
             const isPath = highlightedPath.includes(item.id);
             
             return (
                 <motion.div
                    key={item.id}
                    initial={{ scale: 0 }}
                    animate={{ 
                        scale: isActive ? 1.2 : 1,
                        backgroundColor: isActive ? "#3b82f6" : item.node.isEndOfWord ? "#10b981" : "var(--card-bg)",
                        borderColor: isActive ? "#60a5fa" : item.node.isEndOfWord ? "#34d399" : "var(--card-border)",
                    }}
                    className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-lg z-10 text-[var(--foreground)]`}
                    style={{ left: item.x, top: item.y }}
                 >
                     {item.node.value || "*"}
                 </motion.div>
             );
         })}
      </div>
    </div>
  );
}