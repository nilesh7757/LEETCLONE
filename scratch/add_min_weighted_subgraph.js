const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Minimum Weighted Subgraph With Required Paths</h1>

<p>You are given an integer <code>n</code> denoting the number of nodes in a directed weighted graph. The nodes are labeled from <code>0</code> to <code>n - 1</code>.</p>

<p>You are also given a 2D integer array <code>edges</code> where <code>edges[i] = [from_i, to_i, weight_i]</code> denotes a directed edge from <code>from_i</code> to <code>to_i</code> with weight <code>weight_i</code>.</p>

<p>Lastly, you are given three integers <code>src1</code>, <code>src2</code>, and <code>dest</code>.</p>

<p>Find the <strong>minimum weight</strong> of a subgraph of the graph such that it is possible to reach <code>dest</code> from both <code>src1</code> and <code>src2</code> using only edges of this subgraph. If no such subgraph exists, return <code>-1</code>.</p>

<p>A subgraph is a graph whose vertices and edges are subsets of the original graph. The weight of a subgraph is the sum of weights of its edges.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Optimal Subgraph for Example 1 (src1 = 0, src2 = 1, dest = 5):</h3>
<svg width="360" height="200" viewBox="0 0 360 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow-gray" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Edges -->
  <!-- 0 -> 2 (weight 2) -->
  <line x1="150" y1="70" x2="100" y2="30" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="120" y="44" font-size="9" fill="#94a3b8">2</text>

  <!-- 0 -> 5 (weight 6, Green Highlight) -->
  <line x1="150" y1="70" x2="240" y2="110" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-green)" />
  <text x="195" y="80" font-size="10" font-weight="bold" fill="#10b981">6</text>

  <!-- 1 -> 0 (weight 3, Green Highlight) -->
  <line x1="60" y1="70" x2="150" y2="70" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-green)" />
  <text x="105" y="62" font-size="10" font-weight="bold" fill="#10b981">3</text>

  <!-- 1 -> 4 (weight 5) -->
  <line x1="60" y1="70" x2="150" y2="150" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="96" y="118" font-size="9" fill="#94a3b8">5</text>

  <!-- 2 -> 1 (weight 1) -->
  <line x1="100" y1="30" x2="60" y2="70" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="74" y="44" font-size="9" fill="#94a3b8">1</text>

  <!-- 2 -> 3 (weight 3) -->
  <line x1="100" y1="30" x2="240" y2="30" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="170" y="24" font-size="9" fill="#94a3b8">3</text>

  <!-- 3 -> 5 (weight 4) -->
  <line x1="240" y1="30" x2="240" y2="110" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="246" y="75" font-size="9" fill="#94a3b8">4</text>

  <!-- 3 -> 4 (weight 1) -->
  <line x1="240" y1="30" x2="150" y2="150" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="202" y="100" font-size="9" fill="#94a3b8">1</text>

  <!-- 4 -> 5 (weight 2) -->
  <line x1="150" y1="150" x2="240" y2="110" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-gray)" />
  <text x="202" y="140" font-size="9" fill="#94a3b8">2</text>

  <!-- Nodes -->
  <!-- Node 0 -->
  <circle cx="150" cy="70" r="14" fill="#1e293b" stroke="#ef4444" stroke-width="2.5" />
  <text x="150" y="74" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="150" y="94" font-size="7" fill="#ef4444" font-weight="bold" text-anchor="middle">src1</text>

  <!-- Node 1 -->
  <circle cx="60" cy="70" r="14" fill="#1e293b" stroke="#3b82f6" stroke-width="2.5" />
  <text x="60" y="74" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="60" y="94" font-size="7" fill="#3b82f6" font-weight="bold" text-anchor="middle">src2</text>

  <!-- Node 2 -->
  <circle cx="100" cy="30" r="12" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="100" y="34" font-size="10" fill="#94a3b8" text-anchor="middle">2</text>

  <!-- Node 3 -->
  <circle cx="240" cy="30" r="12" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="240" y="34" font-size="10" fill="#94a3b8" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="150" cy="150" r="12" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="150" y="154" font-size="10" fill="#94a3b8" text-anchor="middle">4</text>

  <!-- Node 5 -->
  <circle cx="240" cy="110" r="14" fill="#1e293b" stroke="#a855f7" stroke-width="2.5" />
  <text x="240" y="114" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="240" y="134" font-size="7" fill="#a855f7" font-weight="bold" text-anchor="middle">dest</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The optimal subgraph contains the edges <code>1 &rarr; 0</code> and <code>0 &rarr; 5</code>. 
<ul>
  <li>Path from <code>src1 = 0</code> to <code>dest = 5</code>: <code>0 &rarr; 5</code> (weight 6).</li>
  <li>Path from <code>src2 = 1</code> to <code>dest = 5</code>: <code>1 &rarr; 0 &rarr; 5</code> (weight 3 + 6 = 9).</li>
</ul>
The sum of the edge weights in the subgraph is <code>3 + 6 = 9</code>. Any other subgraph (e.g. going through node 4) yields a higher total weight.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers <code>N</code> and <code>M</code> representing the number of vertices and directed edges.</li>
  <li><strong>Line 2:</strong> Three space-separated integers <code>src1</code>, <code>src2</code>, and <code>dest</code>.</li>
  <li><strong>Next <code>M</code> lines:</strong> Three space-separated integers <code>u v w</code> representing a directed edge from <code>u</code> to <code>v</code> with weight <code>w</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum weight of the subgraph, or <code>-1</code> if unreachable.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>3 &le; N &le; 10^5</code></li>
  <li><code>0 &le; M &le; 10^5</code></li>
  <li><code>0 &le; u, v, src1, src2, dest &lt; N</code></li>
  <li><code>u &ne; v</code></li>
  <li><code>1 &le; w &le; 10^5</code></li>
  <li><code>src1</code>, <code>src2</code>, and <code>dest</code> are pairwise distinct.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

const long long INF = 1e18;

vector<long long> dijkstra(int startNode, int n, const vector<vector<pair<int, int>>>& graph) {
    vector<long long> dist(n, INF);
    dist[startNode] = 0;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;
    pq.push({0, startNode});
    
    while (!pq.empty()) {
        auto p = pq.top();
        pq.pop();
        
        long long d = p.first;
        int u = p.second;
        if (d > dist[u]) continue;
        
        for (const auto& edge : graph[u]) {
            int v = edge.first;
            int w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, m;
    if (cin >> n >> m) {
        int src1, src2, dest;
        if (cin >> src1 >> src2 >> dest) {
            vector<vector<pair<int, int>>> adj(n);
            vector<vector<pair<int, int>>> revAdj(n);
            
            for (int i = 0; i < m; ++i) {
                int u, v, w;
                cin >> u >> v >> w;
                adj[u].push_back({v, w});
                revAdj[v].push_back({u, w});
            }
            
            vector<long long> d1 = dijkstra(src1, n, adj);
            vector<long long> d2 = dijkstra(src2, n, adj);
            vector<long long> d3 = dijkstra(dest, n, revAdj);
            
            long long minWeight = INF;
            for (int c = 0; c < n; ++c) {
                if (d1[c] != INF && d2[c] != INF && d3[c] != INF) {
                    minWeight = min(minWeight, d1[c] + d2[c] + d3[c]);
                }
            }
            
            if (minWeight == INF) {
                cout << -1 << "\\n";
            } else {
                cout << minWeight << "\\n";
            }
        }
    }
    return 0;
}
`.trim();

// MinHeap for local Dijkstra
class MinHeap {
  constructor() {
    this.data = [];
  }
  push(item) {
    this.data.push(item);
    this.up(this.data.length - 1);
  }
  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const bottom = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.down(0);
    }
    return top;
  }
  up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p][0] <= this.data[i][0]) break;
      const tmp = this.data[p];
      this.data[p] = this.data[i];
      this.data[i] = tmp;
      i = p;
    }
  }
  down(i) {
    const len = this.data.length;
    while ((i << 1) + 1 < len) {
      let left = (i << 1) + 1;
      let right = left + 1;
      let best = i;
      if (this.data[left][0] < this.data[best][0]) best = left;
      if (right < len && this.data[right][0] < this.data[best][0]) best = right;
      if (best === i) break;
      const tmp = this.data[i];
      this.data[i] = this.data[best];
      this.data[best] = tmp;
      i = best;
    }
  }
  isEmpty() {
    return this.data.length === 0;
  }
}

function solveMinWeightedSubgraph(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0 || lines[0] === "") return "-1";
  
  const header = lines[0].trim().split(/\s+/);
  const n = parseInt(header[0]);
  const m = parseInt(header[1]);
  
  if (lines.length < 2) return "-1";
  const params = lines[1].trim().split(/\s+/);
  const src1 = parseInt(params[0]);
  const src2 = parseInt(params[1]);
  const dest = parseInt(params[2]);
  
  const adj = Array.from({ length: n }, () => []);
  const revAdj = Array.from({ length: n }, () => []);
  
  for (let i = 0; i < m; i++) {
    const lineIdx = 2 + i;
    if (!lines[lineIdx]) continue;
    const edge = lines[lineIdx].trim().split(/\s+/);
    if (edge.length < 3) continue;
    const u = parseInt(edge[0]);
    const v = parseInt(edge[1]);
    const w = parseInt(edge[2]);
    adj[u].push([v, w]);
    revAdj[v].push([u, w]);
  }
  
  function dijkstra(startNode, graph) {
    const dist = new Array(n).fill(Infinity);
    dist[startNode] = 0;
    const heap = new MinHeap();
    heap.push([0, startNode]);
    
    while (!heap.isEmpty()) {
      const [d, u] = heap.pop();
      if (d > dist[u]) continue;
      
      for (const [v, w] of graph[u]) {
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          heap.push([dist[v], v]);
        }
      }
    }
    return dist;
  }
  
  const d1 = dijkstra(src1, adj);
  const d2 = dijkstra(src2, adj);
  const d3 = dijkstra(dest, revAdj);
  
  let minWeight = Infinity;
  for (let c = 0; c < n; c++) {
    if (d1[c] !== Infinity && d2[c] !== Infinity && d3[c] !== Infinity) {
      minWeight = Math.min(minWeight, d1[c] + d2[c] + d3[c]);
    }
  }
  
  return minWeight === Infinity ? "-1" : String(minWeight);
}

const staticCases = [
  { input: "6 9\n0 1 5\n0 2 2\n0 5 6\n1 0 3\n1 4 5\n2 1 1\n2 3 3\n3 5 4\n3 4 1\n4 5 2", isExample: true },
  { input: "3 0\n0 1 2", isExample: true },
  { input: "3 3\n0 1 2\n0 2 1\n1 2 1\n0 1 1", isExample: true }
];

function generateRandomGraph(n, m) {
  const edges = [];
  const selfCheck = new Set();
  
  // Pick random src1, src2, dest
  const nodes = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = nodes[i];
    nodes[i] = nodes[j];
    nodes[j] = temp;
  }
  const src1 = nodes[0];
  const src2 = nodes[1];
  const dest = nodes[2];

  // Try to generate m random directed edges
  let generated = 0;
  let attempts = 0;
  while (generated < m && attempts < m * 5) {
    attempts++;
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u === v) continue;
    const key = `${u}->${v}`;
    if (selfCheck.has(key)) continue;
    selfCheck.add(key);
    const w = Math.floor(Math.random() * 1000) + 1; // 1 to 1000
    edges.push(`${u} ${v} ${w}`);
    generated++;
  }
  
  const headerLine = `${n} ${edges.length}`;
  const paramLine = `${src1} ${src2} ${dest}`;
  return `${headerLine}\n${paramLine}\n${edges.join("\n")}`;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveMinWeightedSubgraph(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Grid type 1: disconnected
    "4 1\n0 1 3\n2 3 5",
    // Grid type 2: simple path
    "3 2\n0 1 2\n0 1 5\n1 2 4",
    // Large weights to test 64-bit overflow
    "3 2\n0 1 2\n0 2 100000\n1 2 100000",
    // Parallel edges (select minimum weight)
    "3 4\n0 1 2\n0 2 10\n0 2 2\n1 2 10\n1 2 3",
    // Dest is unreachable
    "4 3\n0 1 3\n0 2 2\n1 2 1\n2 0 4"
  ];

  for (const ec of edgeCases) {
    const expected = solveMinWeightedSubgraph(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 100)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 50) + 6; // 6 to 55
    const m = Math.floor(Math.random() * 100) + 5; // 5 to 104
    const input = generateRandomGraph(n, m);
    const expected = solveMinWeightedSubgraph(input);

    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Verify all locally
  console.log("Verifying test cases...");
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const expected = solveMinWeightedSubgraph(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-min-weighted-subgraph" },
    update: {
      title: "Minimum Weighted Subgraph With Required Paths - LeetCode 2203 - NeetCode",
      url: "https://www.youtube.com/watch?v=FGl-1S2Wb2Q",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-min-weighted-subgraph",
      title: "Minimum Weighted Subgraph With Required Paths - LeetCode 2203 - NeetCode",
      url: "https://www.youtube.com/watch?v=FGl-1S2Wb2Q",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ** NeetCode video guide ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Minimum Weighted Subgraph With Required Paths' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "minimum-weighted-subgraph-with-required-paths" },
    update: {
      title: "Minimum Weighted Subgraph With Required Paths",
      difficulty: "Hard",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id }
        ]
      }
    },
    create: {
      slug: "minimum-weighted-subgraph-with-required-paths",
      title: "Minimum Weighted Subgraph With Required Paths",
      difficulty: "Hard",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully created/updated 'Minimum Weighted Subgraph With Required Paths'!");
  console.log("Slug:", result.slug);
  console.log("Total uploaded test cases:", result.testSets.length);
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
