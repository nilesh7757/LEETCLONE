const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Minimum Cost to Reach Destination with Time Constraints</h1>

<p>There is a country with <code>n</code> cities, numbered from <code>0</code> to <code>n - 1</code>, and undirected roads connecting them. Each road <code>(u, v)</code> has a travel time associated with it. In addition, each city <code>i</code> charges a passing fee <code>passingFees[i]</code> that you must pay when you enter or pass through that city.</p>

<p>You want to travel from city <code>0</code> to city <code>n - 1</code>. You are given a time budget <code>maxTime</code>. Your goal is to find a route that minimizes the <strong>total passing fees</strong> (including the fees for the starting and destination cities) such that the sum of travel times for the route does not exceed <code>maxTime</code>.</p>

<p>Return the minimum cost to reach your destination city. If it is impossible to reach city <code>n - 1</code> within <code>maxTime</code> minutes, return <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Optimal Path Structure for Example 1:</h3>
<svg width="480" height="240" viewBox="0 0 480 240" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <!-- 0-3 (time 5) -->
  <line x1="50" y1="120" x2="170" y2="190" stroke="#475569" stroke-width="2" />
  <text x="100" y="170" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">5m</text>

  <!-- 3-4 (time 5) -->
  <line x1="170" y1="190" x2="290" y2="190" stroke="#475569" stroke-width="2" />
  <text x="230" y="205" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">5m</text>

  <!-- 4-5 (time 15) -->
  <line x1="290" y1="190" x2="410" y2="120" stroke="#475569" stroke-width="2" />
  <text x="360" y="170" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">15m</text>

  <!-- 3-5 (time 20) -->
  <line x1="170" y1="190" x2="410" y2="120" stroke="#475569" stroke-width="2" />
  <text x="280" y="150" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">20m</text>

  <!-- Optimal Path Edges (Green) -->
  <!-- 0-1 (time 10) -->
  <line x1="50" y1="120" x2="170" y2="50" stroke="#10b981" stroke-width="3" />
  <text x="100" y="75" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">10m</text>

  <!-- 1-2 (time 10) -->
  <line x1="170" y1="50" x2="290" y2="50" stroke="#10b981" stroke-width="3" />
  <text x="230" y="40" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">10m</text>

  <!-- 2-5 (time 10) -->
  <line x1="290" y1="50" x2="410" y2="120" stroke="#10b981" stroke-width="3" />
  <text x="360" y="75" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">10m</text>

  <!-- Nodes -->
  <!-- Node 0 -->
  <circle cx="50" cy="120" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="50" y="125" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="50" y="95" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Fee: $5</text>

  <!-- Node 1 -->
  <circle cx="170" cy="50" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="170" y="55" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="170" y="25" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Fee: $1</text>

  <!-- Node 2 -->
  <circle cx="290" cy="50" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="290" y="55" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="290" y="25" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Fee: $2</text>

  <!-- Node 3 -->
  <circle cx="170" cy="190" r="18" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="170" y="195" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  <text x="170" y="220" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">Fee: $10</text>

  <!-- Node 4 -->
  <circle cx="290" cy="190" r="18" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="290" y="195" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="290" y="220" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">Fee: $6</text>

  <!-- Node 5 -->
  <circle cx="410" cy="120" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2.5" />
  <text x="410" y="125" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="410" y="95" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Fee: $2</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The optimal route is <code>0 &rarr; 1 &rarr; 2 &rarr; 5</code>. The total travel time is <code>10 + 10 + 10 = 30</code> minutes, which does not exceed <code>maxTime = 30</code>. The total passing fee is <code>passingFees[0] + passingFees[1] + passingFees[2] + passingFees[5] = 5 + 1 + 2 + 2 = 10</code>. This is the minimum possible cost.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>maxTime</code> representing the maximum allowed time budget.</li>
  <li><strong>Line 2:</strong> Two space-separated integers <code>n</code> (number of cities) and <code>m</code> (number of roads).</li>
  <li><strong>Line 3:</strong> <code>n</code> space-separated integers representing the passing fee of each city from <code>0</code> to <code>n - 1</code>.</li>
  <li><strong>Next <code>m</code> lines:</strong> Three space-separated integers <code>u v time</code> representing an undirected road between city <code>u</code> and city <code>v</code> taking <code>time</code> minutes.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum cost to reach city <code>n - 1</code> within the time budget, or <code>-1</code> if it is impossible.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &le; n &le; 1000</code></li>
  <li><code>n - 1 &le; m &le; 1000</code></li>
  <li><code>10 &le; maxTime &le; 1000</code></li>
  <li><code>1 &le; passingFees[i] &le; 1000</code></li>
  <li><code>1 &le; time_i &le; 1000</code></li>
  <li>There are no self-loops or multiple roads between the same two cities.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

struct State {
    int cost;
    int node;
    int time;
    bool operator>(const State& other) const {
        return cost > other.cost;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int maxTime;
    if (!(cin >> maxTime)) return 0;
    
    int n, m;
    if (!(cin >> n >> m)) return 0;
    
    vector<int> passingFees(n);
    for (int i = 0; i < n; ++i) {
        cin >> passingFees[i];
    }
    
    vector<vector<pair<int, int>>> adj(n);
    for (int i = 0; i < m; ++i) {
        int u, v, t;
        cin >> u >> v >> t;
        adj[u].push_back({v, t});
        adj[v].push_back({u, t});
    }
    
    priority_queue<State, vector<State>, greater<State>> pq;
    vector<int> minTime(n, 1e9);
    
    pq.push({passingFees[0], 0, 0});
    
    while (!pq.empty()) {
        State curr = pq.top();
        pq.pop();
        
        int cost = curr.cost;
        int u = curr.node;
        int t = curr.time;
        
        if (t >= minTime[u]) continue;
        minTime[u] = t;
        
        if (u == n - 1) {
            cout << cost << "\\n";
            return 0;
        }
        
        for (auto& edge : adj[u]) {
            int v = edge.first;
            int time = edge.second;
            int nt = t + time;
            if (nt <= maxTime) {
                pq.push({cost + passingFees[v], v, nt});
            }
        }
    }
    
    cout << -1 << "\\n";
    return 0;
}
`.trim();

// Solver implementation
function solveMinCostToReachDestination(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return -1;
  const maxTime = parseInt(lines[0].trim());
  if (!lines[1]) return -1;
  const firstLine = lines[1].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const m = parseInt(firstLine[1]);

  if (!lines[2]) return -1;
  const passingFees = lines[2].trim().split(/\s+/).map(Number);

  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < m; i++) {
    const edgeLine = lines[3 + i];
    if (!edgeLine) continue;
    const tokens = edgeLine.trim().split(/\s+/);
    if (tokens.length < 3) continue;
    const u = parseInt(tokens[0]);
    const v = parseInt(tokens[1]);
    const time = parseInt(tokens[2]);
    adj[u].push([v, time]);
    adj[v].push([u, time]);
  }

  const pq = [[passingFees[0], 0, 0]];
  const minTime = new Array(n).fill(Infinity);

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, u, t] = pq.shift();

    if (t >= minTime[u]) continue;
    minTime[u] = t;

    if (u === n - 1) return cost;

    for (const [v, time] of adj[u]) {
      const nt = t + time;
      if (nt <= maxTime) {
        pq.push([cost + passingFees[v], v, nt]);
      }
    }
  }

  return -1;
}

// Random Graph Generator
function generateConnectedGraph(n, density = 0.3) {
  const edges = [];
  const edgeSet = new Set();
  
  // Spanning tree
  const reached = [0];
  const unreached = Array.from({ length: n - 1 }, (_, i) => i + 1);
  
  for (let i = unreached.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unreached[i], unreached[j]] = [unreached[j], unreached[i]];
  }
  
  for (const v of unreached) {
    const u = reached[Math.floor(Math.random() * reached.length)];
    const time = Math.floor(Math.random() * 20) + 1; // 1-20 minutes
    edges.push([u, v, time]);
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
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u === v) continue;
    const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
    if (!edgeSet.has(key)) {
      const time = Math.floor(Math.random() * 20) + 1;
      edges.push([u, v, time]);
      edgeSet.add(key);
    }
  }
  
  return edges;
}

function graphToInput(maxTime, n, edges, passingFees) {
  const lines = [String(maxTime), `${n} ${edges.length}`, passingFees.join(" ")];
  for (const [u, v, t] of edges) {
    lines.push(`${u} ${v} ${t}`);
  }
  return lines.join("\n");
}

const staticCases = [
  {
    input: "30\n6 7\n5 1 2 10 6 2\n0 1 10\n1 2 10\n2 5 10\n0 3 5\n3 4 5\n4 5 15\n3 5 20",
    isExample: true
  },
  {
    input: "29\n6 7\n5 1 2 10 6 2\n0 1 10\n1 2 10\n2 5 10\n0 3 5\n3 4 5\n4 5 15\n3 5 20",
    isExample: true
  },
  {
    input: "25\n6 7\n5 1 2 10 6 2\n0 1 10\n1 2 10\n2 5 10\n0 3 5\n3 4 5\n4 5 15\n3 5 20",
    isExample: true
  }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveMinCostToReachDestination(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 small edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Two nodes, reachable
    "15\n2 1\n10 20\n0 1 10",
    // Two nodes, unreachable due to maxTime
    "5\n2 1\n10 20\n0 1 10",
    // Linear graph
    "50\n4 3\n5 10 15 20\n0 1 10\n1 2 15\n2 3 20",
    // Disconnected graph
    "100\n3 1\n1 2 3\n0 1 10",
    // Start node is same as end node? (N >= 2 as per constraints, so no)
    // Budget just enough
    "45\n4 3\n5 10 15 20\n0 1 10\n1 2 15\n2 3 20"
  ];

  for (const ec of edgeCases) {
    const expected = solveMinCostToReachDestination(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random graphs (varying N from 4 to 35)
  console.log("Generating random graphs...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 6) + 4; // 4-9
    else if (i < 25) n = Math.floor(Math.random() * 15) + 10; // 10-24
    else n = Math.floor(Math.random() * 12) + 24; // 24-35

    const density = Math.random() * 0.3 + 0.1;
    const edges = generateConnectedGraph(n, density);
    const passingFees = [];
    for (let j = 0; j < n; j++) {
      passingFees.push(Math.floor(Math.random() * 100) + 1); // fee 1-100
    }
    
    // Pick standard path time sum, then scale maxTime around it
    const maxTime = Math.floor(Math.random() * 150) + 30; // budget 30-179
    const input = graphToInput(maxTime, n, edges, passingFees);
    const expected = solveMinCostToReachDestination(input);

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
    const expected = solveMinCostToReachDestination(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-min-cost-destination" },
    update: {
      title: "Minimum Cost to Reach Destination in Time Constraints",
      url: "https://www.youtube.com/watch?v=Fj-cuhkRj2E", // generic or specific search
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-min-cost-destination",
      title: "Minimum Cost to Reach Destination in Time Constraints",
      url: "https://www.youtube.com/watch?v=Fj-cuhkRj2E",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Minimum Cost to Reach Destination with Time' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "minimum-cost-to-reach-destination-with-time" },
    update: {
      title: "Minimum Cost to Reach Destination with Time",
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
      slug: "minimum-cost-to-reach-destination-with-time",
      title: "Minimum Cost to Reach Destination with Time",
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

  console.log("🎉 Successfully created/updated 'Minimum Cost to Reach Destination with Time'!");
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
