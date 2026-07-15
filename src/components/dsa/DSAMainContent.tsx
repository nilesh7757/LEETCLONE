"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BookOpen, Code2, Trophy, ExternalLink } from "lucide-react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { CodeSnippet } from "./DocComponents";

interface DSACategory {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  themeRGB: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (speed: number, isFullscreen?: boolean) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detailedDocs: any;
  codeImplementations?: Record<string, string | undefined>;
}

interface DSAMainContentProps {
  selectedCategory: DSACategory;
  animationSpeed: number;
  isFullscreen: boolean;
  isStudio?: boolean;
}

interface PracticeQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  externalUrl: string;
  internalUrl: string;
}

const practiceQuestionsMap: Record<string, PracticeQuestion[]> = {
  SORTING: [
    { title: "Sort an Array", difficulty: "Medium", platform: "LeetCode 912", externalUrl: "https://leetcode.com/problems/sort-an-array/", internalUrl: "/problems?search=Sort" },
    { title: "Height Checker", difficulty: "Easy", platform: "LeetCode 1051", externalUrl: "https://leetcode.com/problems/height-checker/", internalUrl: "/problems?search=Height" }
  ],
  SELECTION_SORT: [
    { title: "Sort Colors", difficulty: "Medium", platform: "LeetCode 75", externalUrl: "https://leetcode.com/problems/sort-colors/", internalUrl: "/problems?search=Sort" },
    { title: "Third Maximum Number", difficulty: "Easy", platform: "LeetCode 414", externalUrl: "https://leetcode.com/problems/third-maximum-number/", internalUrl: "/problems?search=Maximum" }
  ],
  INSERTION_SORT: [
    { title: "Insertion Sort List", difficulty: "Medium", platform: "LeetCode 147", externalUrl: "https://leetcode.com/problems/insertion-sort-list/", internalUrl: "/problems?search=Sort" },
    { title: "Sort an Array", difficulty: "Medium", platform: "LeetCode 912", externalUrl: "https://leetcode.com/problems/sort-an-array/", internalUrl: "/problems?search=Sort" }
  ],
  QUICK_SORT: [
    { title: "Kth Largest Element in an Array", difficulty: "Medium", platform: "LeetCode 215", externalUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/", internalUrl: "/problems?search=Largest" },
    { title: "Majority Element", difficulty: "Easy", platform: "LeetCode 169", externalUrl: "https://leetcode.com/problems/majority-element/", internalUrl: "/problems?search=Majority" }
  ],
  MERGE_SORT: [
    { title: "Count Inversions in an Array", difficulty: "Medium", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/global-and-local-inversions/", internalUrl: "/problems/count-inversions-in-an-array" },
    { title: "Reverse Pairs", difficulty: "Hard", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/reverse-pairs/", internalUrl: "/problems/reverse-pairs" }
  ],
  BINARY_SEARCH: [
    { title: "Binary Search", difficulty: "Easy", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/binary-search/", internalUrl: "/problems/binary-search" },
    { title: "Search in Rotated Sorted Array", difficulty: "Medium", platform: "LeetCode 33", externalUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/", internalUrl: "/problems?search=Rotated" },
    { title: "Median of Two Sorted Arrays", difficulty: "Hard", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/", internalUrl: "/problems/median-of-two-sorted-arrays" }
  ],
  LINKED_LIST: [
    { title: "Reverse Linked List", difficulty: "Easy", platform: "LeetCode 206", externalUrl: "https://leetcode.com/problems/reverse-linked-list/", internalUrl: "/problems?search=List" },
    { title: "Linked List Cycle", difficulty: "Easy", platform: "LeetCode 141", externalUrl: "https://leetcode.com/problems/linked-list-cycle/", internalUrl: "/problems?search=Cycle" },
    { title: "Merge k Sorted Lists", difficulty: "Hard", platform: "LeetCode 23", externalUrl: "https://leetcode.com/problems/merge-k-sorted-lists/", internalUrl: "/problems?search=Merge" }
  ],
  BST: [
    { title: "Validate Binary Search Tree", difficulty: "Medium", platform: "LeetCode 98", externalUrl: "https://leetcode.com/problems/validate-binary-search-tree/", internalUrl: "/problems?search=Validate" },
    { title: "Insert into a Binary Search Tree", difficulty: "Medium", platform: "LeetCode 701", externalUrl: "https://leetcode.com/problems/insert-into-a-binary-search-tree/", internalUrl: "/problems?search=Tree" }
  ],
  TRIE: [
    { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", platform: "LeetCode 208", externalUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/", internalUrl: "/problems?search=Trie" },
    { title: "Word Search II", difficulty: "Hard", platform: "LeetCode 212", externalUrl: "https://leetcode.com/problems/word-search-ii/", internalUrl: "/problems?search=Word" }
  ],
  HEAP: [
    { title: "Kth Largest Element in a Stream", difficulty: "Easy", platform: "LeetCode 703", externalUrl: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", internalUrl: "/problems?search=Kth" },
    { title: "Find Median from Data Stream", difficulty: "Hard", platform: "LeetCode 295", externalUrl: "https://leetcode.com/problems/find-median-from-data-stream/", internalUrl: "/problems?search=Median" }
  ],
  SEGMENT_TREE: [
    { title: "Range Sum Query - Mutable", difficulty: "Medium", platform: "LeetCode 307", externalUrl: "https://leetcode.com/problems/range-sum-query-mutable/", internalUrl: "/problems?search=Range" },
    { title: "Count of Smaller Numbers After Self", difficulty: "Hard", platform: "LeetCode 315", externalUrl: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", internalUrl: "/problems?search=Smaller" }
  ],
  KMP: [
    { title: "Find the Index of the First Occurrence in a String", difficulty: "Easy", platform: "LeetCode 28", externalUrl: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", internalUrl: "/problems?search=String" },
    { title: "Repeated Substring Pattern", difficulty: "Easy", platform: "LeetCode 459", externalUrl: "https://leetcode.com/problems/repeated-substring-pattern/", internalUrl: "/problems?search=Pattern" }
  ],
  DSU: [
    { title: "Accounts Merge using DSU", difficulty: "Medium", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/accounts-merge/", internalUrl: "/problems/accounts-merge-using-dsu" },
    { title: "Number of Provinces", difficulty: "Medium", platform: "LeetCode 547", externalUrl: "https://leetcode.com/problems/number-of-provinces/", internalUrl: "/problems?search=Provinces" }
  ],
  FIBONACCI: [
    { title: "Climbing Stairs", difficulty: "Easy", platform: "LeetCode 70", externalUrl: "https://leetcode.com/problems/climbing-stairs/", internalUrl: "/problems?search=Stairs" },
    { title: "Fibonacci Number", difficulty: "Easy", platform: "LeetCode 509", externalUrl: "https://leetcode.com/problems/fibonacci-number/", internalUrl: "/problems?search=Fibonacci" }
  ],
  KNAPSACK: [
    { title: "Partition Equal Subset Sum", difficulty: "Medium", platform: "LeetCode 416", externalUrl: "https://leetcode.com/problems/partition-equal-subset-sum/", internalUrl: "/problems?search=Partition" },
    { title: "Target Sum", difficulty: "Medium", platform: "LeetCode 494", externalUrl: "https://leetcode.com/problems/target-sum/", internalUrl: "/problems?search=Target" }
  ],
  SLIDING_WINDOW: [
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", internalUrl: "/problems/longest-substring-without-repeating-characters" },
    { title: "Minimum Window Substring", difficulty: "Hard", platform: "LeetCode 76", externalUrl: "https://leetcode.com/problems/minimum-window-substring/", internalUrl: "/problems?search=Window" }
  ],
  KADANE: [
    { title: "Maximum Subarray", difficulty: "Medium", platform: "LeetCode 53", externalUrl: "https://leetcode.com/problems/maximum-subarray/", internalUrl: "/problems?search=Subarray" },
    { title: "Maximum Product Subarray", difficulty: "Medium", platform: "LeetCode 152", externalUrl: "https://leetcode.com/problems/maximum-product-subarray/", internalUrl: "/problems?search=Product" }
  ],
  LCS: [
    { title: "Longest Common Subsequence", difficulty: "Medium", platform: "LeetCode 1143", externalUrl: "https://leetcode.com/problems/longest-common-subsequence/", internalUrl: "/problems?search=Subsequence" },
    { title: "Shortest Common Supersequence", difficulty: "Hard", platform: "LeetCode 1092", externalUrl: "https://leetcode.com/problems/shortest-common-supersequence/", internalUrl: "/problems?search=Supersequence" }
  ],
  LIS: [
    { title: "Longest Increasing Subsequence", difficulty: "Medium", platform: "LeetCode 300", externalUrl: "https://leetcode.com/problems/longest-increasing-subsequence/", internalUrl: "/problems?search=Increasing" },
    { title: "Russian Doll Envelopes", difficulty: "Hard", platform: "LeetCode 354", externalUrl: "https://leetcode.com/problems/russian-doll-envelopes/", internalUrl: "/problems?search=Envelopes" }
  ],
  EDIT_DISTANCE: [
    { title: "Edit Distance", difficulty: "Medium", platform: "LeetCode 72", externalUrl: "https://leetcode.com/problems/edit-distance/", internalUrl: "/problems?search=Distance" },
    { title: "Delete Operation for Two Strings", difficulty: "Medium", platform: "LeetCode 583", externalUrl: "https://leetcode.com/problems/delete-operation-for-two-strings/", internalUrl: "/problems?search=Delete" }
  ],
  SCC: [
    { title: "Critical Connections in a Network", difficulty: "Hard", platform: "LeetCode 1192", externalUrl: "https://leetcode.com/problems/critical-connections-in-a-network/", internalUrl: "/problems?search=Connections" }
  ],
  LCA: [
    { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", platform: "LeetCode 236", externalUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", internalUrl: "/problems?search=Ancestor" },
    { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Easy", platform: "LeetCode 235", externalUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", internalUrl: "/problems?search=Ancestor" }
  ],
  FENWICK: [
    { title: "Create Sorted Array through Instructions", difficulty: "Hard", platform: "LeetCode 1649", externalUrl: "https://leetcode.com/problems/create-sorted-array-through-instructions/", internalUrl: "/problems?search=Array" }
  ],
  TARJAN: [
    { title: "Critical Connections in a Network", difficulty: "Hard", platform: "LeetCode 1192", externalUrl: "https://leetcode.com/problems/critical-connections-in-a-network/", internalUrl: "/problems?search=Connections" }
  ],
  BITMASK_DP: [
    { title: "Can I Win", difficulty: "Medium", platform: "LeetCode 294", externalUrl: "https://leetcode.com/problems/can-i-win/", internalUrl: "/problems?search=Win" }
  ],
  SIEVE: [
    { title: "Count Primes", difficulty: "Medium", platform: "LeetCode 204", externalUrl: "https://leetcode.com/problems/count-primes/", internalUrl: "/problems?search=Primes" }
  ],
  DIGIT_DP: [
    { title: "Numbers At Most N Given Digit Set", difficulty: "Hard", platform: "LeetCode 902", externalUrl: "https://leetcode.com/problems/numbers-at-most-n-given-digit-set/", internalUrl: "/problems?search=Digit" }
  ],
  SPARSE_TABLE: [
    { title: "Range Minimum Query", difficulty: "Medium", platform: "SPOJ RMQSQ", externalUrl: "https://www.spoj.com/problems/RMQSQ/", internalUrl: "/problems?search=Range" }
  ],
  REROOTING: [
    { title: "Sum of Distances in Tree", difficulty: "Hard", platform: "LeetCode 834", externalUrl: "https://leetcode.com/problems/sum-of-distances-in-tree/", internalUrl: "/problems?search=Tree" }
  ],
  BINARY_LIFTING: [
    { title: "Kth Ancestor of a Tree Node", difficulty: "Hard", platform: "LeetCode 1483", externalUrl: "https://leetcode.com/problems/kth-ancestor-of-a-tree-node/", internalUrl: "/problems?search=Ancestor" }
  ],
  GRAPH_BFS: [
    { title: "Number of Islands", difficulty: "Medium", platform: "LeetCode 200", externalUrl: "https://leetcode.com/problems/number-of-islands/", internalUrl: "/problems?search=Islands" },
    { title: "Rotting Oranges", difficulty: "Medium", platform: "LeetCode 994", externalUrl: "https://leetcode.com/problems/rotting-oranges/", internalUrl: "/problems?search=Oranges" }
  ],
  DIJKSTRA: [
    { title: "Network Delay Time", difficulty: "Medium", platform: "LeetCode 743", externalUrl: "https://leetcode.com/problems/network-delay-time/", internalUrl: "/problems?search=Network" },
    { title: "Number of Ways to Arrive at Destination", difficulty: "Medium", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/", internalUrl: "/problems/number-of-ways-to-arrive-at-destination" }
  ],
  BELLMAN_FORD: [
    { title: "Cheapest Flights Within K Stops", difficulty: "Medium", platform: "LeetCode 787", externalUrl: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", internalUrl: "/problems?search=Flights" }
  ],
  MST: [
    { title: "Min Cost to Connect All Points", difficulty: "Medium", platform: "LeetCode 1584", externalUrl: "https://leetcode.com/problems/min-cost-to-connect-all-points/", internalUrl: "/problems?search=Cost" }
  ],
  FLOYD_WARSHALL: [
    { title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", difficulty: "Medium", platform: "LeetCode 1334", externalUrl: "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/", internalUrl: "/problems?search=City" }
  ],
  STACK_QUEUE: [
    { title: "Valid Parentheses", difficulty: "Easy", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/valid-parentheses/", internalUrl: "/problems/valid-parentheses" },
    { title: "Task Scheduler", difficulty: "Medium", platform: "LogiQuest", externalUrl: "https://leetcode.com/problems/task-scheduler/", internalUrl: "/problems/task-scheduler" }
  ],
  TOPO_SORT: [
    { title: "Course Schedule II", difficulty: "Medium", platform: "LeetCode 210", externalUrl: "https://leetcode.com/problems/course-schedule-ii/", internalUrl: "/problems?search=Course" }
  ],
  N_QUEENS: [
    { title: "N-Queens", difficulty: "Hard", platform: "LeetCode 51", externalUrl: "https://leetcode.com/problems/n-queens/", internalUrl: "/problems?search=Queens" }
  ],
  TREE_TRAVERSAL: [
    { title: "Binary Tree Inorder Traversal", difficulty: "Easy", platform: "LeetCode 94", externalUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/", internalUrl: "/problems?search=Traversal" }
  ]
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return (
    <div className="min-h-[480px] flex items-center justify-center bg-[var(--card)] rounded-2xl border border-[var(--border)]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[1px] border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Loading visualizer...</p>
      </div>
    </div>
  );
  return <>{children}</>;
};

export const DSAMainContent = ({ selectedCategory, animationSpeed, isFullscreen }: DSAMainContentProps) => {
  const [activeTab, setActiveTab] = useState<"viz" | "docs" | "code" | "practice">("viz");

  const tabs = [
    { id: "viz", label: "Visualizer", icon: Activity },
    { id: "docs", label: "Resources", icon: BookOpen },
    { id: "code", label: "Code", icon: Code2 },
    { id: "practice", label: "Practice", icon: Trophy },
  ] as const;

  const VisualizationStage = (
    <div className="w-full">
       <ErrorBoundary name={selectedCategory.title} key={selectedCategory.id}>
          <ClientOnly>
             {selectedCategory.component(animationSpeed, isFullscreen)}
          </ClientOnly>
       </ErrorBoundary>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tabs Selector Row */}
      <div className="flex gap-2 border-b border-[var(--border)]/40 pb-3">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab.id 
                     ? "text-[var(--foreground)] bg-[var(--foreground)]/5 border border-[var(--border)]" 
                     : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
               }`}
            >
               <tab.icon size={12} className={activeTab === tab.id ? "text-[#3b82f6]" : "inherit"} />
               <span>{tab.label}</span>
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedCategory.id}-${activeTab}`} 
          initial={{ opacity: 0, scale: 0.99 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, filter: 'blur(20px)' }} 
          transition={{ duration: 0.3 }}
          className="relative w-full"
        >
          {activeTab === "viz" && VisualizationStage}

          {activeTab === "docs" && (
            <div className="min-h-[300px]">
              {selectedCategory.detailedDocs || (
                  <div className="p-16 rounded-2xl text-center bg-[var(--foreground)]/[0.01] border border-[var(--border)]">
                      <p className="text-[var(--muted-foreground)] text-[9px] font-mono uppercase tracking-[0.4em] animate-pulse">Resources coming soon...</p>
                  </div>
              )}
            </div>
          )}

          {activeTab === "code" && (
            <div className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#3b82f6]" />
                  Source Implementation
               </h3>
               {selectedCategory.codeImplementations ? (
                  <CodeSnippet code={selectedCategory.codeImplementations} />
               ) : (
                   <div className="p-16 rounded-2xl text-center bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)]">
                      <p className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-[0.4em]">No code available yet</p>
                   </div>
               )}
            </div>
          )}

          {activeTab === "practice" && (
            <div className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#3b82f6]" />
                  Curated Practice Problems
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(practiceQuestionsMap[selectedCategory.id] || []).map((q, idx) => (
                      <div key={idx} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between gap-2">
                              <div>
                                  <h4 className="text-xs font-bold text-[var(--foreground)]">{q.title}</h4>
                                  <span className="text-[9px] font-mono text-[var(--muted-foreground)]/60">{q.platform}</span>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                  q.difficulty === "Easy" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                  q.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                  "bg-red-500/10 text-red-500 border border-red-500/20"
                              }`}>
                                  {q.difficulty}
                              </span>
                          </div>
                          <div className="flex gap-2 w-full mt-2">
                              <a href={q.internalUrl} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/20 rounded-xl text-[#3b82f6] transition-all text-[9px] font-black uppercase tracking-wider text-center cursor-pointer">
                                  Solve on LogiQuest
                              </a>
                              <a href={q.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-3 py-2 bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all text-[9px] font-black uppercase tracking-wider text-center cursor-pointer">
                                  <ExternalLink size={10} /> LeetCode
                              </a>
                          </div>
                      </div>
                  ))}
                  {(!practiceQuestionsMap[selectedCategory.id] || practiceQuestionsMap[selectedCategory.id].length === 0) && (
                      <div className="col-span-full p-16 rounded-2xl text-center bg-[var(--foreground)]/[0.01] border border-dashed border-[var(--border)]">
                          <p className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-[0.4em]">No practice questions listed for this category yet</p>
                      </div>
                  )}
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
