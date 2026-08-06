const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Contest Balloons</h1>

<p>There are <code>n</code> teams in a contest, numbered from <code>1</code> to <code>n</code>. Limak is on team <code>1</code>. Each team <code>i</code> currently has <code>t_i</code> balloons and a weight capacity <code>w_i</code>.</p>

<p>Standings are ranked based on the number of balloons each team has. Specifically, a team's rank is defined as <code>1 + (number of active teams with strictly more balloons than them)</code>. If two teams have the same number of balloons, they share the same rank.</p>

<p>If a team's balloon count exceeds their weight limit (i.e. <code>t_i > w_i</code>), that team is <strong>disqualified</strong> and removed from the standings.</p>

<p>Limak cannot steal balloons, but he can choose to <strong>give away</strong> his balloons to other teams. If Limak gives <code>x</code> balloons to team <code>i</code>, Limak's balloon count decreases by <code>x</code>, and team <code>i</code>'s balloon count increases by <code>x</code>. If team <code>i</code>'s balloon count now exceeds their weight capacity <code>w_i</code>, they are disqualified.</p>

<p>Determine Limak's <strong>best possible rank</strong> (the smallest rank number) he can achieve by strategically giving away any number of his balloons.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Standings & Disqualification Costs for Example 1:</h3>
<svg width="420" height="240" viewBox="0 0 420 240" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Row 1: Team 2 -->
  <text x="30" y="45" font-size="12" font-weight="bold" fill="#ffffff">Team 2</text>
  <rect x="90" y="32" width="110" height="16" rx="3" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="1.5" />
  <line x1="200" y1="28" x2="200" y2="52" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,2" />
  <text x="210" y="44" font-size="9" font-weight="bold" fill="#ef4444">Limit: 110</text>
  <text x="300" y="44" font-size="10" font-weight="bold" fill="#fca5a5">Cost to DQ: 1</text>
  <text x="385" y="45" font-size="12" fill="#ef4444">❌</text>

  <!-- Row 2: Team 3 -->
  <text x="30" y="95" font-size="12" font-weight="bold" fill="#ffffff">Team 3</text>
  <rect x="90" y="82" width="110" height="16" rx="3" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="1.5" />
  <line x1="215" y1="78" x2="215" y2="102" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,2" />
  <text x="225" y="94" font-size="9" font-weight="bold" fill="#ef4444">Limit: 115</text>
  <text x="300" y="94" font-size="10" font-weight="bold" fill="#fca5a5">Cost to DQ: 6</text>
  <text x="385" y="95" font-size="12" fill="#ef4444">❌</text>

  <!-- Row 3: Limak -->
  <text x="30" y="145" font-size="12" font-weight="bold" fill="#10b981">Limak (1)</text>
  <rect x="90" y="132" width="100" height="16" rx="3" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1.5" />
  <line x1="240" y1="128" x2="240" y2="152" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" />
  <text x="250" y="144" font-size="9" font-weight="bold" fill="#10b981">Limit: 120</text>
  <text x="300" y="144" font-size="10" font-weight="bold" fill="#a7f3d0">Start: 100 &rarr; End: 82</text>
  <text x="385" y="145" font-size="12" fill="#10b981">🏆</text>

  <!-- Row 4: Team 4 -->
  <text x="30" y="195" font-size="12" font-weight="bold" fill="#ffffff">Team 4</text>
  <rect x="90" y="182" width="100" height="16" rx="3" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="1.5" />
  <line x1="200" y1="178" x2="200" y2="202" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,2" />
  <text x="210" y="194" font-size="9" font-weight="bold" fill="#ef4444">Limit: 110</text>
  <text x="300" y="194" font-size="10" font-weight="bold" fill="#fca5a5">Cost to DQ: 11</text>
  <text x="385" y="195" font-size="12" fill="#ef4444">❌</text>
</svg>
<p><strong>Explanation for Example 1:</strong> Limak starts with <code>100</code> balloons. Initially, Team 2 and Team 3 have strictly more balloons than Limak (110 each), putting Limak at rank 3. Limak can give <code>1</code> balloon to Team 2 (disqualifying them) and <code>6</code> balloons to Team 3 (disqualifying them). After doing so, Limak has <code>93</code> balloons left. However, now Team 4 (which had 100) has more than Limak, so Limak's rank is still 2. Limak then gives <code>11</code> balloons to Team 4, disqualifying them. Now all other teams have been disqualified, leaving Limak at rank <code>1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>n</code> representing the number of teams.</li>
  <li><strong>Next <code>n</code> lines:</strong> Two space-separated integers <code>t_i w_i</code> representing the initial balloons and weight capacity of the <code>i</code>-th team. Index 1 represents Limak's team.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: Limak's best possible rank.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>2 &le; n &le; 3*10^5</code></li>
  <li><code>0 &le; t_i &le; w_i &le; 10^18</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

struct Team {
    long long t;
    long long w;
    bool operator<(const Team& other) const {
        return t < other.t; // sorted in ascending for easy popping from back
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    long long limakT, limakW;
    cin >> limakT >> limakW;
    
    vector<Team> otherTeams(n - 1);
    for (int i = 0; i < n - 1; ++i) {
        cin >> otherTeams[i].t >> otherTeams[i].w;
    }
    
    sort(otherTeams.begin(), otherTeams.end());
    
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    
    while (!otherTeams.empty() && otherTeams.back().t > limakT) {
        pq.push(otherTeams.back().w - otherTeams.back().t + 1);
        otherTeams.pop_back();
    }
    
    int bestRank = pq.size() + 1;
    
    while (!pq.empty()) {
        long long cost = pq.top();
        pq.pop();
        if (limakT >= cost) {
            limakT -= cost;
            while (!otherTeams.empty() && otherTeams.back().t > limakT) {
                pq.push(otherTeams.back().w - otherTeams.back().t + 1);
                otherTeams.pop_back();
            }
            bestRank = min(bestRank, (int)pq.size() + 1);
        } else {
            break;
        }
    }
    
    cout << bestRank << "\\n";
    return 0;
}
`.trim();

// Solver implementation using BigInt
function solveContestBalloons(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 1;
  const n = parseInt(lines[0].trim());
  if (n <= 1 || !lines[1]) return 1;

  const limakTokens = lines[1].trim().split(/\s+/);
  let limakT = BigInt(limakTokens[0]);
  const limakW = BigInt(limakTokens[1]);

  const teams = [];
  for (let i = 1; i < n; i++) {
    const teamLine = lines[1 + i];
    if (!teamLine) continue;
    const tokens = teamLine.trim().split(/\s+/);
    if (tokens.length < 2) continue;
    teams.push({
      t: BigInt(tokens[0]),
      w: BigInt(tokens[1])
    });
  }

  teams.sort((a, b) => {
    if (b.t > a.t) return 1;
    if (b.t < a.t) return -1;
    return 0;
  });

  const heap = [];
  function pushHeap(cost) {
    heap.push(cost);
    let idx = heap.length - 1;
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (heap[parentIdx] <= heap[idx]) break;
      [heap[parentIdx], heap[idx]] = [heap[idx], heap[parentIdx]];
      idx = parentIdx;
    }
  }

  function popHeap() {
    if (heap.length === 0) return null;
    const min = heap[0];
    const end = heap.pop();
    if (heap.length > 0) {
      heap[0] = end;
      let idx = 0;
      const length = heap.length;
      while (true) {
        const leftIdx = 2 * idx + 1;
        const rightIdx = 2 * idx + 2;
        let swapIdx = null;

        if (leftIdx < length) {
          if (heap[leftIdx] < heap[idx]) {
            swapIdx = leftIdx;
          }
        }
        if (rightIdx < length) {
          if (
            (swapIdx === null && heap[rightIdx] < heap[idx]) ||
            (swapIdx !== null && heap[rightIdx] < heap[leftIdx])
          ) {
            swapIdx = rightIdx;
          }
        }

        if (swapIdx === null) break;
        [heap[idx], heap[swapIdx]] = [heap[swapIdx], heap[idx]];
        idx = swapIdx;
      }
    }
    return min;
  }

  let nextTeamIdx = 0;
  while (nextTeamIdx < teams.length && teams[nextTeamIdx].t > limakT) {
    const cost = teams[nextTeamIdx].w - teams[nextTeamIdx].t + 1n;
    pushHeap(cost);
    nextTeamIdx++;
  }

  let bestRank = heap.length + 1;

  while (heap.length > 0) {
    const cost = popHeap();
    if (limakT >= cost) {
      limakT -= cost;
      while (nextTeamIdx < teams.length && teams[nextTeamIdx].t > limakT) {
        const c = teams[nextTeamIdx].w - teams[nextTeamIdx].t + 1n;
        pushHeap(c);
        nextTeamIdx++;
      }
      bestRank = Math.min(bestRank, heap.length + 1);
    } else {
      break;
    }
  }

  return bestRank;
}

const staticCases = [
  {
    input: "4\n100 120\n110 110\n110 115\n100 110",
    isExample: true
  },
  {
    input: "3\n10 20\n20 30\n30 40",
    isExample: true
  },
  {
    input: "4\n10 20\n15 17\n13 14\n12 16",
    isExample: true
  }
];

function generateRandomBigInt(minVal, maxVal) {
  const range = maxVal - minVal;
  return minVal + BigInt(Math.floor(Math.random() * Number(range)));
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveContestBalloons(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // 2 teams
    "2\n10 20\n15 15",
    // Limak already wins
    "3\n100 200\n50 60\n30 40",
    // Everyone is already disqualified or easy to dq
    "4\n10 100\n20 20\n30 30\n40 40",
    // Large values up to 10^18
    "3\n1000000000000000000 1000000000000000000\n2000000000000000000 2000000000000000000\n3000000000000000000 3000000000000000000",
    // Balloon counts equal weight
    "3\n10 10\n15 15\n20 20"
  ];

  for (const ec of edgeCases) {
    const expected = solveContestBalloons(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 35)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 6) + 4;   // 4-9
    else if (i < 25) n = Math.floor(Math.random() * 15) + 10; // 10-24
    else n = Math.floor(Math.random() * 12) + 24; // 24-35

    const limakT = generateRandomBigInt(10n, 100000n);
    const limakW = limakT + generateRandomBigInt(1n, 50000n);
    
    const lines = [`${n}`, `${limakT} ${limakW}`];
    for (let j = 1; j < n; j++) {
      const t = generateRandomBigInt(5n, limakT * 3n);
      const w = t + generateRandomBigInt(0n, 50000n);
      lines.push(`${t} ${w}`);
    }

    const input = lines.join("\n");
    const expected = solveContestBalloons(input);

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
    const expected = solveContestBalloons(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "codeforces-contest-balloons-editorial" },
    update: {
      title: "Codeforces 725D Contest Balloons Editorial",
      url: "https://codeforces.com/blog/entry/47953",
      type: "WEBSITE",
      topic: "Greedy",
      creator: "Codeforces",
      isPublic: true,
    },
    create: {
      id: "codeforces-contest-balloons-editorial",
      title: "Codeforces 725D Contest Balloons Editorial",
      url: "https://codeforces.com/blog/entry/47953",
      type: "WEBSITE",
      topic: "Greedy",
      creator: "Codeforces",
      isPublic: true,
    }
  });
  console.log("   ✅ Codeforces resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Contest Balloons' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "contest-balloons" },
    update: {
      title: "Contest Balloons",
      difficulty: "Hard",
      category: "Greedy",
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
      slug: "contest-balloons",
      title: "Contest Balloons",
      difficulty: "Hard",
      category: "Greedy",
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

  console.log("🎉 Successfully created/updated 'Contest Balloons'!");
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
