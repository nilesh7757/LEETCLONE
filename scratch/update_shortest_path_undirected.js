const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Shortest Path in Undirected Graph with Unit Distance</h1>

<p>Given an undirected graph with <code>V</code> vertices and <code>E</code> edges, where every edge has a <strong>unit weight of 1</strong>, find the shortest path distance from a given source node <code>src</code> to all other vertices in the graph.</p>

<p>If a vertex is unreachable from the source node, its shortest path distance should be represented as <code>-1</code>.</p>

<p>Return an array of size <code>V</code> containing the shortest distances, where the <code>i</code>-th element is the distance from <code>src</code> to vertex <code>i</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph Structure for Example 1 (Fully Connected):</h3>
<p><strong>Input:</strong> <code>V = 9</code>, <code>E = 10</code>, <code>src = 0</code>, <code>edges = [[0,1],[0,3],[3,4],[4,5],[5,6],[1,2],[2,6],[6,7],[7,8],[6,8]]</code></p>
<svg width="550" height="220" viewBox="0 0 550 220" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="50" y1="110" x2="150" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="50" y1="110" x2="150" y2="170" stroke="#475569" stroke-width="3" />
  <line x1="150" y1="170" x2="250" y2="170" stroke="#475569" stroke-width="3" />
  <line x1="250" y1="170" x2="350" y2="170" stroke="#475569" stroke-width="3" />
  <line x1="350" y1="170" x2="350" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="150" y1="50" x2="250" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="250" y1="50" x2="350" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="350" y1="50" x2="450" y2="110" stroke="#475569" stroke-width="3" />
  <line x1="450" y1="110" x2="450" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="350" y1="50" x2="450" y2="50" stroke="#475569" stroke-width="3" />

  <!-- Nodes (color-coded by distance) -->
  <!-- Node 0 (dist=0) -->
  <circle cx="50" cy="110" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="3" />
  <text x="50" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="50" y="80" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">d=0</text>

  <!-- Node 1 (dist=1) -->
  <circle cx="150" cy="50" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="150" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="150" y="25" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">d=1</text>

  <!-- Node 3 (dist=1) -->
  <circle cx="150" cy="170" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="150" y="175" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  <text x="150" y="200" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">d=1</text>

  <!-- Node 2 (dist=2) -->
  <circle cx="250" cy="50" r="18" fill="#1e293b" stroke="#eab308" stroke-width="2" />
  <text x="250" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="250" y="25" font-size="10" font-weight="bold" fill="#eab308" text-anchor="middle">d=2</text>

  <!-- Node 4 (dist=2) -->
  <circle cx="250" cy="170" r="18" fill="#1e293b" stroke="#eab308" stroke-width="2" />
  <text x="250" y="175" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="250" y="200" font-size="10" font-weight="bold" fill="#eab308" text-anchor="middle">d=2</text>

  <!-- Node 5 (dist=3) -->
  <circle cx="350" cy="170" r="18" fill="#1e293b" stroke="#a855f7" stroke-width="2" />
  <text x="350" y="175" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="350" y="200" font-size="10" font-weight="bold" fill="#a855f7" text-anchor="middle">d=3</text>

  <!-- Node 6 (dist=3) -->
  <circle cx="350" cy="50" r="18" fill="#1e293b" stroke="#a855f7" stroke-width="2" />
  <text x="350" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
  <text x="350" y="25" font-size="10" font-weight="bold" fill="#a855f7" text-anchor="middle">d=3</text>

  <!-- Node 7 (dist=4) -->
  <circle cx="450" cy="110" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
  <text x="450" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>
  <text x="450" y="142" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">d=4</text>

  <!-- Node 8 (dist=4) -->
  <circle cx="450" cy="50" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
  <text x="450" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">8</text>
  <text x="450" y="25" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">d=4</text>
</svg>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Graph Structure for Example 3 (With Unreachable Component):</h3>
<p><strong>Input:</strong> <code>V = 5</code>, <code>E = 3</code>, <code>src = 0</code>, <code>edges = [[0,1],[1,2],[3,4]]</code></p>
<svg width="550" height="150" viewBox="0 0 550 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Component 1 Edges -->
  <line x1="70" y1="75" x2="170" y2="75" stroke="#475569" stroke-width="3" />
  <line x1="170" y1="75" x2="270" y2="75" stroke="#475569" stroke-width="3" />

  <!-- Component 2 Edges -->
  <line x1="400" y1="75" x2="500" y2="75" stroke="#ef4444" stroke-width="3" stroke-dasharray="5,3" />

  <!-- Component 1 Nodes -->
  <circle cx="70" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="3" />
  <text x="70" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="70" y="45" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">d=0</text>

  <circle cx="170" cy="75" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="170" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="170" y="45" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">d=1</text>

  <circle cx="270" cy="75" r="18" fill="#1e293b" stroke="#eab308" stroke-width="2" />
  <text x="270" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="270" y="45" font-size="10" font-weight="bold" fill="#eab308" text-anchor="middle">d=2</text>

  <!-- Component 2 Nodes (Unreachable) -->
  <circle cx="400" cy="75" r="18" fill="#1d1e22" stroke="#475569" stroke-width="2" />
  <text x="400" y="80" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">3</text>
  <text x="400" y="45" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">d=-1</text>

  <circle cx="500" cy="75" r="18" fill="#1d1e22" stroke="#475569" stroke-width="2" />
  <text x="500" y="80" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">4</text>
  <text x="500" y="45" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">d=-1</text>
</svg>
<p><strong>Explanation for Example 3:</strong> Nodes 3 and 4 belong to a separate connected component and cannot be reached from source node 0, so their distances are marked as <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Three space-separated integers: <code>V</code> (number of vertices), <code>E</code> (number of edges), and <code>src</code> (the source node).</li>
  <li><strong>Next <code>E</code> lines:</strong> Two space-separated integers <code>u v</code> representing an undirected edge between node <code>u</code> and node <code>v</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print <code>V</code> space-separated integers representing the shortest path distances from <code>src</code> to all vertices from 0 to <code>V - 1</code>.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; V &le; 10^4</code></li>
  <li><code>0 &le; E &le; 10^5</code></li>
  <li><code>0 &le; src &lt; V</code></li>
  <li><code>0 &le; u, v &lt; V</code></li>
  <li>There are no self-loops or multiple edges between the same two nodes.</li>
</ul>
`.trim();

// Solver implementation to calculate expectedOutputs
function solveShortestPath(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return "";
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const e = parseInt(firstLine[1]);
  const src = parseInt(firstLine[2]);

  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < e; i++) {
    const edgeLine = lines[1 + i];
    if (!edgeLine) continue;
    const tokens = edgeLine.trim().split(/\s+/);
    if (tokens.length < 2) continue;
    const u = parseInt(tokens[0]);
    const v = parseInt(tokens[1]);
    adj[u].push(v);
    adj[v].push(u);
  }

  const dist = new Array(n).fill(1e9);
  dist[src] = 0;
  const q = [src];
  let qIdx = 0;

  while (qIdx < q.length) {
    const node = q[qIdx++];
    for (const neighbor of adj[node]) {
      if (dist[node] + 1 < dist[neighbor]) {
        dist[neighbor] = dist[node] + 1;
        q.push(neighbor);
      }
    }
  }

  const result = dist.map(d => (d === 1e9 ? -1 : d));
  return result.join(" ");
}

// Generator helpers
function generateConnectedGraph(n, density = 0.3) {
  if (n === 1) {
    return { n, edges: [], src: 0 };
  }
  const edges = [];
  const edgeSet = new Set();
  
  const visited = [0];
  const unvisited = Array.from({ length: n - 1 }, (_, i) => i + 1);
  
  for (let i = unvisited.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unvisited[i], unvisited[j]] = [unvisited[j], unvisited[i]];
  }
  
  for (const v of unvisited) {
    const u = visited[Math.floor(Math.random() * visited.length)];
    const min = Math.min(u, v);
    const max = Math.max(u, v);
    edges.push([min, max]);
    edgeSet.add(`${min}-${max}`);
    visited.push(v);
  }
  
  const maxEdges = (n * (n - 1)) / 2;
  const targetEdges = Math.min(maxEdges, Math.max(n - 1, Math.floor(maxEdges * density)));
  const attempts = 1000;
  let count = 0;
  
  while (edges.length < targetEdges && count < attempts) {
    count++;
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u === v) continue;
    const min = Math.min(u, v);
    const max = Math.max(u, v);
    const key = `${min}-${max}`;
    if (!edgeSet.has(key)) {
      edges.push([min, max]);
      edgeSet.add(key);
    }
  }
  
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }
  
  const src = Math.floor(Math.random() * n);
  return { n, edges, src };
}

function generateDisconnectedGraph(n, numComponents = 2) {
  if (n <= numComponents) {
    return { n, edges: [], src: 0 };
  }
  
  const componentSizes = new Array(numComponents).fill(1);
  let remaining = n - numComponents;
  while (remaining > 0) {
    const idx = Math.floor(Math.random() * numComponents);
    componentSizes[idx]++;
    remaining--;
  }
  
  let nodeOffset = 0;
  const allEdges = [];
  
  for (const size of componentSizes) {
    const subGraph = generateConnectedGraph(size, 0.4);
    for (const [u, v] of subGraph.edges) {
      allEdges.push([u + nodeOffset, v + nodeOffset]);
    }
    nodeOffset += size;
  }
  
  for (let i = allEdges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allEdges[i], allEdges[j]] = [allEdges[j], allEdges[i]];
  }
  
  const src = Math.floor(Math.random() * n);
  return { n, edges: allEdges, src };
}

function graphToInput(graph) {
  const head = `${graph.n} ${graph.edges.length} ${graph.src}`;
  const lines = [head];
  for (const [u, v] of graph.edges) {
    lines.push(`${u} ${v}`);
  }
  return lines.join("\n");
}

const staticCases = [
  { input: "9 10 0\n0 1\n0 3\n3 4\n4 5\n5 6\n1 2\n2 6\n6 7\n7 8\n6 8", isExample: true },
  { input: "8 10 0\n1 0\n2 1\n0 3\n3 7\n3 4\n7 4\n7 6\n4 5\n4 6\n6 5", isExample: true },
  { input: "5 3 0\n0 1\n1 2\n3 4", isExample: true },
  { input: "1 0 0", isExample: false },
  { input: "6 5 3\n0 1\n1 2\n2 3\n3 4\n4 5", isExample: false }
];

async function main() {
  const testSets = [];

  // 1. Add static examples and edge cases
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveShortestPath(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: expected,
      isExample: tc.isExample
    });
  }

  // 2. Generate 35 random connected graphs
  console.log("Generating 35 connected graphs...");
  for (let i = 0; i < 35; i++) {
    // vary size
    let n = 2;
    if (i < 10) n = Math.floor(Math.random() * 8) + 2; // 2-9
    else if (i < 25) n = Math.floor(Math.random() * 30) + 10; // 10-39
    else n = Math.floor(Math.random() * 50) + 40; // 40-89
    
    const density = Math.random() * 0.4 + 0.1; // 10% to 50% density
    const graph = generateConnectedGraph(n, density);
    const input = graphToInput(graph);
    const expected = solveShortestPath(input);
    
    testSets.push({
      input,
      expectedOutput: expected,
      isExample: false
    });
  }

  // 3. Generate 15 random disconnected graphs (multiple components)
  console.log("Generating 15 disconnected graphs...");
  for (let i = 0; i < 15; i++) {
    let n = Math.floor(Math.random() * 40) + 10; // 10-49
    let comps = Math.floor(Math.random() * 3) + 2; // 2-4 components
    
    const graph = generateDisconnectedGraph(n, comps);
    const input = graphToInput(graph);
    const expected = solveShortestPath(input);
    
    testSets.push({
      input,
      expectedOutput: expected,
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Verify all locally (making sure they all run and have valid format)
  console.log("Verifying test cases format...");
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const n = parseInt(tc.input.split("\n")[0].split(" ")[0]);
    const expCount = tc.expectedOutput.split(" ").length;
    if (n !== expCount) {
      throw new Error(`Test case ${i} mismatch! N = ${n}, expected output count = ${expCount}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-shortest-path-undirected" },
    update: {
      title: "Shortest Path in Undirected Graph with Unit Distance",
      url: "https://takeuforward.org/data-structure/shortest-path-in-undirected-graph-with-unit-distance-g-28/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-shortest-path-undirected",
      title: "Shortest Path in Undirected Graph with Unit Distance",
      url: "https://takeuforward.org/data-structure/shortest-path-in-undirected-graph-with-unit-distance-g-28/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-shortest-path-undirected-video" },
    update: {
      title: "Shortest Path in Undirected Graph with Unit Distance | BFS",
      url: "https://www.youtube.com/watch?v=C4gxoTaI71U",
      type: "VIDEO",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-shortest-path-undirected-video",
      title: "Shortest Path in Undirected Graph with Unit Distance | BFS",
      url: "https://www.youtube.com/watch?v=C4gxoTaI71U",
      type: "VIDEO",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver video resource ready.");

  // 6. Update problem in database
  console.log("Updating problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "shortest-path-in-undirected-graph-with-unit-distance" },
    data: {
      description: htmlDescription,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully updated 'Shortest Path in Undirected Graph with Unit Distance'!");
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
