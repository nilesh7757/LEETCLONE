const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const criticalConnectionsHtml = `
<h1>Critical Connections in a Network</h1>

<p>There is an undirected connected network of <code>n</code> servers represented by vertices labeled from <code>0</code> to <code>n - 1</code>. You are given an array of connections <code>connections</code> where <code>connections[i] = [u, v]</code> represents a bidirectional connection between servers <code>u</code> and <code>v</code>.</p>

<p>A <strong>critical connection</strong> (bridge) is a connection that, if removed, will make some servers unable to reach some other servers.</p>

<p>Return all critical connections in the network in lexicographically sorted order.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>N</code> (number of servers) and <code>E</code> (number of connections).</li>
  <li><strong>Next <code>E</code> lines:</strong> Two space-separated integers <code>u v</code> representing a bidirectional connection.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print each critical connection on a new line as <code>u v</code>.</li>
  <li>The connections and individual edge nodes can be printed in any order.</li>
  <li>If there are no critical connections, print <code>None</code>.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &lt;= N &lt;= 10^5</code></li>
  <li><code>N - 1 &lt;= E &lt;= 10^5</code></li>
  <li><code>0 &lt;= u, v &lt; N</code></li>
  <li>The network is fully connected.</li>
  <li>There are no self-loops or duplicate edges.</li>
</ul>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visual Walkthrough: Tarjan's Bridge Finder</h3>
<p>Consider a network of 4 servers and 4 connections: <code>[(0,1), (1,2), (2,0), (1,3)]</code></p>

<svg width="450" height="220" viewBox="0 0 450 220" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="80" y1="110" x2="200" y2="110" stroke="#475569" stroke-width="3" />
  <line x1="80" y1="110" x2="140" y2="180" stroke="#475569" stroke-width="3" />
  <line x1="200" y1="110" x2="140" y2="180" stroke="#475569" stroke-width="3" />
  
  <!-- Critical Bridge Connection (Glowing Orange) -->
  <line x1="200" y1="110" x2="320" y2="110" stroke="#f97316" stroke-width="4" stroke-dasharray="6,4" />

  <!-- Node 0 -->
  <circle cx="80" cy="110" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="80" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>

  <!-- Node 2 -->
  <circle cx="140" cy="180" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="140" y="185" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 1 (Bridge End) -->
  <circle cx="200" cy="110" r="18" fill="#1e293b" stroke="#f97316" stroke-width="2.5" />
  <text x="200" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Node 3 (Bridge End / Leaf) -->
  <circle cx="320" cy="110" r="18" fill="#1e293b" stroke="#f97316" stroke-width="2.5" />
  <text x="320" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  
  <!-- Bridge label -->
  <text x="260" y="95" font-size="10" font-weight="bold" fill="#f97316" text-anchor="middle">Critical Connection (Bridge)</text>
</svg>

<p>If we remove the edge <code>(1,3)</code>, node <code>3</code> becomes isolated from the rest of the network <code>{0, 1, 2}</code>. Therefore, <code>(1,3)</code> is a <strong>Critical Connection (Bridge)</strong>.</p>
<p>If we remove any other edge (e.g. <code>(0,1)</code>), the graph remains fully connected since there is an alternative path <code>0 - 2 - 1</code>. Thus, no other connections are critical.</p>
`.trim();

// Articulation Point Solver
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
    if (!vis[i]) dfs(i, -1);
  }
  const ans = [];
  for (let i = 0; i < n; i++) {
    if (mark[i] === 1) ans.push(i);
  }
  if (ans.length === 0) return "None";
  return ans.join(" ");
}

// Critical Connections Solver
function solveCriticalConnections(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const vis = new Array(n).fill(false);
  const tin = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const bridges = [];
  let timer = 1;

  function dfs(node, parent) {
    vis[node] = true;
    tin[node] = low[node] = timer++;
    for (const neighbor of adj[node]) {
      if (neighbor === parent) continue;
      if (!vis[neighbor]) {
        dfs(neighbor, node);
        low[node] = Math.min(low[node], low[neighbor]);
        if (low[neighbor] > tin[node]) {
          bridges.push([Math.min(node, neighbor), Math.max(node, neighbor)]);
        }
      } else {
        low[node] = Math.min(low[node], tin[neighbor]);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!vis[i]) dfs(i, -1);
  }
  if (bridges.length === 0) return "None";
  bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return bridges.map(([u, v]) => `${u} ${v}`).join("\n");
}

// Parse graph input helper
function parseGraphInput(inputStr) {
  const lines = inputStr.trim().split("\n").map(l => l.trim()).filter(Boolean);
  const [n, e] = lines[0].split(/\s+/).map(Number);
  const edges = [];
  for (let i = 1; i <= e; i++) {
    if (lines[i]) {
      const [u, v] = lines[i].split(/\s+/).map(Number);
      edges.push([u, v]);
    }
  }
  return { n, edges };
}

async function main() {
  // 1. Remove Rotting Oranges
  try {
    const deleted = await prisma.problem.deleteMany({
      where: { slug: "rotting-oranges" }
    });
    console.log(`Rotting Oranges deletion result: Deleted ${deleted.count} records.`);
  } catch (e) {
    console.log("Rotting Oranges deletion skipped or failed (might already be deleted):", e.message);
  }

  // 2. Update Critical Connections with SVG Description
  await prisma.problem.update({
    where: { slug: "critical-connections" },
    data: {
      description: criticalConnectionsHtml
    }
  });
  console.log("Successfully updated Critical Connections HTML description with SVG graph visualization!");

  // 3. Test and Verify Articulation Point test sets
  console.log("\nVerifying Articulation Point test cases...");
  const apProblem = await prisma.problem.findUnique({
    where: { slug: "articulation-point-in-graph" }
  });
  if (apProblem && Array.isArray(apProblem.testSets)) {
    let failed = 0;
    apProblem.testSets.forEach((tc, idx) => {
      const { n, edges } = parseGraphInput(tc.input);
      const computed = solveArticulationPoints(n, edges);
      
      // Using custom sets compare for safety
      const cleanSet = (s) => new Set(s.trim().toLowerCase().split(/\s+/).filter(Boolean));
      const compSet = cleanSet(computed);
      const expSet = cleanSet(tc.expectedOutput);
      
      let pass = compSet.size === expSet.size;
      if (pass) {
        for (const item of compSet) {
          if (!expSet.has(item)) {
            pass = false;
            break;
          }
        }
      }

      if (!pass) {
        console.error(`  [FAIL] Testcase #${idx + 1} fails!`);
        console.error(`    Input:\n${tc.input}`);
        console.error(`    Expected: "${tc.expectedOutput}"`);
        console.error(`    Computed: "${computed}"`);
        failed++;
      }
    });
    if (failed === 0) {
      console.log(`  [SUCCESS] All ${apProblem.testSets.length} Articulation Point test cases verified and matching correctly!`);
    } else {
      console.error(`  [WARNING] ${failed} Articulation Point test cases failed!`);
    }
  } else {
    console.error("  Articulation Point problem or testSets not found in DB!");
  }

  // 4. Test and Verify Critical Connections test sets
  console.log("\nVerifying Critical Connections test cases...");
  const ccProblem = await prisma.problem.findUnique({
    where: { slug: "critical-connections" }
  });
  if (ccProblem && Array.isArray(ccProblem.testSets)) {
    let failed = 0;
    ccProblem.testSets.forEach((tc, idx) => {
      const { n, edges } = parseGraphInput(tc.input);
      const computed = solveCriticalConnections(n, edges);
      
      // Set compare of edges
      const parseEdges = (text) => {
        const set = new Set();
        const lines = text.split(/\n/);
        for (const line of lines) {
          const tokens = line.trim().split(/\s+/).filter(Boolean);
          if (tokens.length === 2) {
            const u = parseInt(tokens[0]);
            const v = parseInt(tokens[1]);
            if (!isNaN(u) && !isNaN(v)) {
              set.add(`${Math.min(u,v)}-${Math.max(u,v)}`);
            }
          }
        }
        return set;
      };

      const compSet = parseEdges(computed);
      const expSet = parseEdges(tc.expectedOutput);
      
      let pass = compSet.size === expSet.size;
      if (pass) {
        for (const edge of compSet) {
          if (!expSet.has(edge)) {
            pass = false;
            break;
          }
        }
      }

      if (!pass) {
        console.error(`  [FAIL] Testcase #${idx + 1} fails!`);
        console.error(`    Input:\n${tc.input}`);
        console.error(`    Expected: "${tc.expectedOutput}"`);
        console.error(`    Computed: "${computed}"`);
        failed++;
      }
    });
    if (failed === 0) {
      console.log(`  [SUCCESS] All ${ccProblem.testSets.length} Critical Connections test cases verified and matching correctly!`);
    } else {
      console.error(`  [WARNING] ${failed} Critical Connections test cases failed!`);
    }
  } else {
    console.error("  Critical Connections problem or testSets not found in DB!");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
