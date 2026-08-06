const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Longest Substring Without Repeating Characters</h1>

<p>Sam works on the security team at a large tech company. Last week, an internal audit flagged thousands of employee passwords as "weak," and Sam's manager wants a tool to prove exactly why.</p>

<p>The audit team's working theory: a password is only as strong as its longest stretch of characters where nothing repeats. Once a character shows up twice within a stretch, an attacker's pattern-matching script gets a foothold — so the longer an unbroken, repeat-free run of characters is, the harder that section is to crack.</p>

<p>Sam has been handed a single leaked password string <code>s</code> (which could contain letters, digits, symbols, even spaces) and needs to report back one number: across the entire string, what is the length of the single <strong>longest contiguous stretch</strong> in which no character appears more than once?</p>

<p>Sam's manager doesn't want the stretch itself, or where it starts — just how long the strongest unbroken run is, so the audit report can score the password.</p>

<p>Write a program to compute this for Sam.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Sliding Window Example for <code>s = "abcabcbb"</code>:</h3>
<svg width="500" height="150" viewBox="0 0 500 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- Sliding Window Highlight (abc) -->
  <rect x="35" y="45" width="140" height="50" rx="8" fill="#047857" fill-opacity="0.2" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,2" />
  
  <!-- Characters -->
  <!-- Cell 0: 'a' -->
  <rect x="40" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="60" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">a</text>
  
  <!-- Cell 1: 'b' -->
  <rect x="90" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="110" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">b</text>
  
  <!-- Cell 2: 'c' -->
  <rect x="140" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="160" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">c</text>

  <!-- Cell 3: 'a' (Duplicate) -->
  <rect x="190" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
  <text x="210" y="75" font-size="16" font-weight="bold" fill="#ef4444" text-anchor="middle">a</text>
  
  <!-- Cell 4: 'b' -->
  <rect x="240" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="260" y="75" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">b</text>
  
  <!-- Cell 5: 'c' -->
  <rect x="290" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="310" y="75" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">c</text>
  
  <!-- Cell 6: 'b' -->
  <rect x="340" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="360" y="75" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">b</text>
  
  <!-- Cell 7: 'b' -->
  <rect x="390" y="50" width="40" height="40" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <text x="410" y="75" font-size="16" font-weight="bold" fill="#94a3b8" text-anchor="middle">b</text>
  
  <!-- Pointers -->
  <!-- Left Pointer -->
  <text x="60" y="115" font-size="12" font-weight="bold" fill="#10b981" text-anchor="middle">L (Start)</text>
  <path d="M 60 102 L 60 93" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrow)" />
  
  <!-- Right Pointer -->
  <text x="160" y="115" font-size="12" font-weight="bold" fill="#10b981" text-anchor="middle">R (End)</text>
  <path d="M 160 102 L 160 93" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrow)" />
  
  <!-- Alert for duplicate -->
  <path d="M 210 115 L 210 95" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" />
  <text x="210" y="130" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">Duplicate 'a' breaks streak!</text>
</svg>
<p><strong>Explanation for Example 1:</strong> The longest contiguous repeat-free stretch is <code>"abc"</code>, which has a length of <code>3</code>. When the pointer shifts to the next character (the second <code>"a"</code>), it introduces a duplicate within the active window, forcing the start pointer to advance.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li>A single line containing the string <code>s</code>, consisting of printable ASCII characters.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer representing the length of the longest contiguous stretch of <code>s</code> in which no character repeats.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; s.length &le; 10^5</code></li>
  <li><code>s</code> consists of printable ASCII characters (which can include letters, numbers, punctuation symbols, and spaces).</li>
</ul>
`.trim();

// Solver implementation
function solveLongestSubstring(s) {
  const charSet = new Set();
  let l = 0;
  let res = 0;
  for (let r = 0; r < s.length; r++) {
    while (charSet.has(s[r])) {
      charSet.delete(s[l]);
      l++;
    }
    charSet.add(s[r]);
    res = Math.max(res, r - l + 1);
  }
  return res;
}

const staticCases = [
  { input: "abcabcbb", isExample: true },
  { input: "bbbbb", isExample: true },
  { input: "pwwkew", isExample: true }
];

// Random string helper
function generateRandomString(length, pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ") {
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
    const expected = solveLongestSubstring(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Add edge cases
  console.log("Adding edge cases...");
  // Length 1 cases
  const edgeCases = [
    "a",
    " ",
    "!",
    "     ",
    "abcdefghijklmnopqrstuvwxyz",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`{}|[]\\:\";'<>?,./",
    "abababababababababab",
    "123123123123123123",
    "a".repeat(100),
    "a b c d e f g"
  ];

  for (const ec of edgeCases) {
    const expected = solveLongestSubstring(ec);
    testSets.push({
      input: ec,
      expectedOutput: String(expected),
      isExample: false
    });
  }

  // 3. Generate random strings of varying lengths
  console.log("Generating random test cases...");
  const pools = [
    "abcdefghijklmnopqrstuvwxyz",
    "abcdefg", // smaller pool to enforce repeats
    "0123456789",
    "abc ", // spaces included
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*() "
  ];

  for (let i = 0; i < 42; i++) {
    const pool = pools[i % pools.length];
    let len = 5;
    if (i < 10) len = Math.floor(Math.random() * 15) + 5; // 5-19
    else if (i < 30) len = Math.floor(Math.random() * 200) + 50; // 50-249
    else len = Math.floor(Math.random() * 2000) + 1000; // 1000-2999
    
    const str = generateRandomString(len, pool);
    const expected = solveLongestSubstring(str);
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
    const expected = solveLongestSubstring(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Input: "${tc.input}", Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-longest-substring" },
    update: {
      title: "Striver's Longest Substring Without Repeating Characters",
      url: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/",
      type: "WEBSITE",
      topic: "String",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-longest-substring",
      title: "Striver's Longest Substring Without Repeating Characters",
      url: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/",
      type: "WEBSITE",
      topic: "String",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-longest-substring" },
    update: {
      title: "NeetCode's Longest Substring Without Repeating Characters",
      url: "https://www.youtube.com/watch?v=wiGpG14tDsU",
      type: "VIDEO",
      topic: "String",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-longest-substring",
      title: "NeetCode's Longest Substring Without Repeating Characters",
      url: "https://www.youtube.com/watch?v=wiGpG14tDsU",
      type: "VIDEO",
      topic: "String",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Update problem in database and clean legacy resources
  console.log("Updating problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "longest-substring-without-repeating-characters" },
    data: {
      description: htmlDescription,
      testSets: testSets,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully updated 'Longest Substring Without Repeating Characters'!");
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
