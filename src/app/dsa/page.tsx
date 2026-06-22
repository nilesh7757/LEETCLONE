"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownNarrowWide, Search, Database, Network, 
  Infinity as InfinityIcon, Sparkles, Layers, 
  Menu, ChevronRight, Cpu, Activity,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react";

import { dsaCategories } from "@/components/dsa/dsaCategories";
import { DSAHeader } from "@/components/dsa/DSAHeader";
import { DSASidebar, DSACategory } from "@/components/dsa/DSASidebar";
import { DSAMainContent } from "@/components/dsa/DSAMainContent";

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState<DSACategory>(dsaCategories[0] as DSACategory);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const themeColor = selectedCategory.themeColor || "#3b82f6";

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const groups = [
    { id: "all", title: "All", icon: <Layers size={18} /> },
    { id: "sorting", title: "Sorting", icon: <ArrowDownNarrowWide size={18} /> },
    { id: "searching", title: "Searching", icon: <Search size={18} /> },
    { id: "data-structures", title: "Data Structures", icon: <Database size={18} /> },
    { id: "graphs", title: "Graphs", icon: <Network size={18} /> },
    { id: "dp", title: "DP", icon: <InfinityIcon size={18} /> },
    { id: "advanced", title: "Advanced", icon: <Sparkles size={18} /> },
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

  const filteredCategories = dsaCategories.filter(cat => {
    const matchesSearch = cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = activeGroup === "all" || categoryToGroup[cat.id] === activeGroup;
    return matchesSearch && matchesGroup;
  });

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
      className="w-full h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans"
    >
      {/* 1. TOP UTILITY BAR (HUD) */}
      <header className="h-14 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-6 shrink-0 z-50 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
                  <Cpu size={16} className="text-[#3b82f6]" />
               </div>
               <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.3em] text-[var(--foreground)]">Neuro.Flow</span>
            </div>
            <div className="h-4 w-px border-[var(--border)] hidden sm:block" />
            <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--muted-foreground)]">
               <span className="hidden md:inline">Project_DSA</span>
               <ChevronRight size={10} className="hidden md:inline" />
               <span className="text-[var(--muted-foreground)]">{activeGroup.toUpperCase()}</span>
               <ChevronRight size={10} />
               <span className="text-[var(--foreground)] font-bold truncate max-w-[120px] md:max-w-none">{selectedCategory.title}</span>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden md:block relative group">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[#3b82f6] transition-colors">
                  <Search size={14} />
               </div>
               <input 
                  type="text"
                  placeholder="Quick Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[var(--foreground)]/5 border border-[var(--border)] rounded-full py-1.5 pl-10 pr-4 text-[11px] w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition-all font-mono"
               />
            </div>
            <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden p-2 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--muted-foreground)]"
            >
               <Menu size={20} />
            </button>
         </div>
      </header>

      {/* 2. MAIN STUDIO AREA */}
      <main className="flex-1 flex min-h-0 relative">
         {/* A. ACTIVITY BAR (LEFT) - Desktop Only */}
         <aside className="hidden lg:flex w-16 border-r border-[var(--border)] bg-[var(--background)] flex flex-col items-center py-6 gap-6 shrink-0 z-40">
            <button 
               onClick={() => setIsSidebarVisible(!isSidebarVisible)}
               className={`p-3 rounded-xl transition-all hover:bg-[var(--foreground)]/5 ${isSidebarVisible ? "text-[var(--muted-foreground)]" : "text-[#3b82f6] bg-[#3b82f6]/10"}`}
               title={isSidebarVisible ? "Close Sidebar" : "Open Sidebar"}
            >
               {isSidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="w-8 h-px border-[var(--border)]" />
            {groups.map(g => (
               <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  title={g.title}
                  className={`p-3 rounded-xl transition-all relative group ${
                     activeGroup === g.id ? "bg-[#3b82f6]/10 text-[#3b82f6]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
               >
                  {g.icon}
                  {activeGroup === g.id && (
                     <motion.div layoutId="activity-active" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#3b82f6] rounded-r-full" />
                  )}
                  <div className="absolute left-full ml-4 px-3 py-1 bg-[var(--card)] border border-[var(--border)] rounded text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                     {g.title}
                  </div>
               </button>
            ))}
         </aside>

         {/* B. PROTOCOL INDEX (SIDEBAR) - Collapsible & Mobile Overly */}
         <AnimatePresence initial={false}>
            {(isSidebarVisible || isMobileMenuOpen) && (
               <motion.aside 
                  initial={{ width: 0, x: -320, opacity: 0 }}
                  animate={{ width: isMobileMenuOpen ? "100%" : 320, x: 0, opacity: 1 }}
                  exit={{ width: 0, x: -320, opacity: 0 }}
                  transition={{ type: 'spring', damping: 40, stiffness: 300 }}
                  className={`border-r border-[var(--border)] bg-[var(--background)] flex flex-col shrink-0 z-[60] lg:z-30 overflow-hidden ${isMobileMenuOpen ? "fixed inset-0" : "relative"}`}
               >
                  <div className={`${isMobileMenuOpen ? "w-full" : "w-80"} flex flex-col h-full`}>
                     <div className="p-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                           {isMobileMenuOpen && (
                              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -ml-2 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--muted-foreground)]">
                                 <ChevronRight className="rotate-180" size={18} />
                              </button>
                           )}
                           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)]">Protocol Index</h3>
                        </div>
                        <span className="text-[9px] font-mono text-[#3b82f6] bg-[#3b82f6]/5 px-2 py-0.5 rounded border border-[#3b82f6]/20">{filteredCategories.length}</span>
                     </div>
                     
                     {isMobileMenuOpen && (
                        <div className="p-4 border-b border-[var(--border)] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                           {groups.map(g => (
                              <button 
                                 key={g.id} 
                                 onClick={() => setActiveGroup(g.id)}
                                 className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeGroup === g.id ? "bg-[#3b82f6] text-[var(--foreground)]" : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)]"}`}
                              >
                                 {g.title}
                              </button>
                           ))}
                        </div>
                     )}

                     <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
                        <DSASidebar 
                           filteredCategories={filteredCategories} 
                           selectedCategory={selectedCategory} 
                           setSelectedCategory={setSelectedCategory} 
                           isStudio
                        />
                     </div>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>

         {/* C. THE STAGE (MAIN CONTENT) */}
         <section className="flex-1 flex flex-col min-w-0 bg-[var(--background)] relative overflow-hidden">
            {/* Dynamic Stage Background */}
            <div className="absolute inset-0 pointer-events-none">
               <motion.div 
                  className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06]"
                  animate={{ 
                     x: mousePos.x - (isSidebarVisible ? 1000 : 600),
                     y: mousePos.y - 100,
                     backgroundColor: themeColor 
                  }}
                  transition={{ type: 'spring', damping: 50, stiffness: 60 }}
               />
               <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern" style={{ backgroundSize: '40px 40px' }} />
            </div>

            {/* Stage Header */}
            <div className="h-14 flex items-center justify-between px-4 md:px-8 bg-transparent border-b border-[var(--border)] shrink-0 z-20 overflow-x-auto no-scrollbar">
               <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                     <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] whitespace-nowrap">Neural Sync: Active</span>
                  </div>
                  <div className="h-3 w-px border-[var(--border)] hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-2">
                     <Activity size={12} className="text-[#3b82f6]" />
                     <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] whitespace-nowrap">Latency: 12ms</span>
                  </div>
               </div>
               
               <DSAHeader 
                  isStudio
                  animationSpeed={animationSpeed} 
                  setAnimationSpeed={setAnimationSpeed} 
                  handleShare={handleShare} 
               />
            </div>

            {/* Stage Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 z-10 relative">
               <div className="w-full h-full">
                  <DSAMainContent 
                     selectedCategory={selectedCategory} 
                     animationSpeed={animationSpeed} 
                     isStudio
                  />
               </div>
            </div>
         </section>
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
