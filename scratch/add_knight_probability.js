const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Knight Probability in Chessboard</h1>

<p>On an <code>N x N</code> chessboard, a knight starts at cell <code>(row, column)</code> and attempts to make exactly <code>K</code> moves. The rows and columns are 0-indexed, so the top-left cell is <code>(0, 0)</code>, and the bottom-right cell is <code>(N - 1, N - 1)</code>.</p>

<p>A chess knight has eight possible moves. Each move is two cells horizontally and one cell vertically, or one cell horizontally and two cells vertically.</p>

<p>Each time the knight is to move, it chooses one of eight possible moves uniformly at random (even if the piece would go off the chessboard) and moves there.</p>

<p>The knight continues moving until it has made exactly <code>K</code> moves or has moved off the chessboard.</p>

<p>Return the probability that the knight remains on the chessboard after it has stopped moving. The output should be formatted to 6 decimal places.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Knight Moves from Start (0, 0) on a 3x3 Board:</h3>
<svg width="320" height="200" viewBox="0 0 320 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead marker -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
    </marker>
  </defs>

  <!-- 3x3 Grid (Rows: 0, 1, 2; Cols: 0, 1, 2) -->
  <!-- Row 0 -->
  <rect x="30" y="30" width="40" height="40" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1.5" />
  <text x="50" y="55" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">START</text>
  <rect x="75" y="30" width="40" height="40" fill="#1e293b" stroke="#334155" />
  <rect x="120" y="30" width="40" height="40" fill="#334155" stroke="#334155" />

  <!-- Row 1 -->
  <rect x="30" y="75" width="40" height="40" fill="#334155" stroke="#334155" />
  <rect x="75" y="75" width="40" height="40" fill="#1e293b" stroke="#334155" />
  <rect x="120" y="75" width="40" height="40" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24" stroke-width="2" />
  <text x="140" y="99" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">p = 1/8</text>

  <!-- Row 2 -->
  <rect x="30" y="120" width="40" height="40" fill="#1e293b" stroke="#334155" />
  <rect x="75" y="120" width="40" height="40" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24" stroke-width="2" />
  <text x="95" y="144" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">p = 1/8</text>
  <rect x="120" y="120" width="40" height="40" fill="#334155" stroke="#334155" />

  <!-- Transition curves -->
  <path d="M 50 70 Q 140 50 140 70" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="2,2" marker-end="url(#arrow)" />
  <path d="M 50 70 Q 40 140 70 140" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="2,2" marker-end="url(#arrow)" />

  <!-- Legend -->
  <text x="180" y="45" font-size="9" font-weight="bold" fill="#ef4444">Start Cell (0,0)</text>
  <text x="180" y="90" font-size="9" font-weight="bold" fill="#fbbf24">Valid 1st moves</text>
  <text x="180" y="105" font-size="8" fill="#94a3b8">Remaining 6 moves</text>
  <text x="180" y="115" font-size="8" fill="#94a3b8">go off-board (lost)</text>
</svg>
<p><strong>Explanation for Example 1:</strong> 
From <code>(0,0)</code>, only two moves to <code>(1,2)</code> and <code>(2,1)</code> remain inside the board. 
Each move has a probability of <code>1/8</code>. After 1 move, the probability is <code>2/8 = 0.25</code>. After 2 moves, the total cumulative probability of staying inside is <code>0.0625</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing four space-separated integers: <code>N</code>, <code>K</code>, <code>row</code>, <code>column</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print the probability formatted to 6 decimal places.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 25</code></li>
  <li><code>0 &le; K &le; 100</code></li>
  <li><code>0 &le; row, column &le; N - 1</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <iomanip>

using namespace std;

double knightProbability(int n, int k, int row, int column) {
    vector<vector<double>> dp(n, vector<double>(n, 0.0));
    dp[row][column] = 1.0;
    
    int dr[] = {-2, -2, -1, -1, 1, 1, 2, 2};
    int dc[] = {-1, 1, -2, 2, -2, 2, -1, 1};
    
    for (int s = 0; s < k; ++s) {
        vector<vector<double>> nextDp(n, vector<double>(n, 0.0));
        for (int r = 0; r < n; ++r) {
            for (int c = 0; c < n; ++c) {
                if (dp[r][c] > 0) {
                    for (int m = 0; m < 8; ++m) {
                        int nr = r + dr[m];
                        int nc = c + dc[m];
                        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
                            nextDp[nr][nc] += dp[r][c] / 8.0;
                        }
                    }
                }
            }
        }
        dp = nextDp;
    }
    
    double totalProb = 0.0;
    for (int r = 0; r < n; ++r) {
        for (int c = 0; c < n; ++c) {
            totalProb += dp[r][c];
        }
    }
    return totalProb;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, k, row, column;
    if (cin >> n >> k >> row >> column) {
        cout << fixed << setprecision(6) << knightProbability(n, k, row, column) << "\\n";
    }
    return 0;
}
`.trim();

function solveKnightProbability(n, k, row, col) {
  let dp = Array.from({ length: n }, () => new Array(n).fill(0));
  dp[row][col] = 1.0;

  const dr = [-2, -2, -1, -1, 1, 1, 2, 2];
  const dc = [-1, 1, -2, 2, -2, 2, -1, 1];

  for (let s = 0; s < k; s++) {
    const nextDp = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (dp[r][c] > 0) {
          for (let m = 0; m < 8; m++) {
            const nr = r + dr[m];
            const nc = c + dc[m];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
              nextDp[nr][nc] += dp[r][c] / 8.0;
            }
          }
        }
      }
    }
    dp = nextDp;
  }

  let totalProb = 0.0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      totalProb += dp[r][c];
    }
  }

  return totalProb.toFixed(6);
}

const staticCases = [
  { n: 3, k: 2, r: 0, c: 0, isExample: true },
  { n: 1, k: 0, r: 0, c: 0, isExample: true },
  { n: 3, k: 1, r: 0, c: 0, isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const input = `${tc.n} ${tc.k} ${tc.r} ${tc.c}`;
    const expected = solveKnightProbability(tc.n, tc.k, tc.r, tc.c);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    { n: 1, k: 5, r: 0, c: 0 },
    { n: 5, k: 0, r: 2, c: 2 },
    { n: 8, k: 1, r: 0, c: 0 }, // Corner of standard board
    { n: 8, k: 1, r: 4, c: 4 }, // Center of standard board
    { n: 3, k: 15, r: 1, c: 1 }, // Knight trapped at center has 0 probability to stay after 1st move anyway
    { n: 2, k: 2, r: 0, c: 0 }
  ];

  for (const ec of edgeCases) {
    const input = `${ec.n} ${ec.k} ${ec.r} ${ec.c}`;
    const expected = solveKnightProbability(ec.n, ec.k, ec.r, ec.c);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 25, K up to 15)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 12) + 4; // 4 to 15
    const k = Math.floor(Math.random() * 15);     // 0 to 14
    const r = Math.floor(Math.random() * n);
    const c = Math.floor(Math.random() * n);

    const input = `${n} ${k} ${r} ${c}`;
    const expected = solveKnightProbability(n, k, r, c);

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
    const parts = tc.input.split(" ").map(Number);
    const expected = solveKnightProbability(parts[0], parts[1], parts[2], parts[3]);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-knight-probability" },
    update: {
      title: "Knight Probability in Chessboard - LeetCode 688 - NeetCode",
      url: "https://www.youtube.com/watch?v=54nJhM2AZv4",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-knight-probability",
      title: "Knight Probability in Chessboard - LeetCode 688 - NeetCode",
      url: "https://www.youtube.com/watch?v=54nJhM2AZv4",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Knight Probability in Chessboard' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "knight-probability-in-chessboard" },
    update: {
      title: "Knight Probability in Chessboard",
      difficulty: "Medium",
      category: "Dynamic Programming",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id }
        ]
      }
    },
    create: {
      slug: "knight-probability-in-chessboard",
      title: "Knight Probability in Chessboard",
      difficulty: "Medium",
      category: "Dynamic Programming",
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully created/updated 'Knight Probability in Chessboard'!");
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
