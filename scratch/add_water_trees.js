const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Water the Trees</h1>

<p>There are <code>n</code> trees in a row, numbered from <code>1</code> to <code>n</code>. The initial height of the <code>i</code>-th tree is <code>h_i</code>. You want to water the trees so that they all have the same height.</p>

<p>You have a watering can. You can use it in two different ways each day:</p>
<ul>
  <li>On <strong>odd days</strong> (1st, 3rd, 5th, etc.), you can choose one tree and increase its height by <code>1</code>.</li>
  <li>On <strong>even days</strong> (2nd, 4th, 6th, etc.), you can choose one tree and increase its height by <code>2</code>.</li>
</ul>

<p>You can also choose to do nothing on any day. Your goal is to find the minimum number of days required to make all trees reach the same height.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Tree Height Progress for Example 1 (target height = 4):</h3>
<svg width="400" height="240" viewBox="0 0 400 240" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Target Height Line (4) -->
  <line x1="40" y1="60" x2="360" y2="60" stroke="#f59e0b" stroke-dasharray="4,3" stroke-width="1.5" />
  <text x="365" y="64" font-size="10" font-weight="bold" fill="#f59e0b">Target (4)</text>

  <!-- Trees (Initial Heights) -->
  <!-- Tree 0 (height 1) -->
  <rect x="70" y="140" width="30" height="40" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <!-- Added height on Day 1 (+1) -->
  <rect x="70" y="100" width="30" height="40" rx="1" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="1" />
  <!-- Added height on Day 4 (+2) -->
  <rect x="70" y="60" width="30" height="40" rx="1" fill="#10b981" fill-opacity="0.6" stroke="#10b981" stroke-width="1" />
  <text x="85" y="195" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Tree 0</text>
  <text x="85" y="165" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">H=1</text>
  <text x="85" y="125" font-size="9" fill="#a7f3d0" text-anchor="middle">Day 1 (+1)</text>
  <text x="85" y="85" font-size="9" fill="#34d399" text-anchor="middle">Day 4 (+2)</text>

  <!-- Tree 1 (height 2) -->
  <rect x="180" y="100" width="30" height="80" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <!-- Added height on Day 2 (+2) -->
  <rect x="180" y="60" width="30" height="40" rx="1" fill="#10b981" fill-opacity="0.6" stroke="#10b981" stroke-width="1" />
  <text x="195" y="195" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Tree 1</text>
  <text x="195" y="145" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">H=2</text>
  <text x="195" y="85" font-size="9" fill="#34d399" text-anchor="middle">Day 2 (+2)</text>

  <!-- Tree 2 (height 4) -->
  <rect x="290" y="60" width="30" height="120" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="305" y="195" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Tree 2</text>
  <text x="305" y="125" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">H=4</text>

  <!-- Ground Line -->
  <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" stroke-width="2" />

  <!-- Timeline Notes -->
  <rect x="40" y="210" width="320" height="24" rx="4" fill="#111827" stroke="#1f2937" />
  <text x="200" y="226" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">
    Day 1: Tree 0 | Day 2: Tree 1 | Day 3: Idle | Day 4: Tree 0 &rarr; Min Days = 4
  </text>
</svg>
<p><strong>Explanation for Example 1:</strong> The initial heights are <code>[1, 2, 4]</code>. If we target the height of <code>4</code>:
<ul>
  <li>Day 1 (odd): Increase Tree 0 by 1. Heights: <code>[2, 2, 4]</code>.</li>
  <li>Day 2 (even): Increase Tree 1 by 2. Heights: <code>[2, 4, 4]</code>.</li>
  <li>Day 3 (odd): Do nothing (idle).</li>
  <li>Day 4 (even): Increase Tree 0 by 2. Heights: <code>[4, 4, 4]</code>.</li>
</ul>
All trees now have a height of <code>4</code>. The total days required is <code>4</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>n</code> representing the number of trees.</li>
  <li><strong>Line 2:</strong> <code>n</code> space-separated integers representing the initial heights.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimum days required to make all trees equal height.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; n &le; 3*10^5</code></li>
  <li><code>1 &le; h_i &le; 10^9</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

bool isValid(const vector<long long>& h, long long target, long long days) {
    long long odd = (days + 1) / 2;
    long long even = days / 2;
    long long total_1s = 0;
    long long total_2s = 0;
    for (long long height : h) {
        long long diff = target - height;
        total_2s += diff / 2;
        total_1s += diff % 2;
    }
    if (total_1s > odd) return false;
    return total_2s <= even + (odd - total_1s) / 2;
}

long long solve(const vector<long long>& h, long long target) {
    long long low = 0;
    long long high = 1e18;
    long long ans = high;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (isValid(h, target, mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<long long> h(n);
    long long maxH = 0;
    for (int i = 0; i < n; ++i) {
        cin >> h[i];
        maxH = max(maxH, h[i]);
    }
    
    long long ans = min(solve(h, maxH), solve(h, maxH + 1));
    cout << ans << "\\n";
    return 0;
}
`.trim();

// Solver implementation using BigInt
function isValid(h, target, days) {
  const odd = (days + 1n) / 2n;
  const even = days / 2n;
  let total1s = 0n;
  let total2s = 0n;
  for (const height of h) {
    const diff = target - height;
    total2s += diff / 2n;
    total1s += diff % 2n;
  }
  if (total1s > odd) return false;
  return total2s <= even + (odd - total1s) / 2n;
}

function solveForTarget(h, target) {
  let low = 0n;
  let high = 1000000000000000000n; // 1e18
  let ans = high;
  while (low <= high) {
    const mid = (low + high) / 2n;
    if (isValid(h, target, mid)) {
      ans = mid;
      high = mid - 1n;
    } else {
      low = mid + 1n;
    }
  }
  return ans;
}

function solveWaterTrees(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return 0;
  const h = lines[1].trim().split(/\s+/).map(BigInt);

  let maxH = 0n;
  for (const val of h) {
    if (val > maxH) maxH = val;
  }

  const ans1 = solveForTarget(h, maxH);
  const ans2 = solveForTarget(h, maxH + 1n);
  return ans1 < ans2 ? ans1 : ans2;
}

const staticCases = [
  { input: "3\n1 2 4", isExample: true },
  { input: "5\n2 2 4 4 4", isExample: true },
  { input: "10\n4 1 5 4 1 1 5 2 2 4", isExample: true }
];

function generateRandomHeights(n, maxH = 1000000000) {
  const h = [];
  for (let i = 0; i < n; i++) {
    h.push(Math.floor(Math.random() * maxH) + 1);
  }
  return h;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveWaterTrees(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // Already all equal
    "3\n5 5 5",
    // 2 trees, odd diff
    "2\n1 2",
    // 2 trees, even diff
    "2\n1 3",
    // Large differences
    "3\n1 1000000000 1",
    // Standard powers of two
    "4\n2 4 8 16"
  ];

  for (const ec of edgeCases) {
    const expected = solveWaterTrees(ec);
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

    const h = generateRandomHeights(n, 1000000);
    const input = `${n}\n${h.join(" ")}`;
    const expected = solveWaterTrees(input);

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
    const expected = solveWaterTrees(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "codeforces-water-trees-editorial" },
    update: {
      title: "Codeforces 1661C Water the Trees Editorial",
      url: "https://codeforces.com/blog/entry/101700",
      type: "WEBSITE",
      topic: "Binary Search",
      creator: "Codeforces",
      isPublic: true,
    },
    create: {
      id: "codeforces-water-trees-editorial",
      title: "Codeforces 1661C Water the Trees Editorial",
      url: "https://codeforces.com/blog/entry/101700",
      type: "WEBSITE",
      topic: "Binary Search",
      creator: "Codeforces",
      isPublic: true,
    }
  });
  console.log("   ✅ Codeforces resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Water the Trees' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "water-the-trees" },
    update: {
      title: "Water the Trees",
      difficulty: "Hard",
      category: "Binary Search",
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
      slug: "water-the-trees",
      title: "Water the Trees",
      difficulty: "Hard",
      category: "Binary Search",
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

  console.log("🎉 Successfully created/updated 'Water the Trees'!");
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
