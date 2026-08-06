const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Critical Connections in a Network</h1>

<p>There is an undirected connected network of <code>n</code> servers represented by vertices labeled from <code>0</code> to <code>n - 1</code>. You are given an array of connections <code>connections</code> where <code>connections[i] = [u, v]</code> represents a bidirectional connection between servers <code>u</code> and <code>v</code>.</p>

<p>A <strong>critical connection</strong> (bridge) is a connection that, if removed, will make some servers unable to reach some other servers.</p>

<p>Return all critical connections in the network in lexicographically sorted order.</p>

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

<h3>Visual Walkthrough: Tarjan's Bridge Finder</h3>
<p>Consider a network of 4 servers and 4 connections: <code>[(0,1), (1,2), (2,0), (1,3)]</code></p>
<pre>
   (0) --- (1) --- (3)
    \\     /
     \\   /
      (2)
</pre>

<p>If we remove the edge <code>(1,3)</code>, node <code>3</code> becomes isolated from the rest of the network <code>{0, 1, 2}</code>. Therefore, <code>(1,3)</code> is a <strong>Critical Connection (Bridge)</strong>.</p>
<p>If we remove any other edge (e.g. <code>(0,1)</code>), the graph remains fully connected since there is an alternative path <code>0 - 2 - 1</code>. Thus, no other connections are critical.</p>
`.trim();

const checkerCode = `
try {
  const normExpected = expectedOutput.trim().toLowerCase();
  const normActual = actualOutput.trim().toLowerCase();

  if (normExpected === "none" || normExpected === "") {
    result = (normActual === "none" || normActual === "");
  } else {
    const parseEdges = (text) => {
      const set = new Set();
      const lines = text.split(/\\r?\\n/);
      for (const line of lines) {
        const tokens = line.trim().split(/\\s+/);
        if (tokens.length === 2) {
          const u = parseInt(tokens[0]);
          const v = parseInt(tokens[1]);
          if (!isNaN(u) && !isNaN(v)) {
            const min = Math.min(u, v);
            const max = Math.max(u, v);
            set.add(\`\${min}-\${max}\`);
          }
        }
      }
      return set;
    };

    const expectedSet = parseEdges(expectedOutput);
    const actualSet = parseEdges(actualOutput);

    if (expectedSet.size === 0) {
      result = (normActual === "none" || normActual === "" || actualSet.size === 0);
    } else {
      if (expectedSet.size !== actualSet.size) {
        result = false;
      } else {
        let match = true;
        for (const edge of expectedSet) {
          if (!actualSet.has(edge)) {
            match = false;
            break;
          }
        }
        result = match;
      }
    }
  }
} catch (e) {
  result = false;
}
`.trim();

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
    if (!vis[i]) {
      dfs(i, -1);
    }
  }

  if (bridges.length === 0) return "None";
  
  bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return bridges.map(([u, v]) => `${u} ${v}`).join("\n");
}

function generateRandomGraph(n, edgeDensity = 1.35) {
  const edges = [];
  for (let i = 1; i < n; i++) {
    const parent = Math.floor(Math.random() * i);
    edges.push([parent, i]);
  }
  const extraCount = Math.floor(n * (edgeDensity - 1));
  const existing = new Set(edges.map(([u, v]) => `${Math.min(u,v)}-${Math.max(u,v)}`));
  for (let k = 0; k < extraCount; k++) {
    let u = Math.floor(Math.random() * n);
    let v = Math.floor(Math.random() * n);
    if (u !== v) {
      const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
      if (!existing.has(key)) {
        edges.push([u, v]);
        existing.add(key);
      }
    }
  }
  return edges;
}

async function main() {
  const testSets = [];

  // Ex 1
  testSets.push({
    input: "4 4\n0 1\n1 2\n2 0\n1 3",
    isExample: true,
    expectedOutput: "1 3"
  });
  // Ex 2
  testSets.push({
    input: "2 1\n0 1",
    isExample: true,
    expectedOutput: "0 1"
  });
  // Ex 3
  testSets.push({
    input: "4 3\n0 1\n1 2\n2 3",
    isExample: true,
    expectedOutput: "0 1\n1 2\n2 3"
  });

  // Corner Case 4: Double cycle connected by a bridge
  testSets.push({
    input: "6 7\n0 1\n1 2\n2 0\n2 3\n3 4\n4 5\n5 3",
    isExample: false,
    expectedOutput: "2 3"
  });

  // Cycle 5: Pure cycle graph (no bridges)
  testSets.push({
    input: "5 5\n0 1\n1 2\n2 3\n3 4\n4 0",
    isExample: false,
    expectedOutput: "None"
  });

  // Paths 6-7: Simple line graphs
  testSets.push({
    input: "5 4\n0 1\n1 2\n2 3\n3 4",
    isExample: false,
    expectedOutput: "0 1\n1 2\n2 3\n3 4"
  });

  // Randomized cases (8-50)
  for (let i = 8; i <= 51; i++) {
    const n = 5 + (i % 4) * 5; // 5, 10, 15, 20
    const edgeDensity = 1.1 + (i % 3) * 0.15;
    const edges = generateRandomGraph(n, edgeDensity);
    edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const inputLines = [`${n} ${edges.length}`];
    for (const [u, v] of edges) {
      inputLines.push(`${u} ${v}`);
    }
    const inputStr = inputLines.join("\n");
    const expectedOutputStr = solveCriticalConnections(n, edges);

    testSets.push({
      input: inputStr,
      isExample: false,
      expectedOutput: expectedOutputStr
    });
  }

  // Update Database
  const result = await prisma.problem.update({
    where: { slug: "critical-connections" },
    data: {
      description: htmlDescription,
      customChecker: checkerCode,
      testSets: testSets
    }
  });

  console.log("Successfully restored Critical Connections in a Network in local database!");
  console.log("Uploaded test cases:", result.testSets.length);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
