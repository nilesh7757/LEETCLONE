import React from "react";
import {
  ArrowDownNarrowWide, Activity, Check, Search, Target, Microscope,
  GitBranch, Share2, Cpu, Network, Layers, GitMerge, RotateCcw, Zap,
  Database, Sliders, GitPullRequest, FastForward, Link, Infinity as InfinityIcon,
  ShoppingBag, Route, MoveHorizontal, ListTree, Crown,
  FileSearch, BoxSelect, Binary, Sparkles, Layout, Terminal, TrendingUp,
  AlertTriangle, Type, LayoutGrid, Hash, RefreshCw, ChevronRight, ArrowUp
} from "lucide-react";

import SortingVisualizer from "@/features/visualizer/components/DSA/SortingVisualizer";
import SelectionSortVisualizer from "@/features/visualizer/components/DSA/SelectionSortVisualizer";
import InsertionSortVisualizer from "@/features/visualizer/components/DSA/InsertionSortVisualizer";
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
import BellmanFordVisualizer from "@/features/visualizer/components/DSA/BellmanFordVisualizer";
import MSTVisualizer from "@/features/visualizer/components/DSA/MSTVisualizer";
import FloydWarshallVisualizer from "@/features/visualizer/components/DSA/FloydWarshallVisualizer";
import FibonacciVisualizer from "@/features/visualizer/components/DSA/FibonacciVisualizer";
import KnapsackVisualizer from "@/features/visualizer/components/DSA/KnapsackVisualizer";
import SlidingWindowVisualizer from "@/features/visualizer/components/DSA/SlidingWindowVisualizer";
import KadaneVisualizer from "@/features/visualizer/components/DSA/KadaneVisualizer";
import LCSVisualizer from "@/features/visualizer/components/DSA/LCSVisualizer";
import LISVisualizer from "@/features/visualizer/components/DSA/LISVisualizer";
import EditDistanceVisualizer from "@/features/visualizer/components/DSA/EditDistanceVisualizer";
import SCCVisualizer from "@/features/visualizer/components/DSA/SCCVisualizer";
import LCAVisualizer from "@/features/visualizer/components/DSA/LCAVisualizer";
import FenwickTreeVisualizer from "@/features/visualizer/components/DSA/FenwickTreeVisualizer";
import TarjanVisualizer from "@/features/visualizer/components/DSA/TarjanVisualizer";
import BitmaskDPVisualizer from "@/features/visualizer/components/DSA/BitmaskDPVisualizer";
import SieveVisualizer from "@/features/visualizer/components/DSA/SieveVisualizer";
import DigitDPVisualizer from "@/features/visualizer/components/DSA/DigitDPVisualizer";
import SparseTableVisualizer from "@/features/visualizer/components/DSA/SparseTableVisualizer";
import RerootingVisualizer from "@/features/visualizer/components/DSA/RerootingVisualizer";
import BinaryLiftingVisualizer from "@/features/visualizer/components/DSA/BinaryLiftingVisualizer";

import { DocSection, ComplexityCard, CodeSnippet } from "./DocComponents";

export const dsaCategories = [
  {
    id: "SORTING",
    title: "Bubble Sort",
    icon: <ArrowDownNarrowWide />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Simple comparison-based sorting.",
    component: (speed: number) => <SortingVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="How it Works" icon={Activity} color="var(--viz-amber)">
            <p>Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in the wrong order.</p>
            <p>In each pass through the array, the largest unsorted element &quot;bubbles up&quot; to its correct position at the end, just like bubbles rise to the surface of water.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N²)" space="O(1)" />
            <DocSection title="Stability & Use Cases" icon={Check} color="var(--viz-deep-purple)">
              <p>Bubble sort is <strong>Stable</strong>, meaning it preserves the relative order of equal elements. While inefficient for large datasets, it&apos;s useful for educational purposes and nearly-sorted arrays.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
      "Python": `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
      "Java": `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      "JavaScript": `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
}`
    }
  },
  {
    id: "SELECTION_SORT",
    title: "Selection Sort",
    icon: <Target />,
    themeColor: "var(--viz-deep-purple)",
    themeRGB: "var(--viz-deep-purple-rgb)",
    description: "Extremum search protocol.",
    component: (speed: number) => <SelectionSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Extremum Search" icon={Search} color="var(--viz-deep-purple)">
            <p>Selection Sort operates on the principle of <strong>In-Place Extremum Selection</strong>. It conceptually divides the manifold into a sorted and an unsorted sub-manifold.</p>
            <p>In each iteration, the algorithm performs a linear scan to identify the absolute minimum element in the unsorted region and displaces it to the boundary of the sorted region.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N²)" space="O(1)" />
            <DocSection title="Displacement Lemma" icon={Zap} color="var(--viz-rose)">
              <p>Unlike Bubble Sort, Selection Sort performs at most <strong>$N-1$ swaps</strong>. This makes it more efficient in scenarios where memory write operations (displacement) are significantly more expensive than comparisons.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        if (min_idx != i)
            swap(arr[min_idx], arr[i]);
    }
}`,
      "Python": `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      "Java": `public void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}`,
      "JavaScript": `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx !== i) {
            [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
        }
    }
}`
    }
  },
  {
    id: "INSERTION_SORT",
    title: "Insertion Sort",
    icon: <Sliders />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Builds the sorted array one item at a time.",
    component: (speed: number) => <InsertionSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="How it Works" icon={Activity} color="var(--viz-amber)">
            <p>Insertion Sort builds the final sorted array <strong>one element at a time</strong>. It is much like the way you sort playing cards in your hands.</p>
            <p>You take one element from the unsorted part and find its correct position in the sorted part, shifting other elements to make room.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N²)" space="O(1)" />
            <DocSection title="Efficiency" icon={Zap} color="var(--viz-deep-purple)">
              <p>Insertion Sort is very efficient for small datasets or arrays that are already <strong>partially sorted</strong>. In the best case (already sorted), it runs in $O(N)$ time.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
      "Python": `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
      "Java": `public void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
      "JavaScript": `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
    }
  },
  {
    id: "BINARY_SEARCH",
    title: "Binary Search",
    icon: <Search />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Logarithmic search in sorted arrays.",
    component: (speed: number) => <BinarySearchVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="How it Works" icon={Activity} color="var(--viz-cyan)">
            <p>Binary Search finds the position of a target value within a <strong>sorted array</strong>. It works by repeatedly dividing the search interval in half.</p>
            <p>If the value of the search key is less than the item in the middle of the interval, narrow the interval to the lower half. Otherwise, narrow it to the upper half.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N)" space="O(1)" />
            <DocSection title="Prerequisite" icon={AlertTriangle} color="var(--viz-amber)">
              <p>Crucially, Binary Search only works on <strong>Sorted</strong> data. If the data is not sorted, you must sort it first or use a linear search.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `int binarySearch(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      "Python": `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      "Java": `public int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      "JavaScript": `function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor(low + (high - low) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    }
  },
  {
    id: "LINKED_LIST",
    title: "Linked List",
    icon: <Link />,
    themeColor: "var(--viz-lime)",
    themeRGB: "var(--viz-lime-rgb)",
    description: "Pointer-based linear topology.",
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
            <DocSection title="Pointer Anatomy" icon={Share2} color="var(--viz-amber)">
              <ul className="space-y-3 list-none">
                <li className="flex gap-2"><span className="text-[var(--viz-cyan)] font-bold">● Value:</span> The payload residing at the address.</li>
                <li className="flex gap-2"><span className="text-[var(--viz-amber)] font-bold">● Next:</span> A hex reference to the successor manifold.</li>
                <li className="flex gap-2"><span className="text-[var(--viz-rose)] font-bold">● NULL:</span> The termination signal of the sequence.</li>
              </ul>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void traverse(Node* head) {
    Node* temp = head;
    while (temp != nullptr) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "NULL";
}`,
      "Python": `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def traverse(head):
    temp = head
    while temp:
        print(temp.data, end=" -> ")
        temp = temp.next
    print("NULL")`,
      "Java": `class Node {
    int data;
    Node next;
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

public void traverse(Node head) {
    Node temp = head;
    while (temp != null) {
        System.out.print(temp.data + " -> ");
        temp = temp.next;
    }
    System.out.println("NULL");
}`,
      "JavaScript": `class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

function traverse(head) {
    let temp = head;
    let result = "";
    while (temp) {
        result += temp.data + " -> ";
        temp = temp.next;
    }
    console.log(result + "NULL");
}`
    }
  },
  {
    id: "GRAPH_BFS",
    title: "Graph Traversal",
    icon: <Network />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Relational manifold search.",
    component: (speed: number) => <GraphVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Traversal Topology" icon={Network}>
            <p>Graph traversal algorithms explore nodes and edges to determine connectivity or search for specific properties.</p>
            <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[var(--viz-cyan)]">BFS (Breadth-First):</strong> Explores neighbor-by-neighbor, like a wave expanding from a source. Ideal for shortest paths in unweighted graphs.</li>
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[var(--viz-rose)]">DFS (Depth-First):</strong> Plunges as deep as possible down each branch before backtracking. Useful for cycle detection, topological sorting, and maze solving.</li>
            </ul>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <div className="grid grid-cols-2 gap-4">
                <DocSection title="Queue Lemma" icon={Layers} color="var(--viz-cyan)">
                <p>BFS uses a <strong>FIFO Queue</strong> to ensure strictly layered exploration.</p>
                </DocSection>
                <DocSection title="Recursion Stack" icon={GitBranch} color="var(--viz-rose)">
                <p>DFS relies on a <strong>LIFO Stack</strong> (or recursion) to backtrack efficiently.</p>
                </DocSection>
            </div>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `void bfs(int start, vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}

void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}`,
      "Python": `from collections import deque

def bfs(start, adj, V):
    visited = [False] * V
    q = deque([start])
    visited[start] = True
    while q:
        u = q.popleft()
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                q.append(v)

def dfs(u, adj, visited):
    visited[u] = True
    for v in adj[u]:
        if not visited[v]:
            dfs(v, adj, visited)`,
      "Java": `public void bfs(int start, List<List<Integer>> adj, int V) {
    boolean[] visited = new boolean[V];
    Queue<Integer> q = new LinkedList<>();
    visited[start] = true;
    q.add(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                visited[v] = true;
                q.add(v);
            }
        }
    }
}

public void dfs(int u, List<List<Integer>> adj, boolean[] visited) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}`,
      "JavaScript": `function bfs(start, adj, V) {
    const visited = new Array(V).fill(false);
    const q = [start];
    visited[start] = true;
    while (q.length > 0) {
        const u = q.shift();
        for (const v of adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}

function dfs(u, adj, visited) {
    visited[u] = true;
    for (const v of adj[u]) {
        if (!visited[v]) dfs(v, adj, visited);
    }
}`
    }
  },
  {
    id: "BELLMAN_FORD",
    title: "Bellman-Ford",
    icon: <TrendingUp />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Negative edge tolerance protocol.",
    component: (speed: number) => <BellmanFordVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Relaxation Principle" icon={Activity} color="var(--viz-rose)">
            <p>The Bellman-Ford algorithm computes shortest paths from a single source to all other nodes. Unlike Dijkstra, it can handle <strong>Negative Edge Weights</strong>.</p>
            <p>It operates by repeatedly <strong>relaxing</strong> all edges of the graph. After $V-1$ iterations, all shortest paths are guaranteed to be found, provided no negative cycles exist.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V * E)" space="O(V)" />
            <DocSection title="Cycle Detection" icon={AlertTriangle} color="var(--viz-rose)">
              <p>A unique capability of Bellman-Ford is the detection of <strong>Negative Weight Cycles</strong>. If an edge can still be relaxed after $V-1$ iterations, a negative cycle is present, making the &quot;shortest&quot; path undefined.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `struct Edge { int u, v, w; };

void bellmanFord(int V, int S, vector<Edge>& edges) {
    vector<int> dist(V, INT_MAX);
    dist[S] = 0;

    for (int i = 1; i < V; i++) {
        for (auto& e : edges) {
            if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v])
                dist[e.v] = dist[e.u] + e.w;
        }
    }

    // Detect negative cycle
    for (auto& e : edges) {
        if (dist[e.u] != INT_MAX && dist[e.u] + e.w < dist[e.v])
            cout << "Negative Cycle Detected";
    }
}`,
      "Python": `def bellman_ford(V, S, edges):
    dist = [float('inf')] * V
    dist[S] = 0

    for _ in range(V - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            print("Negative Cycle Detected")
    return dist`,
      "Java": `public void bellmanFord(int V, int S, List<Edge> edges) {
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[S] = 0;

    for (int i = 1; i < V; i++) {
        for (Edge e : edges) {
            if (dist[e.u] != Integer.MAX_VALUE && dist[e.u] + e.w < dist[e.v])
                dist[e.v] = dist[e.u] + e.w;
        }
    }

    for (Edge e : edges) {
        if (dist[e.u] != Integer.MAX_VALUE && dist[e.u] + e.w < dist[e.v])
            System.out.println("Negative Cycle Detected");
    }
}`,
      "JavaScript": `function bellmanFord(V, S, edges) {
    let dist = new Array(V).fill(Infinity);
    dist[S] = 0;

    for (let i = 1; i < V; i++) {
        for (let [u, v, w] of edges) {
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    for (let [u, v, w] of edges) {
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            console.log("Negative Cycle Detected");
        }
    }
    return dist;
}`
    }
  },
  {
    id: "MST",
    title: "Minimum Spanning Tree",
    icon: <GitMerge />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Prim's greedy optimization.",
    component: (speed: number) => <MSTVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Greedy Optimization" icon={Network}>
            <p>A Minimum Spanning Tree (MST) connects all vertices with the minimum possible total edge weight, without cycles.</p>
            <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[var(--viz-deep-purple)]">Prim&apos;s Algorithm:</strong> Grows a single tree from a starting node, always adding the cheapest connection to the unvisited frontier. Ideal for dense graphs.</li>
                <li className="flex gap-3 text-xs text-muted-foreground"><strong className="text-[var(--viz-amber)]">Kruskal&apos;s Algorithm:</strong> Sorts all edges by weight and iteratively adds them if they don&apos;t form a cycle (using Disjoint Set Union). Better for sparse graphs.</li>
            </ul>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(E log V)" space="O(V + E)" />
            <div className="grid grid-cols-2 gap-4">
                <DocSection title="Cut Property (Prim)" icon={Zap} color="var(--viz-deep-purple)">
                <p>Always chooses the minimum weight edge crossing from visited to unvisited sets.</p>
                </DocSection>
                <DocSection title="Cycle Property (Kruskal)" icon={RotateCcw} color="var(--viz-amber)">
                <p>Adds edges in ascending order of weight, skipping any that connect nodes already in the same component.</p>
                </DocSection>
            </div>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `int primMST(int V, vector<vector<pair<int, int>>>& adj) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<bool> inMST(V, false);
    int sum = 0;
    pq.push({0, 0}); // {weight, node}

    while (!pq.empty()) {
        int u = pq.top().second, w = pq.top().first; pq.pop();
        if (inMST[u]) continue;
        inMST[u] = true; sum += w;
        for (auto& edge : adj[u]) {
            if (!inMST[edge.first]) pq.push({edge.second, edge.first});
        }
    }
    return sum;
}`,
      "Python": `import heapq

def prim_mst(V, adj):
    pq = [(0, 0)] # (weight, node)
    visited = [False] * V
    total_weight = 0
    while pq:
        w, u = heapq.heappop(pq)
        if visited[u]: continue
        visited[u] = True
        total_weight += w
        for v, weight in adj[u]:
            if not visited[v]:
                heapq.heappush(pq, (weight, v))
    return total_weight`,
      "Java": `public int primMST(int V, List<List<int[]>> adj) {
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    boolean[] visited = new boolean[V];
    int sum = 0;
    pq.add(new int[]{0, 0});
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int w = curr[0], u = curr[1];
        if (visited[u]) continue;
        visited[u] = true;
        sum += w;
        for (int[] edge : adj.get(u)) {
            if (!visited[edge[0]]) pq.add(new int[]{edge[1], edge[0]});
        }
    }
    return sum;
}`,
      "JavaScript": `function primMST(V, adj) {
    const pq = new MinPriorityQueue({ priority: x => x[0] });
    const visited = new Array(V).fill(false);
    let sum = 0;
    pq.enqueue([0, 0]);
    while (!pq.isEmpty()) {
        const [w, u] = pq.dequeue().element;
        if (visited[u]) continue;
        visited[u] = true;
        sum += w;
        for (const [v, weight] of adj[u]) {
            if (!visited[v]) pq.enqueue([weight, v]);
        }
    }
    return sum;
}`
    }
  },
  {
    id: "DIJKSTRA",
    title: "Dijkstra's Algorithm",
    icon: <Zap />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Finds the shortest path from a source to all nodes.",
    component: (speed: number) => <DijkstraVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="How it Works" icon={Activity} color="var(--viz-rose)">
            <p>Dijkstra&apos;s algorithm finds the shortest path from a starting node to all other nodes in a weighted graph. It uses a <strong>Greedy</strong> approach.</p>
            <p>At each step, it picks the unvisited node with the smallest distance, explores its neighbors, and updates their distances if a shorter path is found. This is called <strong>Relaxation</strong>.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(E log V)" space="O(V + E)" />
            <DocSection title="Constraint" icon={AlertTriangle} color="var(--viz-amber)">
              <p>Dijkstra only works for graphs with <strong>non-negative</strong> edge weights. For negative weights, use the Bellman-Ford algorithm.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `vector<int> dijkstra(int V, vector<vector<pair<int, int>>>& adj, int S) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<int> dist(V, INT_MAX);
    dist[S] = 0;
    pq.push({0, S});

    while (!pq.empty()) {
        int d = pq.top().first, u = pq.top().second; pq.pop();
        if (d > dist[u]) continue;
        for (auto& edge : adj[u]) {
            if (dist[u] + edge.second < dist[edge.first]) {
                dist[edge.first] = dist[u] + edge.second;
                pq.push({dist[edge.first], edge.first});
            }
        }
    }
    return dist;
}`,
      "Python": `import heapq

def dijkstra(V, adj, S):
    pq = [(0, S)]
    dist = [float('inf')] * V
    dist[S] = 0
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      "Java": `public int[] dijkstra(int V, List<List<int[]>> adj, int S) {
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[S] = 0;
    pq.add(new int[]{0, S});
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];
        if (d > dist[u]) continue;
        for (int[] edge : adj.get(u)) {
            if (dist[u] + edge[1] < dist[edge[0]]) {
                dist[edge[0]] = dist[u] + edge[1];
                pq.add(new int[]{dist[edge[0]], edge[0]});
            }
        }
    }
    return dist;
}`,
      "JavaScript": `function dijkstra(V, adj, S) {
    const dist = new Array(V).fill(Infinity);
    dist[S] = 0;
    const pq = new MinPriorityQueue({ priority: x => x[0] });
    pq.enqueue([0, S]);
    while (!pq.isEmpty()) {
        const [d, u] = pq.dequeue().element;
        if (d > dist[u]) continue;
        for (const [v, weight] of adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.enqueue([dist[v], v]);
            }
        }
    }
    return dist;
}`
    }
  },
  {
    id: "STACK_QUEUE",
    title: "Stack & Queue",
    icon: <Database />,
    themeColor: "var(--viz-lime)",
    themeRGB: "var(--viz-lime-rgb)",
    description: "LIFO and FIFO data buffers.",
    component: (speed: number) => <StackQueueVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Buffer Topology" icon={Database}>
            <p>Stacks and Queues are fundamental linear buffers defined by their <strong>Access Pattern</strong>. A <strong>Stack</strong> (LIFO) simulates a vertical pile where the last item added is the first accessible. A <strong>Queue</strong> (FIFO) simulates a horizontal pipe where flow is continuous.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(1) Ops" space="O(N)" />
            <DocSection title="Access Lemma" icon={ArrowDownNarrowWide} color="var(--viz-cyan)">
              <p><strong>Stack:</strong> Push/Pop operates on the <em>Top</em>. Useful for recursion, undo mechanisms, and parsing.</p>
              <p><strong>Queue:</strong> Enqueue/Dequeue operates on <em>Rear/Front</em>. Essential for scheduling, buffering, and BFS.</p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `// Stack
stack<int> s;
s.push(10); int t = s.top(); s.pop();

// Queue
queue<int> q;
q.push(10); int f = q.front(); q.pop();`,
      "Python": `// Stack (list)
s = []; s.append(10); t = s[-1]; s.pop()

// Queue (deque)
from collections import deque
q = deque(); q.append(10); f = q[0]; q.popleft()`,
      "Java": `// Stack
Stack<Integer> s = new Stack<>();
s.push(10); int t = s.peek(); s.pop();

// Queue
Queue<Integer> q = new LinkedList<>();
q.add(10); int f = q.peek(); q.remove();`,
      "JavaScript": `// Stack (array)
let s = []; s.push(10); let t = s[s.length-1]; s.pop();

// Queue (array)
let q = []; q.push(10); let f = q.shift();`
    }
  },
  {
    id: "QUICK_SORT",
    title: "Quick Sort",
    icon: <Zap />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Pivot-based partitioning.",
    component: (speed: number) => <QuickSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Partition Strategy" icon={Binary} color="var(--viz-rose)">
            <p>Quick Sort is a <strong>Divide and Conquer</strong> algorithm driven by the <strong>Pivot Standard</strong>. It selects a &apos;pivot&apos; element and partitions the array so that all smaller elements move to its left and larger ones to its right.</p>
            <p>We visualize the <strong>Lomuto Partition Scheme</strong>, which is simpler to implement but may perform more swaps than Hoare&apos;s scheme. It iterates a single pointer to expand the &apos;smaller elements&apos; region.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N log N)" space="O(log N)" />
            <DocSection title="Recursive Depth" icon={GitPullRequest} color="var(--viz-cyan)">
              <p>Efficiency hinges on the pivot. A balanced pivot splits the array evenly (logarithmic depth). A poor pivot (e.g., smallest/largest element) degrades performance to O(N²).</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" /> Lomuto Partition Logic</h4>
                    <ul className="space-y-4 text-xs text-muted-foreground leading-relaxed font-mono">
                        <li className="flex gap-3"><span className="text-[var(--viz-rose)] font-bold">01.</span> <strong className="text-foreground">Pivot Selection:</strong> Choose the last element (or random) as the pivot.</li>
                        <li className="flex gap-3"><span className="text-[var(--viz-rose)] font-bold">02.</span> <strong className="text-foreground">Boundary Tracking:</strong> Maintain index `i` (initially `low - 1`) to mark the end of the &quot;smaller than pivot&quot; region.</li>
                        <li className="flex gap-3"><span className="text-[var(--viz-rose)] font-bold">03.</span> <strong className="text-foreground">Scanning:</strong> Iterate `j` from `low` to `high - 1`. If `arr[j] {"<"} pivot`, increment `i` and swap `arr[i]` with `arr[j]`.</li>
                        <li className="flex gap-3"><span className="text-[var(--viz-rose)] font-bold">04.</span> <strong className="text-foreground">Placement:</strong> Finally, swap the pivot (`arr[high]`) with `arr[i + 1]` to place it in its correct sorted position.</li>
                    </ul>
                </div>
                
                <CodeSnippet code={{ "C++": `int partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high]; // Lomuto Pivot\n    int i = (low - 1);     // Index of smaller element\n    \n    for (int j = low; j <= high - 1; j++) {\n        // If current element is smaller than the pivot\n        if (arr[j] < pivot) {\n            i++; \n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return (i + 1); // Return partition index\n}\n\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        \n        // Recursively sort elements before and after partition\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }
}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "MERGE_SORT",
    title: "Merge Sort",
    icon: <Layers />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Divide-and-conquer recursion.",
    component: (speed: number) => <MergeSortVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Atomic Decomposition" icon={Microscope} color="var(--viz-deep-purple)">
            <p>Merge Sort treats sorting as a process of <strong>Recursive Decomposition</strong>. The manifold is split into atomic units (single elements) which are inherently sorted. The true logic resides in the <strong>Conquer Phase</strong>.</p>
            <p>By merging two sorted sub-manifolds, we maintain a stable order while re-assembling the full vector space.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N log N)" space="O(N)" />
            <DocSection title="Merging Lemma" icon={GitMerge} color="var(--viz-amber)">
              <p>During the merge, we compare the leading elements of two sub-manifolds. The smaller element is moved to the parent manifold, ensuring that each re-assembled level is perfectly ordered.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Merge Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        The `merge` function uses a temporary array to interleave elements from two sorted halves (`left` and `right`) into a single sorted sequence.
                    </p>
                    <CodeSnippet code={{ "C++": `void merge(vector<int>& arr, int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    vector<int> L(n1), R(n2);\n    for(int i=0; i<n1; i++) L[i] = arr[l + i];\n    for(int j=0; j<n2; j++) R[j] = arr[m + 1 + j];\n\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) arr[k++] = L[i++];\n        else arr[k++] = R[j++];\n    }\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];
}` }} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Recursive Driver</h4>
                    <CodeSnippet code={{ "C++": `void mergeSort(vector<int>& arr, int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "BST",
    title: "Binary Search Tree",
    icon: <GitBranch />,
    themeColor: "var(--viz-lavender)",
    themeRGB: "var(--viz-lavender-rgb)",
    description: "Hierarchical sorted manifold.",
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
            <DocSection title="Geometric Balance" icon={Check} color="var(--viz-amber)">
              <p>The effectiveness of a BST is directly proportional to its <strong>Structural Balance</strong>. A skewed tree degenerates into a linear manifold ($O(N)$), while a balanced tree maintains optimal $O(\\$log N)$ performance.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Search Logic</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Navigate the tree by comparing `val` with `root-&gt;val`. Go left if smaller, right if larger.
                    </p>
                    <CodeSnippet code={{ "C++": `TreeNode* search(TreeNode* root, int val) {\n    if (root == nullptr || root->val == val) return root;\n    \n    if (val < root->val) 
        return search(root->left, val);
        
    return search(root->right, val);
}` }} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Insert Logic</h4>
                    <CodeSnippet code={{ "C++": `TreeNode* insert(TreeNode* root, int val) {\n    if (!root) return new TreeNode(val);\n    \n    if (val < root->val)
        root->left = insert(root->left, val);
    else if (val > root->val)
        root->right = insert(root->right, val);
        
    return root;
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TRIE",
    title: "Trie (Prefix Tree)",
    icon: <BoxSelect />,
    themeColor: "var(--viz-lavender)",
    themeRGB: "var(--viz-lavender-rgb)",
    description: "Optimized string retrieval manifold.",
    component: (speed: number) => <TrieVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Prefix Compression" icon={Cpu} color="var(--viz-lavender)">
            <p>A Trie (Prefix Tree) optimizes sequence storage by <strong>Sharing Common Prefixes</strong>. Instead of storing the full sequence, each node represents a single character manifold.</p>
            <p>This allows for ultra-fast $O(L)$ lookups (where $L$ is sequence length) and is the foundation for autocomplete and linguistic analysis systems.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(L) per Op" space="O(Alphabet * N)" />
            <DocSection title="Path Resolution" icon={Activity} color="var(--viz-cyan)">
              <p>Traversal through a Trie is deterministic. Each character in the query sequence acts as a directional signal to the next memory cell, resolving the presence of a sequence through path existence.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-lavender)]" /> Trie Node</h4>
                    <CodeSnippet code={{ "C++": `struct TrieNode {\n    TrieNode* children[26];\n    bool isEndOfWord;\n    \n    TrieNode() {\n        isEndOfWord = false;\n        for (int i = 0; i < 26; i++) 
            children[i] = nullptr;
    }
};` }} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Insertion</h4>
                    <CodeSnippet code={{ "C++": `void insert(string word) {\n    TrieNode* curr = root;\n    for (char c : word) {\n        int idx = c - 'a';\n        if (!curr->children[idx])
            curr->children[idx] = new TrieNode();\n        curr = curr->children[idx];\n    }\n    curr->isEndOfWord = true;
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "HEAP",
    title: "Binary Heap",
    icon: <Binary />,
    themeColor: "var(--viz-lavender)",
    themeRGB: "var(--viz-lavender-rgb)",
    description: "Complete tree priority manifold.",
    component: (speed: number) => <HeapVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Priority Ordering" icon={Target} color="var(--viz-amber)">
            <p>A Min-Heap is a specialized complete tree that maintains the <strong>Heap Property</strong>: the value of each node is less than or equal to the values of its children. This ensures that the global minimum is always at the root manifold.</p>
            <p>It is the primary engine for <strong>Priority Queues</strong> and greedy algorithmic choices.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N) Insert" space="O(N)" />
            <DocSection title="Bubble Logic" icon={ArrowDownNarrowWide} color="var(--viz-cyan)">
              <p>When the property is violated, elements &quot;Bubble Up&quot; or &quot;Sink Down&quot; through recursive swaps until the hierarchy is restored. This maintenance occurs in $O(\\$log N)$ time.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" /> Heapify Up (Insert)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        After inserting at the end, swap with parent if the heap property is violated. Repeat until root.
                    </p>
                    <CodeSnippet code={{ "C++": `void heapifyUp(int i) {\n    while (i > 0) {\n        int p = (i - 1) / 2;\n        if (heap[i] < heap[p]) {\n            swap(heap[i], heap[p]);\n            i = p;\n        } else break;
    }
}` }} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" /> Heapify Down (Extract)</h4>
                    <CodeSnippet code={{ "C++": `void heapifyDown(int i) {\n    int smallest = i;\n    int l = 2*i + 1, r = 2*i + 2;\n    \n    if (l < n && heap[l] < heap[smallest]) smallest = l;\n    if (r < n && heap[r] < heap[smallest]) smallest = r;\n    \n    if (smallest != i) {\n        swap(heap[i], heap[smallest]);\n        heapifyDown(smallest);
    }
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "SEGMENT_TREE",
    title: "Segment Tree",
    icon: <BoxSelect />,
    themeColor: "var(--viz-lavender)",
    themeRGB: "var(--viz-lavender-rgb)",
    description: "Range query optimization protocol.",
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
            <DocSection title="Contribution Lemma" icon={Zap} color="var(--viz-deep-purple)">
              <p>During a query, if a node&apos;s interval is fully contained within the query range, it returns its pre-computed value immediately. Otherwise, it delegates to its children, combining their partial results.</p>
            </DocSection>
          </div>
        </div>

        {/* Tutorial Section */}
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Build (Recursive)</h4>
                    <CodeSnippet code={{ "C++": `void build(int node, int start, int end) {\n    if (start == end) {\n        tree[node] = arr[start];\n    } else {\n        int mid = (start + end) / 2;\n        build(2*node, start, mid);\n        build(2*node+1, mid+1, end);\n        tree[node] = tree[2*node] + tree[2*node+1];\n    }
}` }} />
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Range Query</h4>
                    <CodeSnippet code={{ "C++": `int query(int node, int start, int end, int l, int r) {\n    if (r < start || end < l) return 0;\n    if (l <= start && end <= r) return tree[node];\n    \n    int mid = (start + end) / 2;\n    return query(2*node, start, mid, l, r) + 
           query(2*node+1, mid+1, end, l, r);
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KMP",
    title: "KMP Algorithm",
    icon: <FileSearch />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Linear string pattern matching.",
    component: (speed: number) => <KMPVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Pattern Autocorrelation" icon={Microscope}>
            <p>The Knuth-Morris-Pratt (KMP) algorithm optimizes pattern matching by exploiting the <strong>Self-Similarity</strong> of the pattern. When a mismatch occurs, we don&apos;t need to backtrack the text pointer; we only shift the pattern pointer.</p>
            <p>This is achieved via the <strong>Prefix Function</strong> ($\\$pi$), which maps the length of the longest proper prefix that is also a suffix.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N + M)" space="O(M)" />
            <DocSection title="No Backtracking" icon={FastForward} color="var(--viz-amber)">
              <p>Unlike naive matching which backtracks to $i+1$, KMP slides the pattern by $\\$pi$[q] characters, guaranteeing linear time complexity $O(N)$.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> LPS Array</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Compute the Longest Prefix Suffix (LPS) array to determine jump distances.
                    </p>
                    <CodeSnippet code={{ "C++": `vector<int> computeLPS(string P) {\n    int m = P.length();\n    vector<int> lps(m, 0);\n    int len = 0, i = 1;\n    while (i < m) {\n        if (P[i] == P[len]) lps[i++] = ++len;\n        else if (len != 0) len = lps[len-1];\n        else lps[i++] = 0;\n    }\n    return lps;
}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Matching Logic</h4>
                    <CodeSnippet code={{ "C++": `void KMPSearch(string pat, string txt) {\n    int M = pat.length();\n    int N = txt.length();\n    vector<int> lps = computeLPS(pat);\n    int i = 0, j = 0;\n    while (i < N) {\n        if (pat[j] == txt[i]) { j++; i++; }\n        if (j == M) {\n            cout << "Found at " << i - j;
            j = lps[j - 1];\n        } else if (i < N && pat[j] != txt[i]) {\n            if (j != 0) j = lps[j - 1];\n            else i++;\n        }
    }
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "DSU",
    title: "Disjoint Set Union",
    icon: <Network />,
    themeColor: "var(--viz-lime)",
    themeRGB: "var(--viz-lime-rgb)",
    description: "Equivalence class management.",
    component: (speed: number) => <DSUVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Union-Find Structure" icon={Network}>
            <p>DSU is a data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets. It provides near-constant time operations to add new sets, merge existing sets, and determine whether elements are in the same set.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(α(N))" space="O(N)" />
            <DocSection title="Path Compression" icon={Zap} color="var(--viz-amber)">
              <p>By making every node on the path point directly to the root during a `find` operation, we flatten the tree structure, ensuring subsequent operations are extremely fast.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Find with Compression</h4>
                    <CodeSnippet code={{ "C++": `int find(int i) {\n    if (parent[i] == i)
        return i;
    return parent[i] = find(parent[i]);
}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Union by Rank</h4>
                    <CodeSnippet code={{ "C++": `void unite(int i, int j) {\n    int root_i = find(i);
    int root_j = find(j);
    if (root_i != root_j) {
        if (rank[root_i] < rank[root_j])
            swap(root_i, root_j);
        parent[root_j] = root_i;
        if (rank[root_i] == rank[root_j])
            rank[root_i]++;
    }
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "FIBONACCI",
    title: "Fibonacci Sequence",
    icon: <InfinityIcon />,
    themeColor: "var(--viz-deep-purple)",
    themeRGB: "var(--viz-deep-purple-rgb)",
    description: "DP state memoization.",
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
            <DocSection title="State Transition" icon={GitBranch} color="var(--viz-cyan)">
              <p>We define the state simply as index $i$. The transition is deterministic: $dp[i] = dp[i-1] + dp[i-2]$.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" /> Recursive Memoization</h4>
                    <CodeSnippet code={{ "C++": `int fib(int n, vector<int>& memo) {\n    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KNAPSACK",
    title: "0/1 Knapsack",
    icon: <ShoppingBag />,
    themeColor: "var(--viz-deep-purple)",
    themeRGB: "var(--viz-deep-purple-rgb)",
    description: "Maximizing value under a weight limit.",
    component: (speed: number) => <KnapsackVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="How it Works" icon={Activity} color="var(--viz-deep-purple)">
            <p>The 0/1 Knapsack problem is about choosing a subset of items to maximize total value without exceeding a weight limit. &quot;0/1&quot; means you must either take an item fully or leave it.</p>
            <p>It uses <strong>Dynamic Programming</strong> to build a table where each cell represents the maximum value for a given number of items and weight capacity.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N * W)" space="O(N * W)" />
            <DocSection title="The Decision" icon={Check} color="var(--viz-amber)">
              <p>For each item, we decide: <strong>Is it better to include it or exclude it?</strong> If we include it, we add its value and reduce the remaining capacity. We pick the maximum of these two choices.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Implementation</h4>
                    <CodeSnippet code={{
                      "C++": `int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {
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
}`,
                      "Python": `def knapsack(W, wt, val, n):
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            if wt[i-1] <= w:
                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], 
                               dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][W]`,
                      "Java": `public int knapSack(int W, int[] wt, int[] val, int n) {
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (wt[i - 1] <= w)
                dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], 
                                    dp[i - 1][w]);
            else
                dp[i][w] = dp[i - 1][w];
        }
    }
    return dp[n][W];
}`,
                      "JavaScript": `function knapSack(W, wt, val, n) {
    let dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            if (wt[i - 1] <= w) {
                dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], 
                                    dp[i - 1][w]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}`
                    }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "FLOYD_WARSHALL",
    title: "Floyd-Warshall",
    icon: <Route />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "All-pairs shortest paths.",
    component: (speed: number) => <FloydWarshallVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        {/* New Structured Explanation Section */}
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-deep-purple)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The algorithm operates on a <strong>State-Space Transformation</strong>. It starts with direct edge weights and iteratively relaxes the entire manifold by considering every node as a mandatory &quot;waypoint&quot; (Intermediate Node $k$).
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">01.</span> Map direct connections</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">02.</span> Expand via node $k=0 … N$</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">03.</span> Update global invariants</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Algorithm Output
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The final product is an <strong>All-Pairs Distance Tensor</strong>. Every cell $(i, j)$ in the matrix will contain the absolute minimum cost to travel between those two coordinates, regardless of how many intermediate jumps are required.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[var(--viz-cyan)] text-center">
                            Matrix[i][j] = Shortest(i → j)
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Your Expectations
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            As you execute the visualizer, expect to see the &quot;Relational Wave&quot;. When a cell flashes <strong>Green</strong>, it means a &quot;shortcut&quot; has been discovered through the current intermediate node $k$. The graph edges will thicken to represent the newly optimized path.
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
            <DocSection title="The Relaxation Lemma" icon={Activity} color="var(--viz-cyan)">
              <p>For every pair $(i, j)$, we check if a path going through node $k$ is shorter than the best path found so far:</p>
              <p className="font-mono text-[var(--viz-amber)] bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                $D[i][j] = min(D[i][j], D[i][k] + D[k][j])$
              </p>
              <p className="mt-4">This <strong>Triangle Inequality</strong> check ensures that the manifold converges to the global minimum distance for all pairs.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Tutorial & Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> 1. Initialization</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        Create a matrix `dist` where `dist[i][j]` is the weight of the edge from $i$ to $j$. Set `dist[i][i] = 0` and `dist[i][j] = INF` if no direct edge exists.
                    </p>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-8"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" /> 2. The K-Loop (Crucial)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                        The outermost loop (indexed by $k$) represents the <strong>Intermediate Node</strong>. We are asking: &quot;Can node $k$ improve the path between any $i$ and $j$?&quot; 
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed font-mono mt-2 italic">
                        Note: You must iterate $k$ first. Iterating $i$ or $j$ first will result in an incorrect local optimum.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> 3. Standard C++ Implementation</h4>
                    <CodeSnippet code={{ "C++": `void floydWarshall(int V, vector<vector<int>>& graph) {\n    vector<vector<int>> dist = graph;\n\n    for (int k = 0; k < V; k++) {\n        for (int i = 0; i < V; i++) {\n            for (int j = 0; j < V; j++) {\n                // If i->k and k->j paths exist\n                if (dist[i][k] != INF && dist[k][j] != INF) {\n                    if (dist[i][k] + dist[k][j] < dist[i][j]) {\n                        dist[i][j] = dist[i][k] + dist[k][j];\n                    }\n                }
            }
        }
    }
    // Result: dist[i][j] contains shortest path i to j
}` }} />
                </div>
            </div>

            <div className="mt-12 p-8 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="text-[var(--viz-amber)]" size={20} /> Handling Negative Cycles</h4>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    Floyd-Warshall can detect <strong>Negative Weight Cycles</strong>. If after the algorithm finishes, any diagonal element `dist[i][i]` is less than 0, then a negative cycle exists that passes through node $i$. This is a unique advantage over Dijkstra&apos;s algorithm.
                </p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "SLIDING_WINDOW",
    title: "Sliding Window",
    icon: <BoxSelect />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Efficient range sum processing.",
    component: (speed: number) => <SlidingWindowVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="State Maintenance" icon={Layout}>
            <p>The Sliding Window technique converts nested loop operations into a single linear scan. As the window glides over the data manifold, we update the state incrementally (add new element, remove old) rather than re-computing from scratch.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(1)" />
            <DocSection title="Monotonicity" icon={ArrowDownNarrowWide} color="var(--viz-amber)">
              <p>For dynamic windows, the window expands by moving the right pointer and contracts by moving the left pointer to satisfy constraints, maintaining a valid state at all times.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Dynamic Window</h4>
                    <CodeSnippet code={{ "C++": `int maxSubArrayLen(int target, vector<int>& nums) {\n    int left = 0, curr = 0, ans = 0;
    for (int right = 0; right < nums.size(); right++) {
        curr += nums[right];
        while (curr >= target) {
            ans = min(ans, right - left + 1);
            curr -= nums[left++];
        }
    }
    return ans;
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TOPO_SORT",
    title: "Topological Sort",
    icon: <MoveHorizontal />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "DAG linear ordering.",
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
            <DocSection title="Indegree Lemma" icon={ArrowDownNarrowWide} color="var(--viz-amber)">
              <p>In Kahn&apos;s Algorithm, nodes with 0 indegree have no dependencies and can be processed immediately. Removing them potentially frees up their neighbors.</p>
            </DocSection>
          </div>
        </div>
        
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Cpu size={14} className="text-[var(--viz-deep-purple)]" />Implementation Guide</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" /> Kahn&apos;s Algorithm (BFS)</h4>
                    <CodeSnippet code={{ "C++": `vector<int> kahn(int V, vector<vector<int>>& adj) {\n    vector<int> indegree(V, 0);
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
}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "N_QUEENS",
    title: "N-Queens Protocol",
    icon: <Crown />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Backtracking search manifold.",
    component: (speed: number) => <NQueensVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The algorithm utilizes <strong>Backtracking (DFS)</strong> to explore the state space. It attempts to place queens column-by-column, ensuring no two queens attack each other.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[var(--viz-cyan)]">01.</span> Position row-by-row</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-cyan)]">02.</span> Validate safety constraints</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-cyan)]">03.</span> Backtrack on conflict</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Safety Invariants
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            For every placement $(r, c)$, the algorithm verifies three invariants: the horizontal row, the upper diagonal, and the lower diagonal.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[var(--viz-deep-purple)] text-center">
                            No shared Row | Diag1 | Diag2
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
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
          <DocSection title="Placement Rules" icon={Crown} color="var(--viz-amber)">
            <p>The N-Queens problem asks us to place N queens on an N×N chessboard so that no two queens can attack each other.</p>
            <p>This means no two queens can be in the same <strong>row</strong>, <strong>column</strong>, or <strong>diagonal</strong>. It&apos;s a classic example of using backtracking to explore possible solutions efficiently.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N!)" space="O(N)" />
            <DocSection title="Recursive Branching" icon={RotateCcw} color="var(--viz-rose)">
              <p>We place queens one by one in different columns. For each column, we try all rows. If a placement is safe, we move to the next column. If we get stuck, we <strong>backtrack</strong> and try a different row in the previous column.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> isSafe Utility</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This function checks the three primary attack vectors: the row to the left, and both upper/lower left diagonals.
                    </p>
                    <CodeSnippet code={{ "C++": `bool isSafe(int row, int col, vector<string>& board, int n) {\n    // Row check\n    for (int i = 0; i < col; i++)\n        if (board[row][i] == 'Q') return false;\n\n    // Upper diagonal\n    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--)\n        if (board[i][j] == 'Q') return false;\n\n    // Lower diagonal\n    for (int i = row, j = col; i < n && j >= 0; i++, j++)\n        if (board[i][j] == 'Q') return false;\n\n    return true;\n}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Core Recursive Solver</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The solver iterates through every row in the current column, attempting a placement and recursing.
                    </p>
                    <CodeSnippet code={{ "C++": `void solve(int col, vector<string>& board, vector<vector<string>>& ans, int n) {\n    if (col == n) {\n        ans.push_back(board);\n        return;\n    }\n    for (int row = 0; row < n; row++) {\n        if (isSafe(row, col, board, n)) {\n            board[row][col] = 'Q';\n            solve(col + 1, board, ans, n);\n            board[row][col] = '.'; // Backtrack\n        }\n    }\n}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TREE_TRAVERSAL",
    title: "Tree Traversal",
    icon: <ListTree />,
    themeColor: "var(--viz-lavender)",
    themeRGB: "var(--viz-lavender-rgb)",
    description: "BFS and DFS unit traversal.",
    component: (speed: number) => <TreeTraversalVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Pre-Order (Root-L-R)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process the current node before its sub-manifolds. Ideal for <strong>Topology Duplication</strong> or serializing a tree structure for storage.
                        </p>
                        <div className="p-3 bg-[var(--viz-cyan)]/5 rounded-xl border border-[var(--viz-cyan)]/20 font-mono text-[10px] text-[var(--viz-cyan)] text-center">
                            Process → Left → Right
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            In-Order (L-Root-R)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process nodes in non-decreasing order for <strong>BST Manifolds</strong>. Essential for validating BST properties and range queries.
                        </p>
                        <div className="p-3 bg-[var(--viz-deep-purple)]/5 rounded-xl border border-[var(--viz-deep-purple)]/20 font-mono text-[10px] text-[var(--viz-deep-purple)] text-center">
                            Left → Process → Right
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-rose)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" />
                            Post-Order (L-R-Root)
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Process sub-manifolds before the parent. Required for <strong>Space Deallocation</strong> (bottom-up deletion) and expression evaluation.
                        </p>
                        <div className="p-3 bg-[var(--viz-rose)]/5 rounded-xl border border-[var(--viz-rose)]/20 font-mono text-[10px] text-[var(--viz-rose)] text-center">
                            Left → Right → Process
                        </div>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Recursive Lemma" icon={Zap} color="var(--viz-deep-purple)">
            <p>Every traversal is a specific mapping of a 2D hierarchical manifold into a 1D sequence. The <strong>Recursive Depth</strong> ensures that the entire state space is explored by following the pointer hierarchy.</p>
            <p>While DFS variations (Pre/In/Post) follow the stack-based depth plunge, <strong>BFS (Level-Order)</strong> explores the manifold layered by their geodesic distance from the root.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(H)" />
            <DocSection title="The Visit Standard" icon={Activity} color="var(--viz-amber)">
              <p>In all 3 traversals, every node is visited exactly once. The complexity remains $O(N)$ regardless of the order. The spatial bound $O(H)$ fluctuates based on tree balance ($log N$ to $N$).</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />Implementation Matrix</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> Pre-Order</h4>
                    <CodeSnippet code={{ "C++": `void preOrder(Node* root) {\n    if (!root) return;\n    cout << root->val << " ";\n    preOrder(root->left);\n    preOrder(root->right);\n}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> In-Order</h4>
                    <CodeSnippet code={{ "C++": `void inOrder(Node* root) {\n    if (!root) return;\n    inOrder(root->left);\n    cout << root->val << " ";\n    inOrder(root->right);\n}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" /> Post-Order</h4>
                    <CodeSnippet code={{ "C++": `void postOrder(Node* root) {\n    if (!root) return;\n    postOrder(root->left);\n    postOrder(root->right);\n    cout << root->val << " ";\n}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "KADANE",
    title: "Kadane's Lemma",
    icon: <TrendingUp />,
    themeColor: "var(--viz-deep-purple)",
    themeRGB: "var(--viz-deep-purple-rgb)",
    description: "Maximum subarray sum manifold.",
    component: (speed: number) => <KadaneVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-deep-purple)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Kadane&apos;s algorithm utilizes a <strong>Local Optimization</strong> strategy. At each index $i$, it decides whether to extend the existing subarray or start a new one from $i$.
                        </p>
                        <ul className="text-[10px] space-y-2 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">01.</span> Accumulate current sum</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">02.</span> Update global maximum</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-deep-purple)]">03.</span> Reset if sum {"<"} 0</li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            The DP Invariant
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The state $dp[i]$ represents the maximum subarray sum ending at index $i$. The recurrence is: $dp[i] = max(A[i], A[i] + dp[i-1])$.
                        </p>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border font-mono text-[10px] text-[var(--viz-cyan)] text-center">
                            Local[i] = max(A[i], Local[i-1] + A[i])
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Asymptotic Bound
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Kadane&apos;s algorithm reduces the combinatorial space from $O(N^2)$ contiguous subarrays to a single $O(N)$ pass, achieving optimal linear efficiency.
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--viz-amber)] uppercase tracking-widest bg-[var(--viz-amber)]/5 p-2 rounded-lg border border-[var(--viz-amber)]/20">
                            <Activity size={12} /> Temporal: O(N)
                        </div>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="The Greedy Choice" icon={Target} color="var(--viz-amber)">
            <p>The core insight of Kadane&apos;s algorithm is that if a prefix has a negative sum, it can never be part of a maximum subarray starting at a later index.</p>
            <p>By &quot;dropping&quot; the current sum when it falls below zero, we effectively prune the search space and maintain a linear time complexity manifold.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(1)" />
            <DocSection title="Convergence Lemma" icon={Zap} color="var(--viz-deep-purple)">
              <p>Because we only make a single pass over the array and use two scalar variables, the algorithm is both temporally and spatially optimal for this manifold. It transforms a local decision into a global guarantee.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />Manifold Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" /> Standard Approach</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Iterate through the array, maintaining `curr` (local potential) and `best` (global optimum). If the potential collapses below zero, we restart from the next manifold cell.
                    </p>
                    <CodeSnippet code={{ "C++": `long long maxSubarraySum(int arr[], int n) {\n    long long best = -1e18, curr = 0;\n\n    for (int i = 0; i < n; i++) {\n        curr += arr[i];\n\n        if (curr > best) \n            best = curr;\n\n        if (curr < 0) \n            curr = 0;\n    }\n    return best;\n}` }} />
                </div>
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" /> DP Variation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This variation handles cases where all elements are negative by explicitly choosing between the current element and the sum of the current element plus the previous local optimum.
                    </p>
                    <CodeSnippet code={{ "C++": `int maxSubarraySum(vector<int>& nums) {\n    int best = nums[0];\n    int curr = nums[0];\n\n    for (int i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        best = max(best, curr);\n    }\n    return best;\n}` }} />
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "LCS",
    title: "Longest Common Subsequence",
    icon: <Type />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Multi-sequence alignment manifold.",
    component: (speed: number) => <LCSVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            LCS finds the longest sequence that appears in both strings in the same relative order. It uses a 2D DP table where $dp[i][j]$ is the LCS of $S1[0..i-1]$ and $S2[0..j-1]$.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Match Strategy
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            When characters match, we extend the LCS found excluding both characters: $1 + dp[i-1][j-1]$.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-purple)]" />
                            Mismatch Strategy
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            On mismatch, we take the maximum from excluding either character: $max(dp[i-1][j], dp[i][j-1])$.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Optimal Substructure" icon={Database}>
            <p>LCS is fundamental for file comparison (diff), bioinformatics (DNA alignment), and version control systems.</p>
            <p>It demonstrates how a complex global alignment can be built from local character-by-character decisions.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(M * N)" space="O(M * N)" />
            <DocSection title="State Transition" icon={GitBranch} color="var(--viz-amber)">
              <p className="font-mono text-xs">
                if S1[i-1] == S2[j-1]:<br/>
                &nbsp;&nbsp;dp[i][j] = 1 + dp[i-1][j-1]<br/>
                else:<br/>
                &nbsp;&nbsp;dp[i][j] = max(dp[i-1][j], dp[i][j-1])
              </p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `int lcs(string s1, string s2) {\n    int m = s1.size(), n = s2.size();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (s1[i-1] == s2[j-1])\n                dp[i][j] = 1 + dp[i-1][j-1];\n            else\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    return dp[m][n];\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "LIS",
    title: "Longest Increasing Subsequence",
    icon: <TrendingUp />,
    themeColor: "var(--viz-deep-purple)",
    themeRGB: "var(--viz-deep-purple-rgb)",
    description: "Monotonic sequence optimization.",
    component: (speed: number) => <LISVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-deep-purple)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            LIS finds the longest subsequence where elements are in strictly increasing order. For each element $i$, we look back at all previous elements $j &lt; i$ to see which one can extend the subsequence the most.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            State Definition
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            $dp[i]$ is the length of the LIS ending exactly at index $i$. Initially, $dp[i] = 1$ for all $i$.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Transition Lemma
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            $dp[i] = 1 + max(dp[j])$ for all $j &lt; i$ where $A[j] &lt; A[i]$. If no such $j$ exists, $dp[i] = 1$.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Sequential Dependency" icon={Database}>
            <p>LIS is a classic DP problem that illustrates how to build a global optimum by referencing multiple previous states, unlike Kadane which only looks at the immediate predecessor.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N²)" space="O(N)" />
            <DocSection title="Optimal Solution" icon={Zap} color="var(--viz-rose)">
              <p>While the standard DP is $O(N^2)$, LIS can be solved in $O(N log N)$ using a combination of Binary Search and a dynamic array (Patient Sorting).</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `int lis(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> dp(n, 1);\n    int maxLIS = 1;\n\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < i; j++) {\n            if (nums[j] < nums[i])\n                dp[i] = max(dp[i], dp[j] + 1);\n        }\n        maxLIS = max(maxLIS, dp[i]);\n    }\n    return maxLIS;\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "EDIT_DISTANCE",
    title: "Edit Distance",
    icon: <Type />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Levenshtein transformation manifold.",
    component: (speed: number) => <EditDistanceVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Operational Logic
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Edit Distance measures how many operations (Insert, Delete, Replace) are needed to transform one string into another. It builds a global solution from 3 possible local edits.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            The 3 Edits
                        </h5>
                        <ul className="text-[10px] space-y-1 font-mono text-muted-foreground list-none">
                            <li className="flex gap-2"><span className="text-[var(--viz-cyan)]">Insert:</span> Inherit from Left + 1</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-rose)]">Delete:</span> Inherit from Top + 1</li>
                            <li className="flex gap-2"><span className="text-[var(--viz-amber)]">Replace:</span> Inherit from Diagonal + 1</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Match Invariant
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            If characters match, no cost is added. We inherit the diagonal value directly: $dp[i][j] = dp[i-1][j-1]$.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Similarity Metric" icon={Database}>
            <p>Levenshtein distance is the industry standard for fuzzy search, spell checking, and measuring DNA similarity.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(M * N)" space="O(M * N)" />
            <DocSection title="State Transition" icon={GitBranch} color="var(--viz-amber)">
              <p className="font-mono text-[10px]">
                if S1[i-1] == S2[j-1]:<br/>
                &nbsp;&nbsp;dp[i][j] = dp[i-1][j-1]<br/>
                else:<br/>
                &nbsp;&nbsp;dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
              </p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `int minDistance(string word1, string word2) {\n    int m = word1.size(), n = word2.size();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1));\n    for (int i = 0; i <= m; i++) dp[i][0] = i;\n    for (int j = 0; j <= n; j++) dp[0][j] = j;\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (word1[i-1] == word2[j-1])\n                dp[i][j] = dp[i-1][j-1];\n            else\n                dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});\n        }\n    }\n    return dp[m][n];\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "SCC",
    title: "Kosaraju's SCC",
    icon: <Share2 />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Strongly Connected Components.",
    component: (speed: number) => <SCCVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-rose)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-rose)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" />
                            Pass 1: Finishing Time
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Run DFS on the original graph. Push nodes to a stack based on their finishing times. This captures the topological order of the condensation graph.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Pass 2: Transpose
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Reverse all edges in the graph. This doesn&apos;t change the SCCs but prevents DFS from &quot;leaking&quot; into other components.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Pass 3: Component DFS
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Pop from stack and run DFS on reversed graph. Each DFS traversal identifies one Strongly Connected Component.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Connectivity Theory" icon={Network}>
            <p>A Strongly Connected Component is a maximal sub-graph where every node is reachable from every other node in that sub-graph.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <DocSection title="Why Two Passes?" icon={Zap} color="var(--viz-amber)">
              <p>The first pass sorts nodes by their &quot;sink&quot; potential. The second pass (on the reverse graph) ensures that DFS can only stay within an SCC because the escape edges to other components are now pointing inwards.</p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `void dfs1(int u, vector<int> adj[], vector<bool>& vis, stack<int>& st) {\n    vis[u] = true;\n    for(int v : adj[u]) if(!vis[v]) dfs1(v, adj, vis, st);\n    st.push(u);\n}\n\nvoid dfs2(int u, vector<int> rev[], vector<bool>& vis) {\n    vis[u] = true;\n    for(int v : rev[u]) if(!vis[v]) dfs2(v, rev, vis);\n}\n\nvoid kosaraju(int V, vector<int> adj[]) {\n    stack<int> st; vector<bool> vis(V, false);\n    for(int i=0; i<V; i++) if(!vis[i]) dfs1(i, adj, vis, st);\n    \n    vector<int> rev[V];\n    for(int u=0; u<V; u++) for(int v : adj[u]) rev[v].push_back(u);\n    \n    fill(vis.begin(), vis.end(), false);\n    while(!st.empty()) {\n        int u = st.top(); st.pop();\n        if(!vis[u]) { dfs2(u, rev, vis); /* Found SCC */ }\n    }\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "LCA",
    title: "Lowest Common Ancestor",
    icon: <GitBranch />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Hierarchical path convergence.",
    component: (speed: number) => <LCAVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Hierarchical Search
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            LCA identifies the deepest node that is an ancestor to both targets. In our visualizer, we trace paths from root to targets and find their last shared junction.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Path Matching
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            By comparing root-to-node paths, the LCA is the point where the paths diverge. 
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Binary Lifting
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            While this visualizer uses path tracing, production CP uses <strong>Binary Lifting</strong> for $O(log N)$ queries after $O(N log N)$ preprocessing.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Tree Distance Metric" icon={Database}>
            <p>LCA is vital for calculating the distance between two nodes: $Dist(u, v) = Depth(u) + Depth(v) - 2 \cdot Depth(LCA(u, v))$.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N) or O(log N)" space="O(N)" />
            <DocSection title="State Transition" icon={GitBranch} color="var(--viz-amber)">
              <p className="font-mono text-[10px]">
                Path(u) = [root, ..., LCA, ..., u]<br/>
                Path(v) = [root, ..., LCA, ..., v]<br/>
                LCA = Last index where Path(u)[i] == Path(v)[i]
              </p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                <CodeSnippet code={{
                  "C++": `Node* findLCA(Node* root, int n1, int n2) {
    if (!root) return nullptr;
    if (root->data == n1 || root->data == n2) return root;

    Node* left = findLCA(root->left, n1, n2);
    Node* right = findLCA(root->right, n1, n2);

    if (left && right) return root;
    return (left != nullptr) ? left : right;
}`,
                  "Python": `def findLCA(root, n1, n2):
    if not root: return None
    if root.data == n1 or root.data == n2: return root

    left = findLCA(root.left, n1, n2)
    right = findLCA(root.right, n1, n2)

    if left and right: return root
    return left if left else right`,
                  "Java": `public Node findLCA(Node root, int n1, int n2) {
    if (root == null) return null;
    if (root.data == n1 || root.data == n2) return root;

    Node left = findLCA(root.left, n1, n2);
    Node right = findLCA(root.right, n1, n2);

    if (left != null && right != null) return root;
    return (left != null) ? left : right;
}`,
                  "JavaScript": `function findLCA(root, n1, n2) {
    if (!root) return null;
    if (root.data === n1 || root.data === n2) return root;

    const left = findLCA(root.left, n1, n2);
    const right = findLCA(root.right, n1, n2);

    if (left && right) return root;
    return left ? left : right;
}`
                }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "FENWICK",
    title: "Fenwick Tree (BIT)",
    icon: <LayoutGrid />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Efficient range sum management.",
    component: (speed: number) => <FenwickTreeVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-amber)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Binary Structure
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Fenwick trees use the binary representation of indices to store partial sums. Each node $i$ stores the sum of a range whose length is the Least Significant Bit (LSB) of $i$.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            LSB Trick
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            The operation <code>i & -i</code> extracts the lowest set bit, which dictates the parent/child navigation in the tree structure.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-rose)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" />
                            Prefix Power
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Querying the prefix sum up to $i$ takes $O(log N)$ by jumping back using the LSB. Updates work similarly by jumping forward.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Memory Efficiency" icon={Database}>
            <p>Unlike Segment Trees which require $4N$ space, Fenwick Trees use exactly $N+1$ space. They are the standard for 1D range queries in CP.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N)" space="O(N)" />
            <DocSection title="Update Transition" icon={Zap} color="var(--viz-amber)">
              <p className="font-mono text-[10px]">
                void update(int i, int val):<br/>
                &nbsp;&nbsp;for (; i {"<="} n; i += i & -i)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;bit[i] += val;
              </p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `void update(int i, int delta) {\n    for (; i <= n; i += i & -i)\n        bit[i] += delta;\n}\n\nint query(int i) {\n    int sum = 0;\n    for (; i > 0; i -= i & -i)\n        sum += bit[i];\n    return sum;\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "TARJAN",
    title: "Tarjan's (Bridges/AP)",
    icon: <AlertTriangle />,
    themeColor: "var(--viz-rose)",
    themeRGB: "var(--viz-rose-rgb)",
    description: "Graph connectivity protocol.",
    component: (speed: number) => <TarjanVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-rose)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-rose)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" />
                            Discovery Time
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            We track the order in which nodes are visited (<code>tin</code>). This creates a temporal baseline for the graph traversal.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Low-Link Value
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            <code>low[u]</code> is the smallest <code>tin</code> reachable from <code>u</code> in the DFS tree using back-edges.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Connectivity Check
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            If a neighbor $v$ cannot reach $u$ or any ancestor ($low[v] {" > "} tin[u]$), then the edge $u-v$ is a <strong>Bridge</strong>.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Network Criticality" icon={Network}>
            <p>Tarjan&apos;s algorithm identifies Articulation Points and Bridges in a single DFS pass. These are critical components whose failure would partition the network.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(V + E)" space="O(V)" />
            <DocSection title="AP Condition" icon={Zap} color="var(--viz-amber)">
              <p className="font-mono text-[10px]">
                {"// For non-root node u:"}<br/>
                if (any child v has low[v] {" >= "} tin[u])<br/>
                &nbsp;&nbsp;u is an Articulation Point
              </p>
            </DocSection>
          </div>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-border" />
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3"><Terminal size={14} className="text-[var(--viz-deep-purple)]" />C++ Implementation</h3>
                <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CodeSnippet code={{ "C++": `void dfs(int u, int p = -1) {\n    vis[u] = true;\n    tin[u] = low[u] = timer++;\n    for (int v : adj[u]) {\n        if (v == p) continue;\n        if (vis[v]) low[u] = min(low[u], tin[v]);\n        else {\n            dfs(v, u);\n            low[u] = min(low[u], low[v]);\n            if (low[v] > tin[u]) bridges.push_back({u, v});\n        }\n    }\n}` }} />
            </div>
        </div>
      </div>
    )
  },
  {
    id: "BITMASK_DP",
    title: "Bitmask DP",
    icon: <Binary />,
    themeColor: "var(--viz-purple)",
    themeRGB: "var(--viz-purple-rgb)",
    description: "Exponential state mapping.",
    component: (speed: number) => <BitmaskDPVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="The State-Space Challenge" icon={Database}>
            <p>Bitmask DP is used when we need to track a <strong>subset</strong> of items we&apos;ve already used or visited. Instead of an array, we use the bits of an integer as a compact &quot;checklist&quot;.</p>
            <p>This allows us to solve problems that would otherwise require $O(N!)$ permutations in $O(2^N \cdot N^k)$ time, making it the standard for NP-Hard problems like TSP on small datasets.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(2^N * N²)" space="O(2^N * N)" />
            <DocSection title="Bitwise Toolkit" icon={Zap} color="var(--viz-purple)">
              <ul className="space-y-2 list-none text-[10px] font-mono">
                <li><span className="text-[var(--viz-rose)]">Check:</span> <code>(mask {">>"} i) & 1</code></li>
                <li><span className="text-[var(--viz-cyan)]">Add:</span> <code>mask | (1 {"<<"} i)</code></li>
                <li><span className="text-[var(--viz-amber)]">Size:</span> <code>__builtin_popcount(mask)</code></li>
              </ul>
            </DocSection>
          </div>
        </div>

        <DocSection title="Practice Problems" icon={Hash} color="var(--viz-purple)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a href="https://cses.fi/problemset/task/1690" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Hamiltonian Flights</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-purple)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Count the number of ways to visit every city exactly once. Classic TSP variation.</p>
            </a>
            <a href="https://cses.fi/problemset/task/1653" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Elevator Ride</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-purple)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Pack people into minimum elevator trips. Tests your subset transition logic.</p>
            </a>
          </div>
        </DocSection>
      </div>
    ),
    codeImplementations: {
      "C++ (TSP)": `int n, dist[20][20];
    int dp[1 << 20][20];

    int solve(int mask, int u) {
    if (mask == (1 << n) - 1) return 0; // All visited
    if (dp[mask][u] != -1) return dp[mask][u];

    int res = 1e9;
    for (int v = 0; v < n; v++) {
        // If v is not visited (bit v is 0)
        if (!((mask >> v) & 1)) {
            res = min(res, dist[u][v] + solve(mask | (1 << v), v));
        }
    }
    return dp[mask][u] = res;
    }`,
      "Python (TSP)": `def solve(mask, u):
    if mask == (1 << n) - 1:
        return 0
    if (mask, u) in memo:
        return memo[(mask, u)]

    res = float('inf')
    for v in range(n):
        if not (mask & (1 << v)):
            res = min(res, dist[u][v] + solve(mask | (1 << v), v))

    memo[(mask, u)] = res
    return res`,
      "Java (TSP)": `int solve(int mask, int u) {
    if (mask == (1 << n) - 1) return 0;
    if (dp[mask][u] != -1) return dp[mask][u];

    int res = (int)1e9;
    for (int v = 0; v < n; v++) {
        if (((mask >> v) & 1) == 0) {
            res = Math.min(res, dist[u][v] + solve(mask | (1 << v), v));
        }
    }
    return dp[mask][u] = res;
    }`
    }
    },  {
    id: "SIEVE",
    title: "Sieve of Eratosthenes",
    icon: <Binary />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "Prime number extraction.",
    component: (speed: number) => <SieveVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Prime Discovery
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Starting from 2, if a number is still marked as prime, it is truly prime. We then eliminate all its multiples.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Iterative Elimination
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            For a prime $p$, we start marking from $p^2$, $p^2+p$, $p^2+2p$, and so on as composite.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Upper Bound
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {"We only need to iterate $p$ up to $\\sqrt{N}$ to eliminate all composite numbers."}
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Number Theory" icon={Database}>
            <p>{"Sieve is the most efficient way to precompute primes for multiple queries. It transforms $O(N\\sqrt{N})$ primality testing into $O(N log log N)$."}</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N log log N)" space="O(N)" />
            <DocSection title="Elimination Logic" icon={Zap} color="var(--viz-rose)">
              <p className="font-mono text-[10px]">
                if (isPrime[p]):<br/>
                &nbsp;&nbsp;for (int i = p*p; i {" <= "} n; i += p)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;isPrime[i] = false;
              </p>
            </DocSection>
          </div>
        </div>
      </div>
    ),
    codeImplementations: {
      "C++": `vector<bool> sieve(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;
    for (int p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (int i = p * p; i <= n; i += p)
                isPrime[i] = false;
        }
    }
    return isPrime;
}`,
      "Python": `def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for p in range(2, int(n**0.5) + 1):
        if is_prime[p]:
            for i in range(p * p, n + 1, p):
                is_prime[i] = False
    return is_prime`,
      "Java": `public boolean[] sieve(int n) {
    boolean[] isPrime = new boolean[n + 1];
    Arrays.fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    for (int p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (int i = p * p; i <= n; i += p)
                isPrime[i] = false;
        }
    }
    return isPrime;
}`,
      "JavaScript": `function sieve(n) {
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (let i = p * p; i <= n; i += p)
                isPrime[i] = false;
        }
    }
    return isPrime;
}`
    }
  },
  {
    id: "DIGIT_DP",
    title: "Digit DP",
    icon: <Hash />,
    themeColor: "var(--viz-amber)",
    themeRGB: "var(--viz-amber-rgb)",
    description: "Range counting protocol.",
    component: (speed: number) => <DigitDPVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-amber)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            Positional State
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            We process the number digit by digit from left to right. The state is usually <code>(index, tight_constraint, running_property)</code>.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Tight Constraint
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            A boolean flag that tracks if we are restricted by the digits of the upper bound $N$. If <code>tight</code> is true, current digit can&apos;t exceed $N[i]$.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-rose)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-rose)]" />
                            Memoization
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            We cache results for each state, collapsing the search from $O(N)$ to $O(log N \cdot properties)$.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Numerical Analysis" icon={Database}>
            <p>Digit DP is the standard protocol for counting integers in a range $[L, R]$ that satisfy a specific digit-based property (e.g., sum of digits, prime frequency, or non-adjacent matches).</p>
            <p>It transforms a massive $O(R)$ search space into a logarithmic $O(\log R)$ state space by processing digits positionally.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N * States)" space="O(log N * States)" />
            <DocSection title="The Tight Invariant" icon={Zap} color="var(--viz-amber)">
              <p className="text-[10px] leading-relaxed">
                If <code>tight</code> is true, we are restricted by the prefix of $N$. The next digit $d$ must be $\leq N[idx]$. If we pick $d {"<"} N[idx]$, <code>tight</code> becomes false for all subsequent positions, granting us &quot;free range&quot; $[0, 9]$.
              </p>
            </DocSection>
          </div>
        </div>

        <DocSection title="Practice Problems" icon={Hash} color="var(--viz-amber)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a href="https://cses.fi/problemset/task/2220" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Counting Numbers</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-amber)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Count numbers where no two adjacent digits are the same. A classic CSES Digit DP task.</p>
            </a>
            <a href="https://leetcode.com/problems/numbers-at-most-n-given-digit-set/" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Numbers At Most N</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-amber)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Construct numbers using a specific subset of digits. Excellent for practicing tight constraints.</p>
            </a>
          </div>
        </DocSection>
      </div>
    ),
    codeImplementations: {
      "C++": `long long dp[20][2][200];
long long solve(string& s, int idx, bool tight, int sum) {
    if (idx == s.size()) return sum == target;
    if (dp[idx][tight][sum] != -1) return dp[idx][tight][sum];

    long long res = 0;
    int limit = tight ? (s[idx] - '0') : 9;
    for (int d = 0; d <= limit; d++) {
        res += solve(s, idx + 1, tight && (d == limit), sum + d);
    }
    return dp[idx][tight][sum] = res;
}`,
      "Python": `def solve(s, idx, tight, current_sum):
    if idx == len(s):
        return 1 if current_sum == target else 0
    state = (idx, tight, current_sum)
    if state in memo: return memo[state]

    res = 0
    limit = int(s[idx]) if tight else 9
    for d in range(limit + 1):
        res += solve(s, idx + 1, tight and (d == limit), current_sum + d)
    
    memo[state] = res
    return res`,
      "Java": `long[][][] dp;
long solve(String s, int idx, boolean tight, int sum) {
    if (idx == s.length()) return sum == target ? 1 : 0;
    int t = tight ? 1 : 0;
    if (dp[idx][t][sum] != -1) return dp[idx][t][sum];

    long res = 0;
    int limit = tight ? (s.charAt(idx) - '0') : 9;
    for (int d = 0; d <= limit; d++) {
        res += solve(s, idx + 1, tight && (d == limit), sum + d);
    }
    return dp[idx][t][sum] = res;
}`,
      "JavaScript": `function solve(s, idx, tight, sum) {
    if (idx === s.length) return sum === target ? 1 : 0;
    const key = \`\${idx}-\${tight}-\${sum}\`;
    if (memo.has(key)) return memo.get(key);

    let res = 0;
    const limit = tight ? parseInt(s[idx]) : 9;
    for (let d = 0; d <= limit; d++) {
        res += solve(s, idx + 1, tight && (d === limit), sum + d);
    }
    memo.set(key, res);
    return res;
}`
    }
  },
  {
    id: "SPARSE_TABLE",
    title: "Sparse Table",
    icon: <Layers />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "O(1) Range Minimum Queries.",
    component: (speed: number) => <SparseTableVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-8">
            <DocSection title="Algorithmic Blueprint" icon={Layers} color="var(--viz-cyan)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-cyan)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-cyan)]" />
                            Doubling Concept
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            We precompute answers for all ranges of length $2^k$. This allows us to represent any range length as a sum of powers of 2.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-deep-purple)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-deep-purple)]" />
                            Idempotent Query
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            For RMQ, we can cover $[L, R]$ with two overlapping ranges of length $2^j$. Since $min(x, x) = x$, overlap doesn&apos;t hurt.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[var(--viz-amber)] font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--viz-amber)]" />
                            O(1) Speed
                        </h5>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Because only two table lookups are needed, queries are constant time, making it faster than Segment Trees for static data.
                        </p>
                    </div>
                </div>
            </DocSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="Static Range Power" icon={Database}>
            <p>Sparse Tables are elite for <strong>Static RMQ</strong> and <strong>LCA</strong> (via Euler Tour). Unlike Segment Trees, they do not support updates, but they offer true $O(1)$ query time after an $O(N \log N)$ precomputation.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(1) Query" space="O(N log N)" />
            <DocSection title="Build Recurrence" icon={Zap} color="var(--viz-amber)">
              <p className="font-mono text-[10px]">
                st[j][i] = min(<br/>
                &nbsp;&nbsp;st[j-1][i], <br/>
                &nbsp;&nbsp;st[j-1][i + (1 {" << "} (j-1))]<br/>
                )
              </p>
            </DocSection>
          </div>
        </div>

        <DocSection title="Practice Problems" icon={Hash} color="var(--viz-cyan)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a href="https://cses.fi/problemset/task/1647" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Static Range Minimum Queries</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-cyan)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Standard RMQ on a static array. Perfect for Sparse Table implementation.</p>
            </a>
            <a href="https://codeforces.com/contest/1547/problem/F" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Array Stabilization (GCD)</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-cyan)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Advanced application: Sparse Table for Range GCD queries.</p>
            </a>
          </div>
        </DocSection>
      </div>
    ),
    codeImplementations: {
      "C++": `void build(int n, int arr[]) {
    for (int i = 0; i < n; i++) st[0][i] = arr[i];
    for (int j = 1; j <= K; j++)
        for (int i = 0; i + (1 << j) <= n; i++)
            st[j][i] = min(st[j-1][i], st[j-1][i + (1 << (j-1))]);
}

int query(int L, int R) {
    int j = log2_floor[R - L + 1];
    return min(st[j][L], st[j][R - (1 << j) + 1]);
}`,
      "Python": `def build(n, arr):
    st = [[0] * n for _ in range(K + 1)]
    st[0] = arr[:]
    for j in range(1, K + 1):
        for i in range(n - (1 << j) + 1):
            st[j][i] = min(st[j-1][i], st[j-1][i + (1 << (j-1))])
    return st

def query(st, L, R):
    j = (R - L + 1).bit_length() - 1
    return min(st[j][L], st[j][R - (1 << j) + 1])`,
      "Java": `void build(int n, int[] arr) {
    for (int i = 0; i < n; i++) st[0][i] = arr[i];
    for (int j = 1; j <= K; j++) {
        for (int i = 0; i + (1 << j) <= n; i++) {
            st[j][i] = Math.min(st[j-1][i], st[j-1][i + (1 << (j-1))]);
        }
    }
}

int query(int L, int R) {
    int j = log[R - L + 1];
    return Math.min(st[j][L], st[j][R - (1 << j) + 1]);
}`,
      "JavaScript": `function build(n, arr) {
    const st = Array.from({ length: K + 1 }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) st[0][i] = arr[i];
    for (let j = 1; j <= K; j++) {
        for (let i = 0; i + (1 << j) <= n; i++) {
            st[j][i] = Math.min(st[j-1][i], st[j-1][i + (1 << (j-1))]);
        }
    }
    return st;
}

function query(st, L, R) {
    const j = Math.floor(Math.log2(R - L + 1));
    return Math.min(st[j][L], st[j][R - (1 << j) + 1]);
}`
    }
  },
  {
    id: "REROOTING",
    title: "Tree Rerooting",
    icon: <RefreshCw />,
    themeColor: "var(--viz-purple)",
    themeRGB: "var(--viz-purple-rgb)",
    description: "Global tree DP in O(N).",
    component: (speed: number) => <RerootingVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="The Rerooting Concept" icon={Activity} color="var(--viz-purple)">
            <p>Tree Rerooting DP (or All-Root DP) is a powerful technique to compute an answer for <strong>every node</strong> as a potential root in $O(N)$ time.</p>
            <p>A naive approach would take $O(N^2)$ by running a full DFS from every node. Rerooting uses two passes to reuse results: one to aggregate subtree data, and another to propagate global data down from parents.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(N)" space="O(N)" />
            <DocSection title="The Two Passes" icon={Layers} color="var(--viz-cyan)">
              <ul className="space-y-2 list-none text-xs">
                <li><strong className="text-[var(--viz-cyan)]">1. Bottom-Up:</strong> Aggregate subtree information (e.g., sum of distances) for a fixed root.</li>
                <li><strong className="text-[var(--viz-rose)]">2. Top-Down:</strong> Transition the root from parent $u$ to child $v$ by adjusting the aggregated values.</li>
              </ul>
            </DocSection>
          </div>
        </div>

        <DocSection title="Practice Problems" icon={Hash} color="var(--viz-purple)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a href="https://cses.fi/problemset/task/1132" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Tree Distances I</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-purple)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Compute the maximum distance to any other node for every node.</p>
            </a>
            <a href="https://cses.fi/problemset/task/1133" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Tree Distances II</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-purple)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Compute the sum of distances to all other nodes for every node.</p>
            </a>
          </div>
        </DocSection>
      </div>
    ),
    codeImplementations: {
      "DFS (C++)": `// Pass 1: Compute subtree sizes and distance sums
void dfs1(int u, int p) {
    sz[u] = 1; dist[u] = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs1(v, u);
        sz[u] += sz[v];
        dist[u] += dist[v] + sz[v];
    }
}

// Pass 2: Reroot to compute global answers
void dfs2(int u, int p) {
    ans[u] = dist[u]; // Start with current aggregate
    for (int v : adj[u]) {
        if (v == p) continue;
        
        // Save current values
        long long old_u_dist = dist[u], old_u_sz = sz[u];
        long long old_v_dist = dist[v], old_v_sz = sz[v];

        // Reroot u -> v:
        // 1. Detach v from u
        dist[u] -= (dist[v] + sz[v]);
        sz[u] -= sz[v];
        // 2. Attach u to v
        sz[v] += sz[u];
        dist[v] += (dist[u] + sz[u]);

        dfs2(v, u);

        // Backtrack
        dist[u] = old_u_dist; sz[u] = old_u_sz;
        dist[v] = old_v_dist; sz[v] = old_v_sz;
    }
}`,
      "BFS (C++)": `// Iterative Rerooting (Avoids Recursion Depth)
void iterativeRerooting(int n) {
    vector<int> order;
    queue<int> q;
    q.push(1);
    parent[1] = 0;
    while(!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for(int v : adj[u]) {
            if(v != parent[u]) {
                parent[v] = u;
                q.push(v);
            }
        }
    }

    // Pass 1: Bottom-up (Reversed BFS order)
    for(int i = n-1; i >= 0; i--) {
        int u = order[i];
        sz[u] = 1; dist[u] = 0;
        for(int v : adj[u]) {
            if(v != parent[u]) {
                sz[u] += sz[v];
                dist[u] += dist[v] + sz[v];
            }
        }
    }

    // Pass 2: Top-down (BFS order)
    ans[1] = dist[1];
    for(int u : order) {
        for(int v : adj[u]) {
            if(v == parent[u]) continue;
            // Transition: ans[v] = ans[u] - sz[v] + (n - sz[v])
            ans[v] = ans[u] - sz[v] + (n - sz[v]);
        }
    }
}`,
      "Python (DFS)": `def dfs1(u, p):
    size[u] = 1
    dist[u] = 0
    for v in adj[u]:
        if v == p: continue
        dfs1(v, u)
        size[u] += size[v]
        dist[u] += dist[v] + size[v]

def dfs2(u, p):
    ans[u] = dist[u]
    for v in adj[u]:
        if v == p: continue
        # Reroot u -> v
        ans[v] = ans[u] - size[v] + (n - size[v])
        dfs2(v, u)`
    }
  },
  {
    id: "BINARY_LIFTING",
    title: "Binary Lifting",
    icon: <ArrowUp />,
    themeColor: "var(--viz-cyan)",
    themeRGB: "var(--viz-cyan-rgb)",
    description: "O(log N) tree path jumps.",
    component: (speed: number) => <BinaryLiftingVisualizer speed={speed} />,
    detailedDocs: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocSection title="The Power of 2 Jumps" icon={Zap}>
            <p>Binary Lifting precomputes the $2^k$-th ancestor for every node. Any distance $K$ can be decomposed into powers of 2 (e.g., $13 = 8 + 4 + 1$).</p>
            <p>Instead of climbing a tree one by one ($O(N)$), we &quot;jump&quot; up the levels in $O(\log N)$ steps. This is the foundation for efficient LCA and path queries.</p>
          </DocSection>
          <div className="space-y-8">
            <ComplexityCard time="O(log N) Query" space="O(N log N)" />
            <DocSection title="Table Recurrence" icon={Database} color="var(--viz-cyan)">
              <p className="font-mono text-[10px]">
                {/* up[u][k] is 2^k-th ancestor of u */}<br/>
                up[u][k] = up[ up[u][k-1] ][k-1]
              </p>
            </DocSection>
          </div>
        </div>

        <DocSection title="Practice Problems" icon={Hash} color="var(--viz-cyan)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a href="https://cses.fi/problemset/task/1687" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Company Queries I</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-cyan)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Find the K-th boss (ancestor) of an employee in $O(\log N)$.</p>
            </a>
            <a href="https://cses.fi/problemset/task/1688" target="_blank" rel="noopener noreferrer" className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-2xl hover:bg-[var(--accent)] transition-colors group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Company Queries II (LCA)</span>
                <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--viz-cyan)]" />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Find the lowest common boss of two employees using Binary Lifting.</p>
            </a>
          </div>
        </DocSection>
      </div>
    ),
    codeImplementations: {
      "C++": `int up[MAXN][LOGN];

// 1. Precompute table: O(N log N)
void precompute(int n) {
    for (int k = 1; k < LOGN; k++) {
        for (int i = 1; i <= n; i++) {
            if (up[i][k-1] != -1)
                up[i][k] = up[up[i][k-1]][k-1];
        }
    }
}

// 2. Query K-th ancestor: O(log N)
int getKthAncestor(int u, int k) {
    for (int i = 0; i < LOGN; i++) {
        if ((k >> i) & 1) {
            u = up[u][i];
            if (u == -1) break;
        }
    }
    return u;
}`,
      "Python": `def precompute():
    for k in range(1, LOGN):
        for i in range(1, n + 1):
            mid = up[i][k-1]
            if mid != -1:
                up[i][k] = up[mid][k-1]

def get_kth_ancestor(u, k):
    for i in range(LOGN):
        if (k >> i) & 1:
            u = up[u][i]
            if u == -1: break
    return u`,
      "Java": `void precompute(int n) {
    for (int k = 1; k < LOGN; k++) {
        for (int i = 1; i <= n; i++) {
            int mid = up[i][k - 1];
            if (mid != -1) {
                up[i][k] = up[mid][k - 1];
            }
        }
    }
}

int getKthAncestor(int u, int k) {
    for (int i = 0; i < LOGN; i++) {
        if (((k >> i) & 1) == 1) {
            u = up[u][i];
            if (u == -1) break;
        }
    }
    return u;
}`
    }
  },
];

;

;

