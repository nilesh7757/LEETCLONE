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
import MSTVisualizer from "@/components/DSA/MSTVisualizer";
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
  ArrowDownNarrowWide, Activity, GitPullRequest, GitMerge, Target, Menu, X, Code, Check, Copy, MapPin, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Documentation Components ---

const CodeSnippet = ({ code, language = "cpp" }: { code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-[10px] font-mono font-bold text-white/40 uppercase">{language}</span>
        <button onClick={handleCopy} className="text-white/40 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs font-mono leading-relaxed text-white/80">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

interface DocSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
}

const DocSection = ({ title, icon: Icon, children, color = "#58C4DD" }: DocSectionProps) => (
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
    id: "SORTING",
    title: "Bubble Sort",
    icon: <ArrowDownNarrowWide className="text-[#FFFF00]" />,
    description: "Stable monotonic bubbling.",
    component: (speed: number) => <SortingVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Monotonic Bubbling" icon={Activity} color="#FFFF00">
            <p>Bubble Sort is a stable, comparison-based algorithm that iteratively transforms a manifold into a monotonic sequence. It operates by repeatedly stepping through the list, comparing adjacent elements and swapping them if they are in the wrong order.</p>
            <p>The name &quot;Bubble Sort&quot; comes from the way smaller elements &quot;bubble&quot; to the top of the list (beginning of the array) while larger elements sink to the bottom.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N²)" space="O(1)" />
            <DocSection title="Stability Lemma" icon={Check} color="#83C167">
              <p>Bubble sort is <strong>Stable</strong>; it preserves the relative order of equal elements. This is a critical property when sorting complex manifolds with multi-key dependencies.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Swapping Logic</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Iterate through the array multiple times. In each pass, compare adjacent elements and swap if $A[j] &gt; A[j+1]$.
                    </p>
                    <CodeSnippet code={`void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "BINARY_SEARCH",
    title: "Binary Search",
    icon: <Search className="text-[#58C4DD]" />,
    description: "Interval reduction lemma.",
    component: (speed: number) => <BinarySearchVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Algorithm Steps</h4>
                    <ul className="space-y-4 text-xs text-white/60 leading-relaxed font-mono">
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">01.</span>
                            Initialize two pointers, `low = 0` and `high = n - 1`.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">02.</span>
                            Loop while `low &lt;= high`. Calculate `mid = low + (high - low) / 2` to avoid overflow.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">03.</span>
                            Compare `arr[mid]` with `target`.
                            <br/> - If equal, return `mid`.
                            <br/> - If `arr[mid] &lt; target`, ignore left half (`low = mid + 1`).
                            <br/> - If `arr[mid] &gt; target`, ignore right half (`high = mid - 1`).
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">04.</span>
                            If loop ends, target is not present. Return -1.
                        </li>
                    </ul>
                </div>
                
                <CodeSnippet code={`int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`} />
            </div>
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
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Node Structure</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Unlike an array where `A[i]` is just a value, a Node in a Linked List is a container (struct/class) holding both the data and the navigation logic (pointer).
                    </p>
                    <CodeSnippet code={`struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Traversal Logic</h4>
                    <CodeSnippet code={`void traverse(Node* head) {
    Node* temp = head;
    while (temp != nullptr) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "NULL";
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "GRAPH_BFS",
    title: "Graph Traversal",
    icon: <Network className="text-[#83C167]" />,
    description: "Breadth-first connectivity lemma.",
    component: (speed: number) => <GraphVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Connectivity Topology" icon={Network}>
            <p>Graphs map relationships between entities using <strong>Nodes (Vertices)</strong> and <strong>Edges</strong>. BFS (Breadth-First Search) explores this topology layer by layer, acting as a wave of discovery expanding from a source.</p>
            <p>It guarantees the <strong>Shortest Path</strong> in unweighted graphs by exhausting all possibilities at distance $d$ before moving to $d+1$.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <DocSection title="Queue Lemma" icon={Layers} color="#FFFF00">
              <p>BFS relies on a <strong>FIFO Queue</strong> to manage the frontier of discovery. Nodes are enqueued upon discovery and processed in arrival order, ensuring the traversal remains strictly breadth-oriented.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> BFS Logic</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Maintain a `visited` array to prevent cycles and a `queue` for layer-by-layer processing.
                    </p>
                    <CodeSnippet code={`void bfs(int start, vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    queue<int> q;
    
    visited[start] = true;
    q.push(start);
    
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "MST",
    title: "Minimum Spanning Tree",
    icon: <GitMerge className="text-[#FFFF00]" />,
    description: "Prim's greedy optimization.",
    component: (speed: number) => <MSTVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Greedy Optimization" icon={Network}>
            <p>A Minimum Spanning Tree (MST) is a subset of edges that connects all vertices in a weighted graph with the <strong>Minimum Total Weight</strong>, without forming any cycles.</p>
            <p>Prim's Algorithm builds this tree from a single starting vertex, iteratively adding the cheapest edge from the frontier of discovery.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(E log V)" space="O(V + E)" />
            <DocSection title="Cut Property" icon={Zap} color="#83C167">
              <p>For any cut (partition of vertices into two disjoint sets), if an edge has the minimum weight among all crossing edges, then this edge belongs to the MST. Prim's algorithm exploits this by always choosing the minimum cut crossing from the visited set to the unvisited set.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Prim's Logic</h4>
                    <ul className="space-y-4 text-xs text-white/60 leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">01.</span> Start with an arbitrary node. Use a Priority Queue to store connected edges.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">02.</span> Pop the minimum weight edge from PQ.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">03.</span> If the destination node is unvisited, add edge to MST and push new edges to PQ.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">04.</span> Repeat until all V vertices are in the MST.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`int primMST(int V, vector<vector<pair<int, int>>>& adj) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<int> key(V, INT_MAX);
    vector<bool> inMST(V, false);
    int sum = 0;

    pq.push({0, 0}); // weight, node
    key[0] = 0;

    while (!pq.empty()) {
        int u = pq.top().second;
        int w = pq.top().first;
        pq.pop();

        if (inMST[u]) continue;
        inMST[u] = true;
        sum += w;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;
            if (!inMST[v] && weight < key[v]) {
                key[v] = weight;
                pq.push({key[v], v});
            }
        }
    }
    return sum;
}`} />
            </div>

            <div className="mt-12 mb-8">
                 <div className="h-[1px] w-full bg-white/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#F0E442]" /> Kruskal's Logic</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono mb-4">
                        Kruskal's algorithm treats every node as a separate tree (forest) and iteratively merges them using the lightest possible edge, provided it doesn't form a cycle.
                    </p>
                    <ul className="space-y-4 text-xs text-white/60 leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#F0E442] font-bold">01.</span> Sort all edges by weight in ascending order.</li>
                        <li className="flex gap-3"><span className="text-[#F0E442] font-bold">02.</span> Iterate through sorted edges.</li>
                        <li className="flex gap-3"><span className="text-[#F0E442] font-bold">03.</span> Use a Disjoint Set Union (DSU) to check if the edge connects two disjoint components.</li>
                        <li className="flex gap-3"><span className="text-[#F0E442] font-bold">04.</span> If yes, union the sets and add edge to MST. Else, discard.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`struct DSU {
    vector<int> parent;
    DSU(int n) {
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (x == parent[x]) return x;
        return parent[x] = find(parent[x]);
    }
    void unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX != rootY) parent[rootX] = rootY;
    }
};

int kruskalMST(int V, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) {
        return a[2] < b[2];
    });
    
    DSU dsu(V);
    int sum = 0;
    
    for (auto& edge : edges) {
        if (dsu.find(edge[0]) != dsu.find(edge[1])) {
            dsu.unite(edge[0], edge[1]);
            sum += edge[2];
        }
    }
    return sum;
}`} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "DIJKSTRA",
    title: "Dijkstra's Algorithm",
    icon: <Route className="text-[#FC6255]" />,
    description: "Shortest path relaxation.",
    component: (speed: number) => <DijkstraVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Greedy Pathfinding" icon={MapPin}>
            <p>Dijkstra's Algorithm finds the <strong>Shortest Path</strong> from a source node to all other nodes in a weighted graph (with non-negative weights). It operates on the principle of <strong>Greedy Relaxation</strong>.</p>
            <p>At each step, we visit the unvisited node with the smallest known distance from the start, guaranteeing that its distance is final.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(E log V)" space="O(V + E)" />
            <DocSection title="Relaxation Lemma" icon={Activity} color="#FFFF00">
              <p>For an edge $(u, v)$ with weight $w$, if the distance to $u$ plus $w$ is less than the current distance to $v$, we <strong>relax</strong> the edge: $d[v] = d[u] + w$. This strictly decreases the potential of the system.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Algorithm Steps</h4>
                    <ul className="space-y-4 text-xs text-white/60 leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">01.</span> Initialize `dist[]` to Infinity, `dist[source] = 0`.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">02.</span> Use a Priority Queue (Min-Heap) to store `{"{distance, node}"}`.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">03.</span> Pop the node with minimum distance. If already processed, skip.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">04.</span> Iterate neighbors. If `dist[u] + w &lt; dist[v]`, update `dist[v]` and push to PQ.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`vector<int> dijkstra(int V, vector<vector<pair<int, int>>>& adj, int S) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<int> dist(V, INT_MAX);

    dist[S] = 0;
    pq.push({0, S});

    while (!pq.empty()) {
        int d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "STACK_QUEUE",
    title: "Stack & Queue",
    icon: <Layers className="text-[#FC6255]" />,
    description: "LIFO & FIFO memory buffers.",
    component: (speed: number) => <StackQueueVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Buffer Topology" icon={Database}>
            <p>Stacks and Queues are fundamental linear buffers defined by their <strong>Access Pattern</strong>. A <strong>Stack</strong> (LIFO) simulates a vertical pile where the last item added is the first accessible. A <strong>Queue</strong> (FIFO) simulates a horizontal pipe where flow is continuous.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(1) Ops" space="O(N)" />
            <DocSection title="Access Lemma" icon={ArrowDownNarrowWide} color="#58C4DD">
              <p><strong>Stack:</strong> Push/Pop operates on the <em>Top</em>. Useful for recursion, undo mechanisms, and parsing.</p>
              <p><strong>Queue:</strong> Enqueue/Dequeue operates on <em>Rear/Front</em>. Essential for scheduling, buffering, and BFS.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Stack (LIFO)</h4>
                    <CodeSnippet code={`stack<int> s;
s.push(10); // Add to top
s.push(20);
int top = s.top(); // 20
s.pop(); // Removes 20`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Queue (FIFO)</h4>
                    <CodeSnippet code={`queue<int> q;
q.push(10); // Add to rear
q.push(20);
int front = q.front(); // 10
q.pop(); // Removes 10`} />
                </div>
            </div>
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
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Partition Logic</h4>
                    <ul className="space-y-4 text-xs text-white/60 leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">01.</span> Select the last element as `pivot`.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">02.</span> Use pointer `i` to track the boundary of smaller elements.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">03.</span> Iterate `j` from `low` to `high - 1`. If `arr[j] &lt; pivot`, swap `arr[i]` and `arr[j]`, then increment `i`.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">04.</span> Finally, swap `pivot` with `arr[i]` to place it correctly.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`} />
            </div>
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
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Merge Logic</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        The `merge` function uses a temporary array to interleave elements from two sorted halves (`left` and `right`) into a single sorted sequence.
                    </p>
                    <CodeSnippet code={`void merge(vector<int>& arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    vector<int> L(n1), R(n2);
    for(int i=0; i<n1; i++) L[i] = arr[l + i];
    for(int j=0; j<n2; j++) R[j] = arr[m + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Recursive Driver</h4>
                    <CodeSnippet code={`void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}`} />
                </div>
            </div>
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
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Search Logic</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Navigate the tree by comparing `val` with `root-&gt;val`. Go left if smaller, right if larger.
                    </p>
                    <CodeSnippet code={`TreeNode* search(TreeNode* root, int val) {
    if (root == nullptr || root->val == val) return root;
    
    if (val < root->val) 
        return search(root->left, val);
        
    return search(root->right, val);
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Insert Logic</h4>
                    <CodeSnippet code={`TreeNode* insert(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    
    if (val < root->val)
        root->left = insert(root->left, val);
    else if (val > root->val)
        root->right = insert(root->right, val);
        
    return root;
}`} />
                </div>
            </div>
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
      <div className="space-y-12">
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

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Trie Node</h4>
                    <CodeSnippet code={`struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;
    
    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++) 
            children[i] = nullptr;
    }
};`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Insertion</h4>
                    <CodeSnippet code={`void insert(string word) {
    TrieNode* curr = root;
    for (char c : word) {
        int idx = c - 'a';
        if (!curr->children[idx])
            curr->children[idx] = new TrieNode();
        curr = curr->children[idx];
    }
    curr->isEndOfWord = true;
}`} />
                </div>
            </div>
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
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Priority Ordering" icon={Target} color="#FFFF00">
            <p>A Min-Heap is a specialized complete tree that maintains the <strong>Heap Property</strong>: the value of each node is less than or equal to the values of its children. This ensures that the global minimum is always at the root manifold.</p>
            <p>It is the primary engine for <strong>Priority Queues</strong> and greedy algorithmic choices.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N) Insert" space="O(N)" />
            <DocSection title="Bubble Logic" icon={ArrowDownNarrowWide} color="#58C4DD">
              <p>When the property is violated, elements &quot;Bubble Up&quot; or &quot;Sink Down&quot; through recursive swaps until the hierarchy is restored. This maintenance occurs in $O(\log N)$ time.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Heapify Up (Insert)</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        After inserting at the end, swap with parent if the heap property is violated. Repeat until root.
                    </p>
                    <CodeSnippet code={`void heapifyUp(int i) {
    while (i > 0) {
        int p = (i - 1) / 2;
        if (heap[i] < heap[p]) {
            swap(heap[i], heap[p]);
            i = p;
        } else break;
    }
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Heapify Down (Extract)</h4>
                    <CodeSnippet code={`void heapifyDown(int i) {
    int smallest = i;
    int l = 2*i + 1, r = 2*i + 2;
    
    if (l < n && heap[l] < heap[smallest]) smallest = l;
    if (r < n && heap[r] < heap[smallest]) smallest = r;
    
    if (smallest != i) {
        swap(heap[i], heap[smallest]);
        heapifyDown(smallest);
    }
}`} />
                </div>
            </div>
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
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Interval Decomposition" icon={Layers}>
            <p>Segment Trees provide a way to perform <strong>Range Queries</strong> and <strong>Point Updates</strong> on a manifold in logarithmic time. Each node in the tree represents a specific sub-interval $[L, R]$ of the base array.</p>
            <p>The root represents the total interval, and leaves represent atomic indices.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N) Query" space="O(4N)" />
            <DocSection title="Contribution Lemma" icon={Zap} color="#83C167">
              <p>During a query, if a node&apos;s interval is fully contained within the query range, it returns its pre-computed value immediately. Otherwise, it delegates to its children, combining their partial results.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Build (Recursive)</h4>
                    <CodeSnippet code={`void build(int node, int start, int end) {
    if (start == end) {
        tree[node] = arr[start];
    } else {
        int mid = (start + end) / 2;
        build(2*node, start, mid);
        build(2*node+1, mid+1, end);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Range Query</h4>
                    <CodeSnippet code={`int query(int node, int start, int end, int l, int r) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return tree[node];
    
    int mid = (start + end) / 2;
    return query(2*node, start, mid, l, r) + 
           query(2*node+1, mid+1, end, l, r);
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KMP",
    title: "KMP Algorithm",
    icon: <FileSearch className="text-[#83C167]" />,
    description: "Linear string pattern matching.",
    component: (speed: number) => <KMPVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Pattern Autocorrelation" icon={Microscope}>
            <p>The Knuth-Morris-Pratt (KMP) algorithm optimizes pattern matching by exploiting the <strong>Self-Similarity</strong> of the pattern. When a mismatch occurs, we don't need to backtrack the text pointer; we only shift the pattern pointer.</p>
            <p>This is achieved via the <strong>Prefix Function</strong> ($\pi$), which maps the length of the longest proper prefix that is also a suffix.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N + M)" space="O(M)" />
            <DocSection title="No Backtracking" icon={FastForward} color="#FFFF00">
              <p>Unlike naive matching which backtracks to $i+1$, KMP slides the pattern by $\pi[q]$ characters, guaranteeing linear time complexity $O(N)$.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> LPS Array</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Compute the Longest Prefix Suffix (LPS) array to determine jump distances.
                    </p>
                    <CodeSnippet code={`vector<int> computeLPS(string P) {
    int m = P.length();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (P[i] == P[len]) lps[i++] = ++len;
        else if (len != 0) len = lps[len-1];
        else lps[i++] = 0;
    }
    return lps;
}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Matching Logic</h4>
                    <CodeSnippet code={`void KMPSearch(string pat, string txt) {
    int M = pat.length();
    int N = txt.length();
    vector<int> lps = computeLPS(pat);
    int i = 0, j = 0;
    while (i < N) {
        if (pat[j] == txt[i]) { j++; i++; }
        if (j == M) {
            cout << "Found at " << i - j;
            j = lps[j - 1];
        } else if (i < N && pat[j] != txt[i]) {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "DSU",
    title: "Disjoint Set Union",
    icon: <Link className="text-[#58C4DD]" />,
    description: "Connectivity & equivalence classes.",
    component: (speed: number) => <DSUVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Union-Find Structure" icon={Network}>
            <p>DSU is a data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets. It provides near-constant time operations to add new sets, merge existing sets, and determine whether elements are in the same set.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(α(N))" space="O(N)" />
            <DocSection title="Path Compression" icon={Zap} color="#FFFF00">
              <p>By making every node on the path point directly to the root during a `find` operation, we flatten the tree structure, ensuring subsequent operations are extremely fast.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Find with Compression</h4>
                    <CodeSnippet code={`int find(int i) {
    if (parent[i] == i)
        return i;
    return parent[i] = find(parent[i]);
}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Union by Rank</h4>
                    <CodeSnippet code={`void unite(int i, int j) {
    int root_i = find(i);
    int root_j = find(j);
    if (root_i != root_j) {
        if (rank[root_i] < rank[root_j])
            swap(root_i, root_j);
        parent[root_j] = root_i;
        if (rank[root_i] == rank[root_j])
            rank[root_i]++;
    }
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "FIBONACCI",
    title: "Fibonacci (DP)",
    icon: <InfinityIcon className="text-[#FC6255]" />,
    description: "Memoized recursive expansion.",
    component: (speed: number) => <FibonacciVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Dynamic Programming" icon={Layers}>
            <p>The Fibonacci sequence ($F_n = F_{"{n-1}"} + F_{"{n-2}"}$) is the canonical example of <strong>Overlapping Subproblems</strong>. A naive recursive approach recomputes the same states exponentially $O(2^n)$.</p>
            <p><strong>Memoization</strong> caches these results, collapsing the recursion tree into a linear chain $O(n)$.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(N)" />
            <DocSection title="State Transition" icon={GitBranch} color="#58C4DD">
              <p>We define the state simply as index $i$. The transition is deterministic: $dp[i] = dp[i-1] + dp[i-2]$.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Recursive Memoization</h4>
                    <CodeSnippet code={`int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KNAPSACK",
    title: "0/1 Knapsack",
    icon: <ShoppingBag className="text-[#FFFF00]" />,
    description: "Constrained combinatorial optimization.",
    component: (speed: number) => <KnapsackVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        {/* New Structured Explanation Section */}
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="#83C167">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[#83C167] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            The algorithm utilizes <strong>Optimal Substructure</strong>. It solves the problem by breaking it into smaller sub-capacities and sub-sets of items, building a global solution from local optima.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-white/40 list-none">
                            <li className="flex gap-2"><span className="text-[#83C167]">01.</span> Sort items by index</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">02.</span> Binary decision: Take vs Leave</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">03.</span> Memorize sub-problem results</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            Algorithm Output
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            The output is a <strong>Value Optimization Matrix</strong>. The bottom-right cell contains the maximum possible value that can be squeezed into the knapsack under the weight constraint.
                        </p>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-[10px] text-[#58C4DD] text-center">
                            Table[N][W] = Max Value
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#FFFF00] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" />
                            Your Expectations
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            Watch the "Dependency Arrows". When calculating a cell, the visualizer will highlight two previous states: the cell directly above (Exclude) and the cell shifted left by the item's weight (Include).
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Combinatorial Optimization" icon={Database}>
            <p>The 0/1 Knapsack problem asks to maximize the total value of items in a knapsack of capacity $W$. Each item can either be taken (1) or left (0).</p>
            <p>This is a classic <strong>NP-Hard</strong> problem that is solved in pseudo-polynomial time using Dynamic Programming.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N * W)" space="O(N * W)" />
            <DocSection title="Decision Boundary" icon={Binary} color="#FFFF00">
              <p>At each item $i$ and capacity $w$, we have a binary choice: </p>
              <ul className="text-xs space-y-2 text-white/60 font-mono">
                  <li><strong className="text-[#FC6255]">Exclude:</strong> Inherit value from $dp[i-1][w]$</li>
                  <li><strong className="text-[#83C167]">Include:</strong> Add $val[i]$ to $dp[i-1][w-wt[i]]$</li>
              </ul>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Tutorial & Recurrence</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> The Recurrence Relation</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono bg-white/5 p-4 rounded-xl border border-white/10">
                        if wt[i] &lt;= w:
                        <br/>&nbsp;&nbsp;dp[i][w] = max(val[i] + dp[i-1][w-wt[i]], dp[i-1][w])
                        <br/>else:
                        <br/>&nbsp;&nbsp;dp[i][w] = dp[i-1][w]
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed">
                        The state $dp[i][w]$ represents the maximum value attainable using a subset of the first $i$ items with a total weight not exceeding $w$.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> 3. Implementation (C++)</h4>
                    <CodeSnippet code={`int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (wt[i - 1] <= w)
                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], 
                               dp[i - 1][w]);
            else
                dp[i][w] = dp[i - 1][w];
        }
    }
    return dp[n][W];
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "FLOYD_WARSHALL",
    title: "Floyd-Warshall",
    icon: <Route className="text-[#83C167]" />,
    description: "All-pairs shortest path topology.",
    component: (speed: number) => <FloydWarshallVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        {/* New Structured Explanation Section */}
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="#83C167">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[#83C167] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            The algorithm operates on a <strong>State-Space Transformation</strong>. It starts with direct edge weights and iteratively relaxes the entire manifold by considering every node as a mandatory "waypoint" (Intermediate Node $k$).
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-white/40 list-none">
                            <li className="flex gap-2"><span className="text-[#83C167]">01.</span> Map direct connections</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">02.</span> Expand via node $k=0 \dots N$</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">03.</span> Update global invariants</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            Algorithm Output
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            The final product is an <strong>All-Pairs Distance Tensor</strong>. Every cell $(i, j)$ in the matrix will contain the absolute minimum cost to travel between those two coordinates, regardless of how many intermediate jumps are required.
                        </p>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-[10px] text-[#58C4DD] text-center">
                            Matrix[i][j] = Shortest(i → j)
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#FFFF00] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" />
                            Your Expectations
                        </h5>
                        <p className="text-xs leading-relaxed text-white/50">
                            As you execute the visualizer, expect to see the "Relational Wave". When a cell flashes <strong>Green</strong>, it means a "shortcut" has been discovered through the current intermediate node $k$. The graph edges will thicken to represent the newly optimized path.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Dynamic Programming Insight" icon={MapPin}>
            <p>Floyd-Warshall is a powerful <strong>Dynamic Programming</strong> algorithm that solves the All-Pairs Shortest Path problem. The core intuition is to build up shortest paths by considering an increasing set of <strong>Intermediate Nodes</strong>.</p>
            <p>Let $dp[k][i][j]$ be the shortest path from $i$ to $j$ using only nodes from the set {"{0, 1, \dots, k}"} as internal points. We transition from $k-1$ to $k$ by deciding whether to pass through node $k$.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V³)" space="O(V²)" />
            <DocSection title="The Relaxation Lemma" icon={Activity} color="#58C4DD">
              <p>For every pair $(i, j)$, we check if a path going through node $k$ is shorter than the best path found so far:</p>
              <p className="font-mono text-[#FFFF00] bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                $D[i][j] = \min(D[i][j], D[i][k] + D[k][j])$
              </p>
              <p className="mt-4">This <strong>Triangle Inequality</strong> check ensures that the manifold converges to the global minimum distance for all pairs.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Tutorial & Implementation</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> 1. Initialization</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        Create a matrix `dist` where `dist[i][j]` is the weight of the edge from $i$ to $j$. Set `dist[i][i] = 0` and `dist[i][j] = INF` if no direct edge exists.
                    </p>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-8"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> 2. The K-Loop (Crucial)</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono">
                        The outermost loop (indexed by $k$) represents the <strong>Intermediate Node</strong>. We are asking: "Can node $k$ improve the path between any $i$ and $j$?" 
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed font-mono mt-2 italic">
                        Note: You must iterate $k$ first. Iterating $i$ or $j$ first will result in an incorrect local optimum.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> 3. Standard C++ Implementation</h4>
                    <CodeSnippet code={`void floydWarshall(int V, vector<vector<int>>& graph) {
    vector<vector<int>> dist = graph;

    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                // If i->k and k->j paths exist
                if (dist[i][k] != INF && dist[k][j] != INF) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
        }
    }
    // Result: dist[i][j] contains shortest path i to j
}`} />
                </div>
            </div>

            <div className="mt-12 p-8 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="text-[#FFFF00]" size={20} /> Handling Negative Cycles</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                    Floyd-Warshall can detect <strong>Negative Weight Cycles</strong>. If after the algorithm finishes, any diagonal element `dist[i][i]` is less than 0, then a negative cycle exists that passes through node $i$. This is a unique advantage over Dijkstra's algorithm.
                </p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "SLIDING_WINDOW",
    title: "Sliding Window",
    icon: <MoveHorizontal className="text-[#58C4DD]" />,
    description: "Linear state maintenance.",
    component: (speed: number) => <SlidingWindowVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="State Maintenance" icon={Layout}>
            <p>The Sliding Window technique converts nested loop operations into a single linear scan. As the window glides over the data manifold, we update the state incrementally (add new element, remove old) rather than re-computing from scratch.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(1)" />
            <DocSection title="Monotonicity" icon={ArrowDownNarrowWide} color="#FFFF00">
              <p>For dynamic windows, the window expands by moving the right pointer and contracts by moving the left pointer to satisfy constraints, maintaining a valid state at all times.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Dynamic Window</h4>
                    <CodeSnippet code={`int maxSubArrayLen(int target, vector<int>& nums) {
    int left = 0, curr = 0, ans = 0;
    for (int right = 0; right < nums.size(); right++) {
        curr += nums[right];
        while (curr >= target) {
            ans = min(ans, right - left + 1);
            curr -= nums[left++];
        }
    }
    return ans;
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TOPO_SORT",
    title: "Topological Sort",
    icon: <ListOrdered className="text-[#FC6255]" />,
    description: "DAG dependency resolution.",
    component: (speed: number) => <TopoSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Dependency Resolution" icon={ListTree}>
            <p>Topological sorting is a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge $u \to v$, vertex $u$ comes before $v$ in the ordering.</p>
            <p>It is the standard algorithm for scheduling tasks, resolving build dependencies, and logic synthesis.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <DocSection title="Indegree Lemma" icon={ArrowDownNarrowWide} color="#FFFF00">
              <p>In Kahn's Algorithm, nodes with 0 indegree have no dependencies and can be processed immediately. Removing them potentially frees up their neighbors.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Kahn's Algorithm (BFS)</h4>
                    <CodeSnippet code={`vector<int> kahn(int V, vector<vector<int>>& adj) {
    vector<int> indegree(V, 0);
    for (int u = 0; u < V; u++)
        for (int v : adj[u]) indegree[v]++;
        
    queue<int> q;
    for (int i = 0; i < V; i++)
        if (indegree[i] == 0) q.push(i);
        
    vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push(u);
        for (int v : adj[u])
            if (--indegree[v] == 0) q.push(v);
    }
    return result;
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "N_QUEENS",
    title: "N-Queens",
    icon: <Crown className="text-[#FFFF00]" />,
    description: "Backtracking state space.",
    component: (speed: number) => <NQueensVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Constraint Satisfaction" icon={Crown}>
            <p>The N-Queens problem is to place N queens on an N×N chessboard such that no two queens attack each other. This is a classic example of **Backtracking**, where we explore the state space tree depth-first.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N!)" space="O(N)" />
            <DocSection title="Pruning" icon={X} color="#FC6255">
              <p>We prune branches of the search tree immediately upon detecting a violation (a queen attacking another), significantly reducing the search space compared to brute force.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3"><Code size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Backtracking Logic</h4>
                    <CodeSnippet code={`void solve(int col, vector<string>& board, vector<vector<string>>& ans, int n) {
    if (col == n) {
        ans.push_back(board);
        return;
    }
    for (int row = 0; row < n; row++) {
        if (isSafe(row, col, board, n)) {
            board[row][col] = 'Q';
            solve(col + 1, board, ans, n);
            board[row][col] = '.'; // Backtrack
        }
    }
}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
];

export default function DSAPage() {
  const [selectedCategory, setSelectedCategory] = useState(dsaCategories[0]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white relative">
      {/* 3B1B Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#58C4DD]/20 rounded-xl text-[#58C4DD]"><GraduationCap size={20} /></div>
                <h1 className="text-xl font-light tracking-tight text-white">DSA <span className="text-[#58C4DD] font-medium">Visualizer</span></h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all">
                <Menu size={24} />
            </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
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

        {/* Mobile Sidebar / Drawer */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: "100%" }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: "100%" }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col p-6 lg:hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-black tracking-[0.3em] text-white/40 uppercase">Select Manifold</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full text-white/60 hover:bg-white/20">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 space-y-3 pb-8">
                        {dsaCategories.map((cat) => (
                        <button key={cat.id} onClick={() => { setSelectedCategory(cat); setIsMobileMenuOpen(false); }} className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedCategory.id === cat.id ? "bg-white/10 border-[#58C4DD]/50" : "bg-transparent border-white/5"}`}>
                            <div className={`p-2.5 rounded-xl ${selectedCategory.id === cat.id ? "bg-[#58C4DD]/20" : "bg-white/5"}`}>{cat.icon}</div>
                            <div><h4 className="font-bold text-sm text-white tracking-wide">{cat.title}</h4></div>
                        </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-3 space-y-4 max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide sticky top-24">
            <h3 className="text-[10px] font-black text-white/20 px-4 uppercase tracking-[0.25em] mb-4">Coordinate Systems</h3>
            {dsaCategories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat)} className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${selectedCategory.id === cat.id ? "bg-white/10 border-[#58C4DD]/50 shadow-[0_0_20px_rgba(88,196,221,0.1)] translate-x-2" : "bg-transparent border-white/5 hover:border-white/20"}`}>
                <div className={`p-2.5 rounded-xl transition-colors ${selectedCategory.id === cat.id ? "bg-[#58C4DD]/20" : "bg-white/5 group-hover:bg-white/10"}`}>{cat.icon}</div>
                <div><h4 className="font-bold text-xs text-white tracking-wide">{cat.title}</h4><p className="text-[9px] text-white/30 font-mono mt-0.5 uppercase tracking-tighter">{cat.description}</p></div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 w-full">
            <AnimatePresence mode="wait">
              <motion.div key={selectedCategory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                
                {/* Mobile Specific Controls */}
                <div className="lg:hidden mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Speed</span>
                    <input type="range" min="100" max="2000" step="100" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} className="w-32 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFFF00]" />
                </div>

                {/* The Visualizer */}
                <div className="mb-12 w-full overflow-hidden">{selectedCategory.component(animationSpeed)}</div>

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
