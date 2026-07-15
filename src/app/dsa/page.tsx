"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  ArrowDownNarrowWide, Search, Database, Network, 
  Infinity as InfinityIcon, Sparkles, Cpu, ChevronDown, Share2, Gauge, Maximize2
} from "lucide-react";

import { dsaCategories } from "@/components/dsa/dsaCategories";
import { DSACategory } from "@/components/dsa/DSASidebar";
import { DSAMainContent } from "@/components/dsa/DSAMainContent";
import Link from "next/link";

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState<DSACategory>(dsaCategories[0] as DSACategory);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const vizContainerRef = useRef<HTMLDivElement>(null);

  const themeColor = selectedCategory.themeColor || "#3b82f6";

  const speedOptions = [
    { label: "0.5×", value: 1600 },
    { label: "1×", value: 800 },
    { label: "1.5×", value: 533 },
    { label: "2×", value: 400 },
    { label: "3×", value: 267 },
  ];
  const currentSpeedLabel = speedOptions.find(s => s.value === animationSpeed)?.label ?? "1×";

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Sync state with browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!vizContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await vizContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  const groups = [
    { id: "sorting", title: "Sorting", icon: <ArrowDownNarrowWide size={14} /> },
    { id: "searching", title: "Searching", icon: <Search size={14} /> },
    { id: "data-structures", title: "Data Structures", icon: <Database size={14} /> },
    { id: "graphs", title: "Graphs", icon: <Network size={14} /> },
    { id: "dp", title: "Dynamic Programming", icon: <InfinityIcon size={14} /> },
    { id: "advanced", title: "Advanced Algorithms", icon: <Sparkles size={14} /> },
  ];

  const categoryToGroup: Record<string, string> = {
    "SORTING": "sorting",
    "QUICK_SORT": "sorting",
    "MERGE_SORT": "sorting",
    "SELECTION_SORT": "sorting",
    "INSERTION_SORT": "sorting",
    "BINARY_SEARCH": "searching",
    "KMP": "searching",
    "LINKED_LIST": "data-structures",
    "STACK_QUEUE": "data-structures",
    "BST": "data-structures",
    "TRIE": "data-structures",
    "HEAP": "data-structures",
    "SEGMENT_TREE": "data-structures",
    "DSU": "data-structures",
    "TREE_TRAVERSAL": "data-structures",
    "GRAPH_BFS": "graphs",
    "MST": "graphs",
    "DIJKSTRA": "graphs",
    "BELLMAN_FORD": "graphs",
    "FLOYD_WARSHALL": "graphs",
    "TOPO_SORT": "graphs",
    "FIBONACCI": "dp",
    "KNAPSACK": "dp",
    "KADANE": "dp",
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden flex flex-col transition-colors duration-500"
    >
      {/* Background Interactive Glow */}
      <div 
         className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[130px] transition-all duration-300 hidden md:block"
         style={{
            background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)`,
            left: mousePos.x - 300,
            top: mousePos.y - 300,
         }}
      />

      {/* HEADER NAVBAR */}
      <header className="border-b border-[var(--border)]/60 bg-[var(--background)]/85 backdrop-blur-md sticky top-0 z-40 px-4 md:px-10 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="font-black text-sm text-white font-mono">LQ</span>
               </div>
               <span className="text-base font-black tracking-tight bg-gradient-to-r from-white to-[var(--muted-foreground)] bg-clip-text text-transparent">LogiQuest</span>
            </Link>
         </div>

         <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
               Dashboard
            </Link>
            <button className="p-2 hover:bg-[var(--foreground)]/5 border border-[var(--border)]/60 rounded-xl transition-all cursor-pointer">
               <Share2 size={16} />
            </button>
         </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full px-2 md:px-8 py-4 md:py-6 z-10 flex flex-col gap-4 md:gap-6">
         
         {/* Title & Selector Block */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/60">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#3b82f6] px-2 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-md">
                     {categoryToGroup[selectedCategory.id]?.toUpperCase() || "ALGORITHM"}
                  </span>
               </div>
               <h1 className="text-2xl md:text-3xl font-black tracking-tight">{selectedCategory.title}</h1>
               <p className="text-xs text-[var(--muted-foreground)] max-w-xl">{selectedCategory.description}</p>
            </div>

            {/* Header Actions/Controls */}
            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
               {/* Speed selector */}
               <div className="relative">
                  <button
                     onClick={() => setShowSpeedMenu(v => !v)}
                     className="flex items-center gap-1.5 px-3.5 py-3 bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] rounded-2xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer"
                     title="Playback Speed"
                  >
                     <Gauge size={12} className="text-[#3b82f6]" />
                     <span className="hidden sm:inline">{currentSpeedLabel}</span>
                     <ChevronDown size={10} />
                  </button>
                  {showSpeedMenu && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                        <motion.div
                           initial={{ opacity: 0, y: -6 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="absolute right-0 mt-2 w-28 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl py-1.5 z-50"
                        >
                           {speedOptions.map(opt => (
                              <button
                                 key={opt.value}
                                 onClick={() => { setAnimationSpeed(opt.value); setShowSpeedMenu(false); }}
                                 className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[var(--foreground)]/5 ${
                                    animationSpeed === opt.value ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                                 }`}
                              >
                                 {animationSpeed === opt.value && <span className="text-[var(--viz-green)] mr-1">✓</span>}
                                 {opt.label}
                              </button>
                           ))}
                        </motion.div>
                     </>
                  )}
               </div>

               {/* Fullscreen Button */}
               <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] rounded-2xl text-[var(--foreground)] transition-all cursor-pointer flex items-center justify-center shadow-sm"
                  title="Fullscreen"
               >
                  <Maximize2 size={14} className="text-[#3b82f6]" />
               </button>

               {/* Algorithm Selector Dropdown */}
               <div className="relative">
                  <button 
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm hover:border-[#3b82f6]/50 transition-all font-bold text-xs cursor-pointer"
                  >
                     <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: themeColor }}>
                        {React.isValidElement(selectedCategory.icon) && React.cloneElement(selectedCategory.icon as React.ReactElement<{ size: number }>, { size: 10 })}
                     </div>
                     <span className="text-[var(--foreground)] font-black uppercase tracking-widest text-[10px]">{selectedCategory.title}</span>
                     <ChevronDown size={14} className={`text-[var(--muted-foreground)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                     <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)} />
                        <div className="absolute right-0 mt-3 w-64 max-h-96 overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-2 custom-scrollbar">
                           {groups.map((group) => {
                              const groupCats = dsaCategories.filter((cat) => categoryToGroup[cat.id] === group.id);
                              if (groupCats.length === 0) return null;
                              return (
                                 <div key={group.id} className="mb-4 last:mb-0">
                                    <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-3 mb-2 flex items-center gap-2">
                                       {group.icon}
                                       {group.title}
                                    </div>
                                    <div className="space-y-1">
                                       {groupCats.map((cat) => (
                                          <button
                                             key={cat.id}
                                             onClick={() => { setSelectedCategory(cat as DSACategory); setIsDropdownOpen(false); }}
                                             className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                                                selectedCategory.id === cat.id 
                                                   ? "bg-[#3b82f6]/10 text-[#3b82f6]" 
                                                   : "text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5"
                                             }`}
                                          >
                                             <div className="w-4 h-4 rounded flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.themeColor }}>
                                                {React.isValidElement(cat.icon) && React.cloneElement(cat.icon as React.ReactElement<{ size: number }>, { size: 8 })}
                                             </div>
                                             <span className="truncate">{cat.title}</span>
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* Visualizer Stage Container */}
         <div ref={vizContainerRef} className="w-full">
            <DSAMainContent 
               selectedCategory={selectedCategory} 
               animationSpeed={animationSpeed} 
               isFullscreen={isFullscreen}
            />
         </div>

      </main>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--foreground)/5; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--foreground)/10; }
         .bg-grid-pattern {
            background-image: linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
                              linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
         }
      `}</style>
    </div>
  );
}
