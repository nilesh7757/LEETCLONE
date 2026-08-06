import { PrismaClient, ProblemType } from '@prisma/client';
const prisma = new PrismaClient();

// ==========================================
// 1. ROTTING ORANGES SOLVER
// ==========================================
function solveRottingOranges(m: number, n: number, gridInput: number[][]): number {
  const grid = gridInput.map(row => [...row]);
  const queue: [number, number, number][] = [];
  let freshCount = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 2) {
        queue.push([i, j, 0]);
      } else if (grid[i][j] === 1) {
        freshCount++;
      }
    }
  }

  let minutes = 0;
  let qIdx = 0;
  while (qIdx < queue.length && freshCount > 0) {
    const [r, c, t] = queue[qIdx++];
    minutes = t + 1;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1) {
        grid[nr][nc] = 2;
        freshCount--;
        queue.push([nr, nc, minutes]);
      }
    }
  }

  return freshCount === 0 ? minutes : -1;
}

// ==========================================
// 2. CRITICAL CONNECTIONS SOLVER
// ==========================================
function solveCriticalConnections(n: number, edges: [number, number][]): [number, number][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const tin = new Int32Array(n).fill(-1);
  const low = new Int32Array(n).fill(-1);
  const bridges: [number, number][] = [];
  let timer = 0;

  function dfs(u: number, p: number) {
    tin[u] = low[u] = timer++;
    for (const v of adj[u]) {
      if (v === p) continue;
      if (tin[v] !== -1) {
        low[u] = Math.min(low[u], tin[v]);
      } else {
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > tin[u]) {
          bridges.push([Math.min(u, v), Math.max(u, v)]);
        }
      }
    }
  }

  // Assuming connected graph as per standard LeetCode problem constraints
  if (n > 0) {
    dfs(0, -1);
  }

  bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return bridges;
}

// ==========================================
// 3. ROTTING ORANGES TEST CASES GENERATOR
// ==========================================
function generateRottingOrangesTestCases() {
  const testSets: { input: string; expectedOutput: string; isExample: boolean }[] = [];

  // Examples (3)
  const examples = [
    {
      grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]],
      isExample: true
    },
    {
      grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]],
      isExample: true
    },
    {
      grid: [[0, 2]],
      isExample: true
    }
  ];

  for (const ex of examples) {
    const m = ex.grid.length;
    const n = ex.grid[0].length;
    const inputStr = `${m} ${n}\n` + ex.grid.map(row => row.join(' ')).join('\n');
    const expected = solveRottingOranges(m, n, ex.grid);
    testSets.push({
      input: inputStr,
      expectedOutput: String(expected),
      isExample: ex.isExample
    });
  }

  // Edge Cases (1x1, 1x2, 2x1)
  const edgeGrids = [
    [[0]], [[1]], [[2]],
    [[0, 0]], [[1, 1]], [[2, 2]], [[1, 2]], [[2, 1]], [[0, 1]], [[0, 2]],
    [[0], [0]], [[1], [1]], [[2], [2]], [[1], [2]], [[2], [1]], [[0], [1]]
  ];

  for (const grid of edgeGrids) {
    const m = grid.length;
    const n = grid[0].length;
    const inputStr = `${m} ${n}\n` + grid.map(row => row.join(' ')).join('\n');
    const expected = solveRottingOranges(m, n, grid);
    testSets.push({
      input: inputStr,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // Larger Line / Chain cases
  // A long chain of fresh oranges, rotten at one end
  for (let len = 3; len <= 10; len++) {
    const grid1 = [Array(len).fill(1)];
    grid1[0][0] = 2; // Rotten at left
    const inputStr1 = `1 ${len}\n` + grid1[0].join(' ');
    testSets.push({
      input: inputStr1,
      expectedOutput: String(len - 1),
      isExample: false
    });

    const grid2 = Array.from({ length: len }, () => [1]);
    grid2[len - 1][0] = 2; // Rotten at bottom
    const inputStr2 = `${len} 1\n` + grid2.map(r => r[0]).join('\n');
    testSets.push({
      input: inputStr2,
      expectedOutput: String(len - 1),
      isExample: false
    });
  }

  // Unreachable / No Rotten Case
  testSets.push({
    input: "3 3\n1 1 1\n1 1 1\n1 1 1",
    expectedOutput: "-1",
    isExample: false
  });

  // All empty
  testSets.push({
    input: "3 3\n0 0 0\n0 0 0\n0 0 0",
    expectedOutput: "0",
    isExample: false
  });

  // All rotten
  testSets.push({
    input: "3 3\n2 2 2\n2 2 2\n2 2 2",
    expectedOutput: "0",
    isExample: false
  });

  // Multiple Rotten Spreaders
  const multiRottenGrid1 = [
    [2, 1, 2],
    [1, 1, 1],
    [2, 1, 2]
  ];
  testSets.push({
    input: "3 3\n2 1 2\n1 1 1\n2 1 2",
    expectedOutput: String(solveRottingOranges(3, 3, multiRottenGrid1)),
    isExample: false
  });

  const multiRottenGrid2 = [
    [2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 2]
  ];
  testSets.push({
    input: "3 5\n2 1 1 1 2\n1 1 1 1 1\n2 1 1 1 2",
    expectedOutput: String(solveRottingOranges(3, 5, multiRottenGrid2)),
    isExample: false
  });

  // Maze-like / blocked pathways
  const blockedGrid = [
    [2, 1, 0, 1, 1],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 2]
  ];
  testSets.push({
    input: "3 5\n2 1 0 1 1\n0 1 0 1 0\n1 1 1 1 2",
    expectedOutput: String(solveRottingOranges(3, 5, blockedGrid)),
    isExample: false
  });

  // Generate random grids to reach at least 50
  let id = 1;
  while (testSets.length < 52) {
    const m = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const n = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const grid: number[][] = [];
    for (let i = 0; i < m; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        const rand = Math.random();
        if (rand < 0.2) row.push(0); // empty
        else if (rand < 0.85) row.push(1); // fresh
        else row.push(2); // rotten
      }
      grid.push(row);
    }
    // Make sure there is at least one rotten and one fresh
    let hasRotten = false;
    let hasFresh = false;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === 2) hasRotten = true;
        if (grid[i][j] === 1) hasFresh = true;
      }
    }
    if (!hasRotten) {
      grid[0][0] = 2;
    }
    if (!hasFresh) {
      grid[m - 1][n - 1] = 1;
    }

    const inputStr = `${m} ${n}\n` + grid.map(row => row.join(' ')).join('\n');
    const expected = solveRottingOranges(m, n, grid);
    testSets.push({
      input: inputStr,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  return testSets;
}

// ==========================================
// 4. CRITICAL CONNECTIONS TEST CASES GENERATOR
// ==========================================
function generateCriticalConnectionsTestCases() {
  const testSets: { input: string; expectedOutput: string; isExample: boolean }[] = [];

  // Example 1
  const ex1Edges: [number, number][] = [[0, 1], [1, 2], [2, 0], [1, 3]];
  testSets.push({
    input: "4 4\n0 1\n1 2\n2 0\n1 3",
    expectedOutput: solveCriticalConnections(4, ex1Edges).map(([u, v]) => `${u} ${v}`).join('\n'),
    isExample: true
  });

  // Example 2 (Simplest: 2 nodes, 1 bridge)
  const ex2Edges: [number, number][] = [[0, 1]];
  testSets.push({
    input: "2 1\n0 1",
    expectedOutput: "0 1",
    isExample: true
  });

  // Star Graph (All edges are bridges)
  for (let n = 3; n <= 10; n++) {
    const edges: [number, number][] = [];
    for (let i = 1; i < n; i++) {
      edges.push([0, i]);
    }
    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected,
      isExample: false
    });
  }

  // Ring Graph / Cycle (No bridges)
  for (let n = 3; n <= 10; n++) {
    const edges: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      edges.push([i, (i + 1) % n]);
    }
    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected, // should be empty string
      isExample: false
    });
  }

  // Dumbbell Graph (Two rings connected by a bridge)
  // ring 1: 0, 1, 2. ring 2: 3, 4, 5. bridge: 2-3
  const dumbbellEdges: [number, number][] = [
    [0, 1], [1, 2], [2, 0],
    [3, 4], [4, 5], [5, 3],
    [2, 3]
  ];
  testSets.push({
    input: "6 7\n0 1\n1 2\n2 0\n3 4\n4 5\n5 3\n2 3",
    expectedOutput: "2 3",
    isExample: false
  });

  // Line / Tree (N nodes, N-1 bridges)
  for (let n = 3; n <= 8; n++) {
    const edges: [number, number][] = [];
    for (let i = 0; i < n - 1; i++) {
      edges.push([i, i + 1]);
    }
    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected,
      isExample: false
    });
  }

  // Complete Graphs (K_n, no bridges)
  for (let n = 3; n <= 6; n++) {
    const edges: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        edges.push([i, j]);
      }
    }
    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected,
      isExample: false
    });
  }

  // Tree Graphs (Random binary-like trees)
  for (let n = 8; n <= 15; n += 2) {
    const edges: [number, number][] = [];
    for (let i = 1; i < n; i++) {
      const parent = Math.floor((i - 1) / 2);
      edges.push([parent, i]);
    }
    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected,
      isExample: false
    });
  }

  // Grid Graphs with one bridge hanging off
  // 2x3 grid: nodes 0..5. Edge to node 6 (bridge)
  const gridEdges: [number, number][] = [
    [0, 1], [1, 2], [3, 4], [4, 5],
    [0, 3], [1, 4], [2, 5],
    [2, 6]
  ];
  testSets.push({
    input: "7 8\n0 1\n1 2\n3 4\n4 5\n0 3\n1 4\n2 5\n2 6",
    expectedOutput: "2 6",
    isExample: false
  });

  // Random Connected Graphs (Erdős-Rényi-like with guarantees of connection)
  while (testSets.length < 52) {
    const n = Math.floor(Math.random() * 20) + 10; // 10 to 29 nodes
    const edges: [number, number][] = [];
    
    // Ensure connectivity: connect each node i to a random previous node
    for (let i = 1; i < n; i++) {
      const target = Math.floor(Math.random() * i);
      edges.push([target, i]);
    }

    // Add extra random edges to create cycles and reduce bridges
    const edgeSet = new Set(edges.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`));
    const extraEdgesCount = Math.floor(Math.random() * n);
    for (let k = 0; k < extraEdgesCount; k++) {
      const u = Math.floor(Math.random() * n);
      const v = Math.floor(Math.random() * n);
      if (u !== v) {
        const edgeKey = `${Math.min(u, v)}-${Math.max(u, v)}`;
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push([u, v]);
        }
      }
    }

    // Shuffle edges to make it realistic
    edges.sort(() => Math.random() - 0.5);

    const inputStr = `${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n');
    const expected = solveCriticalConnections(n, edges).map(([u, v]) => `${u} ${v}`).join('\n');
    testSets.push({
      input: inputStr,
      expectedOutput: expected,
      isExample: false
    });
  }

  return testSets;
}

// ==========================================
// MAIN EXECUTION
// ==========================================
async function main() {
  console.log("Generating Rotting Oranges test cases...");
  const rottingOrangesTestCases = generateRottingOrangesTestCases();
  console.log(`Generated ${rottingOrangesTestCases.length} test cases for Rotting Oranges.`);

  console.log("Generating Critical Connections test cases...");
  const criticalConnectionsTestCases = generateCriticalConnectionsTestCases();
  console.log(`Generated ${criticalConnectionsTestCases.length} test cases for Critical Connections.`);

  // Rotting Oranges Description HTML
  const rottingOrangesDescriptionHTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; color: #e4e4e7; line-height: 1.6;">
  <h1>Rotting Oranges</h1>
  <p>You are given an <code>m x n</code> grid where each cell can have one of three values:</p>
  <ul>
    <li><code>0</code> representing an empty cell,</li>
    <li><code>1</code> representing a fresh orange, or</li>
    <li><code>2</code> representing a rotten orange.</li>
  </ul>
  <p>Every minute, any fresh orange that is <strong>4-directionally adjacent</strong> to a rotten orange becomes rotten.</p>
  <p>Return <em>the minimum number of minutes that must elapse until no cell has a fresh orange</em>. If this is impossible, return <code>-1</code>.</p>

  <h3 style="color: #f97316; margin-top: 24px;">Visual Explanation of Example 1</h3>
  <p>Given Grid: <code>[[2,1,1],[1,1,0],[0,1,1]]</code></p>
  
  <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; justify-content: start;">
    <!-- Minute 0 -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; width: 160px; text-align: center;">
      <h4 style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">Minute 0 (Start)</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 30px); gap: 6px; justify-content: center; margin-bottom: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);" title="Rotten">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;" title="Empty">0</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;" title="Empty">0</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;" title="Fresh">1</div>
      </div>
      <span style="font-size: 11px; color: #71717a;">1 Rotten, 6 Fresh</span>
    </div>

    <!-- Arrow -->
    <div style="display: flex; align-items: center; color: #71717a; font-size: 24px;">&rarr;</div>

    <!-- Minute 1 -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; width: 160px; text-align: center;">
      <h4 style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">Minute 1</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 30px); gap: 6px; justify-content: center; margin-bottom: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
      </div>
      <span style="font-size: 11px; color: #71717a;">3 Rotten, 4 Fresh</span>
    </div>

    <!-- Arrow -->
    <div style="display: flex; align-items: center; color: #71717a; font-size: 24px;">&rarr;</div>

    <!-- Minute 2 -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; width: 160px; text-align: center;">
      <h4 style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">Minute 2</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 30px); gap: 6px; justify-content: center; margin-bottom: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
      </div>
      <span style="font-size: 11px; color: #71717a;">5 Rotten, 2 Fresh</span>
    </div>

    <!-- Arrow -->
    <div style="display: flex; align-items: center; color: #71717a; font-size: 24px;">&rarr;</div>

    <!-- Minute 3 -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; width: 160px; text-align: center;">
      <h4 style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">Minute 3</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 30px); gap: 6px; justify-content: center; margin-bottom: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</div>
      </div>
      <span style="font-size: 11px; color: #71717a;">6 Rotten, 1 Fresh</span>
    </div>

    <!-- Arrow -->
    <div style="display: flex; align-items: center; color: #71717a; font-size: 24px;">&rarr;</div>

    <!-- Minute 4 -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; width: 160px; text-align: center;">
      <h4 style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">Minute 4 (End)</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 30px); gap: 6px; justify-content: center; margin-bottom: 8px;">
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #27272a; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 12px;">0</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
        <div style="width: 30px; height: 30px; border-radius: 6px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">2</div>
      </div>
      <span style="font-size: 11px; color: #22c55e; font-weight: bold;">7 Rotten, 0 Fresh</span>
    </div>
  </div>
  
  <p>Output is <strong>4</strong> because at minute 4, all oranges have rotted.</p>

  <h3 style="color: #3b82f6; margin-top: 24px;">Input Format</h3>
  <p>The input consists of:</p>
  <ul>
    <li>The first line containing two space-separated integers: <code>m</code> and <code>n</code>, the dimensions of the grid.</li>
    <li>The next <code>m</code> lines, each containing <code>n</code> space-separated integers representing a row of the grid (with values 0, 1, or 2).</li>
  </ul>

  <h3 style="color: #3b82f6; margin-top: 16px;">Output Format</h3>
  <p>Print a single integer: the minimum number of minutes until no fresh oranges remain, or <code>-1</code> if it is impossible.</p>

  <h3 style="color: #3b82f6; margin-top: 16px;">Constraints</h3>
  <ul>
    <li><code>1 &le; m, n &le; 10</code></li>
    <li><code>grid[i][j]</code> is <code>0</code>, <code>1</code>, or <code>2</code>.</li>
  </ul>
</div>
  `;

  // Rotting Oranges Python Reference Solution
  const rottingOrangesReferenceSolution = `
import sys
from collections import deque

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    m = int(input_data[0])
    n = int(input_data[1])
    
    grid = []
    queue = deque()
    fresh = 0
    idx = 2
    for i in range(m):
        row = []
        for j in range(n):
            val = int(input_data[idx])
            row.append(val)
            if val == 2:
                queue.append((i, j, 0))
            elif val == 1:
                fresh += 1
            idx += 1
        grid.append(row)
        
    minutes = 0
    while queue and fresh > 0:
        r, c, t = queue.popleft()
        minutes = t + 1
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                queue.append((nr, nc, minutes))
                
    if fresh > 0:
        print(-1)
    else:
        print(minutes)

if __name__ == '__main__':
    solve()
  `.trim();

  // Critical Connections Description HTML
  const criticalConnectionsDescriptionHTML = `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; color: #e4e4e7; line-height: 1.6;">
  <h1>Critical Connections in a Network</h1>
  <p>There are <code>n</code> servers numbered from <code>0</code> to <code>n - 1</code> connected by undirected server-to-server connections forming a network. You are given the connections list where <code>connections[i] = [u, v]</code> represents a bidirectional connection between servers <code>u</code> and <code>v</code>.</p>
  
  <p>A <strong>critical connection</strong> (or bridge) is a connection that, if removed, will make some servers unable to reach some other servers.</p>
  
  <p>Return all critical connections in the network. You must output them sorted such that for each connection <code>[u, v]</code>, <code>u < v</code>, and the list of connections is sorted lexicographically.</p>

  <h3 style="color: #f97316; margin-top: 24px;">Visual Explanation of Example 1</h3>
  <p>Input: <code>n = 4</code>, connections = <code>[[0,1],[1,2],[2,0],[1,3]]</code></p>
  
  <div style="margin: 20px 0; text-align: center;">
    <svg width="360" height="240" viewBox="0 0 360 240" style="background-color: #0b0b0c; border: 1px solid #27272a; border-radius: 16px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
      <defs>
        <!-- Glow filter for critical bridge -->
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <!-- Glow filter for nodes -->
        <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Non-critical connections (Cycle 0-1-2) -->
      <line x1="80" y1="120" x2="200" y2="60" stroke="#3b82f6" stroke-width="4" />
      <line x1="80" y1="120" x2="200" y2="180" stroke="#3b82f6" stroke-width="4" />
      <line x1="200" y1="60" x2="200" y2="180" stroke="#3b82f6" stroke-width="4" />
      
      <!-- Critical Connection (Bridge 1-3) -->
      <line x1="200" y1="180" x2="300" y2="180" stroke="#ef4444" stroke-width="5" stroke-dasharray="6,4" filter="url(#glow-red)" />
      
      <!-- Nodes -->
      <!-- Node 0 -->
      <circle cx="80" cy="120" r="22" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" />
      <text x="80" y="125" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">0</text>
      
      <!-- Node 2 -->
      <circle cx="200" cy="60" r="22" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" />
      <text x="200" y="65" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">2</text>
      
      <!-- Node 1 -->
      <circle cx="200" cy="180" r="22" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" />
      <text x="200" y="185" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">1</text>
      
      <!-- Node 3 -->
      <circle cx="300" cy="180" r="22" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" filter="url(#glow-node)" />
      <text x="300" y="185" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">3</text>
      
      <!-- Labels -->
      <text x="250" y="160" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">CRITICAL BRIDGE</text>
      <text x="140" y="110" fill="#3b82f6" font-size="11" text-anchor="middle">Cycle (Safe)</text>
    </svg>
  </div>
  
  <p>Explanation: If you remove the connection between server 1 and server 3, server 3 becomes isolated from the rest of the network. Therefore, <code>[1,3]</code> is a critical connection.</p>

  <h3 style="color: #3b82f6; margin-top: 24px;">Input Format</h3>
  <p>The input consists of:</p>
  <ul>
    <li>The first line containing two space-separated integers: <code>n</code> (number of servers) and <code>m</code> (number of connections).</li>
    <li>The next <code>m</code> lines, each containing two space-separated integers <code>u</code> and <code>v</code>, representing a bidirectional connection.</li>
  </ul>

  <h3 style="color: #3b82f6; margin-top: 16px;">Output Format</h3>
  <p>Print the critical connections, one per line. Each line should contain two space-separated integers <code>u v</code> representing a critical connection, where <code>u < v</code>. The connections must be printed in lexicographically sorted order.</p>

  <h3 style="color: #3b82f6; margin-top: 16px;">Constraints</h3>
  <ul>
    <li><code>2 &le; n &le; 10<sup>5</sup></code></li>
    <li><code>n - 1 &le; m &le; 10<sup>5</sup></code></li>
    <li><code>0 &le; u, v &le; n - 1</code></li>
    <li><code>u &ne; v</code></li>
    <li>There are no repeated connections in the input.</li>
    <li>The graph is connected.</li>
  </ul>
</div>
  `;

  // Critical Connections Python Reference Solution
  const criticalConnectionsReferenceSolution = `
import sys

# Increase recursion depth for deep graph DFS
sys.setrecursionlimit(200000)

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    m = int(input_data[1])
    
    adj = [[] for _ in range(n)]
    idx = 2
    for _ in range(m):
        u = int(input_data[idx])
        v = int(input_data[idx+1])
        adj[u].append(v)
        adj[v].append(u)
        idx += 2
        
    tin = [-1] * n
    low = [-1] * n
    bridges = []
    timer = 0
    
    def dfs(u, p):
        nonlocal timer
        tin[u] = low[u] = timer
        timer += 1
        for v in adj[u]:
            if v == p:
                continue
            if tin[v] != -1:
                low[u] = min(low[u], tin[v])
            else:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > tin[u]:
                    bridges.append((min(u, v), max(u, v)))
                    
    dfs(0, -1)
    
    bridges.sort()
    for u, v in bridges:
        print(f"{u} {v}")

if __name__ == '__main__':
    solve()
  `.trim();

  console.log("Upserting Rotting Oranges problem...");
  await prisma.problem.upsert({
    where: { slug: "rotting-oranges" },
    update: {
      title: "Rotting Oranges",
      difficulty: "Medium",
      category: "Graphs",
      description: rottingOrangesDescriptionHTML,
      testSets: rottingOrangesTestCases,
      referenceSolution: rottingOrangesReferenceSolution,
      isPublic: true,
      type: ProblemType.CODING
    },
    create: {
      title: "Rotting Oranges",
      slug: "rotting-oranges",
      difficulty: "Medium",
      category: "Graphs",
      description: rottingOrangesDescriptionHTML,
      testSets: rottingOrangesTestCases,
      referenceSolution: rottingOrangesReferenceSolution,
      isPublic: true,
      type: ProblemType.CODING
    }
  });
  console.log("Rotting Oranges problem successfully seeded.");

  console.log("Upserting Critical Connections in a Network problem...");
  await prisma.problem.upsert({
    where: { slug: "critical-connections" },
    update: {
      title: "Critical Connections in a Network",
      difficulty: "Hard",
      category: "Graphs",
      description: criticalConnectionsDescriptionHTML,
      testSets: criticalConnectionsTestCases,
      referenceSolution: criticalConnectionsReferenceSolution,
      isPublic: true,
      type: ProblemType.CODING
    },
    create: {
      title: "Critical Connections in a Network",
      slug: "critical-connections",
      difficulty: "Hard",
      category: "Graphs",
      description: criticalConnectionsDescriptionHTML,
      testSets: criticalConnectionsTestCases,
      referenceSolution: criticalConnectionsReferenceSolution,
      isPublic: true,
      type: ProblemType.CODING
    }
  });
  console.log("Critical Connections problem successfully seeded.");

  console.log("Database update finished successfully.");
}

main()
  .catch(err => {
    console.error("Error running seeding script:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
