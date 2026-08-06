const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Sliding Window Maximum</h1>

<p>You are given an array of integers <code>nums</code>, there is a sliding window of size <code>k</code> which is moving from the very left of the array to the very right. You can only see the <code>k</code> numbers in the window. Each time the sliding window moves right by one position.</p>

<p>Return the max sliding window values.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Sliding Window Steps for Example 1 (k = 3):</h3>
<svg width="400" height="180" viewBox="0 0 400 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Array Elements -->
  <!-- Index 0: 1 -->
  <rect x="20" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="35" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  
  <!-- Index 1: 3 -->
  <rect x="55" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="70" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  
  <!-- Index 2: -1 -->
  <rect x="90" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="105" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">-1</text>
  
  <!-- Index 3: -3 -->
  <rect x="125" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="140" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">-3</text>
  
  <!-- Index 4: 5 -->
  <rect x="160" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="175" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  
  <!-- Index 5: 3 -->
  <rect x="195" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="210" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  
  <!-- Index 6: 6 -->
  <rect x="230" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="245" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
  
  <!-- Index 7: 7 -->
  <rect x="265" y="30" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="280" y="49" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>

  <!-- Sliding Window Step 1 (k = 3) -->
  <rect x="17" y="27" width="106" height="36" rx="6" fill="none" stroke="#10b981" stroke-width="2.5" />
  <text x="17" y="20" font-size="9" font-weight="bold" fill="#10b981">Window 1 (Max = 3)</text>

  <!-- Sliding Window Step 3 (k = 3) -->
  <rect x="87" y="87" width="106" height="36" rx="6" fill="none" stroke="#3b82f6" stroke-width="2.5" />
  <!-- Copy elements for visual representation of shifted window -->
  <rect x="90" y="90" width="30" height="30" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
  <text x="105" y="109" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">-1</text>
  <rect x="125" y="90" width="30" height="30" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
  <text x="140" y="109" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">-3</text>
  <rect x="160" y="90" width="30" height="30" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
  <text x="175" y="109" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
  <text x="87" y="80" font-size="9" font-weight="bold" fill="#3b82f6">Window 3 (Max = 5)</text>

  <path d="M 70 65 L 105 85" stroke="#334155" stroke-dasharray="3,2" stroke-width="1.5" />
</svg>
<p><strong>Explanation:</strong> 
<ul>
  <li>At first index 0-2: window contains <code>[1, 3, -1]</code> &rarr; maximum is <code>3</code>.</li>
  <li>Shift window by 1 cell to index 1-3: window contains <code>[3, -1, -3]</code> &rarr; maximum is <code>3</code>.</li>
  <li>Shift window by 1 cell to index 2-4: window contains <code>[-1, -3, 5]</code> &rarr; maximum is <code>5</code> (shown above).</li>
</ul>
The complete sliding window results are: <code>3 3 5 5 6 7</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers <code>N</code> and <code>K</code> representing array size and window size.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the array elements.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print space-separated integers representing the maximum of each sliding window.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>-10^4 &le; nums[i] &le; 10^4</code></li>
  <li><code>1 &le; K &le; N</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <deque>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, k;
    if (cin >> n >> k) {
        vector<int> nums(n);
        for (int i = 0; i < n; ++i) {
            cin >> nums[i];
        }
        
        deque<int> dq;
        vector<int> res;
        for (int i = 0; i < n; ++i) {
            if (!dq.empty() && dq.front() < i - k + 1) {
                dq.pop_front();
            }
            while (!dq.empty() && nums[dq.back()] <= nums[i]) {
                dq.pop_back();
            }
            dq.push_back(i);
            if (i >= k - 1) {
                res.push_back(nums[dq.front()]);
            }
        }
        
        for (size_t i = 0; i < res.size(); ++i) {
            cout << res[i] << (i == res.size() - 1 ? "" : " ");
        }
        cout << "\\n";
    }
    return 0;
}
`.trim();

function solveSlidingWindow(n, k, nums) {
  const deque = [];
  const res = [];
  for (let i = 0; i < n; i++) {
    if (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);
    if (i >= k - 1) {
      res.push(nums[deque[0]]);
    }
  }
  return res.join(" ");
}

const staticCases = [
  { n: 8, k: 3, nums: [1, 3, -1, -3, 5, 3, 6, 7], isExample: true },
  { n: 1, k: 1, nums: [1], isExample: true },
  { n: 4, k: 2, nums: [4, 3, 2, 1], isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const input = `${tc.n} ${tc.k}\n${tc.nums.join(" ")}`;
    const expected = solveSlidingWindow(tc.n, tc.k, tc.nums);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Edge cases (10)
  console.log("Generating edge cases...");
  const edgeCases = [
    { n: 5, k: 5, nums: [1, 2, 3, 4, 5] }, // K = N
    { n: 5, k: 1, nums: [5, 4, 3, 2, 1] }, // K = 1
    { n: 6, k: 3, nums: [1, 2, 3, 4, 5, 6] }, // sorted ascending
    { n: 6, k: 3, nums: [6, 5, 4, 3, 2, 1] }, // sorted descending
    { n: 5, k: 3, nums: [2, 2, 2, 2, 2] }, // all identical
    { n: 5, k: 2, nums: [-10, -5, -8, -1, -4] } // negative numbers
  ];

  for (const ec of edgeCases) {
    const input = `${ec.n} ${ec.k}\n${ec.nums.join(" ")}`;
    const expected = solveSlidingWindow(ec.n, ec.k, ec.nums);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Random cases (42)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 80) + 10; // 10-89
    const k = Math.floor(Math.random() * n) + 1; // 1 to N
    const nums = [];
    for (let j = 0; j < n; j++) {
      nums.push(Math.floor(Math.random() * 2000) - 1000); // -1000 to 1000
    }
    const input = `${n} ${k}\n${nums.join(" ")}`;
    const expected = solveSlidingWindow(n, k, nums);
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
    const lines = tc.input.split("\n");
    const header = lines[0].split(" ");
    const n = parseInt(header[0]);
    const k = parseInt(header[1]);
    const nums = lines[1].split(" ").map(Number);
    const expected = solveSlidingWindow(n, k, nums);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-sliding-window-maximum" },
    update: {
      title: "Sliding Window Maximum - LeetCode 239 - NeetCode",
      url: "https://www.youtube.com/watch?v=DfljaUwZsOk",
      type: "VIDEO",
      topic: "Queue",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-sliding-window-maximum",
      title: "Sliding Window Maximum - LeetCode 239 - NeetCode",
      url: "https://www.youtube.com/watch?v=DfljaUwZsOk",
      type: "VIDEO",
      topic: "Queue",
      creator: "NeetCode",
      isPublic: true,
    }
  });

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-sliding-window-maximum" },
    update: {
      title: "Sliding Window Maximum - takeUforward",
      url: "https://takeuforward.org/data-structure/sliding-window-maximum/",
      type: "WEBSITE",
      topic: "Queue",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-sliding-window-maximum",
      title: "Sliding Window Maximum - takeUforward",
      url: "https://takeuforward.org/data-structure/sliding-window-maximum/",
      type: "WEBSITE",
      topic: "Queue",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Resources ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Sliding Window Maximum' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "sliding-window-maximum" },
    update: {
      title: "Sliding Window Maximum",
      difficulty: "Hard",
      category: "Queue",
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
      slug: "sliding-window-maximum",
      title: "Sliding Window Maximum",
      difficulty: "Hard",
      category: "Queue",
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

  console.log("🎉 Successfully created/updated 'Sliding Window Maximum'!");
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
