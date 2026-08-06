const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Swim in Rising Water</h1>

<p>You are given an <code>n x n</code> integer matrix <code>grid</code> where each value <code>grid[i][j]</code> represents the elevation at that point <code>(i, j)</code>.</p>

<p>Rain starts to fall. At time <code>t</code>, the depth of the water everywhere is <code>t</code>. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most <code>t</code>. You can swim infinite distances in zero time. Of course, you must stay within the boundaries of the grid during your swim.</p>

<p>Return the least time until you can reach the bottom-right square <code>(n - 1, n - 1)</code> if you start at the top-left square <code>(0, 0)</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Path Structure for Example 3:</h3>
<svg width="320" height="230" viewBox="0 0 320 230" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Grid Cells -->
  <!-- (0,0) -->
  <rect x="50" y="30" width="80" height="80" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="90" y="70" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">0</text>
  <text x="90" y="95" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Start (0,0)</text>

  <!-- (0,1) -->
  <rect x="170" y="30" width="80" height="80" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="210" y="70" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="210" y="95" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Elevation = 1</text>

  <!-- (1,0) -->
  <rect x="50" y="130" width="80" height="80" rx="8" fill="#1d1e22" stroke="#ef4444" stroke-width="1.5" />
  <text x="90" y="170" font-size="18" font-weight="bold" fill="#94a3b8" text-anchor="middle">3</text>
  <text x="90" y="195" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">Elevation = 3</text>

  <!-- (1,1) -->
  <rect x="170" y="130" width="80" height="80" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="210" y="170" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="210" y="195" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Target (1,1)</text>

  <!-- Path Arrows -->
  <path d="M 138 70 L 162 70" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-green)" />
  <path d="M 210 118 L 210 124" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-green)" />
</svg>
<p><strong>Explanation for Example 3:</strong> To reach the bottom-right cell <code>(1, 1)</code> starting from <code>(0, 0)</code>, we can travel via <code>(0, 0) &rarr; (0, 1) &rarr; (1, 1)</code>. The maximum elevation encountered along this path is <code>max(0, 1, 2) = 2</code>. Any other path would require swimming through a cell with elevation <code>3</code>. Thus, the minimum time to complete this path is <code>2</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>The first line contains a single integer <code>n</code>, the side length of the grid.</li>
  <li>Each of the next <code>n</code> lines contains <code>n</code> space-separated integers, representing the grid elevations.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum time to reach the bottom-right square <code>(n - 1, n - 1)</code> starting from <code>(0, 0)</code>.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>n == grid.length == grid[i].length</code></li>
  <li><code>1 &le; n &le; 50</code></li>
  <li><code>0 &le; grid[i][j] &lt; n^2</code></li>
  <li>Every value <code>grid[i][j]</code> is distinct.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

struct Cell {
    int t;
    int r;
    int c;
    bool operator>(const Cell& other) const {
        return t > other.t;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<vector<int>> grid(n, vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
        }
    }
    
    priority_queue<Cell, vector<Cell>, greater<Cell>> pq;
    vector<vector<int>> dist(n, vector<int>(n, 1e9));
    
    dist[0][0] = grid[0][0];
    pq.push({grid[0][0], 0, 0});
    
    int dr[] = {0, 0, 1, -1};
    int dc[] = {1, -1, 0, 0};
    
    while (!pq.empty()) {
        Cell curr = pq.top();
        pq.pop();
        
        int t = curr.t;
        int r = curr.r;
        int c = curr.c;
        
        if (r == n - 1 && c == n - 1) {
            cout << t << "\\n";
            return 0;
        }
        
        if (t > dist[r][c]) continue;
        
        for (int i = 0; i < 4; ++i) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                int nt = max(t, grid[nr][nc]);
                if (nt < dist[nr][nc]) {
                    dist[nr][nc] = nt;
                    pq.push({nt, nr, nc});
                }
            }
        }
    }
    
    return 0;
}
`.trim();

// Solver implementation using Dijkstra
function solveSwimInRisingWater(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  const grid = [];
  for (let i = 0; i < n; i++) {
    grid.push(lines[1 + i].trim().split(/\s+/).map(Number));
  }

  const dist = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  dist[0][0] = grid[0][0];
  
  const pq = [[grid[0][0], 0, 0]]; // [t, r, c]

  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [t, r, c] = pq.shift();
    if (r === n - 1 && c === n - 1) return t;
    if (t > dist[r][c]) continue;

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const nt = Math.max(t, grid[nr][nc]);
        if (nt < dist[nr][nc]) {
          dist[nr][nc] = nt;
          pq.push([nt, nr, nc]);
        }
      }
    }
  }
  return 0;
}

// Grid generator helper (distinct integers from 0 to n*n - 1)
function generateDistinctGrid(n) {
  const nums = Array.from({ length: n * n }, (_, i) => i);
  // Shuffle
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  const grid = [];
  for (let i = 0; i < n; i++) {
    grid.push(nums.slice(i * n, (i + 1) * n));
  }
  return grid;
}

function gridToInput(grid) {
  const n = grid.length;
  const lines = [String(n)];
  for (let i = 0; i < n; i++) {
    lines.push(grid[i].join(" "));
  }
  return lines.join("\n");
}

const staticCases = [
  { input: "1\n0", isExample: true },
  { input: "2\n0 2\n1 3", isExample: true },
  { input: "2\n0 1\n3 2", isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveSwimInRisingWater(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 small edge cases (N=3)
  console.log("Generating small N=3 edge cases...");
  for (let i = 0; i < 10; i++) {
    const grid = generateDistinctGrid(3);
    const input = gridToInput(grid);
    const expected = solveSwimInRisingWater(input);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random grids of varying sizes (N=4 to N=50)
  console.log("Generating random valid grids...");
  for (let i = 0; i < 42; i++) {
    let n = 4;
    if (i < 10) n = Math.floor(Math.random() * 5) + 4;   // 4-8
    else if (i < 25) n = Math.floor(Math.random() * 15) + 9;  // 9-23
    else n = Math.floor(Math.random() * 25) + 24;  // 24-48
    
    // Safety check constraint: 1 <= n <= 50
    n = Math.min(50, Math.max(1, n));

    const grid = generateDistinctGrid(n);
    const input = gridToInput(grid);
    const expected = solveSwimInRisingWater(input);
    
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
    const expected = solveSwimInRisingWater(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-swim-rising-water" },
    update: {
      title: "Swim in Rising Water - Dijkstra's Algorithm",
      url: "https://takeuforward.org/graphs/swim-in-rising-water-dijkstras-algorithm-g-45/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-swim-rising-water",
      title: "Swim in Rising Water - Dijkstra's Algorithm",
      url: "https://takeuforward.org/graphs/swim-in-rising-water-dijkstras-algorithm-g-45/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-swim-rising-water" },
    update: {
      title: "NeetCode's Swim in Rising Water - LeetCode 778",
      url: "https://www.youtube.com/watch?v=amvrKlMLuGY",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-swim-rising-water",
      title: "NeetCode's Swim in Rising Water - LeetCode 778",
      url: "https://www.youtube.com/watch?v=amvrKlMLuGY",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Swim in Rising Water' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "swim-in-rising-water" },
    update: {
      title: "Swim in Rising Water",
      difficulty: "Hard",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    },
    create: {
      slug: "swim-in-rising-water",
      title: "Swim in Rising Water",
      difficulty: "Hard",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully created/updated 'Swim in Rising Water'!");
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
