const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Non-overlapping Intervals</h1>

<p>Given an array of intervals <code>intervals</code> where <code>intervals[i] = [start_i, end_i]</code>, return the <strong>minimum number of intervals</strong> you need to remove to make the rest of the intervals non-overlapping.</p>

<p>Note that intervals which touch at a point are <strong>not</strong> considered overlapping. For example, <code>[1, 2]</code> and <code>[2, 3]</code> are non-overlapping.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Timeline & Interval Layout for Example 1:</h3>
<svg width="400" height="190" viewBox="0 0 400 190" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Timeline Axis Line -->
  <line x1="50" y1="140" x2="350" y2="140" stroke="#475569" stroke-width="2" />
  
  <!-- Axis Ticks & Labels -->
  <!-- Tick 1 -->
  <line x1="80" y1="135" x2="80" y2="145" stroke="#475569" stroke-width="2" />
  <text x="80" y="160" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle">1</text>
  
  <!-- Tick 2 -->
  <line x1="160" y1="135" x2="160" y2="145" stroke="#475569" stroke-width="2" />
  <text x="160" y="160" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle">2</text>
  
  <!-- Tick 3 -->
  <line x1="240" y1="135" x2="240" y2="145" stroke="#475569" stroke-width="2" />
  <text x="240" y="160" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle">3</text>
  
  <!-- Tick 4 -->
  <line x1="320" y1="135" x2="320" y2="145" stroke="#475569" stroke-width="2" />
  <text x="320" y="160" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle">4</text>

  <!-- Intervals -->
  <!-- [1, 2] (Green) -->
  <rect x="80" y="40" width="80" height="20" rx="4" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2" />
  <text x="120" y="54" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[1, 2]</text>

  <!-- [2, 3] (Green) -->
  <rect x="160" y="40" width="80" height="20" rx="4" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2" />
  <text x="200" y="54" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[2, 3]</text>

  <!-- [3, 4] (Green) -->
  <rect x="240" y="40" width="80" height="20" rx="4" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2" />
  <text x="280" y="54" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[3, 4]</text>

  <!-- [1, 3] (Red / Removed) -->
  <rect x="80" y="80" width="160" height="20" rx="4" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="160" y="94" font-size="10" font-weight="bold" fill="#fca5a5" text-anchor="middle">[1, 3] (Overlap)</text>
  
  <!-- Red X mark over [1,3] -->
  <text x="60" y="94" font-size="12" font-weight="bold" fill="#ef4444" text-anchor="middle">❌</text>
</svg>
<p><strong>Explanation for Example 1:</strong> By removing the interval <code>[1, 3]</code>, the remaining intervals <code>[1, 2]</code>, <code>[2, 3]</code>, and <code>[3, 4]</code> do not overlap and perfectly touch end-to-start. Thus, we only need to remove <code>1</code> interval.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>N</code> representing the number of intervals.</li>
  <li><strong>Next <code>N</code> lines:</strong> Two space-separated integers <code>start end</code> representing each interval range.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the minimum number of intervals to remove.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>start_i &lt; end_i</code></li>
  <li><code>-5 * 10^4 &le; start_i, end_i &le; 5 * 10^4</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Interval {
    int start;
    int end;
};

bool compareIntervals(const Interval& a, const Interval& b) {
    return a.end < b.end;
}

int eraseOverlapIntervals(vector<Interval>& intervals) {
    if (intervals.empty()) return 0;
    sort(intervals.begin(), intervals.end(), compareIntervals);
    
    int count = 0;
    int prevEnd = intervals[0].end;
    
    for (size_t i = 1; i < intervals.size(); ++i) {
        if (intervals[i].start < prevEnd) {
            count++;
        } else {
            prevEnd = intervals[i].end;
        }
    }
    
    return count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<Interval> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].start >> intervals[i].end;
    }
    
    cout << eraseOverlapIntervals(intervals) << "\\n";
    return 0;
}
`.trim();

// Solver implementation
function solveNonOverlappingIntervals(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return 0;

  const intervals = [];
  for (let i = 0; i < n; i++) {
    const tokens = lines[1 + i].trim().split(/\s+/);
    if (tokens.length < 2) continue;
    intervals.push({ start: parseInt(tokens[0]), end: parseInt(tokens[1]) });
  }

  if (intervals.length === 0) return 0;

  intervals.sort((a, b) => a.end - b.end);

  let count = 0;
  let prevEnd = intervals[0].end;

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start < prevEnd) {
      count++;
    } else {
      prevEnd = intervals[i].end;
    }
  }

  return count;
}

const staticCases = [
  { input: "4\n1 2\n2 3\n3 4\n1 3", isExample: true },
  { input: "3\n1 2\n1 2\n1 2", isExample: true },
  { input: "2\n1 2\n2 3", isExample: true }
];

// Helper to generate random intervals
function generateRandomIntervals(n, range = 1000, maxLen = 100) {
  const intervals = [];
  for (let i = 0; i < n; i++) {
    const start = Math.floor(Math.random() * (range * 2)) - range;
    const len = Math.floor(Math.random() * maxLen) + 1;
    intervals.push([start, start + len]);
  }
  return intervals;
}

function intervalsToInput(intervals) {
  const lines = [String(intervals.length)];
  for (const [start, end] of intervals) {
    lines.push(`${start} ${end}`);
  }
  return lines.join("\n");
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveNonOverlappingIntervals(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    [[5, 10]],
    [[1, 10], [2, 3], [4, 5], [6, 7]],
    [[1, 2], [3, 4], [5, 6], [7, 8]],
    [[1, 100], [50, 150], [90, 200]],
    [[-100, -50], [-70, -20], [-60, -30]],
    [[1, 5], [1, 5], [1, 5], [1, 5]],
    [[1, 2], [2, 3], [3, 4], [4, 5]],
    [[-1000, 1000]],
    [[1, 2], [1, 10], [9, 10]],
    [[1, 4], [2, 5], [3, 6], [4, 7]]
  ];

  for (const ec of edgeCases) {
    const input = intervalsToInput(ec);
    const expected = solveNonOverlappingIntervals(input);
    testSets.push({
      input,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 1000)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 15) + 5;   // 5-19
    else if (i < 25) n = Math.floor(Math.random() * 150) + 20; // 20-169
    else n = Math.floor(Math.random() * 800) + 100; // 100-899

    const intervals = generateRandomIntervals(n, 2000, 150);
    const input = intervalsToInput(intervals);
    const expected = solveNonOverlappingIntervals(input);

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
    const expected = solveNonOverlappingIntervals(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-non-overlapping-intervals-website" },
    update: {
      title: "Non-overlapping Intervals - Greedy Algorithm",
      url: "https://takeuforward.org/greedy-algorithm/non-overlapping-intervals-greedy/",
      type: "WEBSITE",
      topic: "Greedy",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-non-overlapping-intervals-website",
      title: "Non-overlapping Intervals - Greedy Algorithm",
      url: "https://takeuforward.org/greedy-algorithm/non-overlapping-intervals-greedy/",
      type: "WEBSITE",
      topic: "Greedy",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-non-overlapping-intervals-video" },
    update: {
      title: "NeetCode's Non-overlapping Intervals - LeetCode 435",
      url: "https://www.youtube.com/watch?v=nONCGxWoUfM",
      type: "VIDEO",
      topic: "Greedy",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-non-overlapping-intervals-video",
      title: "NeetCode's Non-overlapping Intervals - LeetCode 435",
      url: "https://www.youtube.com/watch?v=nONCGxWoUfM",
      type: "VIDEO",
      topic: "Greedy",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode video resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Non-overlapping Intervals' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "non-overlapping-intervals" },
    update: {
      title: "Non-overlapping Intervals",
      difficulty: "Medium",
      category: "Greedy",
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
      slug: "non-overlapping-intervals",
      title: "Non-overlapping Intervals",
      difficulty: "Medium",
      category: "Greedy",
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

  console.log("🎉 Successfully created/updated 'Non-overlapping Intervals'!");
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
