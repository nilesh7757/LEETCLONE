const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// JS implementation of Tarjan's Articulation Points algorithm to compute expected outputs
function solveArticulationPoints(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const vis = new Array(n).fill(false);
  const tin = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const mark = new Array(n).fill(0);
  let timer = 1;

  function dfs(node, parent) {
    vis[node] = true;
    tin[node] = low[node] = timer++;
    let child = 0;

    for (const neighbor of adj[node]) {
      if (neighbor === parent) continue;
      if (!vis[neighbor]) {
        dfs(neighbor, node);
        low[node] = Math.min(low[node], low[neighbor]);
        if (low[neighbor] >= tin[node] && parent !== -1) {
          mark[node] = 1;
        }
        child++;
      } else {
        low[node] = Math.min(low[node], tin[neighbor]);
      }
    }

    if (parent === -1 && child > 1) {
      mark[node] = 1;
    }
  }

  for (let i = 0; i < n; i++) {
    if (!vis[i]) {
      dfs(i, -1);
    }
  }

  const ans = [];
  for (let i = 0; i < n; i++) {
    if (mark[i] === 1) {
      ans.push(i);
    }
  }

  if (ans.length === 0) return "None";
  return ans.join(" ");
}

// Generate randomized connected graph with N nodes
function generateRandomGraph(n, edgeDensity = 1.3) {
  const edges = [];
  // 1. Spanning tree to ensure connectedness
  for (let i = 1; i < n; i++) {
    const parent = Math.floor(Math.random() * i);
    edges.push([parent, i]);
  }

  // 2. Add extra random edges
  const extraEdgesCount = Math.floor(n * (edgeDensity - 1));
  const existingSet = new Set(edges.map(([u, v]) => `${Math.min(u,v)}-${Math.max(u,v)}`));

  for (let k = 0; k < extraEdgesCount; k++) {
    let u = Math.floor(Math.random() * n);
    let v = Math.floor(Math.random() * n);
    if (u !== v) {
      const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
      if (!existingSet.has(key)) {
        edges.push([u, v]);
        existingSet.add(key);
      }
    }
  }

  return edges;
}

async function main() {
  const testSets = [];

  // --- Add Examples (1-3) ---
  // Ex 1
  testSets.push({
    input: "5 5\n0 1\n1 4\n2 4\n2 3\n3 4",
    isExample: true,
    expectedOutput: "1 4"
  });
  // Ex 2
  testSets.push({
    input: "4 4\n0 1\n1 2\n2 0\n1 3",
    isExample: true,
    expectedOutput: "1"
  });
  // Ex 3
  testSets.push({
    input: "3 3\n0 1\n1 2\n2 0",
    isExample: true,
    expectedOutput: "None"
  });

  // --- Add Corner Cases & Standard Structures (4-15) ---
  // Case 4: Simple line graph (all internal nodes are articulation points)
  testSets.push({
    input: "6 5\n0 1\n1 2\n2 3\n3 4\n4 5",
    isExample: false,
    expectedOutput: "1 2 3 4"
  });

  // Case 5: Star graph (center hub 0 is articulation point)
  testSets.push({
    input: "6 5\n0 1\n0 2\n0 3\n0 4\n0 5",
    isExample: false,
    expectedOutput: "0"
  });

  // Case 6: Completely disconnected vertices (articulation point: None)
  testSets.push({
    input: "4 0",
    isExample: false,
    expectedOutput: "None"
  });

  // Case 7: Cycle graph C5 (no articulation points)
  testSets.push({
    input: "5 5\n0 1\n1 2\n2 3\n3 4\n4 0",
    isExample: false,
    expectedOutput: "None"
  });

  // Case 8: Two cycles joined by an edge (both end nodes of the link are articulation points)
  testSets.push({
    input: "7 8\n0 1\n1 2\n2 0\n2 3\n3 4\n4 5\n5 6\n6 4",
    isExample: false,
    expectedOutput: "2 3 4"
  });

  // Case 9: Tree (leaves are not articulation points, internal nodes are)
  testSets.push({
    input: "8 7\n0 1\n1 2\n1 3\n2 4\n2 5\n3 6\n3 7",
    isExample: false,
    expectedOutput: "1 2 3"
  });

  // Case 10: Complete graph K5 (no articulation points)
  testSets.push({
    input: "5 10\n0 1\n0 2\n0 3\n0 4\n1 2\n1 3\n1 4\n2 3\n2 4\n3 4",
    isExample: false,
    expectedOutput: "None"
  });

  // Case 11: Two separate components, each has an articulation point
  testSets.push({
    input: "8 7\n0 1\n1 2\n2 0\n2 3\n4 5\n5 6\n6 7",
    isExample: false,
    expectedOutput: "2 5 6"
  });

  // Case 12: Complex tree structure
  testSets.push({
    input: "10 9\n0 1\n1 2\n2 3\n3 4\n0 5\n5 6\n6 7\n0 8\n8 9",
    isExample: false,
    expectedOutput: "0 1 2 3 5 6 8"
  });

  // --- Add Randomized Cases (13-50) ---
  for (let i = 13; i <= 50; i++) {
    // Ranging from small (10 nodes) to medium-large (80 nodes)
    const n = 10 + (i % 5) * 15; // 10, 25, 40, 55, 70
    const edgeDensity = 1.1 + (i % 3) * 0.15; // 1.1, 1.25, 1.4
    const edges = generateRandomGraph(n, edgeDensity);
    
    // Sort edges for cleaner input presentation
    edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const inputLines = [`${n} ${edges.length}`];
    for (const [u, v] of edges) {
      inputLines.push(`${u} ${v}`);
    }
    const inputStr = inputLines.join("\n");
    const expectedOutputStr = solveArticulationPoints(n, edges);

    testSets.push({
      input: inputStr,
      isExample: false,
      expectedOutput: expectedOutputStr
    });
  }

  console.log(`Generated ${testSets.length} test cases successfully!`);
  
  // Write the output json to scratch for inspect
  const fs = require("fs");
  fs.writeFileSync("D:/LEETCLONE/scratch/articulation_testsets.json", JSON.stringify(testSets, null, 2));
  console.log("Saved generated test cases to D:/LEETCLONE/scratch/articulation_testsets.json");
}

main().catch(e => console.error(e));
