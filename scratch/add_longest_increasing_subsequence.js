const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Longest Increasing Subsequence</h1>

<p>Given an integer array <code>nums</code>, return the length of the <strong>longest strictly increasing subsequence</strong>.</p>

<p>A <strong>subsequence</strong> is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements. For example, <code>[3, 6, 2, 7]</code> is a subsequence of the array <code>[0, 3, 1, 6, 2, 2, 7]</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Optimal LIS Structure for Example 1:</h3>
<svg width="450" height="150" viewBox="0 0 450 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Array Elements -->
  <!-- 10 -->
  <rect x="25" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="45" y="70" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">10</text>
  
  <!-- 9 -->
  <rect x="75" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="95" y="70" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">9</text>

  <!-- 2 (LIS) -->
  <rect x="125" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="145" y="70" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- 5 -->
  <rect x="175" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="195" y="70" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">5</text>

  <!-- 3 (LIS) -->
  <rect x="225" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="245" y="70" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <!-- 7 (LIS) -->
  <rect x="275" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="295" y="70" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>

  <!-- 101 -->
  <rect x="325" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="345" y="70" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">101</text>

  <!-- 18 (LIS) -->
  <rect x="375" y="45" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="395" y="70" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">18</text>

  <!-- Optimal LIS Path Connectors -->
  <!-- 2 -> 3 -->
  <path d="M 145 92 Q 195 125 245 92" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrow-green)" />
  <!-- 3 -> 7 -->
  <path d="M 245 92 Q 270 115 295 92" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrow-green)" />
  <!-- 7 -> 18 -->
  <path d="M 295 92 Q 345 125 395 92" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrow-green)" />

  <text x="225" y="138" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Longest Increasing Subsequence: [2, 3, 7, 18] (length 4)</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The longest strictly increasing subsequence is <code>[2, 3, 7, 18]</code>, which has a length of <code>4</code>. Another valid LIS of the same length is <code>[2, 3, 7, 101]</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>N</code> representing the size of the array.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the array elements.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the length of the longest strictly increasing subsequence.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 2500</code></li>
  <li><code>-10^4 &le; nums[i] &le; 10^4</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int lengthOfLIS(vector<int>& nums) {
    if (nums.empty()) return 0;
    vector<int> temp;
    temp.push_back(nums[0]);
    for (int i = 1; i < nums.size(); ++i) {
        if (nums[i] > temp.back()) {
            temp.push_back(nums[i]);
        } else {
            auto it = lower_bound(temp.begin(), temp.end(), nums[i]);
            *it = nums[i];
        }
    }
    return temp.size();
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }
    
    cout << lengthOfLIS(nums) << "\\n";
    return 0;
}
`.trim();

// Solver implementation using Binary Search
function solveLIS(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return 0;
  const nums = lines[1].trim().split(/\s+/).map(Number);

  const temp = [nums[0]];
  for (let i = 1; i < n; i++) {
    const val = nums[i];
    if (val > temp[temp.length - 1]) {
      temp.push(val);
    } else {
      let low = 0;
      let high = temp.length - 1;
      let pos = temp.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (temp[mid] >= val) {
          pos = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      temp[pos] = val;
    }
  }
  return temp.length;
}

const staticCases = [
  { input: "8\n10 9 2 5 3 7 101 18", isExample: true },
  { input: "6\n0 1 0 3 2 3", isExample: true },
  { input: "7\n7 7 7 7 7 7 7", isExample: true }
];

// Helper to generate random arrays
function generateRandomArray(n, minVal = -1000, maxVal = 1000) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
  }
  return arr;
}

function arrayToInput(arr) {
  return `${arr.length}\n${arr.join(" ")}`;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveLIS(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    [5],
    [5, 4, 3, 2, 1], // strictly decreasing
    [1, 2, 3, 4, 5, 6, 7], // strictly increasing
    [2, 2, 2, 3, 3, 3, 4, 4, 4], // duplicates
    [10, -10, 20, -20, 30, -30], // alternating positive/negative
    [-10000, 10000], // boundaries
    [-10, -9, -8, -7, -6], // all negative increasing
    [0, 0, 0, 0], // zeros
    [1, 2, 1, 2, 1, 2, 1, 2], // repeating cycles
    [100, 10, 1]
  ];

  for (const ec of edgeCases) {
    const input = arrayToInput(ec);
    const expected = solveLIS(input);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random arrays (N up to 1000)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 20) + 5; // 5-24
    else if (i < 25) n = Math.floor(Math.random() * 200) + 50; // 50-249
    else n = Math.floor(Math.random() * 800) + 200; // 200-999

    const arr = generateRandomArray(n, -5000, 5000);
    const input = arrayToInput(arr);
    const expected = solveLIS(input);

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
    const expected = solveLIS(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-lis-website" },
    update: {
      title: "Longest Increasing Subsequence - Dynamic Programming",
      url: "https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-lis-website",
      title: "Longest Increasing Subsequence - Dynamic Programming",
      url: "https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-lis-video" },
    update: {
      title: "NeetCode's Longest Increasing Subsequence - LeetCode 300",
      url: "https://www.youtube.com/watch?v=cjWnW0hdF1Y",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-lis-video",
      title: "NeetCode's Longest Increasing Subsequence - LeetCode 300",
      url: "https://www.youtube.com/watch?v=cjWnW0hdF1Y",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode video resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Longest Increasing Subsequence' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "longest-increasing-subsequence" },
    update: {
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      category: "Dynamic Programming",
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
      slug: "longest-increasing-subsequence",
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      category: "Dynamic Programming",
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

  console.log("🎉 Successfully created/updated 'Longest Increasing Subsequence'!");
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
