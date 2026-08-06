const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Path With Minimum Effort</h1>

<p>You are a hiker preparing for an upcoming hike. You are given a 2D grid <code>heights</code> of size <code>rows x cols</code>, where <code>heights[row][col]</code> represents the height of cell <code>(row, col)</code>. You are situated in the top-left cell, <code>(0, 0)</code>, and you hope to travel to the bottom-right cell, <code>(rows-1, cols-1)</code> (i.e., <strong>0-indexed</strong>).</p>

<p>You can move <strong>up</strong>, <strong>down</strong>, <strong>left</strong>, or <strong>right</strong>, and you wish to find a route that requires the <strong>minimum effort</strong>.</p>

<p>A route's <strong>effort</strong> is the <strong>maximum absolute difference</strong> in heights between two consecutive cells of the route.</p>

<p>Return the minimum effort required to travel from the top-left cell to the bottom-right cell.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph & Path Structure for Example 1:</h3>
<svg width="280" height="280" viewBox="0 0 280 280" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Row 0 -->
  <rect x="30" y="30" width="55" height="55" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="57" y="62" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="57" y="78" font-size="8" font-weight="bold" fill="#10b981" text-anchor="middle">Start</text>

  <rect x="100" y="30" width="55" height="55" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="127" y="64" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">2</text>

  <rect x="170" y="30" width="55" height="55" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="197" y="64" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">2</text>

  <!-- Row 1 -->
  <rect x="30" y="100" width="55" height="55" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="57" y="134" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <rect x="100" y="100" width="55" height="55" rx="6" fill="#1d1e22" stroke="#ef4444" stroke-width="1.5" />
  <text x="127" y="134" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">8</text>

  <rect x="170" y="100" width="55" height="55" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="197" y="134" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">2</text>

  <!-- Row 2 -->
  <rect x="30" y="170" width="55" height="55" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="57" y="204" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

  <rect x="100" y="170" width="55" height="55" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="127" y="204" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <rect x="170" y="170" width="55" height="55" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="197" y="196" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="197" y="214" font-size="8" font-weight="bold" fill="#3b82f6" text-anchor="middle">End</text>

  <!-- Path Arrows -->
  <path d="M 57 88 L 57 96" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow-green)" />
  <path d="M 57 158 L 57 166" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow-green)" />
  <path d="M 88 197 L 96 197" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow-green)" />
  <path d="M 158 197 L 166 197" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrow-green)" />
</svg>
<p><strong>Explanation for Example 1:</strong> The route <code>(0,0) &rarr; (1,0) &rarr; (2,0) &rarr; (2,1) &rarr; (2,2)</code> has consecutive height differences of <code>|1 - 3| = 2</code>, <code>|3 - 5| = 2</code>, <code>|5 - 3| = 2</code>, and <code>|3 - 5| = 2</code>. The maximum absolute difference is <code>2</code>. This requires less effort than the alternate top route (which would require a maximum absolute difference of <code>3</code> when jumping from <code>2</code> to <code>5</code>).</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>rows</code> and <code>cols</code>, representing the dimensions of the grid.</li>
  <li><strong>Next <code>rows</code> lines:</strong> <code>cols</code> space-separated integers representing the height of each cell.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the minimum effort required to travel from top-left to bottom-right.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>rows == heights.length</code></li>
  <li><code>cols == heights[i].length</code></li>
  <li><code>1 &le; rows, cols &le; 100</code></li>
  <li><code>1 &le; heights[i][j] &le; 10^6</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <algorithm>

using namespace std;

struct Cell {
    int eff;
    int r;
    int c;
    bool operator>(const Cell& other) const {
        return eff > other.eff;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int rows, cols;
    if (!(cin >> rows >> cols)) return 0;
    
    vector<vector<int>> heights(rows, vector<int>(cols));
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            cin >> heights[i][j];
        }
    }
    
    priority_queue<Cell, vector<Cell>, greater<Cell>> pq;
    vector<vector<int>> dist(rows, vector<int>(cols, 1e9));
    
    dist[0][0] = 0;
    pq.push({0, 0, 0});
    
    int dr[] = {0, 0, 1, -1};
    int dc[] = {1, -1, 0, 0};
    
    while (!pq.empty()) {
        Cell curr = pq.top();
        pq.pop();
        
        int eff = curr.eff;
        int r = curr.r;
        int c = curr.c;
        
        if (r == rows - 1 && c == cols - 1) {
            cout << eff << "\\n";
            return 0;
        }
        
        if (eff > dist[r][c]) continue;
        
        for (int i = 0; i < 4; ++i) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                int neff = max(eff, abs(heights[r][c] - heights[nr][nc]));
                if (neff < dist[nr][nc]) {
                    dist[nr][nc] = neff;
                    pq.push({neff, nr, nc});
                }
            }
        }
    }
    
    return 0;
}
`.trim();

// Solver implementation using Dijkstra
function solvePathWithMinimumEffort(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const header = lines[0].trim().split(/\s+/);
  const rows = parseInt(header[0]);
  const cols = parseInt(header[1]);

  const heights = [];
  for (let i = 0; i < rows; i++) {
    heights.push(lines[1 + i].trim().split(/\s+/).map(Number));
  }

  const dist = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  dist[0][0] = 0;
  
  const pq = [[0, 0, 0]]; // [eff, r, c]

  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [eff, r, c] = pq.shift();
    if (r === rows - 1 && c === cols - 1) return eff;
    if (eff > dist[r][c]) continue;

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neff = Math.max(eff, Math.abs(heights[r][c] - heights[nr][nc]));
        if (neff < dist[nr][nc]) {
          dist[nr][nc] = neff;
          pq.push([neff, nr, nc]);
        }
      }
    }
  }
  return 0;
}

// Random heights grid generator
function generateRandomHeights(rows, cols, maxVal = 1000) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.floor(Math.random() * maxVal) + 1);
    }
    grid.push(row);
  }
  return grid;
}

function gridToInput(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const lines = [`${rows} ${cols}`];
  for (let i = 0; i < rows; i++) {
    lines.push(grid[i].join(" "));
  }
  return lines.join("\n");
}

const staticCases = [
  { input: "3 3\n1 2 2\n3 8 2\n5 3 5", isExample: true },
  { input: "3 3\n1 2 3\n3 8 4\n5 3 5", isExample: true },
  { input: "5 5\n1 2 1 1 1\n1 2 1 2 1\n1 2 1 2 1\n1 2 1 2 1\n1 1 1 2 1", isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solvePathWithMinimumEffort(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 small edge cases (e.g. 1xN, Nx1)
  console.log("Generating edge cases...");
  const edgeGrids = [
    [[5]],
    [[1, 5, 10, 15]],
    [[10], [20], [15], [30]],
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    [[1, 1000000], [1000000, 1]]
  ];

  for (const grid of edgeGrids) {
    const input = gridToInput(grid);
    const expected = solvePathWithMinimumEffort(input);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random grids (sizes up to 35x35)
  console.log("Generating 42 random grids...");
  for (let i = 0; i < 42; i++) {
    let rows = 4, cols = 4;
    if (i < 10) {
      rows = Math.floor(Math.random() * 5) + 3; // 3-7
      cols = Math.floor(Math.random() * 5) + 3; // 3-7
    } else if (i < 25) {
      rows = Math.floor(Math.random() * 10) + 8; // 8-17
      cols = Math.floor(Math.random() * 10) + 8; // 8-17
    } else {
      rows = Math.floor(Math.random() * 15) + 18; // 18-32
      cols = Math.floor(Math.random() * 15) + 18; // 18-32
    }

    const grid = generateRandomHeights(rows, cols, 10000);
    const input = gridToInput(grid);
    const expected = solvePathWithMinimumEffort(input);

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
    const expected = solvePathWithMinimumEffort(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-path-minimum-effort" },
    update: {
      title: "Path With Minimum Effort - Dijkstra's Algorithm",
      url: "https://takeuforward.org/data-structure/path-with-minimum-effort-g-37/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-path-minimum-effort",
      title: "Path With Minimum Effort - Dijkstra's Algorithm",
      url: "https://takeuforward.org/data-structure/path-with-minimum-effort-g-37/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-path-minimum-effort" },
    update: {
      title: "NeetCode's Path With Minimum Effort - LeetCode 1631",
      url: "https://www.youtube.com/watch?v=XQlyKkJ5DHY",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-path-minimum-effort",
      title: "NeetCode's Path With Minimum Effort - LeetCode 1631",
      url: "https://www.youtube.com/watch?v=XQlyKkJ5DHY",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Path With Minimum Effort' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "path-with-minimum-effort" },
    update: {
      title: "Path With Minimum Effort",
      difficulty: "Medium",
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
      slug: "path-with-minimum-effort",
      title: "Path With Minimum Effort",
      difficulty: "Medium",
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

  console.log("🎉 Successfully created/updated 'Path With Minimum Effort'!");
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
