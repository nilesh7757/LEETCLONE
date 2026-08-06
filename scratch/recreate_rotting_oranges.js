const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// JS implementation of Rotting Oranges BFS to compute expected outputs
function solveRottingOranges(r, c, grid) {
  const queue = [];
  let freshCount = 0;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      if (grid[i][j] === 2) {
        queue.push([i, j, 0]); // row, col, time
      } else if (grid[i][j] === 1) {
        freshCount++;
      }
    }
  }

  let maxMinutes = 0;
  let head = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (head < queue.length) {
    const [row, col, time] = queue[head++];
    maxMinutes = Math.max(maxMinutes, time);

    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] === 1) {
        grid[nr][nc] = 2; // rot it
        freshCount--;
        queue.push([nr, nc, time + 1]);
      }
    }
  }

  return freshCount === 0 ? maxMinutes : -1;
}

const htmlDescription = `
<h1>Rotting Oranges</h1>

<p>You are given an <code>m x n</code> grid where each cell can have one of three values:</p>
<ul>
  <li><code>0</code> representing an empty cell,</li>
  <li><code>1</code> representing a fresh orange, or</li>
  <li><code>2</code> representing a rotten orange.</li>
</ul>

<p>Every minute, any fresh orange that is <strong>4-directionally adjacent</strong> (up, down, left, right) to a rotten orange becomes rotten.</p>

<p>Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations:</h3>

<h3>Grid State for Example 1:</h3>
<svg width="240" height="240" viewBox="0 0 240 240" style="background-color: #0f172a; border-radius: 12px; margin: 15px auto; border: 1px solid #1e293b; display: block;">
  <!-- Row 0 -->
  <rect x="15" y="15" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="90" y="15" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="165" y="15" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <!-- Row 1 -->
  <rect x="15" y="90" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="90" y="90" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="165" y="90" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <!-- Row 2 -->
  <rect x="15" y="165" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="90" y="165" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <rect x="165" y="165" width="60" height="60" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />

  <!-- Cell Oranges -->
  <!-- (0,0) Rotten -->
  <circle cx="45" cy="45" r="20" fill="#ef4444" opacity="0.9" />
  <circle cx="45" cy="45" r="16" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="45" y="49" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">Rotten</text>
  
  <!-- (0,1) Fresh -->
  <circle cx="120" cy="45" r="20" fill="#eab308" />
  <text x="120" y="49" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>

  <!-- (0,2) Fresh -->
  <circle cx="195" cy="45" r="20" fill="#eab308" />
  <text x="195" y="49" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>

  <!-- (1,0) Fresh -->
  <circle cx="45" cy="120" r="20" fill="#eab308" />
  <text x="45" y="124" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>

  <!-- (1,1) Fresh -->
  <circle cx="120" cy="120" r="20" fill="#eab308" />
  <text x="120" y="124" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>

  <!-- (1,2) Empty -->
  <text x="195" y="124" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">Empty</text>

  <!-- (2,0) Empty -->
  <text x="45" y="199" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">Empty</text>

  <!-- (2,1) Fresh -->
  <circle cx="120" cy="199" r="20" fill="#eab308" />
  <text x="120" y="203" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>

  <!-- (2,2) Fresh -->
  <circle cx="195" cy="199" r="20" fill="#eab308" />
  <text x="195" y="203" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Fresh</text>
</svg>

<p><strong>Example 1 Output:</strong> <code>4</code></p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>R</code> (number of rows) and <code>C</code> (number of columns).</li>
  <li><strong>Next <code>R</code> lines:</strong> <code>C</code> space-separated integers representing the cell values (0, 1, or 2).</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the minimum number of minutes, or <code>-1</code> if some fresh oranges can never rot.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &lt;= R, C &lt;= 10</code></li>
  <li>Grid values are strictly <code>0</code>, <code>1</code>, or <code>2</code>.</li>
</ul>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Test Case Explanations</h3>
<ul>
  <li><strong>Example 1:</strong> Minute 1 rots (0,1) and (1,0). Minute 2 rots (0,2) and (1,1). Minute 3 rots (2,1). Minute 4 rots (2,2). Total: 4 minutes.</li>
  <li><strong>Example 2:</strong> The fresh orange at (2,2) is surrounded by empty cells and cannot be reached by any rotten orange. Returns -1.</li>
  <li><strong>Example 3:</strong> There are no fresh oranges initially. Time elapsed is 0.</li>
</ul>
`;

const referenceSolutionCode = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int r, c;
    if (!(cin >> r >> c)) return 0;
    
    vector<vector<int>> grid(r, vector<int>(c));
    queue<pair<pair<int, int>, int>> q;
    int freshCount = 0;
    
    for (int i = 0; i < r; ++i) {
        for (int j = 0; j < c; ++j) {
            cin >> grid[i][j];
            if (grid[i][j] == 2) {
                q.push({{i, j}, 0});
            } else if (grid[i][j] == 1) {
                freshCount++;
            }
        }
    }
    
    int maxMinutes = 0;
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};
    
    while (!q.empty()) {
        int row = q.front().first.first;
        int col = q.front().first.second;
        int time = q.front().second;
        q.pop();
        
        maxMinutes = max(maxMinutes, time);
        
        for (int i = 0; i < 4; ++i) {
            int nr = row + dr[i];
            int nc = col + dc[i];
            
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] == 1) {
                grid[nr][nc] = 2;
                freshCount--;
                q.push({{nr, nc}, time + 1});
            }
        }
    }
    
    if (freshCount == 0) {
        cout << maxMinutes << "\\n";
    } else {
        cout << -1 << "\\n";
    }
    
    return 0;
}
`;

async function main() {
  const testSets = [];

  // Ex 1
  testSets.push({
    input: "3 3\n2 1 1\n1 1 0\n0 1 1",
    isExample: true,
    expectedOutput: "4"
  });
  // Ex 2
  testSets.push({
    input: "3 3\n2 1 1\n0 1 1\n1 0 1",
    isExample: true,
    expectedOutput: "-1"
  });
  // Ex 3
  testSets.push({
    input: "1 2\n0 2",
    isExample: true,
    expectedOutput: "0"
  });

  // Corner Case 4: No rotten oranges, all fresh
  testSets.push({
    input: "2 2\n1 1\n1 1",
    isExample: false,
    expectedOutput: "-1"
  });

  // Corner Case 5: All rotten, no fresh
  testSets.push({
    input: "2 2\n2 2\n2 2",
    isExample: false,
    expectedOutput: "0"
  });

  // Corner Case 6: All empty cells
  testSets.push({
    input: "2 2\n0 0\n0 0",
    isExample: false,
    expectedOutput: "0"
  });

  // Linear path of oranges
  testSets.push({
    input: "1 5\n2 1 1 1 1",
    isExample: false,
    expectedOutput: "4"
  });

  // Generate randomized grid matrices (8-50)
  for (let i = 8; i <= 50; i++) {
    const r = 2 + (i % 5); // 2 to 6 rows
    const c = 2 + ((i + 2) % 5); // 2 to 6 cols
    const grid = Array.from({ length: r }, () => new Array(c).fill(0));
    
    for (let rIdx = 0; rIdx < r; rIdx++) {
      for (let cIdx = 0; cIdx < c; cIdx++) {
        const rand = Math.random();
        if (rand < 0.2) {
          grid[rIdx][cIdx] = 0; // Empty
        } else if (rand < 0.8) {
          grid[rIdx][cIdx] = 1; // Fresh
        } else {
          grid[rIdx][cIdx] = 2; // Rotten
        }
      }
    }
    
    // Ensure at least one rotten exists for some layouts
    if (i % 4 !== 0) {
      grid[Math.floor(Math.random() * r)][Math.floor(Math.random() * c)] = 2;
    }

    const inputLines = [`${r} ${c}`];
    for (let rIdx = 0; rIdx < r; rIdx++) {
      inputLines.push(grid[rIdx].join(" "));
    }

    const inputStr = inputLines.join("\n");
    
    // Solve with JS BFS to set verified output
    const expectedOutputStr = String(solveRottingOranges(r, c, grid));

    testSets.push({
      input: inputStr,
      isExample: false,
      expectedOutput: expectedOutputStr
    });
  }

  // Create or Update Problem
  // Deleting previous just in case, then creating fresh
  await prisma.problem.deleteMany({ where: { slug: "rotting-oranges" } });
  
  const problem = await prisma.problem.create({
    data: {
      title: "Rotting Oranges",
      slug: "rotting-oranges",
      difficulty: "Medium",
      category: "Graphs",
      description: htmlDescription,
      referenceSolution: referenceSolutionCode,
      testSets: testSets,
      hints: [
        "Use Breadth-First Search (BFS) for layer-by-layer decay simulation.",
        "Store cell row index, column index, and time elapsed in a queue.",
        "Verify if any fresh orange remains at the end and return -1 if true."
      ],
      companies: ["Google", "Amazon", "Microsoft", "Meta"],
      companyTags: ["Google", "Amazon", "Meta"]
    }
  });

  console.log("Successfully created Rotting Oranges problem record in database!");
  console.log("Slug:", problem.slug);
  console.log("Uploaded test cases:", problem.testSets.length);

  // Link Learning Resource
  // Deleting duplicate resource first if exists
  await prisma.learningResource.deleteMany({
    where: { url: "https://www.youtube.com/watch?v=y704fEOx0s0" }
  });

  const resource = await prisma.learningResource.create({
    data: {
      title: "Rotting Oranges - Graph BFS Walkthrough",
      url: "https://www.youtube.com/watch?v=y704fEOx0s0",
      type: "VIDEO",
      topic: "Graphs",
      creator: "NeetCode",
      problems: {
        connect: { id: problem.id }
      }
    }
  });

  console.log("Successfully connected NeetCode video resource to Rotting Oranges!");
  console.log("Resource Title:", resource.title);
  console.log("Resource URL:", resource.url);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
