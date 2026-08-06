const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const htmlDescription = `
<h1>Allocate Minimum Number of Pages</h1>

<p>You are given an array <code>books</code> of integer numbers where <code>books[i]</code> represents the number of pages in the <code>i</code>-th book. There are <code>m</code> students, and the task is to allocate all the books to the students.</p>

<p>Allocate books in such a way that:</p>
<ol>
  <li>Each student gets at least one book.</li>
  <li>Each book should be allocated to a student.</li>
  <li>Book allocation should be in a contiguous manner.</li>
</ol>

<p>You need to allocate the books so that the <strong>maximum number of pages assigned to a student is minimized</strong>.</p>
<p>If the allocation of books is not possible, return <code>-1</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Optimal Book Allocation for Example 1:</h3>
<svg width="340" height="180" viewBox="0 0 340 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Book 0 (12 pages) -->
  <rect x="30" y="90" width="40" height="40" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="50" y="115" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">12</text>
  <text x="50" y="145" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="middle">Book 0</text>

  <!-- Book 1 (34 pages) -->
  <rect x="80" y="70" width="40" height="60" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="100" y="105" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">34</text>
  <text x="100" y="145" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="middle">Book 1</text>

  <!-- Book 2 (67 pages) -->
  <rect x="130" y="50" width="40" height="80" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
  <text x="150" y="95" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">67</text>
  <text x="150" y="145" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="middle">Book 2</text>

  <!-- Book 3 (90 pages) -->
  <rect x="210" y="30" width="40" height="100" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
  <text x="230" y="85" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">90</text>
  <text x="230" y="145" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="middle">Book 3</text>

  <!-- Allocation Brackets / Group Labels -->
  <!-- Student 1 Group -->
  <path d="M 30 15 L 30 10 L 170 10 L 170 15" fill="none" stroke="#3b82f6" stroke-width="1.5" />
  <text x="100" y="2" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Student 1 (12+34+67 = 113 pages)</text>

  <!-- Student 2 Group -->
  <path d="M 210 15 L 210 10 L 250 10 L 250 15" fill="none" stroke="#10b981" stroke-width="1.5" />
  <text x="230" y="2" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Student 2 (90 pages)</text>

  <!-- MiniMax Arrow pointer -->
  <text x="140" y="170" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Minimax Max Pages = 113</text>
</svg>
<p><strong>Explanation for Example 1:</strong> Books are distributed as <code>[12, 34, 67]</code> for Student 1 and <code>[90]</code> for Student 2. The maximum pages assigned to a student is <code>max(113, 90) = 113</code>. Any other distribution yields a higher maximum page value (e.g. <code>[12, 34]</code> and <code>[67, 90]</code> yields <code>157</code> pages). Thus, the minimax value is <code>113</code>.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> A single integer <code>N</code> representing the number of books.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the page counts.</li>
  <li><strong>Line 3:</strong> A single integer <code>m</code> representing the number of students.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print a single integer: the minimax maximum page assignment, or <code>-1</code> if book allocation is impossible.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>1 &le; books[i] &le; 10^4</code></li>
  <li><code>1 &le; m &le; 10^5</code></li>
</ul>
`.trim();

const cppReferenceSolution = `
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

bool isValid(const vector<int>& books, int m, long long mid) {
    int studentCount = 1;
    long long currentPages = 0;
    for (int book : books) {
        if (currentPages + book > mid) {
            studentCount++;
            currentPages = book;
            if (studentCount > m) return false;
        } else {
            currentPages += book;
        }
    }
    return true;
}

long long allocateBooks(const vector<int>& books, int m) {
    if (books.size() < (size_t)m) return -1;
    
    long long low = *max_element(books.begin(), books.end());
    long long high = accumulate(books.begin(), books.end(), 0LL);
    long long result = -1;
    
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (isValid(books, m, mid)) {
            result = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<int> books(n);
    for (int i = 0; i < n; ++i) {
        cin >> books[i];
    }
    
    int m;
    if (!(cin >> m)) return 0;
    
    cout << allocateBooks(books, m) << "\\n";
    return 0;
}
`.trim();

// Solver implementation
function solveAllocatePages(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return -1;
  const n = parseInt(lines[0].trim());
  if (n === 0 || !lines[1]) return -1;
  const books = lines[1].trim().split(/\s+/).map(Number);
  if (!lines[2]) return -1;
  const m = parseInt(lines[2].trim());

  if (books.length < m) return -1;

  let low = Math.max(...books);
  let high = books.reduce((a, b) => a + b, 0);
  let result = -1;

  function isValid(mid) {
    let studentCount = 1;
    let currentPages = 0;
    for (const book of books) {
      if (currentPages + book > mid) {
        studentCount++;
        currentPages = book;
        if (studentCount > m) return false;
      } else {
        currentPages += book;
      }
    }
    return true;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (isValid(mid)) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

const staticCases = [
  { input: "4\n12 34 67 90\n2", isExample: true },
  { input: "3\n15 17 20\n2", isExample: true },
  { input: "4\n10 20 30 40\n2", isExample: true }
];

function generateRandomBooks(n, maxPages = 5000) {
  const books = [];
  for (let i = 0; i < n; i++) {
    books.push(Math.floor(Math.random() * maxPages) + 1);
  }
  return books;
}

function booksToInput(books, m) {
  return `${books.length}\n${books.join(" ")}\n${m}`;
}

async function main() {
  const testSets = [];

  // 1. Add static examples
  console.log("Adding static cases...");
  for (const tc of staticCases) {
    const expected = solveAllocatePages(tc.input);
    testSets.push({
      input: tc.input,
      expectedOutput: String(expected),
      isExample: tc.isExample
    });
  }

  // 2. Generate 10 edge cases
  console.log("Generating edge cases...");
  const edgeCases = [
    // m > n -> -1
    booksToInput([10, 20], 3),
    // m == n -> max(books)
    booksToInput([10, 20, 30, 40], 4),
    // All identical pages
    booksToInput([100, 100, 100, 100], 2),
    // Linear decreasing
    booksToInput([500, 400, 300, 200, 100], 3),
    // One very large book
    booksToInput([1, 1, 10000, 1, 1], 2),
    // Only 1 student
    booksToInput([10, 20, 30, 40], 1),
    // Large values
    booksToInput([10000, 10000, 10000, 10000], 4),
    // Empty-like impossible case
    booksToInput([50], 2)
  ];

  for (const ec of edgeCases) {
    const expected = solveAllocatePages(ec);
    testSets.push({
      input: ec,
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

    const books = generateRandomBooks(n, 5000);
    // 10% cases are impossible
    let m = Math.floor(Math.random() * n) + 1;
    if (Math.random() < 0.1) {
      m = n + Math.floor(Math.random() * 10) + 1;
    }

    const input = booksToInput(books, m);
    const expected = solveAllocatePages(input);

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
    const expected = solveAllocatePages(tc.input);
    if (tc.expectedOutput !== String(expected)) {
      throw new Error(`Mismatch at test case ${i}! Expected: ${expected}, Got: ${tc.expectedOutput}`);
    }
  }
  console.log("✨ All test cases passed local verification!");

  // 5. Upsert Learning Resources
  console.log("Upserting learning resources...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-allocate-pages-website" },
    update: {
      title: "Allocate Minimum Number of Pages - Binary Search",
      url: "https://takeuforward.org/data-structure/allocate-books-or-book-allocation-problem/",
      type: "WEBSITE",
      topic: "Binary Search",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-allocate-pages-website",
      title: "Allocate Minimum Number of Pages - Binary Search",
      url: "https://takeuforward.org/data-structure/allocate-books-or-book-allocation-problem/",
      type: "WEBSITE",
      topic: "Binary Search",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver website resource ready.");

  const res2 = await prisma.learningResource.upsert({
    where: { id: "striver-allocate-pages-video" },
    update: {
      title: "Striver's Book Allocation Problem Video guide",
      url: "https://www.youtube.com/watch?v=gYmWHvqbky0",
      type: "VIDEO",
      topic: "Binary Search",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-allocate-pages-video",
      title: "Striver's Book Allocation Problem Video guide",
      url: "https://www.youtube.com/watch?v=gYmWHvqbky0",
      type: "VIDEO",
      topic: "Binary Search",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver video resource ready.");

  // 6. Update problem in database
  console.log("Updating problem in database...");
  const result = await prisma.problem.update({
    where: { slug: "allocate-minimum-number-of-pages" },
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

  console.log("🎉 Successfully updated 'Allocate Minimum Number of Pages'!");
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
