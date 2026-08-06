const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

const htmlDescription = `
<h1>Articulation Point in Graph</h1>

<p>Given an undirected connected graph with <code>V</code> vertices and <code>E</code> edges, your task is to find all <strong>Articulation Points</strong> (also known as cut vertices) in the graph.</p>

<p>An <strong>articulation point</strong> (or cut vertex) is a node whose removal (along with all its associated edges) disconnects the graph or increases the number of connected components, splitting it into two or more independent parts.</p>

<p>Return all articulation points in ascending sorted order. If there are no articulation points in the graph, return <code>None</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations:</h3>

<h3>Graph Structure for Example 1:</h3>
<svg width="460" height="220" viewBox="0 0 460 220" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="60" y1="110" x2="160" y2="110" stroke="#475569" stroke-width="3" />
  <line x1="160" y1="110" x2="280" y2="110" stroke="#475569" stroke-width="3" />
  <line x1="280" y1="110" x2="380" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="280" y1="110" x2="380" y2="170" stroke="#475569" stroke-width="3" />
  <line x1="380" y1="50" x2="380" y2="170" stroke="#475569" stroke-width="3" />

  <!-- Node 0 -->
  <circle cx="60" cy="110" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="60" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>

  <!-- Node 1 (Articulation Point) -->
  <circle cx="160" cy="110" r="22" fill="#1e293b" stroke="#ef4444" stroke-width="3" />
  <circle cx="160" cy="110" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="160" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="160" y="80" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">Cut Vertex</text>

  <!-- Node 4 (Articulation Point) -->
  <circle cx="280" cy="110" r="22" fill="#1e293b" stroke="#ef4444" stroke-width="3" />
  <circle cx="280" cy="110" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="280" y="115" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  <text x="280" y="80" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">Cut Vertex</text>

  <!-- Node 2 -->
  <circle cx="380" cy="50" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="380" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 3 -->
  <circle cx="380" cy="170" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="380" y="175" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
</svg>

<p><strong>Example 1 Output:</strong> <code>1 4</code></p>

<h3>Graph Structure for Example 2:</h3>
<svg width="450" height="200" viewBox="0 0 450 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="100" y1="50" x2="220" y2="100" stroke="#475569" stroke-width="3" />
  <line x1="220" y1="100" x2="100" y2="150" stroke="#475569" stroke-width="3" />
  <line x1="100" y1="150" x2="100" y2="50" stroke="#475569" stroke-width="3" />
  <line x1="220" y1="100" x2="360" y2="100" stroke="#475569" stroke-width="3" />

  <!-- Node 0 -->
  <circle cx="100" cy="50" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="100" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>

  <!-- Node 2 -->
  <circle cx="100" cy="150" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="100" y="155" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Node 1 (Articulation Point) -->
  <circle cx="220" cy="100" r="22" fill="#1e293b" stroke="#ef4444" stroke-width="3" />
  <circle cx="220" cy="100" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="220" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="220" y="70" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">Cut Vertex</text>

  <!-- Node 3 -->
  <circle cx="360" cy="100" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="360" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
</svg>

<p><strong>Example 2 Output:</strong> <code>1</code></p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>N</code> (number of nodes) and <code>E</code> (number of connections).</li>
  <li><strong>Next <code>E</code> lines:</strong> Two space-separated integers <code>u v</code> representing a bidirectional connection.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print all articulation points in ascending order, separated by a single space.</li>
  <li>If there are no articulation points in the graph, print <code>None</code>.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &lt;= N &lt;= 10^5</code></li>
  <li><code>1 &lt;= E &lt;= 10^5</code></li>
  <li><code>0 &lt;= u, v &lt; N</code></li>
  <li>The graph may have multiple connected components.</li>
  <li>There are no self-loops or duplicate edges.</li>
</ul>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visual Walkthrough: Tarjan's DFS-based Cut-Vertex Discovery</h3>
<p>To find articulation points in $O(V + E)$ time, we keep track of insertion times during a DFS traversal:</p>
<ol>
  <li><strong><code>tin[u]</code>:</strong> The timestamp when node <code>u</code> is first discovered during DFS.</li>
  <li><strong><code>low[u]</code>:</strong> The lowest insertion time reachable from <code>u</code> or its descendants, using at most one back-edge.</li>
</ol>

<p>During DFS, from parent node <code>u</code> to child node <code>v</code>:</p>
<ul>
  <li><strong>If <code>v</code> is not visited:</strong> Recurse on <code>v</code>, then update <code>low[u] = min(low[u], low[v])</code>. If <code>low[v] >= tin[u]</code> and <code>u</code> is not the DFS root, then <strong>node <code>u</code> is an articulation point</strong>.</li>
  <li><strong>If <code>v</code> is already visited:</strong> It's a back-edge. Update <code>low[u] = min(low[u], tin[v])</code>.</li>
  <li><strong>If <code>u</code> is the root of the DFS tree:</strong> It is an articulation point if and only if it has <strong>two or more independent children</strong> in the DFS tree.</li>
</ul>
`;

async function main() {
  const testSetsRaw = fs.readFileSync("D:/LEETCLONE/scratch/articulation_testsets.json", "utf8");
  const testSets = JSON.parse(testSetsRaw);

  const result = await prisma.problem.update({
    where: { slug: "articulation-point-in-graph" },
    data: {
      description: htmlDescription,
      testSets: testSets
    }
  });

  console.log("Successfully updated Articulation Point in Graph problem in database!");
  console.log("Slug:", result.slug);
  console.log("Uploaded test cases count:", result.testSets.length);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
