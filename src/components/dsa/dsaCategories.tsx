import React from "react";
import {
  ArrowDownNarrowWide, Activity, Check, Search, Target, Microscope,
  GitBranch, Share2, Cpu, Network, Layers, GitMerge, RotateCcw, Zap,
  Database, Sliders, GitPullRequest, FastForward, Link, Infinity as InfinityIcon,
  ShoppingBag, Route, MoveHorizontal, ListOrdered, ListTree, Crown, X,
  FileSearch, BoxSelect, Binary, Sparkles, Layout, Terminal, TrendingUp
} from "lucide-react";

import SortingVisualizer from "@/features/visualizer/components/DSA/SortingVisualizer";
import MergeSortVisualizer from "@/features/visualizer/components/DSA/MergeSortVisualizer";
import QuickSortVisualizer from "@/features/visualizer/components/DSA/QuickSortVisualizer";
import BinarySearchVisualizer from "@/features/visualizer/components/DSA/BinarySearchVisualizer";
import LinkedListVisualizer from "@/features/visualizer/components/DSA/LinkedListVisualizer";
import BSTVisualizer from "@/features/visualizer/components/DSA/BSTVisualizer";
import TreeTraversalVisualizer from "@/features/visualizer/components/DSA/TreeTraversalVisualizer";
import TrieVisualizer from "@/features/visualizer/components/DSA/TrieVisualizer";
import KMPVisualizer from "@/features/visualizer/components/DSA/KMPVisualizer";
import SegmentTreeVisualizer from "@/features/visualizer/components/DSA/SegmentTreeVisualizer";
import DSUVisualizer from "@/features/visualizer/components/DSA/DSUVisualizer";
import HeapVisualizer from "@/features/visualizer/components/DSA/HeapVisualizer";
import NQueensVisualizer from "@/features/visualizer/components/DSA/NQueensVisualizer";
import StackQueueVisualizer from "@/features/visualizer/components/DSA/StackQueueVisualizer";
import GraphVisualizer from "@/features/visualizer/components/DSA/GraphVisualizer";
import TopoSortVisualizer from "@/features/visualizer/components/DSA/TopoSortVisualizer";
import DijkstraVisualizer from "@/features/visualizer/components/DSA/DijkstraVisualizer";
import MSTVisualizer from "@/features/visualizer/components/DSA/MSTVisualizer";
import FloydWarshallVisualizer from "@/features/visualizer/components/DSA/FloydWarshallVisualizer";
import FibonacciVisualizer from "@/features/visualizer/components/DSA/FibonacciVisualizer";
import KnapsackVisualizer from "@/features/visualizer/components/DSA/KnapsackVisualizer";
import SlidingWindowVisualizer from "@/features/visualizer/components/DSA/SlidingWindowVisualizer";
import KadaneVisualizer from "@/features/visualizer/components/DSA/KadaneVisualizer";

import { DocSection, ComplexityCard, CodeSnippet } from "./DocComponents";

export const dsaCategories = [
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Swapping Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Iterate through the array multiple times. In each pass, compare adjacent elements and swap if $A[j] &gt; A[j+1]$.
                    </p>
                    <CodeSnippet code={`void bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j + 1]);\n            }\n        }\n    }\n}`} />
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
            <DocSection title="The Median Lemma" icon={Target} color="#f59e0b">
              <p>At every step, we calculate the median index m. By comparing V[m] to the target T, we define a logical boundary. If V[m] {"<"} T, the entire left sub-manifold is discarded as non-viable.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Algorithm Steps</h4>
                    <ul className="space-y-4 text-xs text-muted-foreground leading-relaxed font-mono">
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">01.</span>
                            Initialize two pointers, `low = 0` and `high = n - 1`.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">02.</span>
                            Loop while `low {"<="} high`. Calculate `mid = low + (high - low) / 2` to avoid overflow.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">03.</span>
                            Compare `arr[mid]` with `target`.
                            <br/> - If equal, return `mid`.
                            <br/> - If `arr[mid] {"<"} target`, ignore left half (`low = mid + 1`).
                            <br/> - If `arr[mid] &gt; target`, ignore right half (`high = mid - 1`).
                        </li>
                        <li className="flex gap-3">
                            <span className="text-[#83C167] font-bold">04.</span>
                            If loop ends, target is not present. Return -1.
                        </li>
                    </ul>
                </div>
                
                <CodeSnippet code={`int binarySearch(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        \n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`} />
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Node Structure</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Unlike an array where `A[i]` is just a value, a Node in a Linked List is a container (struct/class) holding both the data and the navigation logic (pointer).
                    </p>
                    <CodeSnippet code={`struct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}
};`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Traversal Logic</h4>
                    <CodeSnippet code={`void traverse(Node* head) {\n    Node* temp = head;\n    while (temp != nullptr) {\n        cout << temp->data << " -> ";\n        temp = temp->next;\n    }\n    cout << "NULL";
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
          <DocSection title="Traversal Topology" icon={Network}>
            <p>Graph traversal algorithms explore nodes and edges to determine connectivity or search for specific properties.</p>
            <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[#58C4DD]">BFS (Breadth-First):</strong> Explores neighbor-by-neighbor, like a wave expanding from a source. Ideal for shortest paths in unweighted graphs.</li>
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[#FC6255]">DFS (Depth-First):</strong> Plunges as deep as possible down each branch before backtracking. Useful for cycle detection, topological sorting, and maze solving.</li>
            </ul>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <div className="grid grid-cols-2 gap-4">
                <DocSection title="Queue Lemma" icon={Layers} color="#58C4DD">
                <p>BFS uses a <strong>FIFO Queue</strong> to ensure strictly layered exploration.</p>
                </DocSection>
                <DocSection title="Recursion Stack" icon={GitBranch} color="#FC6255">
                <p>DFS relies on a <strong>LIFO Stack</strong> (or recursion) to backtrack efficiently.</p>
                </DocSection>
            </div>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> BFS Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Maintain a `visited` array to prevent cycles and a `queue` for layer-by-layer processing.
                    </p>
                    <CodeSnippet code={`void bfs(int start, vector<vector<int>>& adj, int V) {\n    vector<bool> visited(V, false);\n    queue<int> q;\n    \n    visited[start] = true;\n    q.push(start);\n    \n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        cout << u << " ";\n        \n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                q.push(v);\n            }\n        }\n    }
}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> DFS Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Use recursion to dive deep. Mark node as visited upon entry and explore all unvisited neighbors.
                    </p>
                    <CodeSnippet code={`void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {\n    visited[u] = true;\n    cout << u << " ";\n    \n    for (int v : adj[u]) {\n        if (!visited[v]) {\n            dfs(v, adj, visited);\n        }\n    }\n}\n\n// Caller\nvector<bool> visited(V, false);\ndfs(start_node, adj, visited);`} />
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
            <p>A Minimum Spanning Tree (MST) connects all vertices with the minimum possible total edge weight, without cycles.</p>
            <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[#83C167]">Prim's Algorithm:</strong> Grows a single tree from a starting node, always adding the cheapest connection to the unvisited frontier. Ideal for dense graphs.</li>
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[#f59e0b]">Kruskal's Algorithm:</strong> Sorts all edges by weight and iteratively adds them if they don't form a cycle (using Disjoint Set Union). Better for sparse graphs.</li>
            </ul>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(E log V)" space="O(V + E)" />
            <div className="grid grid-cols-2 gap-4">
                <DocSection title="Cut Property (Prim)" icon={Zap} color="#83C167">
                <p>Always chooses the minimum weight edge crossing from visited to unvisited sets.</p>
                </DocSection>
                <DocSection title="Cycle Property (Kruskal)" icon={RotateCcw} color="#f59e0b">
                <p>Adds edges in ascending order of weight, skipping any that connect nodes already in the same component.</p>
                </DocSection>
            </div>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Prim's Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Use a Priority Queue to pick the smallest edge connected to the MST.
                    </p>
                    <CodeSnippet code={`int primMST(int V, vector<vector<pair<int, int>>>& adj) {\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    vector<bool> inMST(V, false);\n    int sum = 0;\n\n    pq.push({0, 0}); // {weight, node}
\n    while (!pq.empty()) {\n        int u = pq.top().second;\n        int w = pq.top().first;\n        pq.pop();\n\n        if (inMST[u]) continue;\n        inMST[u] = true;\n        sum += w;\n\n        for (auto& edge : adj[u]) {\n            int v = edge.first;\n            int weight = edge.second;\n            if (!inMST[v]) {\n                pq.push({weight, v});\n            }\n        }\n    }\n    return sum;
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Kruskal's Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Sort all edges, then use DSU (Disjoint Set Union) to merge components.
                    </p>
                    <CodeSnippet code={`struct Edge { int u, v, weight; };\nbool compareEdges(Edge a, Edge b) { return a.weight < b.weight; }\n\nint kruskalMST(int V, vector<Edge>& edges) {\n    sort(edges.begin(), edges.end(), compareEdges);\n    DSU dsu(V);\n    int sum = 0;\n    \n    for (Edge e : edges) {\n        if (dsu.find(e.u) != dsu.find(e.v)) {\n            dsu.unite(e.u, e.v);\n            sum += e.weight;\n        }\n    }\n    return sum;
}`} />
                </div>
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
          <DocSection title="Greedy Pathfinding" icon={Target}>
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Algorithm Steps</h4>
                    <ul className="space-y-4 text-xs text-muted-foreground leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">01.</span> Initialize `dist[]` to Infinity, `dist[source] = 0`.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">02.</span> Use a Priority Queue (Min-Heap) to store `{" {distance, node}"}`.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">03.</span> Pop the node with minimum distance. If already processed, skip.</li>
                        <li className="flex gap-3"><span className="text-[#83C167] font-bold">04.</span> Iterate neighbors. If `dist[u] + w {"<"} dist[v]`, update `dist[v]` and push to PQ.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`vector<int> dijkstra(int V, vector<vector<pair<int, int>>>& adj, int S) {\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    vector<int> dist(V, INT_MAX);\n\n    dist[S] = 0;\n    pq.push({0, S});\n\n    while (!pq.empty()) {\n        int d = pq.top().first;\n        int u = pq.top().second;\n        pq.pop();\n\n        if (d > dist[u]) continue;\n\n        for (auto& edge : adj[u]) {\n            int v = edge.first;\n            int weight = edge.second;\n\n            if (dist[u] + weight < dist[v]) {\n                dist[v] = dist[u] + weight;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Stack (LIFO)</h4>
                    <CodeSnippet code={`stack<int> s;
s.push(10); // Add to top
s.push(20);
int top = s.top(); // 20
s.pop(); // Removes 20`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Queue (FIFO)</h4>
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
            <p>Quick Sort is a <strong>Divide and Conquer</strong> algorithm driven by the <strong>Pivot Standard</strong>. It selects a 'pivot' element and partitions the array so that all smaller elements move to its left and larger ones to its right.</p>
            <p>We visualize the <strong>Lomuto Partition Scheme</strong>, which is simpler to implement but may perform more swaps than Hoare's scheme. It iterates a single pointer to expand the 'smaller elements' region.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N log N)" space="O(log N)" />
            <DocSection title="Recursive Depth" icon={GitPullRequest} color="#58C4DD">
              <p>Efficiency hinges on the pivot. A balanced pivot splits the array evenly (logarithmic depth). A poor pivot (e.g., smallest/largest element) degrades performance to O(N²).</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Lomuto Partition Logic</h4>
                    <ul className="space-y-4 text-xs text-muted-foreground leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">01.</span> <strong className="text-foreground">Pivot Selection:</strong> Choose the last element (or random) as the pivot.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">02.</span> <strong className="text-foreground">Boundary Tracking:</strong> Maintain index `i` (initially `low - 1`) to mark the end of the "smaller than pivot" region.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">03.</span> <strong className="text-foreground">Scanning:</strong> Iterate `j` from `low` to `high - 1`. If `arr[j] {"<"} pivot`, increment `i` and swap `arr[i]` with `arr[j]`.</li>
                        <li className="flex gap-3"><span className="text-[#FC6255] font-bold">04.</span> <strong className="text-foreground">Placement:</strong> Finally, swap the pivot (`arr[high]`) with `arr[i + 1]` to place it in its correct sorted position.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={`int partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high]; // Lomuto Pivot\n    int i = (low - 1);     // Index of smaller element\n    \n    for (int j = low; j <= high - 1; j++) {\n        // If current element is smaller than the pivot\n        if (arr[j] < pivot) {\n            i++; \n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return (i + 1); // Return partition index\n}\n\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        \n        // Recursively sort elements before and after partition\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Merge Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        The `merge` function uses a temporary array to interleave elements from two sorted halves (`left` and `right`) into a single sorted sequence.
                    </p>
                    <CodeSnippet code={`void merge(vector<int>& arr, int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    vector<int> L(n1), R(n2);\n    for(int i=0; i<n1; i++) L[i] = arr[l + i];\n    for(int j=0; j<n2; j++) R[j] = arr[m + 1 + j];\n\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) arr[k++] = L[i++];\n        else arr[k++] = R[j++];\n    }\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Recursive Driver</h4>
                    <CodeSnippet code={`void mergeSort(vector<int>& arr, int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);
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
            <DocSection title="Geometric Balance" icon={Check} color="#FFFF00">
              <p>The effectiveness of a BST is directly proportional to its <strong>Structural Balance</strong>. A skewed tree degenerates into a linear manifold ($O(N)$), while a balanced tree maintains optimal $O(\\$log N)$ performance.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Search Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Navigate the tree by comparing `val` with `root-&gt;val`. Go left if smaller, right if larger.
                    </p>
                    <CodeSnippet code={`TreeNode* search(TreeNode* root, int val) {\n    if (root == nullptr || root->val == val) return root;\n    \n    if (val < root->val) 
        return search(root->left, val);
        
    return search(root->right, val);
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Insert Logic</h4>
                    <CodeSnippet code={`TreeNode* insert(TreeNode* root, int val) {\n    if (!root) return new TreeNode(val);\n    \n    if (val < root->val)
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Trie Node</h4>
                    <CodeSnippet code={`struct TrieNode {\n    TrieNode* children[26];\n    bool isEndOfWord;\n    \n    TrieNode() {\n        isEndOfWord = false;\n        for (int i = 0; i < 26; i++) 
            children[i] = nullptr;
    }
};`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Insertion</h4>
                    <CodeSnippet code={`void insert(string word) {\n    TrieNode* curr = root;\n    for (char c : word) {\n        int idx = c - 'a';\n        if (!curr->children[idx])
            curr->children[idx] = new TrieNode();\n        curr = curr->children[idx];\n    }\n    curr->isEndOfWord = true;
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
              <p>When the property is violated, elements &quot;Bubble Up&quot; or &quot;Sink Down&quot; through recursive swaps until the hierarchy is restored. This maintenance occurs in $O(\\$log N)$ time.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> Heapify Up (Insert)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        After inserting at the end, swap with parent if the heap property is violated. Repeat until root.
                    </p>
                    <CodeSnippet code={`void heapifyUp(int i) {\n    while (i > 0) {\n        int p = (i - 1) / 2;\n        if (heap[i] < heap[p]) {\n            swap(heap[i], heap[p]);\n            i = p;\n        } else break;
    }
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Heapify Down (Extract)</h4>
                    <CodeSnippet code={`void heapifyDown(int i) {\n    int smallest = i;\n    int l = 2*i + 1, r = 2*i + 2;\n    \n    if (l < n && heap[l] < heap[smallest]) smallest = l;\n    if (r < n && heap[r] < heap[smallest]) smallest = r;\n    \n    if (smallest != i) {\n        swap(heap[i], heap[smallest]);\n        heapifyDown(smallest);
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Build (Recursive)</h4>
                    <CodeSnippet code={`void build(int node, int start, int end) {\n    if (start == end) {\n        tree[node] = arr[start];\n    } else {\n        int mid = (start + end) / 2;\n        build(2*node, start, mid);\n        build(2*node+1, mid+1, end);\n        tree[node] = tree[2*node] + tree[2*node+1];\n    }
}`} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Range Query</h4>
                    <CodeSnippet code={`int query(int node, int start, int end, int l, int r) {\n    if (r < start || end < l) return 0;\n    if (l <= start && end <= r) return tree[node];\n    \n    int mid = (start + end) / 2;\n    return query(2*node, start, mid, l, r) + 
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
            <p>This is achieved via the <strong>Prefix Function</strong> ($\\$pi$), which maps the length of the longest proper prefix that is also a suffix.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N + M)" space="O(M)" />
            <DocSection title="No Backtracking" icon={FastForward} color="#FFFF00">
              <p>Unlike naive matching which backtracks to $i+1$, KMP slides the pattern by $\\$pi$[q] characters, guaranteeing linear time complexity $O(N)$.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> LPS Array</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Compute the Longest Prefix Suffix (LPS) array to determine jump distances.
                    </p>
                    <CodeSnippet code={`vector<int> computeLPS(string P) {\n    int m = P.length();\n    vector<int> lps(m, 0);\n    int len = 0, i = 1;\n    while (i < m) {\n        if (P[i] == P[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len-1];\n        else lps[i++] = 0;\n    }\n    return lps;
}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Matching Logic</h4>
                    <CodeSnippet code={`void KMPSearch(string pat, string txt) {\n    int M = pat.length();\n    int N = txt.length();\n    vector<int> lps = computeLPS(pat);\n    int i = 0, j = 0;\n    while (i < N) {\n        if (pat[j] == txt[i]) { j++; i++; }\n        if (j == M) {\n            cout << "Found at " << i - j;
            j = lps[j - 1];\n        } else if (i < N && pat[j] != txt[i]) {\n            if (j != 0) j = lps[j - 1];\n            else i++;\n        }
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Find with Compression</h4>
                    <CodeSnippet code={`int find(int i) {\n    if (parent[i] == i)
        return i;
    return parent[i] = find(parent[i]);
}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Union by Rank</h4>
                    <CodeSnippet code={`void unite(int i, int j) {\n    int root_i = find(i);
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Recursive Memoization</h4>
                    <CodeSnippet code={`int fib(int n, vector<int>& memo) {\n    if (n <= 1) return n;
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
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The algorithm utilizes <strong>Optimal Substructure</strong>. It solves the problem by breaking it into smaller sub-capacities and sub-sets of items, building a global solution from local optima.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
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
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The output is a <strong>Value Optimization Matrix</strong>. The bottom-right cell contains the maximum possible value that can be squeezed into the knapsack under the weight constraint.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[#58C4DD] text-center">
                            Table[N][W] = Max Value
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#FFFF00] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" />
                            Your Expectations
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
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
              <ul className="text-xs space-y-2 text-muted-foreground font-mono">
                  <li><strong className="text-[#FC6255]">Exclude:</strong> Inherit value from $dp[i-1][w]$</li>
                  <li><strong className="text-[#83C167]">Include:</strong> Add $val[i]$ to $dp[i-1][w-wt[i]]$</li>
              </ul>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Tutorial & Recurrence</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> The Recurrence Relation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono bg-muted/30 p-4 rounded-xl border border-border">
                        if wt[i] {"<="} w:
                        <br/>&nbsp;&nbsp;dp[i][w] = max(val[i] + dp[i-1][w-wt[i]], dp[i-1][w])
                        <br/>else:
                        <br/>&nbsp;&nbsp;dp[i][w] = dp[i-1][w]
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The state $dp[i][w]$ represents the maximum value attainable using a subset of the first $i$ items with a total weight not exceeding $w$.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> 3. Implementation (C++)</h4>
                    <CodeSnippet code={`int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {\n    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));\n\n    for (int i = 1; i <= n; i++) {\n        for (int w = 0; w <= W; w++) {\n            if (wt[i - 1] <= w)
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
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The algorithm operates on a <strong>State-Space Transformation</strong>. It starts with direct edge weights and iteratively relaxes the entire manifold by considering every node as a mandatory "waypoint" (Intermediate Node $k$).
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[#83C167]">01.</span> Map direct connections</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">02.</span> Expand via node $k=0 … N$</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">03.</span> Update global invariants</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            Algorithm Output
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The final product is an <strong>All-Pairs Distance Tensor</strong>. Every cell $(i, j)$ in the matrix will contain the absolute minimum cost to travel between those two coordinates, regardless of how many intermediate jumps are required.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[#58C4DD] text-center">
                            Matrix[i][j] = Shortest(i → j)
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#FFFF00] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" />
                            Your Expectations
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            As you execute the visualizer, expect to see the "Relational Wave". When a cell flashes <strong>Green</strong>, it means a "shortcut" has been discovered through the current intermediate node $k$. The graph edges will thicken to represent the newly optimized path.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Dynamic Programming Insight" icon={Route}>
            <p>Floyd-Warshall is a powerful <strong>Dynamic Programming</strong> algorithm that solves the All-Pairs Shortest Path problem. The core intuition is to build up shortest paths by considering an increasing set of <strong>Intermediate Nodes</strong>.</p>
            <p>Let $dp[k][i][j]$ be the shortest path from $i$ to $j$ using only nodes from the set {"{0, 1, …, k}"} as internal points. We transition from $k-1$ to $k$ by deciding whether to pass through node $k$.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V³)" space="O(V²)" />
            <DocSection title="The Relaxation Lemma" icon={Activity} color="#58C4DD">
              <p>For every pair $(i, j)$, we check if a path going through node $k$ is shorter than the best path found so far:</p>
              <p className="font-mono text-[#FFFF00] bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                $D[i][j] = min(D[i][j], D[i][k] + D[k][j])$
              </p>
              <p className="mt-4">This <strong>Triangle Inequality</strong> check ensures that the manifold converges to the global minimum distance for all pairs.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Tutorial & Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> 1. Initialization</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Create a matrix `dist` where `dist[i][j]` is the weight of the edge from $i$ to $j$. Set `dist[i][i] = 0` and `dist[i][j] = INF` if no direct edge exists.
                    </p>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-8"><div className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" /> 2. The K-Loop (Crucial)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        The outermost loop (indexed by $k$) represents the <strong>Intermediate Node</strong>. We are asking: "Can node $k$ improve the path between any $i$ and $j$?" 
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed font-mono mt-2 italic">
                        Note: You must iterate $k$ first. Iterating $i$ or $j$ first will result in an incorrect local optimum.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> 3. Standard C++ Implementation</h4>
                    <CodeSnippet code={`void floydWarshall(int V, vector<vector<int>>& graph) {\n    vector<vector<int>> dist = graph;\n\n    for (int k = 0; k < V; k++) {\n        for (int i = 0; i < V; i++) {\n            for (int j = 0; j < V; j++) {\n                // If i->k and k->j paths exist\n                if (dist[i][k] != INF && dist[k][j] != INF) {\n                    if (dist[i][k] + dist[k][j] < dist[i][j]) {\n                        dist[i][j] = dist[i][k] + dist[k][j];\n                    }\n                }
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Dynamic Window</h4>
                    <CodeSnippet code={`int maxSubArrayLen(int target, vector<int>& nums) {\n    int left = 0, curr = 0, ans = 0;
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
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[#83C167]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Kahn's Algorithm (BFS)</h4>
                    <CodeSnippet code={`vector<int> kahn(int V, vector<vector<int>>& adj) {\n    vector<int> indegree(V, 0);
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
    icon: <Crown className="text-[#58C4DD]" />,
    description: "Backtracking state space.",
    component: (speed: number) => <NQueensVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="#58C4DD">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The algorithm utilizes <strong>Backtracking (DFS)</strong> to explore the state space. It attempts to place queens column-by-column, ensuring no two queens attack each other.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[#58C4DD]">01.</span> Position row-by-row</li>
                            <li className="flex gap-2"><span className="text-[#58C4DD]">02.</span> Validate safety constraints</li>
                            <li className="flex gap-2"><span className="text-[#58C4DD]">03.</span> Backtrack on conflict</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#83C167] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                            Safety Invariants
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            For every placement $(r, c)$, the algorithm verifies three invariants: the horizontal row, the upper diagonal, and the lower diagonal.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[#83C167] text-center">
                            No shared Row | Diag1 | Diag2
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#f59e0b] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                            Complexity Lemma
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The state space is $N^N$, but with pruning, we reduce this to $O(N!)$. This remains one of the classic examples of exponential growth in combinatorial search.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Placement Rules" icon={Crown} color="#f59e0b">
            <p>The N-Queens problem asks us to place N queens on an N×N chessboard so that no two queens can attack each other.</p>
            <p>This means no two queens can be in the same <strong>row</strong>, <strong>column</strong>, or <strong>diagonal</strong>. It&apos;s a classic example of using backtracking to explore possible solutions efficiently.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N!)" space="O(N)" />
            <DocSection title="Recursive Branching" icon={RotateCcw} color="#FC6255">
              <p>We place queens one by one in different columns. For each column, we try all rows. If a placement is safe, we move to the next column. If we get stuck, we <strong>backtrack</strong> and try a different row in the previous column.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[#83C167]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> isSafe Utility</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This function checks the three primary attack vectors: the row to the left, and both upper/lower left diagonals.
                    </p>
                    <CodeSnippet code={`bool isSafe(int row, int col, vector<string>& board, int n) {\n    // Row check\n    for (int i = 0; i < col; i++)\n        if (board[row][i] == 'Q') return false;\n\n    // Upper diagonal\n    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--)\n        if (board[i][j] == 'Q') return false;\n\n    // Lower diagonal\n    for (int i = row, j = col; i < n && j >= 0; i++, j++)\n        if (board[i][j] == 'Q') return false;\n\n    return true;\n}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Core Recursive Solver</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The solver iterates through every row in the current column, attempting a placement and recursing.
                    </p>
                    <CodeSnippet code={`void solve(int col, vector<string>& board, vector<vector<string>>& ans, int n) {\n    if (col == n) {\n        ans.push_back(board);\n        return;\n    }\n    for (int row = 0; row < n; row++) {\n        if (isSafe(row, col, board, n)) {\n            board[row][col] = 'Q';\n            solve(col + 1, board, ans, n);\n            board[row][col] = '.'; // Backtrack\n        }\n    }\n}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TREE_TRAVERSAL",
    title: "Tree Traversal",
    icon: <ListTree className="text-[#58C4DD]" />,
    description: "Recursive manifold navigation.",
    component: (speed: number) => <TreeTraversalVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="#58C4DD">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            Pre-Order (Root-L-R)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process the current node before its sub-manifolds. Ideal for <strong>Topology Duplication</strong> or serializing a tree structure for storage.
                        </p>
                        <div className="p-3 bg-[#58C4DD]/5 rounded-xl border border-[#58C4DD]/20 font-mono text-[10px] text-[#58C4DD] text-center">
                            Process → Left → Right
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#83C167] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                            In-Order (L-Root-R)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process nodes in non-decreasing order for <strong>BST Manifolds</strong>. Essential for validating BST properties and range queries.
                        </p>
                        <div className="p-3 bg-[#83C167]/5 rounded-xl border border-[#83C167]/20 font-mono text-[10px] text-[#83C167] text-center">
                            Left → Process → Right
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#FC6255] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" />
                            Post-Order (L-R-Root)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process sub-manifolds before the parent. Required for <strong>Space Deallocation</strong> (bottom-up deletion) and expression evaluation.
                        </p>
                        <div className="p-3 bg-[#FC6255]/5 rounded-xl border border-[#FC6255]/20 font-mono text-[10px] text-[#FC6255] text-center">
                            Left → Right → Process
                        </div>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Recursive Lemma" icon={Zap} color="#83C167">
            <p>Every traversal is a specific mapping of a 2D hierarchical manifold into a 1D sequence. The <strong>Recursive Depth</strong> ensures that the entire state space is explored by following the pointer hierarchy.</p>
            <p>While DFS variations (Pre/In/Post) follow the stack-based depth plunge, <strong>BFS (Level-Order)</strong> explores the manifold layered by their geodesic distance from the root.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(H)" />
            <DocSection title="The Visit Standard" icon={Activity} color="#f59e0b">
              <p>In all 3 traversals, every node is visited exactly once. The complexity remains $O(N)$ regardless of the order. The spatial bound $O(H)$ fluctuates based on tree balance ($log N$ to $N$).</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[#83C167]" />Implementation Matrix</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> Pre-Order</h4>
                    <CodeSnippet code={`void preOrder(Node* root) {\n    if (!root) return;\n    cout << root->val << " ";\n    preOrder(root->left);\n    preOrder(root->right);\n}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> In-Order</h4>
                    <CodeSnippet code={`void inOrder(Node* root) {\n    if (!root) return;\n    inOrder(root->left);\n    cout << root->val << " ";\n    inOrder(root->right);\n}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FC6255]" /> Post-Order</h4>
                    <CodeSnippet code={`void postOrder(Node* root) {\n    if (!root) return;\n    postOrder(root->left);\n    postOrder(root->right);\n    cout << root->val << " ";\n}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KADANE",
    title: "Kadane's Algorithm",
    icon: <TrendingUp className="text-[#83C167]" />,
    description: "Maximum subarray sum lemma.",
    component: (speed: number) => <KadaneVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="#83C167">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[#83C167] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Kadane&apos;s algorithm utilizes a <strong>Local Optimization</strong> strategy. At each index $i$, it decides whether to extend the existing subarray or start a new one from $i$.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[#83C167]">01.</span> Accumulate current sum</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">02.</span> Update global maximum</li>
                            <li className="flex gap-2"><span className="text-[#83C167]">03.</span> Reset if sum {"<"} 0</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[#58C4DD] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" />
                            The DP Invariant
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The state $dp[i]$ represents the maximum subarray sum ending at index $i$. The recurrence is: $dp[i] = max(A[i], A[i] + dp[i-1])$.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[#58C4DD] text-center">
                            Local[i] = max(A[i], Local[i-1] + A[i])
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[#f59e0b] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                            Asymptotic Bound
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Kadane&apos;s algorithm reduces the combinatorial space from $O(N^2)$ contiguous subarrays to a single $O(N)$ pass, achieving optimal linear efficiency.
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest bg-[#f59e0b]/5 p-2 rounded-lg border border-[#f59e0b]/20">
                            <Activity size={12} /> Temporal: O(N)
                        </div>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="The Greedy Choice" icon={Target} color="#f59e0b">
            <p>The core insight of Kadane&apos;s algorithm is that if a prefix has a negative sum, it can never be part of a maximum subarray starting at a later index.</p>
            <p>By &quot;dropping&quot; the current sum when it falls below zero, we effectively prune the search space and maintain a linear time complexity manifold.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(1)" />
            <DocSection title="Convergence Lemma" icon={Zap} color="#83C167">
              <p>Because we only make a single pass over the array and use two scalar variables, the algorithm is both temporally and spatially optimal for this manifold. It transforms a local decision into a global guarantee.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[#83C167]" />Manifold Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" /> Standard Approach</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Iterate through the array, maintaining `curr` (local potential) and `best` (global optimum). If the potential collapses below zero, we restart from the next manifold cell.
                    </p>
                    <CodeSnippet code={`long long maxSubarraySum(int arr[], int n) {\n    long long best = -1e18, curr = 0;\n\n    for (int i = 0; i < n; i++) {\n        curr += arr[i];\n\n        if (curr > best) \n            best = curr;\n\n        if (curr < 0) \n            curr = 0;\n    }\n    return best;\n}`} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD]" /> DP Variation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This variation handles cases where all elements are negative by explicitly choosing between the current element and the sum of the current element plus the previous local optimum.
                    </p>
                    <CodeSnippet code={`int maxSubarraySum(vector<int>& nums) {\n    int best = nums[0];\n    int curr = nums[0];\n\n    for (int i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        best = max(best, curr);\n    }\n    return best;\n}`} />
                </div>
            </div>
        </div>
      </div>
    )
  },
];
