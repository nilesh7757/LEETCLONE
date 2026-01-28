"use client";

import React, { useState } from "react";
import SortingVisualizer from "@/components/DSA/SortingVisualizer";
import MergeSortVisualizer from "@/components/DSA/MergeSortVisualizer";
import QuickSortVisualizer from "@/components/DSA/QuickSortVisualizer";
import BinarySearchVisualizer from "@/components/DSA/BinarySearchVisualizer";
import LinkedListVisualizer from "@/components/DSA/LinkedListVisualizer";
import BSTVisualizer from "@/components/DSA/BSTVisualizer";
import TrieVisualizer from "@/components/DSA/TrieVisualizer";
import KMPVisualizer from "@/components/DSA/KMPVisualizer";
import SegmentTreeVisualizer from "@/components/DSA/SegmentTreeVisualizer";
import DSUVisualizer from "@/components/DSA/DSUVisualizer";
import HeapVisualizer from "@/components/DSA/HeapVisualizer";
import NQueensVisualizer from "@/components/DSA/NQueensVisualizer";
import StackQueueVisualizer from "@/components/DSA/StackQueueVisualizer";
import GraphVisualizer from "@/components/DSA/GraphVisualizer";
import TopoSortVisualizer from "@/components/DSA/TopoSortVisualizer";
import DijkstraVisualizer from "@/components/DSA/DijkstraVisualizer";
import FloydWarshallVisualizer from "@/components/DSA/FloydWarshallVisualizer";
import FibonacciVisualizer from "@/components/DSA/FibonacciVisualizer";
import KnapsackVisualizer from "@/components/DSA/KnapsackVisualizer";
import SlidingWindowVisualizer from "@/components/DSA/SlidingWindowVisualizer";
import {
  BookOpen, Layers, GitBranch, Share2, Database, Layout,
  Infinity as InfinityIcon, ShoppingBag, Zap, FastForward,
  Sliders, Crown, MoveHorizontal, Network, ListTree, BoxSelect,
  Link, Search, ListOrdered, FileSearch, Route, Cpu,
  GraduationCap, ChevronRight, Binary, Microscope, Compass,
  ArrowDownNarrowWide, Activity, GitPullRequest, GitMerge, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Documentation Components ---

const DocSection = ({ title, icon: Icon, children, color = "#58C4DD" }: any) => (
  <section className="relative p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden group transition-all hover:border-white/20">
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-700">
      <Icon size={120} style={{ color }} />
    </div>
    <h4 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color }}>
      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
      {title}
    </h4>
    <div className="relative z-10 leading-relaxed text-sm font-light text-white/70 space-y-4">
      {children}
    </div>
  </section>
);

const ComplexityCard = ({ time, space }: { time: string, space: string }) => (
  <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col gap-4">
    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Asymptotic Bounds</h5>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-[10px] text-white/20 font-mono">Temporal</p>
        <p className="text-lg font-bold text-[#FFFF00] font-mono">{time}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-white/20 font-mono">Spatial</p>
        <p className="text-lg font-bold text-[#58C4DD] font-mono">{space}</p>
      </div>
    </div>
  </div>
);

const dsaCategories = [
  {
    id: "BINARY_SEARCH",
    title: "Binary Search",
    icon: <Search className="text-[#58C4DD]" />,
    description: "Interval reduction lemma.",
    component: (speed: number) => <BinarySearchVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Theoretical Basis" icon={Microscope}>
          <p>Binary Search is the fundamental algorithm for searching sorted manifolds. It operates on the principle of <strong>Interval Reduction</strong>, where each evaluation point (the median) effectively eliminates half of the remaining search space.</p>
          <p>Unlike linear scans that operate in 1:1 temporal correspondence with data size, Binary Search achieves <strong>Logarithmic Scaling</strong>, making it suitable for massive datasets.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(log N)" space="O(1)" />
          <DocSection title="The Median Lemma" icon={Target} color="#FFFF00">
            <p>At every step, we calculate the median index m. By comparing V[m] to the target T, we define a logical boundary. If V[m] &lt; T, the entire left sub-manifold is discarded as non-viable.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "LINKED_LIST",
    title: "Linked List",
    icon: <GitBranch className="text-[#58C4DD]" />,
    description: "Discrete memory references.",
    component: (speed: number) => <LinkedListVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Memory Manifold" icon={Cpu}>
          <p>A Linked List represents data as a sequence of <strong>Discrete Memory Objects</strong>. Unlike arrays, nodes are not stored contiguously; they are linked via <strong>Heuristic Pointers</strong> (memory addresses).</p>
          <p>This allows for constant-time $O(1)$ insertions and deletions at known locations, as we only need to re-map the address references rather than shifting the entire manifold.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(N) Search" space="O(N)" />
          <DocSection title="Pointer Anatomy" icon={Share2} color="#FFFF00">
            <ul className="space-y-3 list-none">
              <li className="flex gap-2"><span className="text-[#58C4DD] font-bold">● Value:</span> The payload residing at the address.</li>
              <li className="flex gap-2"><span className="text-[#FFFF00] font-bold">● Next:</span> A hex reference to the successor manifold.</li>
              <li className="flex gap-2"><span className="text-[#FC6255] font-bold">● NULL:</span> The termination signal of the sequence.</li>
            </ul>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "QUICK_SORT",
    title: "Quick Sort",
    icon: <Sliders className="text-[#FC6255]" />,
    description: "Recursive partitioning lemma.",
    component: (speed: number) => <QuickSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Partition Strategy" icon={Binary} color="#FC6255">
          <p>Quick Sort is a <strong>Divide and Conquer</strong> algorithm that centers around the <strong>Pivot Standard</strong>. By selecting a pivot element, we reorganize the manifold such that all smaller elements reside in the left sub-manifold and larger ones in the right.</p>
          <p>Through recursive application of this partitioning lemma, the entire vector space converges to a sorted state.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(N log N)" space="O(log N)" />
          <DocSection title="Recursive Depth" icon={GitPullRequest} color="#58C4DD">
            <p>The efficiency depends on the pivot selection. A perfectly balanced pivot reduces the problem size by half at each level, achieving optimal logarithmic depth.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "MERGE_SORT",
    title: "Merge Sort",
    icon: <FastForward className="text-[#83C167]" />,
    description: "Stable recursive re-assembly.",
    component: (speed: number) => <MergeSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Atomic Decomposition" icon={Microscope} color="#83C167">
          <p>Merge Sort treats sorting as a process of <strong>Recursive Decomposition</strong>. The manifold is split into atomic units (single elements) which are inherently sorted. The true logic resides in the <strong>Conquer Phase</strong>.</p>
          <p>By merging two sorted sub-manifolds, we maintain a stable order while re-assembling the full vector space.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(N log N)" space="O(N)" />
          <DocSection title="Merging Lemma" icon={GitMerge} color="#FFFF00">
            <p>During the merge, we compare the leading elements of two sub-manifolds. The smaller element is moved to the parent manifold, ensuring that each re-assembled level is perfectly ordered.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "BST",
    title: "BST",
    icon: <Database className="text-[#58C4DD]" />,
    description: "Non-linear hierarchy mapping.",
    component: (speed: number) => <BSTVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Hierarchical Logic" icon={Network}>
          <p>A Binary Search Tree (BST) maps a 1D manifold into a 2D <strong>Hierarchical Structure</strong>. For every node, all descendants in the left sub-tree are smaller, and all descendants in the right sub-tree are larger.</p>
          <p>This spatial arrangement allows for search, insertion, and deletion operations to be performed in logarithmic time relative to the tree depth.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(log N)" space="O(N)" />
          <DocSection title="Geometric Balance" icon={Compass} color="#FFFF00">
            <p>The effectiveness of a BST is directly proportional to its <strong>Structural Balance</strong>. A skewed tree degenerates into a linear manifold ($O(N)$), while a balanced tree maintains optimal $O(\log N)$ performance.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "TRIE",
    title: "Trie",
    icon: <Microscope className="text-[#FFFF00]" />,
    description: "Prefix manifold sharing.",
    component: (speed: number) => <TrieVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Prefix Compression" icon={Cpu} color="#FFFF00">
          <p>A Trie (Prefix Tree) optimizes sequence storage by <strong>Sharing Common Prefixes</strong>. Instead of storing the full sequence, each node represents a single character manifold.</p>
          <p>This allows for ultra-fast $O(L)$ lookups (where $L$ is sequence length) and is the foundation for autocomplete and linguistic analysis systems.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(L) per Op" space="O(Alphabet * N)" />
          <DocSection title="Path Resolution" icon={Activity} color="#58C4DD">
            <p>Traversal through a Trie is deterministic. Each character in the query sequence acts as a directional signal to the next memory cell, resolving the presence of a sequence through path existence.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "HEAP",
    title: "Min-Heap",
    icon: <ListTree className="text-[#FFFF00]" />,
    description: "Priority reduction tree.",
    component: (speed: number) => <HeapVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Priority Ordering" icon={Target} color="#FFFF00">
          <p>A Min-Heap is a specialized complete tree that maintains the <strong>Heap Property</strong>: the value of each node is less than or equal to the values of its children. This ensures that the global minimum is always at the root manifold.</p>
          <p>It is the primary engine for <strong>Priority Queues</strong> and greedy algorithmic choices.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(log N) Insert" space="O(N)" />
          <DocSection title="Bubble Logic" icon={ArrowDownNarrowWide} color="#58C4DD">
            <p>When the property is violated, elements "Bubble Up" or "Sink Down" through recursive swaps until the hierarchy is restored. This maintenance occurs in $O(\log N)$ time.</p>
          </DocSection>
        </div>
      </div>
    )
  },
  {
    id: "SEGMENT_TREE",
    title: "Segment Tree",
    icon: <BoxSelect className="text-[#58C4DD]" />,
    description: "Range query manifold.",
    component: (speed: number) => <SegmentTreeVisualizer speed={speed} />,
    detailedDocs: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DocSection title="Interval Decomposition" icon={Layers}>
          <p>Segment Trees provide a way to perform <strong>Range Queries</strong> and <strong>Point Updates</strong> on a manifold in logarithmic time. Each node in the tree represents a specific sub-interval $[L, R]$ of the base array.</p>
          <p>The root represents the total interval, and leaves represent atomic indices.</p>
        </DocSection>
        <div className="space-y-8">
          <ComplexityCard time="O(log N) Query" space="O(4N)" />
          <DocSection title="Contribution Lemma" icon={Zap} color="#83C167">
            <p>During a query, if a node's interval is fully contained within the query range, it returns its pre-computed value immediately. Otherwise, it delegates to its children, combining their partial results.</p>
          </DocSection>
        </div>
      </div>
    )
  }
];

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState(dsaCategories[0]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      {/* 3B1B Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#58C4DD]/20 rounded-xl text-[#58C4DD]"><GraduationCap size={24} /></div>
                <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Academy of Algorithms</span>
            </div>
            <h1 className="text-5xl font-light text-white mb-4 tracking-tight">
              DSA <span className="text-[#58C4DD] font-medium">Visualizer</span>
            </h1>
            <p className="text-white/40 max-w-xl text-lg font-light leading-relaxed">
              Explore the mathematical elegance of computer science through interactive coordinate transformations and temporal state analysis.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-4 min-w-[280px] backdrop-blur-xl shadow-2xl">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Temporal Scale</span>
                <span className="text-xs font-mono text-[#FFFF00] font-bold">{animationSpeed}ms</span>
             </div>
             <input type="range" min="100" max="2000" step="100" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFFF00]" />
             <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-tighter"><span>High Frequency</span><span>Deep Analysis</span></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-4 max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide">
            <h3 className="text-[10px] font-black text-white/20 px-4 uppercase tracking-[0.25em] mb-4">Coordinate Systems</h3>
            {dsaCategories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat)} className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${selectedCategory.id === cat.id ? "bg-white/10 border-[#58C4DD]/50 shadow-[0_0_20px_rgba(88,196,221,0.1)] translate-x-2" : "bg-transparent border-white/5 hover:border-white/20"}`}>
                <div className={`p-2.5 rounded-xl transition-colors ${selectedCategory.id === cat.id ? "bg-[#58C4DD]/20" : "bg-white/5 group-hover:bg-white/10"}`}>{cat.icon}</div>
                <div><h4 className="font-bold text-xs text-white tracking-wide">{cat.title}</h4><p className="text-[9px] text-white/30 font-mono mt-0.5 uppercase tracking-tighter">{cat.description}</p></div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div key={selectedCategory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                
                {/* The Visualizer */}
                <div className="mb-12">{selectedCategory.component(animationSpeed)}</div>

                {/* Mathematical Documentation */}
                <div className="mt-12">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="h-[1px] flex-1 bg-white/10" />
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><BookOpen size={14} className="text-[#58C4DD]" />Logical Documentation</h3>
                      <div className="h-[1px] flex-1 bg-white/10" />
                   </div>
                   
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[200px]">
                        {selectedCategory.detailedDocs || (
                            <div className="p-12 border border-dashed border-white/10 rounded-[3rem] text-center">
                                <p className="text-white/20 text-xs font-mono uppercase tracking-widest">Documentation for this manifold is currently rendering.</p>
                            </div>
                        )}
                   </motion.div>
                </div>

                {/* Footer Action */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 p-8 bg-gradient-to-br from-[#1C1C1C] to-black border border-white/5 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#58C4DD]/20 to-transparent" />
                   <div className="flex gap-6 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#58C4DD]/10 flex items-center justify-center text-[#58C4DD] shadow-inner"><Search size={24} /></div>
                      <div><h4 className="font-bold text-white text-lg">Next Objectives</h4><p className="text-xs text-white/40 font-light tracking-wide mt-1">Apply this lemma to real-world complexity challenges.</p></div>
                   </div>
                   <button className="group px-8 py-3 bg-[#58C4DD] text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_#58C4DD44]">Start Challenges <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
