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
import { BookOpen, Layers, GitBranch, Share2, Database, Layout, Infinity as InfinityIcon, ShoppingBag, Zap, FastForward, Sliders, Crown, MoveHorizontal, Network, ListTree, BoxSelect, Link, Search, ListOrdered, FileSearch, Route } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dsaCategories = [
  {
    id: "SORTING",
    title: "Bubble Sort",
    icon: <Layers className="text-blue-400" />,
    description: "Iterative sorting via swaps.",
    component: (speed: number) => <SortingVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Algorithm Overview</h4>
          <p className="leading-relaxed text-sm">
            Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in the wrong order. This process is repeated until the list is sorted.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Mechanism: Bubbling</h4>
          <p className="leading-relaxed mb-4 text-sm">
            After the first pass through the array, the largest element is guaranteed to "bubble" to the end. After the second pass, the second largest moves to the second-to-last position, and so on.
          </p>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-mono">
            if (arr[j] &gt; arr[j+1]) swap(arr[j], arr[j+1])
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N²) - Quadratic time, inefficient for large lists.<br/>
            <strong>Space:</strong> O(1) - In-place sorting.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "MERGE_SORT",
    title: "Merge Sort",
    icon: <FastForward className="text-cyan-400" />,
    description: "Efficient Divide & Conquer.",
    component: (speed: number) => <MergeSortVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Algorithm Overview</h4>
          <p className="leading-relaxed text-sm">
            Merge Sort is a Divide and Conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Mechanism: The Merge</h4>
          <p className="leading-relaxed mb-4 text-sm">
            The heart of Merge Sort is the <code>merge()</code> function, which takes two sorted sub-arrays and combines them into a single sorted array. This can be done efficiently in linear time.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N log N) - Guaranteed efficiency for all cases.<br/>
            <strong>Space:</strong> O(N) - Requires auxiliary space for merging.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "QUICK_SORT",
    title: "Quick Sort",
    icon: <Sliders className="text-orange-400" />,
    description: "Partitioning & Pivoting.",
    component: (speed: number) => <QuickSortVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Algorithm Overview</h4>
          <p className="leading-relaxed text-sm">
            Quick Sort is a highly efficient sorting algorithm and is based on partitioning of array of data into smaller arrays. A large array is partitioned into two arrays, one of which holds values smaller than the specified value, say pivot, based on which the partition is made and another array holds values greater than the pivot value.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Mechanism: Partitioning</h4>
          <p className="leading-relaxed mb-4 text-sm">
            The key process in Quick Sort is <code>partition()</code>. Target of partitions is, given an array and an element x of array as pivot, put x at its correct position in sorted array and put all smaller elements (smaller than x) before x, and put all greater elements (greater than x) after x.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N log N) average, O(N²) worst case.<br/>
            <strong>Space:</strong> O(log N) - Stack space for recursion.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "BINARY_SEARCH",
    title: "Binary Search",
    icon: <Search className="text-red-400" />,
    description: "O(log N) Search Strategy.",
    component: (speed: number) => <BinarySearchVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Algorithm Overview</h4>
          <p className="leading-relaxed text-sm">
            Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Mechanism: Halving</h4>
          <p className="leading-relaxed mb-4 text-sm">
            By comparing the <code>Target</code> with the <code>Mid</code> element, we can instantly discard half of the remaining search space because the array is sorted.
          </p>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-mono">
            if (arr[mid] &lt; target) left = mid + 1 <br/>
            else right = mid - 1
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(log N) - Extremely fast.<br/>
            <strong>Space:</strong> O(1) - Iterative approach.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "LINKED_LIST",
    title: "Linked List",
    icon: <GitBranch className="text-purple-400" />,
    description: "Pointers and node connections.",
    component: (speed: number) => <LinkedListVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Data Structure Overview</h4>
          <p className="leading-relaxed text-sm">
            A Linked List is a linear data structure where elements are not stored at contiguous memory locations. The elements are linked using pointers.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Node Structure</h4>
          <p className="leading-relaxed mb-4 text-sm">
            Each node contains:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Data:</strong> The value stored.</li>
            <li><strong>Next:</strong> A pointer/reference to the next node in the sequence.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Access:</strong> O(N) - Must traverse from Head.<br/>
            <strong>Insertion/Deletion:</strong> O(1) - If pointer to previous node is known.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "TREES",
    title: "BST",
    icon: <Database className="text-green-400" />,
    description: "Hierarchical data structures.",
    component: (speed: number) => <BSTVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Binary Search Tree (BST)</h4>
          <p className="leading-relaxed text-sm">
            A node-based binary tree data structure which has the following properties:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
            <li>The left subtree of a node contains only nodes with keys lesser than the node's key.</li>
            <li>The right subtree of a node contains only nodes with keys greater than the node's key.</li>
            <li>The left and right subtree must each also be a binary search tree.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Why use BST?</h4>
          <p className="leading-relaxed mb-4 text-sm">
            It allows for fast lookup, addition and removal of items, similar to Binary Search on a sorted array, but with dynamic size.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Search/Insert/Delete:</strong> O(log N) on average, O(N) in worst case (skewed tree).
          </p>
        </section>
      </div>
    )
  },
  {
    id: "TRIE",
    title: "Trie",
    icon: <Network className="text-indigo-400" />,
    description: "Prefix Tree for Strings.",
    component: (speed: number) => <TrieVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Data Structure Overview</h4>
          <p className="leading-relaxed text-sm">
            A Trie (pronounced "try") or Prefix Tree is a tree-based data structure used to efficiently store and retrieve keys in a dataset of strings. It is particularly useful for tasks like autocomplete and spell checking.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Properties</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Each node represents a character of a string.</li>
            <li>The root represents an empty string.</li>
            <li>Paths from the root to specific nodes represent prefixes of words.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Insert/Search:</strong> O(L), where L is the length of the word.<br/>
            <strong>Space:</strong> O(N * L) in the worst case (many distinct prefixes).
          </p>
        </section>
      </div>
    )
  },
  {
    id: "KMP",
    title: "KMP Algorithm",
    icon: <FileSearch className="text-pink-400" />,
    description: "O(N) String Matching.",
    component: (speed: number) => <KMPVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Knuth-Morris-Pratt (KMP)</h4>
          <p className="leading-relaxed text-sm">
            KMP is a string searching algorithm that searches for occurrences of a "word" within a main "text" by employing the observation that when a mismatch occurs, the word itself embodies sufficient information to determine where the next match could begin.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">The LPS Array</h4>
          <p className="leading-relaxed mb-4 text-sm">
            <strong>Longest Prefix Suffix</strong> array. For each index <code>i</code> in the pattern, <code>lps[i]</code> stores the length of the longest proper prefix which is also a suffix of the sub-pattern <code>pat[0..i]</code>.
          </p>
          <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs font-mono">
            Pattern: A B A B C <br/>
            LPS: 0 0 1 2 0
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N + M) - Linear time scan.<br/>
            <strong>Space:</strong> O(M) - For the LPS array.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "SEGMENT_TREE",
    title: "Segment Tree",
    icon: <BoxSelect className="text-lime-400" />,
    description: "Range Query & Point Updates.",
    component: (speed: number) => <SegmentTreeVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Range Query Problems</h4>
          <p className="leading-relaxed text-sm">
            Segment Trees are the gold standard for problems where you need to query a range (e.g., Sum from L to R) and update values (e.g., Update index i to x) frequently.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Structure</h4>
          <p className="leading-relaxed mb-4 text-sm">
            It is a binary tree where each node represents an interval or segment.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Leaf Nodes:</strong> Represent single elements of the array.</li>
            <li><strong>Internal Nodes:</strong> Represent the union of children intervals (e.g., Sum of left and right child).</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Build:</strong> O(N)<br/>
            <strong>Query:</strong> O(log N)<br/>
            <strong>Update:</strong> O(log N)<br/>
            <strong>Space:</strong> O(4 * N)
          </p>
        </section>
      </div>
    )
  },
  {
    id: "DSU",
    title: "Disjoint Set (DSU)",
    icon: <Link className="text-fuchsia-400" />,
    description: "Union-Find & Connectivity.",
    component: (speed: number) => <DSUVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Connectivity Problems</h4>
          <p className="leading-relaxed text-sm">
            Disjoint Set Union (DSU) or Union-Find is a data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets. It provides near-constant time operations to add new sets, merge sets, and find the representative of a set.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Core Operations</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Find(i):</strong> Find the representative (root) of the set containing 'i'. Includes <em>Path Compression</em>.</li>
            <li><strong>Union(i, j):</strong> Merge the sets containing 'i' and 'j'. Includes <em>Union by Rank/Size</em>.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(α(N)) - Where α is the Inverse Ackermann function (practically constant, &le; 4).<br/>
            <strong>Space:</strong> O(N) - To store parent and rank arrays.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "BACKTRACKING",
    title: "Backtracking",
    icon: <Crown className="text-red-400" />,
    description: "Recursion & Pruning (N-Queens).",
    component: (speed: number) => <NQueensVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Concept Overview</h4>
          <p className="leading-relaxed text-sm">
            Backtracking is an algorithmic-technique for solving problems recursively by trying to build a solution incrementally, one piece at a time, removing those solutions that fail to satisfy the constraints of the problem at any point of time.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">N-Queens Problem</h4>
          <p className="leading-relaxed mb-4 text-sm">
            The N Queen is the problem of placing N chess queens on an N×N chessboard so that no two queens attack each other.
          </p>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-mono">
            isValid(board, row, col) ? place() : backtrack()
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N!) - Factorial time complexity.<br/>
          </p>
        </section>
      </div>
    )
  },
  {
    id: "STACK_QUEUE",
    title: "Stack & Queue",
    icon: <Layout className="text-orange-400" />,
    description: "LIFO and FIFO linear structures.",
    component: () => <StackQueueVisualizer />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Stack (LIFO)</h4>
          <p className="leading-relaxed text-sm mb-2">
            <strong>Last In, First Out.</strong> The element inserted last is the first one to be removed.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><strong>Push:</strong> Add to top.</li>
            <li><strong>Pop:</strong> Remove from top.</li>
            <li><em>Usage:</em> Function calls (recursion), Undo mechanisms.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Queue (FIFO)</h4>
          <p className="leading-relaxed text-sm mb-2">
            <strong>First In, First Out.</strong> The element inserted first is the first one to be removed.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><strong>Enqueue:</strong> Add to rear.</li>
            <li><strong>Dequeue:</strong> Remove from front.</li>
            <li><em>Usage:</em> Task scheduling, buffering.</li>
          </ul>
        </section>
      </div>
    )
  },
  {
    id: "HEAP",
    title: "Min-Heap",
    icon: <ListTree className="text-amber-400" />,
    description: "Priority Queue Implementation.",
    component: (speed: number) => <HeapVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Data Structure Overview</h4>
          <p className="leading-relaxed text-sm">
            A Binary Heap is a complete binary tree which satisfies the heap property. In a <strong>Min Heap</strong>, the key at the root must be minimum among all keys present in the Binary Heap.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Operations</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Insert:</strong> Add at end, then "Bubble Up" to restore property.</li>
            <li><strong>Extract Min:</strong> Remove root, replace with last element, then "Bubble Down".</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Insert/Extract:</strong> O(log N) - Height of the tree.<br/>
            <strong>Peek Min:</strong> O(1) - Always at the root.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "SLIDING_WINDOW",
    title: "Sliding Window",
    icon: <MoveHorizontal className="text-teal-400" />,
    description: "Optimization for Arrays/Strings.",
    component: (speed: number) => <SlidingWindowVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Pattern Overview</h4>
          <p className="leading-relaxed text-sm">
            The Sliding Window pattern is used to perform a required operation on a specific window size of a given array or string, such as finding the longest subarray containing all 1s. Sliding Windows start from the 1st element and keep shifting right by one element and adjust the length of the window.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Example: Longest Substring</h4>
          <p className="leading-relaxed mb-4 text-sm">
            Find the length of the longest substring without repeating characters.
            We expand the window [L, R] by moving R. If we meet a duplicate, we shrink L until the duplicate is removed.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N) - Each element is visited at most twice (by L and R pointers).<br/>
            <strong>Space:</strong> O(K) - Size of the character set.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "FIBONACCI",
    title: "Fibonacci (DP)",
    icon: <InfinityIcon className="text-pink-400" />,
    description: "Memoization & Tabulation.",
    component: (speed: number) => <FibonacciVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Problem Statement</h4>
          <p className="leading-relaxed text-sm">
            The Fibonacci numbers are a sequence where each number is the sum of the two preceding ones, usually starting with 0 and 1.
          </p>
          <code className="block mt-2 text-xs bg-black/20 p-2 rounded font-mono">F(n) = F(n-1) + F(n-2)</code>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Dynamic Programming Approach</h4>
          <p className="leading-relaxed mb-4 text-sm">
            Calculating F(n) recursively leads to redundant work (overlapping subproblems). 
            <strong> Tabulation (Bottom-Up)</strong> solves this by starting from the base cases (0, 1) and filling up a table to N.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N) - Linear scan.<br/>
            <strong>Space:</strong> O(N) - Array size (can be optimized to O(1)).
          </p>
        </section>
      </div>
    )
  },
  {
    id: "KNAPSACK",
    title: "Knapsack (DP)",
    icon: <ShoppingBag className="text-purple-400" />,
    description: "Classic 0/1 Knapsack 2D DP.",
    component: (speed: number) => <KnapsackVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Problem Statement</h4>
          <p className="leading-relaxed text-sm">
            Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible. In the 0/1 Knapsack problem, items cannot be divided—you either take the whole item (1) or you don't (0).
          </p>
        </section>
        
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Dynamic Programming State</h4>
          <p className="leading-relaxed mb-4 text-sm">
            We build a 2D table <code>dp[i][w]</code> where:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>i</strong> represents that we are considering items from index 0 to i.</li>
            <li><strong>w</strong> represents the current maximum capacity of the knapsack.</li>
            <li>The cell value <code>dp[i][w]</code> stores the <strong>maximum value</strong> achievable using a subset of the first <code>i</code> items with a capacity limit of <code>w</code>.</li>
          </ul>
        </section>
    
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">The Decision (Recurrence)</h4>
          <p className="leading-relaxed mb-4 text-sm">
            For each item at index <code>i</code> with weight <code>wt</code> and value <code>val</code>, we have two choices for a capacity <code>w</code>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h5 className="font-bold text-red-400 mb-1 text-sm">Option 1: Exclude Item</h5>
              <p className="text-xs opacity-80">We don't put the item in the bag. The max value is whatever we achieved with the previous items (<code>i-1</code>) at the same capacity.</p>
              <code className="block mt-2 text-[10px] bg-black/20 p-2 rounded font-mono">dp[i-1][w]</code>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h5 className="font-bold text-green-400 mb-1 text-sm">Option 2: Include Item</h5>
              <p className="text-xs opacity-80">We put the item in. We gain its value, but lose its weight. We add this to the max value of previous items with the <em>remaining</em> capacity.</p>
              <code className="block mt-2 text-[10px] bg-black/20 p-2 rounded font-mono">val + dp[i-1][w - wt]</code>
            </div>
          </div>
          <p className="mt-4 text-xs italic opacity-70">
            We take the <strong>maximum</strong> of these two options.
          </p>
        </section>
        
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time Complexity:</strong> O(N * W), where N is the number of items and W is the capacity.<br/>
            <strong>Space Complexity:</strong> O(N * W) for the full table, or O(W) if optimized to use a 1D array.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "DIJKSTRA",
    title: "Dijkstra",
    icon: <Zap className="text-yellow-400" />,
    description: "Shortest Path on Weighted Graph.",
    component: (speed: number) => <DijkstraVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Algorithm Overview</h4>
          <p className="leading-relaxed text-sm">
            Dijkstra's algorithm finds the shortest path from a starting node to all other nodes in a graph with non-negative edge weights. It is a greedy algorithm.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Key Concept: Relaxation</h4>
          <p className="leading-relaxed mb-4 text-sm">
            We maintain a list of shortest known distances. For every node, we check if we can find a shorter path by going through a neighbor.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs font-mono">
            if (dist[u] + weight(u,v) &lt; dist[v]) {'{'} <br/>
            &nbsp;&nbsp;dist[v] = dist[u] + weight(u,v)<br/>
            {'}'}
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(E log V) - Using a Min-Priority Queue.<br/>
            <strong>Space:</strong> O(V + E) - To store graph and distances.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "FLOYD_WARSHALL",
    title: "Floyd-Warshall",
    icon: <Route className="text-orange-500" />,
    description: "All-Pairs Shortest Path.",
    component: (speed: number) => <FloydWarshallVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Problem Statement</h4>
          <p className="leading-relaxed text-sm">
            Find the shortest distances between every pair of vertices in a given edge-weighted directed Graph.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Dynamic Programming State</h4>
          <p className="leading-relaxed mb-4 text-sm">
            We maintain a 2D matrix where <code>dist[i][j]</code> represents the shortest distance from <code>i</code> to <code>j</code>.
            We iterate through every node <code>k</code> and check if it can serve as an intermediate point to shorten the path between <code>i</code> and <code>j</code>.
          </p>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs font-mono">
            dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
          </div>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(N³) - Three nested loops.<br/>
            <strong>Space:</strong> O(N²) - Adjacency Matrix.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "GRAPHS",
    title: "Graph & Matrix",
    icon: <Share2 className="text-red-400" />,
    description: "Adjacency Matrix & BFS.",
    component: (speed: number) => <GraphVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Graph Representation</h4>
          <p className="leading-relaxed text-sm mb-4">
            Graphs can be represented as an <strong>Adjacency Matrix</strong> (2D array) or <strong>Adjacency Lists</strong>. The matrix allows O(1) edge lookups but uses O(V²) space.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">BFS Traversal</h4>
          <p className="leading-relaxed mb-4 text-sm">
            Breadth-First Search explores the graph layer by layer, visiting all immediate neighbors before moving deeper.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Uses a <strong>Queue</strong> (FIFO).</li>
            <li>Great for finding the shortest path in unweighted graphs.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(V + E) - Visit every vertex and edge.<br/>
            <strong>Space:</strong> O(V) - To store visited set and queue.
          </p>
        </section>
      </div>
    )
  },
  {
    id: "TOPO_SORT",
    title: "Topological Sort",
    icon: <ListOrdered className="text-cyan-400" />,
    description: "Kahn's Algo & Dependencies.",
    component: (speed: number) => <TopoSortVisualizer speed={speed} />,
    logicSteps: [],
    detailedDocs: (
      <div className="space-y-6 text-[var(--foreground)]/80">
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Dependency Resolution</h4>
          <p className="leading-relaxed text-sm">
            Topological Sort creates a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge <code>u &rarr; v</code>, vertex <code>u</code> comes before vertex <code>v</code>.
          </p>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Kahn's Algorithm (BFS)</h4>
          <p className="leading-relaxed mb-4 text-sm">
            This approach iteratively removes nodes with 0 In-Degree (no dependencies) and updates their neighbors.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Step 1:</strong> Calculate In-Degree for all nodes.</li>
            <li><strong>Step 2:</strong> Add all nodes with 0 In-Degree to a Queue.</li>
            <li><strong>Step 3:</strong> Process Queue: remove node, add to result, decrement neighbor in-degrees.</li>
          </ul>
        </section>
        <section>
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Complexity</h4>
          <p className="text-sm">
            <strong>Time:</strong> O(V + E) - Similar to BFS.<br/>
            <strong>Space:</strong> O(V) - For In-Degree array and Queue.
          </p>
        </section>
      </div>
    )
  }
];

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState(dsaCategories[0]);
  const [animationSpeed, setAnimationSpeed] = useState(300);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 bg-[var(--background)] -z-20" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
              DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Visualizer Pro</span>
            </h1>
            <p className="text-[var(--foreground)]/60 max-w-2xl text-lg">
              Master algorithms with interactive, step-by-step visualizers. You have full control over the execution flow.
            </p>
          </div>
          
          {/* Speed Controller */}
          <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl flex items-center gap-4 min-w-[250px] shadow-sm">
             <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                <Zap size={18} />
             </div>
             <div className="flex-1">
                <div className="flex justify-between mb-1">
                   <span className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase">Animation Speed</span>
                   <span className="text-[10px] font-mono text-yellow-500 font-bold">{animationSpeed}ms</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50"
                  value={animationSpeed} 
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-3 overflow-y-auto max-h-[75vh] pr-2 scrollbar-thin scrollbar-thumb-[var(--card-border)]">
            <h3 className="text-[10px] font-bold text-[var(--foreground)]/40 px-2 uppercase tracking-widest mb-2">Algorithm Categories</h3>
            {dsaCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedCategory.id === cat.id
                    ? "bg-[var(--foreground)]/5 border-blue-500/50 shadow-lg scale-[1.02]"
                    : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--foreground)]/20"
                }`}
              >
                <div className={`p-2 rounded-lg bg-[var(--foreground)]/5`}>
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--foreground)]">{cat.title}</h4>
                  <p className="text-[9px] text-[var(--foreground)]/40 leading-tight">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedCategory.component(animationSpeed)}

                {/* Logic Breakdown Section */}
                <div className="mt-8 p-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                         <Layout size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--foreground)]">How the Logic Works</h3>
                   </div>
                   
                   {/* @ts-ignore */}
                   {selectedCategory.detailedDocs ? (
                      <div className="mt-4">
                        {/* @ts-ignore */}
                        {selectedCategory.detailedDocs}
                      </div>
                   ) : (
                   <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {selectedCategory.logicSteps.map((step, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-4 p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--card-border)] hover:border-purple-500/30 transition-colors group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs group-hover:bg-purple-500 group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-[var(--foreground)]/70 self-center leading-relaxed">
                            {step}
                          </p>
                        </motion.div>
                      ))}
                   </div>
                   )}
                </div>

                <div className="mt-8 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
                   <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                         <BookOpen size={20} />
                      </div>
                      <div>
                         <h4 className="font-bold text-[var(--foreground)]">Mastery Protocol</h4>
                         <p className="text-xs text-[var(--foreground)]/60">Follow the steps above while interacting with the visualizer.</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Practice Related Problems</button>
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}