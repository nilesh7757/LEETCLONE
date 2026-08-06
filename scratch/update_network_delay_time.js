const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Network Delay Time</h1>

<p>You are given a network of <code>n</code> nodes, labeled from <code>1</code> to <code>n</code>. You are also given <code>times</code>, a list of travel times as directed edges <code>times[i] = (u_i, v_i, w_i)</code>, where <code>u_i</code> is the source node, <code>v_i</code> is the target node, and <code>w_i</code> is the time it takes for a signal to travel from source to target.</p>

<p>We will send a signal from a given node <code>k</code>. Return the <strong>minimum time</strong> it takes for all the <code>n</code> nodes to receive the signal. If it is impossible for all the <code>n</code> nodes to receive the signal, return <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph Structure for Example 1:</h3>
<svg width="450" height="220" viewBox="0 0 450 220" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
  </defs>
  <!-- Edges -->
  <line x1="80" y1="100" x2="200" y2="50" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="130" y="65" font-size="12" font-weight="bold" fill="#38bdf8">w=1</text>
  
  <line x1="80" y1="100" x2="200" y2="150" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="130" y="145" font-size="12" font-weight="bold" fill="#38bdf8">w=1</text>
  
  <line x1="200" y1="50" x2="200" y2="150" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="210" y="105" font-size="12" font-weight="bold" fill="#38bdf8">w=1</text>
  
  <line x1="200" y1="150" x2="320" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="270" y="140" font-size="12" font-weight="bold" fill="#38bdf8">w=1</text>

  <!-- Nodes -->
  <!-- Node 2 (Start Node - highlighted in green/emerald) -->
  <circle cx="80" cy="100" r="18" fill="#059669" stroke="#34d399" stroke-width="2.5" />
  <text x="80" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="80" y="75" font-size="11" font-weight="bold" fill="#34d399" text-anchor="middle">START (K)</text>

  <!-- Node 1 -->
  <circle cx="200" cy="50" r="18" fill="#1e293b" stroke="#64748b" stroke-width="2" />
  <text x="200" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Node 3 -->
  <circle cx="200" cy="150" r="18" fill="#1e293b" stroke="#64748b" stroke-width="2" />
  <text x="200" y="155" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="320" cy="100" r="18" fill="#1e293b" stroke="#64748b" stroke-width="2" />
  <text x="320" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
</svg>

<p><strong>Explanation for Example 1:</strong> The signal is sent from node 2. Nodes 1 and 3 receive the signal at time 1. Node 4 receives the signal at time 2 (through node 3). All nodes have received it by time 2.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>n</code> (number of nodes) and <code>k</code> (starting node).</li>
  <li><strong>Line 2:</strong> An integer <code>m</code> (number of directed edges).</li>
  <li><strong>Next <code>m</code> lines:</strong> Three space-separated integers <code>u v w</code> representing a directed edge from <code>u</code> to <code>v</code> with weight <code>w</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the minimum time it takes for all nodes to receive the signal, or <code>-1</code> if it is impossible.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; n &le; 100</code></li>
  <li><code>1 &le; k &le; n</code></li>
  <li><code>0 &le; m &le; 6000</code></li>
  <li><code>1 &le; u_i, v_i &le; n</code></li>
  <li><code>u_i &ne; v_i</code></li>
  <li><code>0 &le; w_i &le; 100</code></li>
  <li>All the pairs <code>(u_i, v_i)</code> are unique.</li>
</ul>
`.trim();

// Solver implementation using Dijkstra
function solveNetworkDelayTime(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return -1;
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const k = parseInt(firstLine[1]);
  if (!lines[1]) return -1;
  const m = parseInt(lines[1].trim());

  const adj = Array.from({ length: n + 1 }, () => []);
  for (let i = 0; i < m; i++) {
    const edgeLine = lines[2 + i];
    if (!edgeLine) continue;
    const tokens = edgeLine.trim().split(/\s+/);
    if (tokens.length < 3) continue;
    const u = parseInt(tokens[0]);
    const v = parseInt(tokens[1]);
    const w = parseInt(tokens[2]);
    adj[u].push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  
  const pq = [[0, k]]; // [distance, node]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;

    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }

  let maxDist = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    maxDist = Math.max(maxDist, dist[i]);
  }
  return maxDist;
}

// Generator helpers
function generateReachableGraph(n, k, density = 0.3) {
  if (n === 1) {
    return { n, k, edges: [] };
  }
  const edges = [];
  const edgeSet = new Set();
  
  // 1. Generate a directed spanning tree rooted at k to guarantee reachability of all nodes
  const reached = [k];
  const unreached = Array.from({ length: n }, (_, i) => i + 1).filter(x => x !== k);
  
  // Shuffle unreached
  for (let i = unreached.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unreached[i], unreached[j]] = [unreached[j], unreached[i]];
  }
  
  for (const v of unreached) {
    const u = reached[Math.floor(Math.random() * reached.length)];
    const w = Math.floor(Math.random() * 50) + 1; // weights 1-50
    edges.push([u, v, w]);
    edgeSet.add(`${u}-${v}`);
    reached.push(v);
  }
  
  // 2. Add extra random edges
  const maxEdges = n * (n - 1);
  const targetEdges = Math.min(maxEdges, Math.max(n - 1, Math.floor(maxEdges * density)));
  const attempts = 1000;
  let count = 0;
  
  while (edges.length < targetEdges && count < attempts) {
    count++;
    const u = Math.floor(Math.random() * n) + 1;
    const v = Math.floor(Math.random() * n) + 1;
    if (u === v) continue;
    const key = `${u}-${v}`;
    if (!edgeSet.has(key)) {
      const w = Math.floor(Math.random() * 50) + 1;
      edges.push([u, v, w]);
      edgeSet.add(key);
    }
  }
  
  return { n, k, edges };
}

function generateUnreachableGraph(n, k) {
  if (n <= 1) {
    return { n: 2, k: 1, edges: [[2, 1, 5]] }; // node 2 is unreachable from k=1
  }
  
  // Partition nodes into two disjoint sets: reachable and unreachable
  const mid = Math.floor(n / 2);
  const reachableNodes = Array.from({ length: mid }, (_, i) => i + 1);
  if (!reachableNodes.includes(k)) {
    reachableNodes.push(k);
  }
  const unreachableNodes = Array.from({ length: n }, (_, i) => i + 1).filter(x => !reachableNodes.includes(x));
  
  const allEdges = [];
  const edgeSet = new Set();
  
  // Generate reachable component
  const reached = [k];
  const unreachedSub = reachableNodes.filter(x => x !== k);
  for (const v of unreachedSub) {
    const u = reached[Math.floor(Math.random() * reached.length)];
    const w = Math.floor(Math.random() * 30) + 1;
    allEdges.push([u, v, w]);
    edgeSet.add(`${u}-${v}`);
    reached.push(v);
  }
  
  // Generate unreachable component (completely separated, or edges only internally/from unreachable back to reachable)
  if (unreachableNodes.length > 0) {
    const unreachedRoot = unreachableNodes[0];
    const reachedUn = [unreachedRoot];
    const unreachedSub2 = unreachableNodes.filter(x => x !== unreachedRoot);
    for (const v of unreachedSub2) {
      const u = reachedUn[Math.floor(Math.random() * reachedUn.length)];
      const w = Math.floor(Math.random() * 30) + 1;
      allEdges.push([u, v, w]);
      edgeSet.add(`${u}-${v}`);
      reachedUn.push(v);
    }
    
    // Add one edge from unreachable component back to reachable (still keeps unreachable components unreachable from k)
    const u = unreachableNodes[Math.floor(Math.random() * unreachableNodes.length)];
    const v = reachableNodes[Math.floor(Math.random() * reachableNodes.length)];
    allEdges.push([u, v, Math.floor(Math.random() * 10) + 1]);
  }
  
  return { n, k, edges: allEdges };
}

function graphToInput(graph) {
  const lines = [`${graph.n} ${graph.k}`, `${graph.edges.length}`];
  for (const [u, v, w] of graph.edges) {
    lines.push(`${u} ${v} ${w}`);
  }
  return lines.join("\n");
}

const staticCases = [
  { input: "4 2\n4\n2 1 1\n2 3 1\n3 4 1\n1 3 1", isExample: true },
  { input: "2 1\n1\n1 2 1", isExample: true },
  { input: "2 2\n1\n2 1 1", isExample: true },
  { input: "4 1\n2\n1 2 5\n3 4 2", isExample: false },
  { input: "5 1\n4\n1 2 10\n2 3 20\n3 4 30\n4 5 40", isExample: false }
];

async function main() {
  const testSets = [];

  // 1. Add static examples and edge cases
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveNetworkDelayTime(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 35 random reachable graphs
  console.log("Generating 35 reachable graphs...");
  for (let i = 0; i < 35; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 8) + 3; // 3-10
    else if (i < 25) n = Math.floor(Math.random() * 30) + 11; // 11-40
    else n = Math.floor(Math.random() * 50) + 41; // 41-90
    
    const k = Math.floor(Math.random() * n) + 1;
    const density = Math.random() * 0.3 + 0.1; // 10% to 40% density
    
    const graph = generateReachableGraph(n, k, density);
    const input = graphToInput(graph);
    const expected = solveNetworkDelayTime(input);
    
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 15 random unreachable graphs
  console.log("Generating 15 unreachable graphs...");
  for (let i = 0; i < 15; i++) {
    let n = Math.floor(Math.random() * 35) + 6; // 6-40
    const k = Math.floor(Math.random() * n) + 1;
    
    const graph = generateUnreachableGraph(n, k);
    const input = graphToInput(graph);
    const expected = solveNetworkDelayTime(input);
    
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
    const lines = tc.input.split("\n");
    const header = lines[0].split(" ");
    const n = parseInt(header[0]);
    const m = parseInt(lines[1]);
    if (lines.length !== m + 2) {
      throw new Error(`Test case ${i} malformed line count! Got ${lines.length}, expected ${m + 2}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-network-delay-time" },
    update: {
      title: "Striver's Network Delay Time - Dijkstra",
      url: "https://takeuforward.org/data-structure/network-delay-time-g-42/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-network-delay-time",
      title: "Striver's Network Delay Time - Dijkstra",
      url: "https://takeuforward.org/data-structure/network-delay-time-g-42/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-network-delay-time" },
    update: {
      title: "NeetCode's Network Delay Time - LeetCode 743",
      url: "https://www.youtube.com/watch?v=EaphyqXM4PQ",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-network-delay-time",
      title: "NeetCode's Network Delay Time - LeetCode 743",
      url: "https://www.youtube.com/watch?v=EaphyqXM4PQ",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Update problem in database and clean legacy resources
  console.log("Updating problem in database & disconnecting legacy Dijkstra resources...");
  const result = await prisma.problem.update({
    where: { slug: "network-delay-time" },
    data: {
      description: htmlDescription,
      testSets: testSets,
      resources: {
        disconnect: [
          { id: "f6e2960f-8d91-408d-b426-4898dd5199df" }, // old general striver video
          { id: "bcc00043-fb4e-46b9-8d35-93622c990a45" }  // old general neetcode video
        ],
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully updated 'Network Delay Time'!");
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
