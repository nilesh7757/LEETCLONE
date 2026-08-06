const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Maximum Product Subarray</h1>

<p>Given an integer array <code>nums</code>, find a subarray that has the largest product, and return <em>the product</em>.</p>

<p>The test cases are generated so that the answer will fit in a <strong>32-bit</strong> integer.</p>

<p>A <strong>subarray</strong> is a contiguous non-empty sequence of elements within an array.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Optimal Subarray & DP Transition for Example 1:</h3>
<svg width="450" height="160" viewBox="0 0 450 160" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead markers -->
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Array Elements -->
  <!-- Index 0: 2 -->
  <rect x="30" y="30" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="50" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <text x="50" y="85" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">idx 0</text>
  
  <!-- Index 1: 3 -->
  <rect x="85" y="30" width="40" height="40" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
  <text x="105" y="55" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  <text x="105" y="85" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">idx 1</text>
  
  <!-- Index 2: -2 -->
  <rect x="140" y="30" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="160" y="55" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">-2</text>
  <text x="160" y="85" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">idx 2</text>
  
  <!-- Index 3: 4 -->
  <rect x="195" y="30" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="215" y="55" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">4</text>
  <text x="215" y="85" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">idx 3</text>

  <!-- Highlight box around [2, 3] -->
  <rect x="25" y="23" width="106" height="50" rx="8" fill="none" stroke="#10b981" stroke-dasharray="3,2" stroke-width="2" />
  
  <!-- Arrow indicating Product = 6 -->
  <path d="M 77 92 L 77 115" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrow-green)" />
  <text x="77" y="132" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Max Subarray: [2, 3]</text>
  <text x="77" y="145" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">(Product = 6)</text>
  
  <!-- DP State representation at the right side of the SVG -->
  <rect x="260" y="20" width="160" height="120" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="340" y="37" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">DP State Tracker</text>
  <line x1="260" y1="46" x2="420" y2="46" stroke="#334155" />
  
  <text x="270" y="62" font-size="8" fill="#94a3b8">At idx 0: max = 2, min = 2</text>
  <text x="270" y="80" font-size="8" fill="#94a3b8">At idx 1: max = 6, min = 3</text>
  <text x="270" y="98" font-size="8" fill="#94a3b8">At idx 2: max = -2, min = -12</text>
  <text x="270" y="116" font-size="8" fill="#94a3b8">At idx 3: max = 4, min = -48</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The contiguous subarray <code>[2, 3]</code> has the largest product = <code>6</code>. We track the minimum product at each step as well, because multiplying a negative number by a large negative minimum product can yield a new maximum product.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>N</code> representing the size of the array.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the array elements.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the maximum product of any contiguous subarray.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 2 * 10^4</code></li>
  <li><code>-10 &le; nums[i] &le; 10</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int maxProduct(vector<int>& nums) {
    if (nums.empty()) return 0;
    int max_prod = nums[0];
    int min_prod = nums[0];
    int global_max = nums[0];
    
    for (size_t i = 1; i < nums.size(); ++i) {
        int val = nums[i];
        if (val < 0) {
            swap(max_prod, min_prod);
        }
        max_prod = max(val, max_prod * val);
        min_prod = min(val, min_prod * val);
        global_max = max(global_max, max_prod);
    }
    return global_max;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; ++i) {
            cin >> nums[i];
        }
        cout << maxProduct(nums) << "\\n";
    }
    return 0;
}
`.trim();

// Solver implementation for verification
function solveMaxProductSubarray(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return 0;
  const nums = lines[1].trim().split(/\s+/).map(Number);
  
  let max_prod = nums[0];
  let min_prod = nums[0];
  let global_max = nums[0];
  
  for (let i = 1; i < n; i++) {
    const val = nums[i];
    if (val < 0) {
      const temp = max_prod;
      max_prod = min_prod;
      min_prod = temp;
    }
    max_prod = Math.max(val, max_prod * val);
    min_prod = Math.min(val, min_prod * val);
    global_max = Math.max(global_max, max_prod);
  }
  return global_max;
}

const staticCases = [
  { input: "4\n2 3 -2 4", isExample: true },
  { input: "3\n-2 0 -1", isExample: true },
  { input: "3\n-3 -1 -1", isExample: true }
];

function generateRandomArray(n, minVal = -10, maxVal = 10) {
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
    const expected = solveMaxProductSubarray(tc.input);
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
    [-5],
    [0],
    [1, 2, 3, 4],
    [-1, -2, -3, -4],
    [2, -3, 2, -3],
    [-2, 0, -1, 0, -3],
    [10, 0, 9, 0, 8],
    [-10, 10, -10, 10, -10],
    [0, 2, 0, -3, 0]
  ];

  for (const ec of edgeCases) {
    const input = arrayToInput(ec);
    const expected = solveMaxProductSubarray(input);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random arrays (N up to 200)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 15) + 5; // 5-19
    else if (i < 25) n = Math.floor(Math.random() * 50) + 20; // 20-69
    else n = Math.floor(Math.random() * 130) + 70; // 70-199

    const arr = generateRandomArray(n, -10, 10);
    const input = arrayToInput(arr);
    const expected = solveMaxProductSubarray(input);

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
    const expected = solveMaxProductSubarray(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-max-product-subarray-website" },
    update: {
      title: "Maximum Product Subarray in an Array - takeUforward",
      url: "https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-max-product-subarray-website",
      title: "Maximum Product Subarray in an Array - takeUforward",
      url: "https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/",
      type: "WEBSITE",
      topic: "Dynamic Programming",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-max-product-subarray-video" },
    update: {
      title: "NeetCode's Maximum Product Subarray - LeetCode 152",
      url: "https://www.youtube.com/watch?v=lqpR2QILYyk",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-max-product-subarray-video",
      title: "NeetCode's Maximum Product Subarray - LeetCode 152",
      url: "https://www.youtube.com/watch?v=lqpR2QILYyk",
      type: "VIDEO",
      topic: "Dynamic Programming",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode video resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Maximum Product Subarray' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "maximum-product-subarray" },
    update: {
      title: "Maximum Product Subarray",
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
      slug: "maximum-product-subarray",
      title: "Maximum Product Subarray",
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

  console.log("🎉 Successfully created/updated 'Maximum Product Subarray'!");
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
