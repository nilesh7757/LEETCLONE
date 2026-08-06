const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Count and Say</h1>

<p>The <strong>count-and-say</strong> sequence is a sequence of digit strings defined by the recursive formula:</p>
<ul>
  <li><code>countAndSay(1) = "1"</code></li>
  <li><code>countAndSay(n)</code> is the run-length encoding of <code>countAndSay(n - 1)</code>.</li>
</ul>

<p><strong>Run-length encoding (RLE)</strong> is a string compression method where consecutive identical characters are replaced by the concatenation of the character count and the character itself. For example, to compress string <code>"3322251"</code>:
<ul>
  <li>Group <code>"33"</code> &rarr; <code>two 3s</code> &rarr; <code>"23"</code></li>
  <li>Group <code>"222"</code> &rarr; <code>three 2s</code> &rarr; <code>"32"</code></li>
  <li>Group <code>"5"</code> &rarr; <code>one 5</code> &rarr; <code>"15"</code></li>
  <li>Group <code>"1"</code> &rarr; <code>one 1</code> &rarr; <code>"11"</code></li>
</ul>
Concatenating these groups yields the compressed string: <code>"23321511"</code>.</p>

<p>Given an integer <code>n</code>, return the <code>n</code>-th element of the count-and-say sequence.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Run-Length Encoding Transition from <code>n = 4</code> to <code>n = 5</code>:</h3>
<svg width="400" height="180" viewBox="0 0 400 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- countAndSay(4) = "1211" -->
  <text x="30" y="35" font-size="11" font-weight="bold" fill="#94a3b8">countAndSay(4) = "1211"</text>
  
  <!-- Group 1: 1 -->
  <rect x="30" y="45" width="25" height="25" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
  <text x="42" y="62" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  
  <!-- Group 2: 2 -->
  <rect x="65" y="45" width="25" height="25" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="77" y="62" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  
  <!-- Group 3: 11 -->
  <rect x="100" y="45" width="50" height="25" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
  <text x="112" y="62" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <text x="137" y="62" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Mapping Arrows / Explanations -->
  <path d="M 42 75 L 42 105" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2,2" />
  <text x="42" y="95" font-size="8" font-weight="bold" fill="#10b981" text-anchor="middle">one 1</text>

  <path d="M 77 75 L 105 105" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2,2" />
  <text x="96" y="95" font-size="8" font-weight="bold" fill="#3b82f6" text-anchor="middle">one 2</text>

  <path d="M 125 75 L 167 105" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="2,2" />
  <text x="150" y="95" font-size="8" font-weight="bold" fill="#a855f7" text-anchor="middle">two 1s</text>

  <!-- countAndSay(5) = "111221" -->
  <text x="30" y="130" font-size="11" font-weight="bold" fill="#94a3b8">countAndSay(5) = "111221"</text>
  
  <!-- Result 11 -->
  <rect x="30" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1" />
  <text x="40" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <rect x="53" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1" />
  <text x="63" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

  <!-- Result 12 -->
  <rect x="80" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
  <text x="90" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  <rect x="103" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
  <text x="113" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

  <!-- Result 21 -->
  <rect x="130" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#a855f7" stroke-width="1" />
  <text x="140" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  <rect x="153" y="140" width="20" height="20" rx="3" fill="#1e293b" stroke="#a855f7" stroke-width="1" />
  <text x="163" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
</svg>
<p><strong>Explanation:</strong> Under <code>n = 4</code>, we group identical consecutive characters in <code>"1211"</code> as <code>"1"</code>, <code>"2"</code>, and <code>"11"</code>. Reading them aloud yields: <code>one 1</code>, <code>one 2</code>, and <code>two 1s</code>. Joining these encodings gives <code>"111221"</code> representing <code>countAndSay(5)</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single integer <code>n</code>.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print the <code>n</code>-th digit string of the count-and-say sequence.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; n &le; 30</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <string>
#include <vector>

using namespace std;

string countAndSay(int n) {
    if (n <= 0) return "";
    string curr = "1";
    for (int i = 2; i <= n; ++i) {
        string nextStr = "";
        int len = curr.length();
        for (int j = 0; j < len; ++j) {
            int count = 1;
            while (j + 1 < len && curr[j] == curr[j + 1]) {
                count++;
                j++;
            }
            nextStr += to_string(count) + curr[j];
        }
        curr = nextStr;
    }
    return curr;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) {
        cout << countAndSay(n) << "\\n";
    }
    return 0;
}
`.trim();

// Solver implementation
function solveCountAndSay(n) {
  if (n <= 0) return "";
  let curr = "1";
  for (let i = 2; i <= n; i++) {
    let next = "";
    let j = 0;
    while (j < curr.length) {
      let count = 1;
      while (j + 1 < curr.length && curr[j] === curr[j + 1]) {
        count++;
        j++;
      }
      next += String(count) + curr[j];
      j++;
    }
    curr = next;
  }
  return curr;
}

const staticCases = [
  { input: "4", isExample: true },
  { input: "1", isExample: true },
  { input: "5", isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveCountAndSay(parseInt(tc.input));
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [2, 3, 6, 7, 8, 9, 10, 12, 15, 30];

  for (const ec of edgeCases) {
    const expected = solveCountAndSay(ec);
    testSets.push({
      input: String(ec),
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 42 random cases (N up to 30)
  console.log("Generating random test cases...");
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 20) + 1; // 1-20
    const expected = solveCountAndSay(n);

    testSets.push({
      input: String(n),
      expectedOutput: String(expected),
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Verify all locally
  console.log("Verifying test cases...");
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const expected = solveCountAndSay(parseInt(tc.input));
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "neetcode-count-and-say" },
    update: {
      title: "Count and Say - LeetCode 38 - NeetCode",
      url: "https://www.youtube.com/watch?v=1UypQLiO1Co",
      type: "VIDEO",
      topic: "String",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-count-and-say",
      title: "Count and Say - LeetCode 38 - NeetCode",
      url: "https://www.youtube.com/watch?v=1UypQLiO1Co",
      type: "VIDEO",
      topic: "String",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Upsert problem record
  console.log("Upserting problem 'Count and Say' in database...");
  const result = await prisma.problem.upsert({
    where: { slug: "count-and-say" },
    update: {
      title: "Count and Say",
      difficulty: "Medium",
      category: "Strings",
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
      slug: "count-and-say",
      title: "Count and Say",
      difficulty: "Medium",
      category: "Strings",
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

  console.log("🎉 Successfully created/updated 'Count and Say'!");
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
