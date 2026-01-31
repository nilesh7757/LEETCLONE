"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownNarrowWide, Search, Database, Network, 
  Infinity as InfinityIcon, Sparkles, Layers, 
  X, Menu
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
    <div className="w-full relative min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--viz-blue)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--viz-purple)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full relative z-10 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto py-12">
        <DSAHeader 
          animationSpeed={animationSpeed} 
          setAnimationSpeed={setAnimationSpeed} 
          handleShare={handleShare} 
        />

        <div className="mt-12">
          <DSAControls 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            activeGroup={activeGroup} 
            setActiveGroup={setActiveGroup} 
            groups={groups} 
          />
        </div>

        <div className="lg:hidden fixed bottom-8 right-8 z-50">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-5 bg-[var(--primary)] text-[var(--background)] rounded-2xl shadow-2xl hover:scale-110 transition-all active:scale-95 shadow-[var(--primary)]/20"
            >
                <Menu size={28} />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
          {/* Sidebar */}
          <DSASidebar 
            filteredCategories={filteredCategories} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />

          {/* Main Content */}
          <div className="lg:col-span-9">
            <DSAMainContent 
              selectedCategory={selectedCategory} 
              animationSpeed={animationSpeed} 
            />
          </div>
        </div>
      </div>
    </div>
  );

}