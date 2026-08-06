const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Palindrome Partitioning II</h1>

<p>Given a string <code>s</code>, partition <code>s</code> such that every substring of the partition is a <strong>palindrome</strong>.</p>

<p>Return the <strong>minimum cuts</strong> needed for a palindrome partitioning of <code>s</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Optimal Partitioning for Example 1 (<code>s = "aab"</code>):</h3>
<svg width="450" height="180" viewBox="0 0 450 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Sub-block 1: aa -->
  <rect x="50" y="40" width="120" height="60" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="3" />
  <text x="80" y="78" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">a</text>
  <text x="140" y="78" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">a</text>
  <text x="110" y="125" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">Palindrome</text>

  <!-- Cut line -->
  <line x1="200" y1="20" x2="200" y2="140" stroke="#f43f5e" stroke-width="4" stroke-dasharray="6,4" />
  <text x="200" y="12" font-size="11" font-weight="bold" fill="#f43f5e" text-anchor="middle">Cut (1)</text>

  <!-- Sub-block 2: b -->
  <rect x="230" y="40" width="60" height="60" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="3" />
  <text x="260" y="78" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">b</text>
  <text x="260" y="125" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">Palindrome</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The string <code>"aab"</code> can be partitioned into <code>"aa"</code> and <code>"b"</code>. Both parts are palindromes individually, requiring a minimum of <code>1</code> cut.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing the string <code>s</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the minimum cuts needed.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; s.length &le; 2000</code></li>
  <li><code>s</code> consists of lowercase English letters only.</li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int minCut(string s) {
    int n = s.length();
    if (n <= 1) return 0;
    
    vector<vector<bool>> isPal(n, vector<bool>(n, false));
    for (int i = 0; i < n; ++i) {
        isPal[i][i] = true;
    }
    for (int len = 2; len <= n; ++len) {
        for (int i = 0; i <= n - len; ++i) {
            int j = i + len - 1;
            if (len == 2) {
                isPal[i][j] = (s[i] == s[j]);
            } else {
                isPal[i][j] = (s[i] == s[j] && isPal[i+1][j-1]);
            }
        }
    }
    
    vector<int> cuts(n, 0);
    for (int i = 0; i < n; ++i) {
        if (isPal[0][i]) {
            cuts[i] = 0;
        } else {
            int minC = i;
            for (int j = 0; j <= i; ++j) {
                if (isPal[j][i]) {
                    minC = min(minC, (j == 0 ? 0 : cuts[j - 1]) + 1);
                }
            }
            cuts[i] = minC;
        }
    }
    return cuts[n - 1];
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    if (cin >> s) {
        cout << minCut(s) << "\\n";
    }
    return 0;
}
`.trim();

// Solver implementation
function solvePalindromePartitioningII(s) {
  const n = s.length;
  if (n <= 1) return 0;

  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) {
    isPal[i][i] = true;
  }
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (len === 2) {
        isPal[i][j] = (s[i] == s[j]);
      } else {
        isPal[i][j] = (s[i] == s[j] && isPal[i + 1][j - 1]);
      }
    }
  }

  const cuts = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (isPal[0][i]) {
      cuts[i] = 0;
    } else {
      let minC = i;
      for (let j = 0; j <= i; j++) {
        if (isPal[j][i]) {
          minC = Math.min(minC, (j === 0 ? 0 : cuts[j - 1]) + 1);
        }
      }
      cuts[i] = minC;
    }
  }
  return cuts[n - 1];
}

const staticCases = [
  { input: "aab", isExample: true },
  { input: "a", isExample: true },
  { input: "ab", isExample: true }
];

// String generator helper
function generateRandomString(length, pool = "abcdefghijklmnopqrstuvwxyz") {
  let res = "";
  for (let i = 0; i < length; i++) {
    res += pool[Math.floor(Math.random() * pool.length)];
  }
  return res;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solvePalindromePartitioningII(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Add 10 edge cases
  console.log("Adding edge cases...");
  const edgeCases = [
    "aba",
    "racecar",
    "aaaaaaa",
    "abcdef",
    "abababab",
    "b",
    "abcdeedcba",
    "abbab",
    "aabccba",
    "abaaba"
  ];

  for (const ec of edgeCases) {
    const expected = solvePalindromePartitioningII(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random strings (varying lengths up to 500)
  console.log("Generating 42 random cases...");
  const pools = ["abc", "ab", "abcdefg", "abcde", "abcdefghijklmnopqrstuvwxyz"];
  for (let i = 0; i < 42; i++) {
    const pool = pools[i % pools.length];
    let len = 5;
    if (i < 15) len = Math.floor(Math.random() * 15) + 5; // 5-19
    else if (i < 30) len = Math.floor(Math.random() * 100) + 20; // 20-119
    else len = Math.floor(Math.random() * 300) + 120; // 120-419

    const str = generateRandomString(len, pool);
    const expected = solvePalindromePartitioningII(str);

    testSets.push({
      input: str,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Verify all locally
  console.log("Verifying test cases...");
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const expected = solvePalindromePartitioningII(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Input: "${tc.input}", Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-palindrome-partitioning-ii-website" },
    update: {
      title: "Palindrome Partitioning II - Front Partition DP",
      url: "https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-53/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-palindrome-partitioning-ii-website",
      title: "Palindrome Partitioning II - Front Partition DP",
      url: "https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-53/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  // 6. Update problem in database
  console.log("Updating problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "palindrome-partitioning-ii" },
    data: {
      description: htmlDescription,
      referenceSolution: cppReferenceSolution,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: "a7e02a0a-5036-44eb-93f3-6eaf8989bccc" }, // legacy striver video
          { id: "f6e2bbf1-f632-4945-81c8-64b8e32d7c42" }  // legacy neetcode video
        ]
      }
    }
  });

  console.log("🎉 Successfully updated 'Palindrome Partitioning II'!");
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
