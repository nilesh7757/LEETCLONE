const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Alien Dictionary</h1>

<p>There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.</p>

<p>You are given a list of strings <code>words</code> from the alien language's dictionary, where the strings in <code>words</code> are <strong>sorted lexicographically</strong> according to the rules of this new language.</p>

<p>Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If there are multiple expected outputs, return <strong>any of them</strong>. If there is no valid order (meaning the sorting rules contain contradictory loops or invalid prefix patterns), return <code>"Impossible"</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Graph Structure for Example 1:</h3>
<p><strong>Input:</strong> <code>words = ["wrt","wrf","er","ett","rftt"]</code>, <code>k = 5</code></p>
<svg width="550" height="150" viewBox="0 0 550 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
    </marker>
  </defs>

  <!-- Edges representing rules -->
  <!-- w -> e -->
  <line x1="68" y1="75" x2="132" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="100" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">w &lt; e (from "wrf","er")</text>

  <!-- e -> r -->
  <line x1="168" y1="75" x2="232" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="200" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">e &lt; r (from "ett","rftt")</text>

  <!-- r -> t -->
  <line x1="268" y1="75" x2="332" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="305" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">r &lt; t (from "er","ett")</text>

  <!-- t -> f -->
  <line x1="368" y1="75" x2="432" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="405" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">t &lt; f (from "wrt","wrf")</text>

  <!-- Nodes -->
  <circle cx="50" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="50" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">w</text>

  <circle cx="150" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="150" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">e</text>

  <circle cx="250" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="250" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">r</text>

  <circle cx="350" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="350" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">t</text>

  <circle cx="450" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="450" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">f</text>
</svg>
<p><strong>Explanation for Example 1:</strong> Comparing adjacent words yields:
<ul>
  <li><code>"wrt"</code> & <code>"wrf"</code> &rarr; <code>t &lt; f</code></li>
  <li><code>"wrf"</code> & <code>"er"</code> &rarr; <code>w &lt; e</code></li>
  <li><code>"er"</code> & <code>"ett"</code> &rarr; <code>r &lt; t</code></li>
  <li><code>"ett"</code> & <code>"rftt"</code> &rarr; <code>e &lt; r</code></li>
</ul>
This builds the order <code>w &rarr; e &rarr; r &rarr; t &rarr; f</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Graph Structure for Example 2:</h3>
<p><strong>Input:</strong> <code>words = ["caa","aaa","aab"]</code>, <code>k = 3</code></p>
<svg width="400" height="150" viewBox="0 0 400 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
    </marker>
  </defs>

  <!-- c -> a -->
  <line x1="68" y1="75" x2="132" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="100" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">c &lt; a (from "caa","aaa")</text>

  <!-- a -> b -->
  <line x1="168" y1="75" x2="232" y2="75" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="200" y="60" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">a &lt; b (from "aaa","aab")</text>

  <!-- Nodes -->
  <circle cx="50" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="50" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">c</text>

  <circle cx="150" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="150" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">a</text>

  <circle cx="250" cy="75" r="18" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
  <text x="250" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">b</text>
</svg>
<p><strong>Explanation for Example 2:</strong> Comparing adjacent words yields:
<ul>
  <li><code>"caa"</code> & <code>"aaa"</code> &rarr; <code>c &lt; a</code></li>
  <li><code>"aaa"</code> & <code>"aab"</code> &rarr; <code>a &lt; b</code></li>
</ul>
This builds the order <code>c &rarr; a &rarr; b</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Cycle Contradiction (Impossible Case):</h3>
<p><strong>Input:</strong> <code>words = ["z","x","z"]</code>, <code>k = 2</code></p>
<svg width="400" height="150" viewBox="0 0 400 150" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
    </marker>
  </defs>

  <path d="M 68 65 Q 135 25 202 65" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-red)" />
  <text x="135" y="35" font-size="10" font-weight="bold" fill="#fca5a5" text-anchor="middle">z &lt; x</text>

  <path d="M 202 85 Q 135 125 68 85" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-red)" />
  <text x="135" y="125" font-size="10" font-weight="bold" fill="#fca5a5" text-anchor="middle">x &lt; z</text>

  <circle cx="50" cy="75" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
  <text x="50" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">z</text>

  <circle cx="220" cy="75" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
  <text x="220" y="80" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">x</text>

  <text x="325" y="80" font-size="12" font-weight="bold" fill="#ef4444" text-anchor="middle">Cycle Detected!</text>
</svg>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> Two space-separated integers: <code>N</code> (number of words in the dictionary) and <code>K</code> (the size of the alien alphabet).</li>
  <li><strong>Next <code>N</code> lines:</strong> The sorted alien words, one per line.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print the sequence of <code>K</code> alien characters representing the alphabetical order (no spaces).</li>
  <li>If no valid order exists (due to a cycle or an invalid prefix like <code>"abc"</code> followed by <code>"ab"</code>), print <code>Impossible</code>.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 100</code></li>
  <li><code>1 &le; K &le; 26</code></li>
  <li><code>1 &le; words[i].length &le; 100</code></li>
  <li>All characters in <code>words[i]</code> are lowercase English letters.</li>
</ul>
`.trim();

// Solver implementation (dynamically extracts alphabet nodes from words)
function solveAlien(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length < 2) return "Impossible";
  const firstLine = lines[0].trim().split(/\s+/);
  const n = parseInt(firstLine[0]);
  const k = parseInt(firstLine[1]);
  const words = [];
  for (let i = 0; i < n; i++) {
    words.push(lines[1 + i] || "");
  }

  const present = new Set();
  for (const word of words) {
    for (const char of word) {
      present.add(char);
    }
  }

  const adj = new Map();
  const inDegree = new Map();

  for (const char of present) {
    adj.set(char, new Set());
    inDegree.set(char, 0);
  }

  let possible = true;
  for (let i = 0; i < n - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];

    if (w1.startsWith(w2) && w1.length > w2.length) {
      possible = false;
      break;
    }

    const len = Math.min(w1.length, w2.length);
    for (let j = 0; j < len; j++) {
      if (w1[j] !== w2[j]) {
        const u = w1[j];
        const v = w2[j];
        if (present.has(u) && present.has(v)) {
          if (!adj.get(u).has(v)) {
            adj.get(u).add(v);
            inDegree.set(v, inDegree.get(v) + 1);
          }
        }
        break;
      }
    }
  }

  if (!possible) {
    return "Impossible";
  }

  const q = [];
  for (const char of present) {
    if (inDegree.get(char) === 0) {
      q.push(char);
    }
  }

  let ans = "";
  while (q.length > 0) {
    q.sort();
    const u = q.shift();
    ans += u;

    for (const v of adj.get(u)) {
      inDegree.set(v, inDegree.get(v) - 1);
      if (inDegree.get(v) === 0) {
        q.push(v);
      }
    }
  }

  if (ans.length < present.size) {
    return "Impossible";
  }
  return ans;
}

// Custom checker code wrapped inside a function to allow returns
const customCheckerCode = `
function validate() {
  try {
    const lines = input.trim().split(/\\s+/);
    if (lines.length < 2) return false;
    
    const n = parseInt(lines[0]);
    const k = parseInt(lines[1]);
    
    const words = [];
    for (let i = 0; i < n; i++) {
      words.push(lines[2 + i] || "");
    }
    
    const charsPresent = new Set();
    for (const word of words) {
      for (const char of word) {
        charsPresent.add(char);
      }
    }
    
    const adj = new Map();
    const inDegree = new Map();
    
    for (const char of charsPresent) {
      adj.set(char, new Set());
      inDegree.set(char, 0);
    }
    
    let hasInvalidPrefix = false;
    for (let i = 0; i < n - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      
      if (w1.startsWith(w2) && w1.length > w2.length) {
        hasInvalidPrefix = true;
        break;
      }
      
      const len = Math.min(w1.length, w2.length);
      for (let j = 0; j < len; j++) {
        if (w1[j] !== w2[j]) {
          const u = w1[j];
          const v = w2[j];
          if (charsPresent.has(u) && charsPresent.has(v)) {
            if (!adj.get(u).has(v)) {
              adj.get(u).add(v);
              inDegree.set(v, inDegree.get(v) + 1);
            }
          }
          break;
        }
      }
    }
    
    const q = [];
    for (const [char, deg] of inDegree.entries()) {
      if (deg === 0) q.push(char);
    }
    
    let count = 0;
    while (q.length > 0) {
      const curr = q.shift();
      count++;
      for (const neighbor of adj.get(curr)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          q.push(neighbor);
        }
      }
    }
    
    const isPossible = !hasInvalidPrefix && (count === charsPresent.size);
    const actualClean = actualOutput.replace(/\\s+/g, "");
    
    if (!isPossible) {
      return (actualClean === "" || actualClean === "Impossible" || actualClean === "[]" || actualClean === "-1" || actualClean.toLowerCase().includes("invalid") || actualClean.toLowerCase().includes("impossible"));
    }
    
    if (actualClean.length !== charsPresent.size) return false;
    
    const userChars = new Set(actualClean.split(""));
    if (userChars.size !== charsPresent.size) return false;
    for (const char of charsPresent) {
      if (!userChars.has(char)) return false;
    }
    
    const pos = new Map();
    actualClean.split("").forEach((char, index) => {
      pos.set(char, index);
    });
    
    for (const [u, neighbors] of adj.entries()) {
      for (const v of neighbors) {
        if (pos.get(u) >= pos.get(v)) {
          return false;
        }
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}
result = validate();
`.trim();

// Local test case validator to verify correctness
function validateTestCase(input, expectedOutput, actualOutput) {
  try {
    const lines = input.trim().split(/\s+/);
    if (lines.length < 2) return false;
    
    const n = parseInt(lines[0]);
    const k = parseInt(lines[1]);
    
    const words = [];
    for (let i = 0; i < n; i++) {
      words.push(lines[2 + i] || "");
    }
    
    const charsPresent = new Set();
    for (const word of words) {
      for (const char of word) {
        charsPresent.add(char);
      }
    }
    
    const adj = new Map();
    const inDegree = new Map();
    
    for (const char of charsPresent) {
      adj.set(char, new Set());
      inDegree.set(char, 0);
    }
    
    let hasInvalidPrefix = false;
    for (let i = 0; i < n - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      
      if (w1.startsWith(w2) && w1.length > w2.length) {
        hasInvalidPrefix = true;
        break;
      }
      
      const len = Math.min(w1.length, w2.length);
      for (let j = 0; j < len; j++) {
        if (w1[j] !== w2[j]) {
          const u = w1[j];
          const v = w2[j];
          if (charsPresent.has(u) && charsPresent.has(v)) {
            if (!adj.get(u).has(v)) {
              adj.get(u).add(v);
              inDegree.set(v, inDegree.get(v) + 1);
            }
          }
          break;
        }
      }
    }
    
    const q = [];
    for (const [char, deg] of inDegree.entries()) {
      if (deg === 0) q.push(char);
    }
    
    let count = 0;
    while (q.length > 0) {
      const curr = q.shift();
      count++;
      for (const neighbor of adj.get(curr)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          q.push(neighbor);
        }
      }
    }
    
    const isPossible = !hasInvalidPrefix && (count === charsPresent.size);
    const actualClean = actualOutput.replace(/\s+/g, "");
    
    if (!isPossible) {
      return actualClean === "" || actualClean === "Impossible" || actualClean === "[]" || actualClean === "-1" || actualClean.toLowerCase().includes("invalid") || actualClean.toLowerCase().includes("impossible");
    }
    
    if (actualClean.length !== charsPresent.size) return false;
    
    const userChars = new Set(actualClean.split(""));
    if (userChars.size !== charsPresent.size) return false;
    for (const char of charsPresent) {
      if (!userChars.has(char)) return false;
    }
    
    const pos = new Map();
    actualClean.split("").forEach((char, index) => {
      pos.set(char, index);
    });
    
    for (const [u, neighbors] of adj.entries()) {
      for (const v of neighbors) {
        if (pos.get(u) >= pos.get(v)) {
          return false;
        }
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// Generator helpers
function generateValidTestCase(n, k, wordLenMin = 1, wordLenMax = 8) {
  const alphabet = Array.from({ length: k }, (_, i) => String.fromCharCode(97 + i));
  const customOrder = [...alphabet];
  for (let i = customOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [customOrder[i], customOrder[j]] = [customOrder[j], customOrder[i]];
  }
  
  const charRank = new Map();
  customOrder.forEach((char, index) => charRank.set(char, index));
  
  const compareWords = (w1, w2) => {
    const len = Math.min(w1.length, w2.length);
    for (let i = 0; i < len; i++) {
      const r1 = charRank.get(w1[i]);
      const r2 = charRank.get(w2[i]);
      if (r1 !== r2) return r1 - r2;
    }
    return w1.length - w2.length;
  };

  const words = [];
  for (let i = 0; i < n; i++) {
    const len = Math.floor(Math.random() * (wordLenMax - wordLenMin + 1)) + wordLenMin;
    let word = "";
    for (let j = 0; j < len; j++) {
      const randChar = alphabet[Math.floor(Math.random() * k)];
      word += randChar;
    }
    words.push(word);
  }

  words.sort(compareWords);

  const uniqueWords = [];
  for (const w of words) {
    if (uniqueWords.length === 0 || uniqueWords[uniqueWords.length - 1] !== w) {
      uniqueWords.push(w);
    }
  }

  if (uniqueWords.length < 2) {
    return generateValidTestCase(n, k, wordLenMin, wordLenMax);
  }

  return `${uniqueWords.length} ${k}\n${uniqueWords.join('\n')}`;
}

function generateImpossibleTestCase(k) {
  const type = Math.random() < 0.5 ? 1 : 2;
  if (type === 1) {
    const word1 = Array.from({ length: 4 }, () => String.fromCharCode(97 + Math.floor(Math.random() * k))).join('');
    const word2 = word1.slice(0, 2);
    return `2 ${k}\n${word1}\n${word2}`;
  } else {
    const char1 = String.fromCharCode(97);
    const char2 = String.fromCharCode(97 + Math.min(1, k - 1));
    return `3 ${k}\n${char1}${char2}\n${char2}${char1}\n${char1}${char2}`;
  }
}

const staticCases = [
  { input: "5 5\nwrt\nwrf\ner\nett\nrftt", isExample: true },
  { input: "3 3\ncaa\naaa\naab", isExample: true },
  { input: "2 2\nz\nx", isExample: true },
  { input: "2 2\nabc\nab", isExample: false },
  { input: "3 3\nab\nba\nab", isExample: false },
  { input: "3 2\nz\nx\nz", isExample: false }
];

async function main() {
  const testSets = [];

  // 1. Add static cases
  console.log("Adding static example/hidden cases...");
  for (const tc of staticCases) {
    const expectedOutput = solveAlien(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: expectedOutput,
      isExample: tc.isExample
    });
  }

  // 2. Generate 35 random valid DAG test cases
  console.log("Generating 35 random valid DAG test cases...");
  for (let i = 0; i < 35; i++) {
    let k = 1;
    const randVal = Math.random();
    if (randVal < 0.1) k = 1;
    else if (randVal < 0.4) k = Math.floor(Math.random() * 5) + 2; // 2-6
    else if (randVal < 0.7) k = Math.floor(Math.random() * 10) + 7; // 7-16
    else k = Math.floor(Math.random() * 10) + 17; // 17-26
    
    const n = Math.floor(Math.random() * 40) + 5; // 5-45
    
    const input = generateValidTestCase(n, k);
    const expectedOutput = solveAlien(input);
    
    testSets.push({
      input: input,
      expectedOutput: expectedOutput,
      isExample: false
    });
  }

  // 3. Generate 15 random impossible cases
  console.log("Generating 15 random impossible cycle/prefix test cases...");
  for (let i = 0; i < 15; i++) {
    const k = Math.floor(Math.random() * 8) + 2; // 2-9
    const input = generateImpossibleTestCase(k);
    const expectedOutput = solveAlien(input);
    
    testSets.push({
      input: input,
      expectedOutput: expectedOutput,
      isExample: false
    });
  }

  console.log(`Generated ${testSets.length} total test cases.`);

  // 4. Validate all
  console.log("Running solver and verifying all test cases against custom validation logic...");
  let allPassed = true;
  for (let i = 0; i < testSets.length; i++) {
    const tc = testSets[i];
    const isValid = validateTestCase(tc.input, tc.expectedOutput, tc.expectedOutput);
    if (!isValid) {
      console.error(`❌ Validation failed for test case ${i}:`);
      console.error(`Input:\n${tc.input}`);
      console.error(`Expected Output: ${tc.expectedOutput}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    throw new Error("Validation failed for some test cases. Aborting database write.");
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-alien-dictionary" },
    update: {
      title: "Striver's Alien Dictionary - Topological Sort",
      url: "https://takeuforward.org/data-structure/alien-dictionary-topological-sort-g-26/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-alien-dictionary",
      title: "Striver's Alien Dictionary - Topological Sort",
      url: "https://takeuforward.org/data-structure/alien-dictionary-topological-sort-g-26/",
      type: "WEBSITE",
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "neetcode-alien-dictionary" },
    update: {
      title: "NeetCode's Alien Dictionary - LeetCode 269",
      url: "https://www.youtube.com/watch?v=EP7g58XgL10",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    },
    create: {
      id: "neetcode-alien-dictionary",
      title: "NeetCode's Alien Dictionary - LeetCode 269",
      url: "https://www.youtube.com/watch?v=EP7g58XgL10",
      type: "VIDEO",
      topic: "Graph",
      creator: "NeetCode",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  // 6. Update problem in database
  console.log("Updating 'Alien Dictionary' problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "alien-dictionary" },
    data: {
      description: htmlDescription,
      testSets: testSets,
      customChecker: customCheckerCode,
      resources: {
        connect: [
          { id: res1.id },
          { id: res2.id }
        ]
      }
    }
  });

  console.log("🎉 Successfully updated 'Alien Dictionary'!");
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
