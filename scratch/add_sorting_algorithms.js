const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ==========================================
// 1. HEAP SORT
// ==========================================

const heapSortHtmlDescription = `
<h1>Heap Sort</h1>

<p>Given an array of integers <code>arr</code>, sort the array in non-decreasing order using the <strong>Heap Sort</strong> algorithm.</p>

<p>Heap Sort is a comparison-based sorting technique based on a Binary Heap data structure. It divides its input into a sorted and an unsorted region, and iteratively shrinks the unsorted region by extracting the largest element from it and inserting it into the sorted region.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Max-Heapification of <code>[4, 10, 3, 5, 1]</code>:</h3>
<svg width="320" height="180" viewBox="0 0 320 180" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <!-- Edges -->
  <line x1="160" y1="30" x2="90" y2="90" stroke="#10b981" stroke-width="1.5" />
  <line x1="160" y1="30" x2="230" y2="90" stroke="#10b981" stroke-width="1.5" />
  <line x1="90" y1="90" x2="50" y2="150" stroke="#10b981" stroke-width="1.5" />
  <line x1="90" y1="90" x2="130" y2="150" stroke="#10b981" stroke-width="1.5" />

  <!-- Nodes -->
  <!-- Node 10 -->
  <circle cx="160" cy="30" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="160" y="34" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">10</text>

  <!-- Node 5 -->
  <circle cx="90" cy="90" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="90" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

  <!-- Node 3 -->
  <circle cx="230" cy="90" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="230" y="94" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

  <!-- Node 4 -->
  <circle cx="50" cy="150" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="50" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

  <!-- Node 1 -->
  <circle cx="130" cy="150" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="130" y="154" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
</svg>
<p><strong>Explanation:</strong> 
<ul>
  <li>Convert the array to a Max-Heap: the maximum element <code>10</code> is at the root.</li>
  <li>Swap the root <code>10</code> with the last leaf element <code>1</code>. Heap size decreases by 1.</li>
  <li>Re-heapify the root, making <code>5</code> the new root.</li>
  <li>Repeat this process until the heap is empty, resulting in a sorted array: <code>1 3 4 5 10</code>.</li>
</ul>
</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> An integer <code>N</code> representing the size of the array.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the array elements.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print space-separated sorted integers representing the final array.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>-10^6 &le; arr[i] &le; 10^6</code></li>
</ul>
`.trim();

const heapSortCppSolution = `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr, int n) {
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; --i) {
        heapify(arr, n, i);
    }
    // Extract elements from heap
    for (int i = n - 1; i > 0; --i) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; ++i) {
            cin >> arr[i];
        }
        heapSort(arr, n);
        for (int i = 0; i < n; ++i) {
            cout << arr[i] << (i == n - 1 ? "" : " ");
        }
        cout << "\\n";
    }
    return 0;
}
`.trim();

// ==========================================
// 2. MERGE SORT
// ==========================================

const mergeSortHtmlDescription = `
<h1>Merge Sort</h1>

<p>Given an array of integers <code>arr</code>, sort the array in non-decreasing order using the <strong>Merge Sort</strong> algorithm.</p>

<p>Merge Sort is a classic divide-and-conquer sorting algorithm. It works by dividing the unsorted list into <code>N</code> sublists, each containing one element, and then repeatedly merging sublists to produce new sorted sublists until there is only one sublist remaining.</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Visualizations & Examples:</h3>

<h3>Divide & Conquer Workflow for <code>[4, 1, 3, 2]</code>:</h3>
<svg width="400" height="200" viewBox="0 0 400 200" style="background-color: #0f172a; border-radius: 12px; margin: 15px 0; border: 1px solid #1e293b; display: block;">
  <defs>
    <!-- Arrowhead marker -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
    </marker>
  </defs>

  <!-- Level 0: Divide -->
  <rect x="150" y="20" width="100" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="200" y="36" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[4, 1, 3, 2]</text>

  <!-- Level 1: Left & Right split -->
  <rect x="70" y="70" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="100" y="86" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">[4, 1]</text>

  <rect x="270" y="70" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
  <text x="300" y="86" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">[3, 2]</text>

  <!-- Level 2: Left & Right merged -->
  <rect x="70" y="120" width="60" height="24" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
  <text x="100" y="136" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[1, 4]</text>

  <rect x="270" y="120" width="60" height="24" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
  <text x="300" y="136" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[2, 3]</text>

  <!-- Level 3: Merged Sorted Array -->
  <rect x="150" y="160" width="100" height="24" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="2" />
  <text x="200" y="176" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">[1, 2, 3, 4]</text>

  <!-- Arrows -->
  <path d="M 180 48 L 115 66" stroke="#94a3b8" stroke-width="1" marker-end="url(#arrow)" />
  <path d="M 220 48 L 285 66" stroke="#94a3b8" stroke-width="1" marker-end="url(#arrow)" />

  <path d="M 100 98 L 100 116" stroke="#10b981" stroke-width="1" stroke-dasharray="2,1" marker-end="url(#arrow)" />
  <path d="M 300 98 L 300 116" stroke="#10b981" stroke-width="1" stroke-dasharray="2,1" marker-end="url(#arrow)" />

  <path d="M 115 148 L 180 156" stroke="#10b981" stroke-width="1" marker-end="url(#arrow)" />
  <path d="M 285 148 L 220 156" stroke="#10b981" stroke-width="1" marker-end="url(#arrow)" />
</svg>
<p><strong>Explanation:</strong>
<ul>
  <li>Divide: Split <code>[4, 1, 3, 2]</code> recursively into single element subarrays.</li>
  <li>Conquer: Merge individual singletons into sorted pairs: <code>[4]</code> &amp; <code>[1]</code> &rarr; <code>[1, 4]</code>; <code>[3]</code> &amp; <code>[2]</code> &rarr; <code>[2, 3]</code>.</li>
  <li>Combine: Merge the two sorted pairs back to yield the fully sorted array: <code>[1, 2, 3, 4]</code>.</li>
</ul>
</p>

<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />

<h3>Input Format:</h3>
<ul>
  <li><strong>Line 1:</strong> An integer <code>N</code> representing the size of the array.</li>
  <li><strong>Line 2:</strong> <code>N</code> space-separated integers representing the array elements.</li>
</ul>

<h3>Output Format:</h3>
<ul>
  <li>Print space-separated sorted integers representing the final array.</li>
</ul>

<h3>Constraints:</h3>
<ul>
  <li><code>1 &le; N &le; 10^5</code></li>
  <li><code>-10^6 &le; arr[i] &le; 10^6</code></li>
</ul>
`.trim();

const mergeSortCppSolution = `
#include <iostream>
#include <vector>

using namespace std;

void merge(vector<int>& arr, int low, int mid, int high) {
    vector<int> temp;
    int left = low;
    int right = mid + 1;
    
    while (left <= mid && right <= high) {
        if (arr[left] <= arr[right]) {
            temp.push_back(arr[left]);
            left++;
        } else {
            temp.push_back(arr[right]);
            right++;
        }
    }
    
    while (left <= mid) {
        temp.push_back(arr[left]);
        left++;
    }
    while (right <= high) {
        temp.push_back(arr[right]);
        right++;
    }
    
    for (int i = low; i <= high; ++i) {
        arr[i] = temp[i - low];
    }
}

void mergeSort(vector<int>& arr, int low, int high) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSort(arr, low, mid);
    mergeSort(arr, mid + 1, high);
    merge(arr, low, mid, high);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; ++i) {
            cin >> arr[i];
        }
        mergeSort(arr, 0, n - 1);
        for (int i = 0; i < n; ++i) {
            cout << arr[i] << (i == n - 1 ? "" : " ");
        }
        cout << "\\n";
    }
    return 0;
}
`.trim();

// Solver helper
function solveSort(input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length < 2) return "";
  const arr = lines[1].trim().split(/\s+/).map(Number);
  arr.sort((a, b) => a - b);
  return arr.join(" ");
}

const staticCases = [
  { input: "5\n4 10 3 5 1", isExample: true },
  { input: "5\n5 4 3 2 1", isExample: true },
  { input: "1\n100", isExample: true }
];

async function seedHeapSort() {
  const testSets = [];
  // Static examples
  for (const tc of staticCases) {
    testSets.push({
      input: tc.input,
      expectedOutput: solveSort(tc.input),
      isExample: tc.isExample
    });
  }

  // Edge cases (10)
  const edgeArrays = [
    "2\n1 2",
    "2\n2 1",
    "5\n2 2 2 2 2", // identical
    "6\n-1 -2 -3 -4 -5 -6", // negatives
    "5\n100 0 -100 50 -50"
  ];
  for (const ea of edgeArrays) {
    testSets.push({
      input: ea,
      expectedOutput: solveSort(ea),
      isExample: false
    });
  }

  // Random cases (42)
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 80) + 10;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 2000) - 1000);
    const input = `${n}\n${arr.join(" ")}`;
    testSets.push({
      input,
      expectedOutput: solveSort(input),
      isExample: false
    });
  }

  // Resources
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-heap-sort-video" },
    update: {
      title: "Striver's Heap Sort Explanation",
      url: "https://www.youtube.com/watch?v=UVW0N1g_k2c",
      type: "VIDEO",
      topic: "Heap",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-heap-sort-video",
      title: "Striver's Heap Sort Explanation",
      url: "https://www.youtube.com/watch?v=UVW0N1g_k2c",
      type: "VIDEO",
      topic: "Heap",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });

  await prisma.problem.upsert({
    where: { slug: "heap-sort" },
    update: {
      title: "Heap Sort",
      difficulty: "Medium",
      category: "Sorting",
      description: heapSortHtmlDescription,
      referenceSolution: heapSortCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    },
    create: {
      slug: "heap-sort",
      title: "Heap Sort",
      difficulty: "Medium",
      category: "Sorting",
      description: heapSortHtmlDescription,
      referenceSolution: heapSortCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    }
  });
  console.log("   ✅ Heap Sort ready.");
}

async function seedMergeSort() {
  const testSets = [];
  // Static examples
  for (const tc of staticCases) {
    testSets.push({
      input: tc.input,
      expectedOutput: solveSort(tc.input),
      isExample: tc.isExample
    });
  }

  // Edge cases (10)
  const edgeArrays = [
    "2\n1 2",
    "2\n2 1",
    "5\n2 2 2 2 2", // identical
    "6\n-1 -2 -3 -4 -5 -6", // negatives
    "5\n100 0 -100 50 -50"
  ];
  for (const ea of edgeArrays) {
    testSets.push({
      input: ea,
      expectedOutput: solveSort(ea),
      isExample: false
    });
  }

  // Random cases (42)
  for (let i = 0; i < 42; i++) {
    const n = Math.floor(Math.random() * 80) + 10;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 2000) - 1000);
    const input = `${n}\n${arr.join(" ")}`;
    testSets.push({
      input,
      expectedOutput: solveSort(input),
      isExample: false
    });
  }

  // Resources
  const res1 = await prisma.learningResource.upsert({
    where: { id: "striver-merge-sort-website" },
    update: {
      title: "Merge Sort Algorithm - takeUforward",
      url: "https://takeuforward.org/data-structure/merge-sort-algorithm/",
      type: "WEBSITE",
      topic: "Sorting",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: "striver-merge-sort-website",
      title: "Merge Sort Algorithm - takeUforward",
      url: "https://takeuforward.org/data-structure/merge-sort-algorithm/",
      type: "WEBSITE",
      topic: "Sorting",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });

  await prisma.problem.upsert({
    where: { slug: "merge-sort" },
    update: {
      title: "Merge Sort",
      difficulty: "Medium",
      category: "Sorting",
      description: mergeSortHtmlDescription,
      referenceSolution: mergeSortCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    },
    create: {
      slug: "merge-sort",
      title: "Merge Sort",
      difficulty: "Medium",
      category: "Sorting",
      description: mergeSortHtmlDescription,
      referenceSolution: mergeSortCppSolution,
      testSets: testSets,
      resources: { connect: [{ id: res1.id }] }
    }
  });
  console.log("   ✅ Merge Sort ready.");
}

async function main() {
  console.log("Starting sorting algorithms seeding...");
  await seedHeapSort();
  await seedMergeSort();
  console.log("🎉 Seeding complete!");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
