const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Maximum XOR Subarray</h1>

<p>Given an array of <code>N</code> non-negative integers, find the contiguous subarray with the <strong>maximum bitwise XOR sum</strong>.</p>

<p>Return a single integer representing the maximum XOR sum of any contiguous subarray.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Max XOR Subarray for <code>arr = [1, 2, 3, 4]</code>:</h3>
<svg width="420" height="210" viewBox="0 0 420 210" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Subarray Highlight (Index 2 to 3) -->
  <rect x="155" y="35" width="120" height="60" rx="8" fill="#047857" fill-opacity="0.2" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,2" />

  <!-- Array Elements -->
  <!-- Cell 0 (1) -->
  <rect x="40" y="40" width="50" height="50" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="65" y="70" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">1</text>
  
  <!-- Cell 1 (2) -->
  <rect x="100" y="40" width="50" height="50" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
  <text x="125" y="70" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">2</text>
  
  <!-- Cell 2 (3) -->
  <rect x="160" y="40" width="50" height="50" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="185" y="70" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  
  <!-- Cell 3 (4) -->
  <rect x="220" y="40" width="50" height="50" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="245" y="70" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

  <!-- Label for Subarray -->
  <text x="215" y="112" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">Max XOR Subarray [3, 4]</text>

  <!-- XOR Bitwise Operation Box -->
  <rect x="290" y="40" width="90" height="130" rx="8" fill="#1d1e22" stroke="#334155" stroke-width="1.5" />
  <text x="335" y="65" font-size="12" font-family="monospace" fill="#94a3b8" text-anchor="middle">3 = 0 1 1</text>
  <text x="300" y="90" font-size="11" font-family="monospace" fill="#ef4444" text-anchor="middle">^</text>
  <text x="335" y="90" font-size="12" font-family="monospace" fill="#94a3b8" text-anchor="middle">4 = 1 0 0</text>
  <line x1="300" y1="105" x2="370" y2="105" stroke="#475569" stroke-width="1" />
  <text x="335" y="125" font-size="12" font-family="monospace" font-weight="bold" fill="#10b981" text-anchor="middle">7 = 1 1 1</text>
  <text x="335" y="150" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">Max XOR Sum</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The contiguous subarray <code>[3, 4]</code> yields a bitwise XOR sum of <code>3 ^ 4 = 7</code> (in binary: <code>011 ^ 100 = 111</code>), which is the maximum XOR sum achievable from any contiguous subarray in the given input.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>N</code> representing the size of the array.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the maximum XOR sum of any contiguous subarray.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>0 &le; arr[i] &le; 2^31 - 1</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct TrieNode {
    TrieNode* children[2];
    TrieNode() {
        children[0] = children[1] = nullptr;
    }
};

class Trie {
    TrieNode* root;
public:
    Trie() {
        root = new TrieNode();
    }
    
    void insert(int num) {
        TrieNode* curr = root;
        for (int i = 30; i >= 0; --i) {
            int bit = (num >> i) & 1;
            if (!curr->children[bit]) {
                curr->children[bit] = new TrieNode();
            }
            curr = curr->children[bit];
        }
    }
    
    int getMax(int num) {
        TrieNode* curr = root;
        int maxVal = 0;
        for (int i = 30; i >= 0; --i) {
            int bit = (num >> i) & 1;
            int oppBit = 1 - bit;
            if (curr->children[oppBit]) {
                maxVal |= (1 << i);
                curr = curr->children[oppBit];
            } else if (curr->children[bit]) {
                curr = curr->children[bit];
            } else {
                break;
            }
        }
        return maxVal;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<int> arr(n);
    Trie trie;
    trie.insert(0);
    
    int prefixXor = 0;
    int maxXor = 0;
    
    for (int i = 0; i < n; ++i) {
        cin >> arr[i];
        prefixXor ^= arr[i];
        trie.insert(prefixXor);
        maxXor = max(maxXor, trie.getMax(prefixXor));
    }
    
    cout << maxXor << "\\n";
    return 0;
}
`.trim();

// Solver implementation using Binary Trie
function solveMaxXorSubarray(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return 0;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return 0;
  const arr = lines[1].trim().split(/\s+/).map(Number);

  class TrieNode {
    constructor() {
      this.children = [null, null];
    }
  }

  class Trie {
    constructor() {
      this.root = new TrieNode();
    }

    insert(num) {
      let curr = this.root;
      for (let i = 30; i >= 0; i--) {
        const bit = (num >> i) & 1;
        if (!curr.children[bit]) {
          curr.children[bit] = new TrieNode();
        }
        curr = curr.children[bit];
      }
    }

    getMax(num) {
      let curr = this.root;
      let maxVal = 0;
      for (let i = 30; i >= 0; i--) {
        const bit = (num >> i) & 1;
        const oppBit = 1 - bit;
        if (curr.children[oppBit]) {
          maxVal |= (1 << i);
          curr = curr.children[oppBit];
        } else if (curr.children[bit]) {
          curr = curr.children[bit];
        } else {
          break;
        }
      }
      return maxVal;
    }
  }

  const trie = new Trie();
  trie.insert(0);

  let prefixXor = 0;
  let maxXor = 0;

  for (let i = 0; i < n; i++) {
    prefixXor ^= arr[i];
    trie.insert(prefixXor);
    maxXor = Math.max(maxXor, trie.getMax(prefixXor));
  }

  return maxXor;
}

const staticCases = [
  { input: "4\n1 2 3 4", isExample: true },
  { input: "5\n8 1 2 12 7", isExample: true }
];

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveMaxXorSubarray(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 15 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    "1\n5",
    "2\n0 0",
    "4\n8 8 8 8",
    "5\n0 1 2 3 4",
    "4\n1073741824 1073741824 1073741824 1073741824", // 2^30
    "3\n2147483647 0 2147483647", // 2^31 - 1
    "2\n2147483647 1",
    "8\n1 2 4 8 16 32 64 128", // powers of 2
    "4\n15 15 15 15",
    "6\n1 3 7 15 31 63",
    "1\n0"
  ];

  for (const ec of edgeCases) {
    const expected = solveMaxXorSubarray(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate 38 random arrays
  console.log("Generating 38 random arrays...");
  for (let i = 0; i < 38; i++) {
    let n = 5;
    if (i < 10) n = Math.floor(Math.random() * 15) + 5;   // 5-19
    else if (i < 25) n = Math.floor(Math.random() * 200) + 20; // 20-219
    else n = Math.floor(Math.random() * 1000) + 200; // 200-1199

    const arr = [];
    const maxVal = Math.random() < 0.2 ? 15 : (Math.random() < 0.5 ? 1023 : 2147483647);
    for (let j = 0; j < n; j++) {
      arr.push(Math.floor(Math.random() * maxVal));
    }
    const input = `${n}\n${arr.join(" ")}`;
    const expected = solveMaxXorSubarray(input);

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
    const expected = solveMaxXorSubarray(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-maximum-xor-subarray" },
    update: {
      title: "Maximum XOR of Two Numbers in an Array",
      url: "https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/",
      type: "WEBSITE",
      topic: "Trie",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-maximum-xor-subarray",
      title: "Maximum XOR of Two Numbers in an Array",
      url: "https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/",
      type: "WEBSITE",
      topic: "Trie",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-maximum-xor-subarray-video" },
    update: {
      title: "Striver's Maximum XOR - Trie Playlist",
      url: "https://www.youtube.com/watch?v=EIhS6nVYXu8",
      type: "VIDEO",
      topic: "Trie",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-maximum-xor-subarray-video",
      title: "Striver's Maximum XOR - Trie Playlist",
      url: "https://www.youtube.com/watch?v=EIhS6nVYXu8",
      type: "VIDEO",
      topic: "Trie",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver video resource ready.");

  // 6. Update problem in database
  console.log("Updating problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "maximum-xor-subarray" },
    data: {
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

  console.log("🎉 Successfully updated 'Maximum XOR Subarray'!");
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
