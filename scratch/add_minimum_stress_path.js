const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Minimum Stress Path</h1>

<h3>Titan OA 2022 Q3</h3>

<p><strong>PROBLEM IN SIMPLE HINDI-ENGLISH:</strong><br />
Given a graph with weighted edges, a source (src) and a destination (dest). You need to find a path from src to dest.<br />
The <strong>Stress of a path</strong> is defined as the maximum weight of any edge present in that path.<br />
We want to find a path whose maximum edge weight (stress) is the <strong>minimum possible</strong>.</p>

<p>Mathematically, find the path <code>P</code> from <code>src</code> to <code>dest</code> that minimizes:</p>
<pre>max_{e &isin; P} weight(e)</pre>
<p>If no path exists from <code>src</code> to <code>dest</code>, return <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Minimax Stress Path for Example 1 (src = 0, dest = 4):</h3>
<svg width="320" height="200" viewBox="0 0 320 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <!-- 0 - 1 (weight 5, Green) -->
  <line x1="40" y1="100" x2="120" y2="50" stroke="#10b981" stroke-width="3" />
  <text x="75" y="65" font-size="10" font-weight="bold" fill="#10b981">5</text>

  <!-- 0 - 2 (weight 10, Gray) -->
  <line x1="40" y1="100" x2="120" y2="150" stroke="#475569" stroke-width="1.5" />
  <text x="75" y="140" font-size="9" fill="#94a3b8">10</text>

  <!-- 1 - 3 (weight 2, Green) -->
  <line x1="120" y1="50" x2="200" y2="100" stroke="#10b981" stroke-width="3" />
  <text x="165" y="65" font-size="10" font-weight="bold" fill="#10b981">2</text>

  <!-- 2 - 3 (weight 8, Gray) -->
  <line x1="120" y1="150" x2="200" y2="100" stroke="#475569" stroke-width="1.5" />
  <text x="165" y="140" font-size="9" fill="#94a3b8">8</text>

  <!-- 3 - 4 (weight 6, Green) -->
  <line x1="200" y1="100" x2="280" y2="100" stroke="#10b981" stroke-width="3" />
  <text x="240" y="92" font-size="10" font-weight="bold" fill="#10b981">6</text>

  <!-- Nodes -->
  <!-- Node 0 -->
  <circle cx="40" cy="100" r="14" fill="#1e293b" stroke="#ef4444" stroke-width="2.5" />
  <text x="40" y="104" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="40" y="124" font-size="7" fill="#ef4444" font-weight="bold" text-anchor="middle">src</text>

  <!-- Node 1 -->
  <circle cx="120" cy="50" r="12" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="120" y="54" font-size="10" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Node 2 -->
  <circle cx="120" cy="150" r="12" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="120" y="154" font-size="10" fill="#94a3b8" text-anchor="middle">2</text>

  <!-- Node 3 -->
  <circle cx="200" cy="100" r="12" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="200" y="104" font-size="10" fill="#ffffff" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="280" cy="100" r="14" fill="#1e293b" stroke="#a855f7" stroke-width="2.5" />
  <text x="280" y="104" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="280" y="124" font-size="7" fill="#a855f7" font-weight="bold" text-anchor="middle">dest</text>
</svg>
<p><strong>Explanation for Example 1:</strong> 
We have two paths from <code>0</code> to <code>4</code>:
<ul>
  <li>Path <code>0 &rarr; 1 &rarr; 3 &rarr; 4</code>: edges are <code>5</code>, <code>2</code>, and <code>6</code>. Max edge is <code>6</code>.</li>
  <li>Path <code>0 &rarr; 2 &rarr; 3 &rarr; 4</code>: edges are <code>10</code>, <code>8</code>, and <code>6</code>. Max edge is <code>10</code>.</li>
</ul>
The path with the minimum stress (maximum weight edge) is <code>0 &rarr; 1 &rarr; 3 &rarr; 4</code> with stress value <code>6</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers <code>N</code> and <code>M</code> representing the number of vertices and undirected edges.</li>
  <li><strong>Line 2:</strong> Two space-separated integers <code>src</code> and <code>dest</code>.</li>
  <li><strong>Next <code>M</code> lines:</strong> Three space-separated integers <code>u v w</code> representing an undirected edge between <code>u</code> and <code>v</code> with weight <code>w</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum stress of a path from <code>src</code> to <code>dest</code>, or <code>-1</code> if no path exists.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &le; N &le; 10^5</code></li>
  <li><code>1 &le; M &le; 2 * 10^5</code></li>
  <li><code>0 &le; u, v, src, dest &lt; N</code></li>
  <li><code>src &ne; dest</code></li>
  <li><code>1 &le; w &le; 10^9</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

const int INF = 2e9;

struct Edge {
    int to;
    int weight;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, m;
    if (cin >> n >> m) {
        int src, dest;
        if (cin >> src >> dest) {
            vector<vector<Edge>> adj(n);
            for (int i = 0; i < m; ++i) {
                int u, v, w;
                cin >> u >> v >> w;
                adj[u].push_back({v, w});
                adj[v].push_back({u, w});
            }
            
            vector<int> dist(n, INF);
            dist[src] = 0;
            
            priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
            pq.push({0, src});
            
            while (!pq.empty()) {
                auto p = pq.top();
                pq.pop();
                
                int d = p.first;
                int u = p.second;
                
                if (u == dest) {
                    cout << d << "\\n";
                    return 0;
                }
                
                if (d > dist[u]) continue;
                
                for (const auto& edge : adj[u]) {
                    int v = edge.to;
                    int w = edge.weight;
                    int nextD = max(d, w);
                    if (nextD < dist[v]) {
                        dist[v] = nextD;
                        pq.push({nextD, v});
                    }
                }
            }
            
            cout << -1 << "\\n";
        }
    }
    return 0;
}
`.trim();

function solveMinStressPath(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0 || lines[0] === "") return "-1";
  
  const header = lines[0].trim().split(/\s+/);
  const n = parseInt(header[0]);
  const m = parseInt(header[1]);
  
  if (lines.length < 2) return "-1";
  const params = lines[1].trim().split(/\s+/);
  const src = parseInt(params[0]);
  const dest = parseInt(params[1]);
  
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < m; i++) {
    const lineIdx = 2 + i;
    if (!lines[lineIdx]) continue;
    const edge = lines[lineIdx].trim().split(/\s+/);
    if (edge.length < 3) continue;
    const u = parseInt(edge[0]);
    const v = parseInt(edge[1]);
    const w = parseInt(edge[2]);
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  
  // Custom Min Heap for Dijkstra
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
  
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  
  const heap = new MinHeap();
  heap.push([0, src]);
  
  while (!heap.isEmpty()) {
    const [d, u] = heap.pop();
    if (u === dest) return String(d);
    if (d > dist[u]) continue;
    
    for (const [v, w] of adj[u]) {
      const nextD = Math.max(d, w);
      if (nextD < dist[v]) {
        dist[v] = nextD;
        heap.push([nextD, v]);
      }
    }
  }
  
  return "-1";
}

const staticCases = [
  { input: "5 5\n0 4\n0 1 5\n0 2 10\n1 3 2\n2 3 8\n3 4 6", isExample: true },
  { input: "3 1\n0 2\n0 1 100", isExample: true },
  { input: "4 4\n0 3\n0 1 1\n1 2 2\n2 3 3\n0 3 5", isExample: true }
];

function generateRandomGraph(n, m) {
  const edges = [];
  const selfCheck = new Set();
  
  // Pick random src, dest
  const src = 0;
  const dest = n - 1;

  // Try to generate m random undirected edges
  let generated = 0;
  let attempts = 0;
  while (generated < m && attempts < m * 5) {
    attempts++;
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u === v) continue;
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (selfCheck.has(key)) continue;
    selfCheck.add(key);
    const w = Math.floor(Math.random() * 1000000000) + 1; // 1 to 10^9
    edges.push(`${u} ${v} ${w}`);
    generated++;
  }
  
  const headerLine = `${n} ${edges.length}`;
  const paramLine = `${src} ${dest}`;
  return `${headerLine}\n${paramLine}\n${edges.join("\n")}`;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveMinStressPath(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Disconnected
    "4 1\n0 3\n1 2 5",
    // Directly connected with single low weight edge
    "2 1\n0 1\n0 1 15",
    // Two paths, one longer but low stress
    "5 5\n0 4\n0 1 1\n1 2 1\n2 3 1\n3 4 1\n0 4 10",
    // Multi-edge between nodes (take min)
    "2 3\n0 1\n0 1 100\n0 1 20\n0 1 50"
  ];

  for (const ec of edgeCases) {
    const expected = solveMinStressPath(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 45 random cases (N up to 100)
  console.log("Generating random test cases...");
  for (let i = 0; i < 45; i++) {
    const n = Math.floor(Math.random() * 50) + 6; // 6 to 55
    const m = Math.floor(Math.random() * 100) + 5; // 5 to 104
    const input = generateRandomGraph(n, m);
    const expected = solveMinStressPath(input);

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
    const expected = solveMinStressPath(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert problem record
  console.log("Upserting problem 'Minimum Stress Path' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "minimum-stress-path" },
    update: {
      title: "Minimum Stress Path",
      difficulty: "Medium",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      companies: ["Titan"],
      companyTags: ["Titan"]
    },
    create: {
      slug: "minimum-stress-path",
      title: "Minimum Stress Path",
      difficulty: "Medium",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      companies: ["Titan"],
      companyTags: ["Titan"]
    }
  });

  console.log("🎉 Successfully created/updated 'Minimum Stress Path'!");
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
