"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownNarrowWide, Search, Database, Network, 
  Infinity as InfinityIcon, Sparkles, Layers, 
  ArrowDownWideNarrow, X, Menu, GraduationCap, Share2
} from "lucide-react";

import { dsaCategories } from "@/components/dsa/dsaCategories";
import { DSAHeader } from "@/components/dsa/DSAHeader";
import { DSAControls } from "@/components/dsa/DSAControls";
import { DSASidebar } from "@/components/dsa/DSASidebar";
import { DSAMainContent } from "@/components/dsa/DSAMainContent";

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState(dsaCategories[0]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const groups = [
    { id: "all", title: "All", icon: <Layers size={14} /> },
    { id: "sorting", title: "Sorting", icon: <ArrowDownNarrowWide size={14} /> },
    { id: "searching", title: "Searching", icon: <Search size={14} /> },
    { id: "data-structures", title: "Data Structures", icon: <Database size={14} /> },
    { id: "graphs", title: "Graphs", icon: <Network size={14} /> },
    { id: "dp", title: "DP", icon: <InfinityIcon size={14} /> },
    { id: "advanced", title: "Advanced", icon: <Sparkles size={14} /> },
  ];

  const categoryToGroup: Record<string, string> = {
    "SORTING": "sorting",
    "QUICK_SORT": "sorting",
    "MERGE_SORT": "sorting",
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
    "FLOYD_WARSHALL": "graphs",
    "TOPO_SORT": "graphs",
    "FIBONACCI": "dp",
    "KNAPSACK": "dp",
    "KADANE": "dp",
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
    <div className="w-full relative min-h-screen bg-background text-foreground">
      {/* 3B1B Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="w-full relative z-10 px-4 md:px-0">
        
        {/* Header */}
        <DSAHeader 
          animationSpeed={animationSpeed} 
          setAnimationSpeed={setAnimationSpeed} 
          handleShare={handleShare} 
        />

        {/* Controls */}
        <DSAControls 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          activeGroup={activeGroup} 
          setActiveGroup={setActiveGroup} 
          groups={groups} 
        />

        {/* Mobile Menu Button (Floating) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-4 bg-[#58C4DD] text-black rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95"
            >
                <Menu size={24} />
            </button>
        </div>

        {/* Mobile Sidebar / Drawer */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: "100%" }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: "100%" }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-background flex flex-col p-6 lg:hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-black tracking-[0.3em] text-muted-foreground uppercase">Select Manifold</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-muted rounded-full text-muted-foreground hover:bg-muted/80">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 space-y-3 pb-8">
                        {filteredCategories.map((cat) => (
                        <button key={cat.id} onClick={() => { setSelectedCategory(cat); setIsMobileMenuOpen(false); }} className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedCategory.id === cat.id ? "bg-muted border-[#58C4DD]/50" : "bg-transparent border-border"}`}>
                            <div className={`p-2.5 rounded-xl ${selectedCategory.id === cat.id ? "bg-[#58C4DD]/20" : "bg-muted"}`}>{cat.icon}</div>
                            <div><h4 className="font-bold text-sm tracking-wide">{cat.title}</h4></div>
                        </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <DSASidebar 
            filteredCategories={filteredCategories} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />

          {/* Main Content */}
          <DSAMainContent 
            selectedCategory={selectedCategory} 
            animationSpeed={animationSpeed} 
          />
        </div>
      </div>
    </div>
  );
}