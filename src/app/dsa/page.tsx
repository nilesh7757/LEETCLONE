"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowDownNarrowWide, Search, Database, Network, 
  Infinity as InfinityIcon, Sparkles, Cpu, ChevronDown, Share2
} from "lucide-react";

import { dsaCategories } from "@/components/dsa/dsaCategories";
import { DSACategory } from "@/components/dsa/DSASidebar";
import { DSAMainContent } from "@/components/dsa/DSAMainContent";
import Link from "next/link";

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState<DSACategory>(dsaCategories[0] as DSACategory);
  const [animationSpeed] = useState(800);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const themeColor = selectedCategory.themeColor || "#3b82f6";

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
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
    "LCS": "dp",
    "SLIDING_WINDOW": "advanced",
    "N_QUEENS": "advanced",
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `DSA Visualizer - ${selectedCategory.title}`,
        text: `Check out this interactive visualization of ${selectedCategory.title}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans relative overflow-x-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06]"
            animate={{ 
               x: mousePos.x - 300,
               y: mousePos.y - 300,
               backgroundColor: themeColor 
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 60 }}
         />
         <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern" style={{ backgroundSize: '40px 40px' }} />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md flex items-center justify-between px-6 z-50 shadow-sm shrink-0">
         <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
                  <Cpu size={16} className="text-[#3b82f6]" />
               </div>
               <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">DSA Studio</span>
            </Link>
         </div>

         {/* Share Button */}
         <div className="flex items-center gap-3">
            <button 
               onClick={handleShare}
               className="p-2.5 bg-[var(--card)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            >
               <Share2 size={16} />
            </button>
         </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full px-2 md:px-8 py-6 md:py-12 z-10 flex flex-col gap-6 md:gap-8">
         
         {/* Title & Selector Block */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]/60">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] px-2 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-md">
                     {categoryToGroup[selectedCategory.id]?.toUpperCase() || "ALGORITHM"}
                  </span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black tracking-tight">{selectedCategory.title}</h1>
               <p className="text-xs md:text-sm text-[var(--muted-foreground)] max-w-xl">{selectedCategory.description}</p>
            </div>

            {/* Algorithm Selector Dropdown */}
            <div className="relative self-start md:self-center shrink-0">
               <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-5 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md hover:border-[#3b82f6]/50 transition-all font-bold text-xs cursor-pointer"
               >
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: themeColor }}>
                     {React.isValidElement(selectedCategory.icon) && React.cloneElement(selectedCategory.icon as React.ReactElement<{ size: number }>, { size: 10 })}
                  </div>
                  <span className="text-[var(--foreground)] font-black uppercase tracking-widest text-[10px]">{selectedCategory.title}</span>
                  <ChevronDown size={14} className={`text-[var(--muted-foreground)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </button>

                {isDropdownOpen && (
                   <>
                      <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:bg-transparent" onClick={() => setIsDropdownOpen(false)} />
                      <div className="fixed md:absolute left-4 md:left-auto right-4 md:right-0 top-[20%] md:top-auto mt-2 md:mt-2 w-[calc(100vw-32px)] md:w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[60vh] md:max-h-[420px] overflow-y-auto custom-scrollbar">
                        {groups.map((group) => {
                           const categoriesInGroup = dsaCategories.filter(cat => categoryToGroup[cat.id] === group.id);
                           if (categoriesInGroup.length === 0) return null;
                           
                           return (
                              <div key={group.id} className="px-2 py-1">
                                 <div className="px-3 py-1.5 text-[8px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-widest border-b border-[var(--border)]/20 mb-1 flex items-center gap-1.5">
                                    {group.icon}
                                    {group.title}
                                 </div>
                                 <div className="space-y-0.5">
                                    {categoriesInGroup.map((cat) => (
                                       <button
                                          key={cat.id}
                                          onClick={() => {
                                             setSelectedCategory(cat);
                                             setIsDropdownOpen(false);
                                          }}
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

         {/* Visualizer Stage Container */}
         <div className="w-full">
            <DSAMainContent 
               selectedCategory={selectedCategory} 
               animationSpeed={animationSpeed} 
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
