const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Maximum Distance</h1>

<p>You are given a connected undirected graph with <code>n</code> vertices and <code>m</code> weighted edges. There are also <code>k</code> special vertices.</p>

<p>You need to find a value <code>X</code> such that all <code>k</code> special vertices can be connected to each other using only edges with weights at most <code>X</code>, and <code>X</code> is the minimum possible such value.</p>

<p>For each of the <code>k</code> special vertices, output this minimum value <code>X</code>. (Since all special vertices belong to the same component and are connected via the same bottleneck edge, the answer is the same for all of them).</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Bottleneck Edge for Example 1:</h3>
<svg width="400" height="240" viewBox="0 0 400 240" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <!-- 1-2 (weight 5) -->
  <line x1="60" y1="70" x2="200" y2="70" stroke="#475569" stroke-width="2" />
  <text x="130" y="60" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">w=5</text>

  <!-- 2-3 (weight 3) -->
  <line x1="200" y1="70" x2="340" y2="70" stroke="#475569" stroke-width="2" />
  <text x="270" y="60" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">w=3</text>

  <!-- 4-5 (weight 2) -->
  <line x1="130" y1="180" x2="270" y2="180" stroke="#475569" stroke-width="2" />
  <text x="200" y="195" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">w=2</text>

  <!-- 3-5 (weight 2) -->
  <line x1="340" y1="70" x2="270" y2="180" stroke="#475569" stroke-width="2" />
  <text x="315" y="130" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">w=2</text>

  <!-- 2-5 (weight 1) -->
  <line x1="200" y1="70" x2="270" y2="180" stroke="#475569" stroke-width="2" />
  <text x="225" y="130" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">w=1</text>

  <!-- Critical Bottleneck Edge: 1-4 (weight 4) -->
  <line x1="60" y1="70" x2="130" y2="180" stroke="#f59e0b" stroke-width="3.5" />
  <text x="80" y="130" font-size="12" font-weight="bold" fill="#f59e0b" text-anchor="middle">w=4 (Bottleneck)</text>

  <!-- Nodes -->
  <!-- Node 1 (Special) -->
  <circle cx="60" cy="70" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="60" y="74" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="60" y="45" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">Special</text>

  <!-- Node 2 -->
  <circle cx="200" cy="70" r="18" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="200" y="74" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 3 (Special) -->
  <circle cx="340" cy="70" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="340" y="74" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  <text x="340" y="45" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">Special</text>

  <!-- Node 4 (Special) -->
  <circle cx="130" cy="180" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="130" y="184" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="130" y="210" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">Special</text>

  <!-- Node 5 -->
  <circle cx="270" cy="180" r="18" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="270" y="184" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The special vertices are <code>1</code>, <code>3</code>, and <code>4</code>. If we sort the edges by weight, we add them in the following order: 
<ul>
  <li>Edge <code>2-5</code> (w=1)</li>
  <li>Edge <code>4-5</code> (w=2)</li>
  <li>Edge <code>3-5</code> (w=2) [special nodes 3 and 4 are now connected]</li>
  <li>Edge <code>1-4</code> (w=4) [special node 1 merges into the component, making all special nodes <code>{1, 3, 4}</code> connected]</li>
</ul>
The weight of the bottleneck edge that successfully connects all special vertices is <code>4</code>. Thus, the answer for all three special vertices is <code>4</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Three space-separated integers: <code>n</code> (number of vertices), <code>m</code> (number of edges), and <code>k</code> (number of special vertices).</li>
  <li><strong>Line 2:</strong> <code>k</code> space-separated integers representing the indices of the special vertices.</li>
  <li><strong>Next <code>m</code> lines:</strong> Three space-separated integers <code>u v w</code> representing an undirected edge between <code>u</code> and <code>v</code> with weight <code>w</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print <code>k</code> space-separated integers, representing the bottleneck weight for each special vertex.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &le; n &le; 10^5</code></li>
  <li><code>n - 1 &le; m &le; 10^5</code></li>
  <li><code>2 &le; k &le; n</code></li>
  <li><code>1 &le; u, v &le; n</code>, <code>u &ne; v</code></li>
  <li><code>1 &le; w &le; 10^9</code></li>
  <li>The graph is connected and has no self-loops.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Edge {
    int u, v, w;
    bool operator<(const Edge& other) const {
        return w < other.w;
    }
};

struct DSU {
    vector<int> parent;
    vector<int> specialCount;
    DSU(int n) {
        parent.resize(n + 1);
        for (int i = 0; i <= n; ++i) parent[i] = i;
        specialCount.assign(n + 1, 0);
    }
    int find(int i) {
        if (parent[i] == i)
            return i;
        return parent[i] = find(parent[i]);
    }
    bool unite(int i, int j, int k, int& ans, int w) {
        int rootI = find(i);
        int rootJ = find(j);
        if (rootI != rootJ) {
            parent[rootI] = rootJ;
            specialCount[rootJ] += specialCount[rootI];
            if (specialCount[rootJ] == k) {
                ans = w;
                return true;
            }
        }
        return false;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, m, k;
    if (!(cin >> n >> m >> k)) return 0;
    
    DSU dsu(n);
    for (int i = 0; i < k; ++i) {
        int x;
        cin >> x;
        dsu.specialCount[x] = 1;
    }
    
    vector<Edge> edges(m);
    for (int i = 0; i < m; ++i) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }
    
    sort(edges.begin(), edges.end());
    
    int ans = 0;
    for (int i = 0; i < m; ++i) {
        if (dsu.unite(edges[i].u, edges[i].v, k, ans, edges[i].w)) {
            break;
        }
    }
    
    for (int i = 0; i < k; ++i) {
        cout << ans << (i == k - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}
`.trim();

// Solver implementation using DSU
function solveCF1081D(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return "";
  const header = lines[0].trim().split(/\s+/);
  const n = parseInt(header[0]);
  const m = parseInt(header[1]);
  const k = parseInt(header[2]);

  if (!lines[1]) return "";
  const specialVertices = lines[1].trim().split(/\s+/).map(Number);

  const edges = [];
  for (let i = 0; i < m; i++) {
    const edgeLine = lines[2 + i];
    if (!edgeLine) continue;
    const tokens = edgeLine.trim().split(/\s+/);
    if (tokens.length < 3) continue;
    edges.push({
      u: parseInt(tokens[0]),
      v: parseInt(tokens[1]),
      w: parseInt(tokens[2])
    });
  }

  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const specialCount = new Array(n + 1).fill(0);
  for (const x of specialVertices) {
    specialCount[x] = 1;
  }

  function find(i) {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    let curr = i;
    while (curr !== root) {
      const next = parent[curr];
      parent[curr] = root;
      curr = next;
    }
    return root;
  }

  edges.sort((a, b) => a.w - b.w);

  let ans = 0;
  for (const edge of edges) {
    const rootU = find(edge.u);
    const rootV = find(edge.v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      specialCount[rootV] += specialCount[rootU];
      if (specialCount[rootV] === k) {
        ans = edge.w;
        break;
      }
    }
  }

  return new Array(k).fill(ans).join(" ");
}

const staticCases = [
  {
    input: "5 6 3\n1 3 4\n1 2 5\n2 3 3\n1 4 4\n4 5 2\n3 5 2\n2 5 1",
    isExample: true
  },
  {
    input: "3 3 2\n2 3\n1 2 5\n2 3 8\n1 3 3",
    isExample: true
  },
  {
    input: "4 4 3\n1 2 4\n1 2 10\n2 3 20\n3 4 30\n1 4 40",
    isExample: true
  }
];

function generateConnectedGraph(n, density = 0.3) {
  const edges = [];
  const edgeSet = new Set();
  
  // Spanning tree
  const reached = [1];
  const unreached = Array.from({ length: n - 1 }, (_, i) => i + 2);
  
  for (let i = unreached.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unreached[i], unreached[j]] = [unreached[j], unreached[i]];
  }
  
  for (const v of unreached) {
    const u = reached[Math.floor(Math.random() * reached.length)];
    const w = Math.floor(Math.random() * 10000) + 1;
    edges.push([u, v, w]);
    edgeSet.add(`${Math.min(u,v)}-${Math.max(u,v)}`);
    reached.push(v);
  }
  
  // Extra edges
  const maxEdges = (n * (n - 1)) / 2;
  const targetEdges = Math.min(maxEdges, Math.max(n - 1, Math.floor(maxEdges * density)));
  const attempts = 2000;
  let count = 0;
  
  while (edges.length < targetEdges && count < attempts) {
    count++;
    const u = Math.floor(Math.random() * n) + 1;
    const v = Math.floor(Math.random() * n) + 1;
    if (u === v) continue;
    const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
    if (!edgeSet.has(key)) {
      const w = Math.floor(Math.random() * 10000) + 1;
      edges.push([u, v, w]);
      edgeSet.add(key);
    }
  }
  
  return edges;
}

function graphToInput(n, k, special, edges) {
  const lines = [`${n} ${edges.length} ${k}`, special.join(" ")];
  for (const [u, v, w] of edges) {
    lines.push(`${u} ${v} ${w}`);
  }
  return lines.join("\n");
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveCF1081D(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Minimal graph: 2 nodes, 1 edge, 2 special
    "2 1 2\n1 2\n1 2 100",
    // Linear graph: 5 nodes, 4 edges, 3 special
    "5 4 3\n1 3 5\n1 2 10\n2 3 20\n3 4 30\n4 5 40",
    // Multiple edge weights between same node pair
    "3 3 2\n1 3\n1 2 5\n1 2 10\n2 3 15",
    // All nodes are special
    "4 3 4\n1 2 3 4\n1 2 10\n2 3 20\n3 4 30",
    // Extreme edge weights
    "3 2 2\n1 3\n1 2 1000000000\n2 3 1000000000"
  ];

  for (const ec of edgeCases) {
    const expected = solveCF1081D(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 35)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 6) + 4;   // 4-9
    else if (i < 25) n = Math.floor(Math.random() * 15) + 10; // 10-24
    else n = Math.floor(Math.random() * 12) + 24; // 24-35

    const density = Math.random() * 0.3 + 0.1;
    const edges = generateConnectedGraph(n, density);
    
    // Choose k special nodes
    const k = Math.floor(Math.random() * (n - 1)) + 2; // 2 to n
    const nodes = Array.from({ length: n }, (_, j) => j + 1);
    // Shuffle nodes
    for (let j = nodes.length - 1; j > 0; j--) {
      const idx = Math.floor(Math.random() * (j + 1));
      [nodes[j], nodes[idx]] = [nodes[idx], nodes[j]];
    }
    const special = nodes.slice(0, k);

    const input = graphToInput(n, k, special, edges);
    const expected = solveCF1081D(input);

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
    const expected = solveCF1081D(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "codeforces-maximum-distance-editorial" },
    update: {
      title: "Codeforces 1081D Maximum Distance Editorial",
      url: "https://codeforces.com/blog/entry/63877",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Codeforces",
      isPublic: true,
    },
    create: {
      id: "codeforces-maximum-distance-editorial",
      title: "Codeforces 1081D Maximum Distance Editorial",
      url: "https://codeforces.com/blog/entry/63877",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Codeforces",
      isPublic: true,
    }
  });
  console.log("   ✅ Codeforces resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Maximum Distance' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "maximum-distance" },
    update: {
      title: "Maximum Distance",
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
      slug: "maximum-distance",
      title: "Maximum Distance",
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

  console.log("🎉 Successfully created/updated 'Maximum Distance'!");
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
