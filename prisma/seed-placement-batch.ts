import { PrismaClient, ProblemType } from "@prisma/client";

const prisma = new PrismaClient();

const problemsData = [
  {
    title: "Count Inversions in an Array",
    slug: "count-inversions-in-an-array",
    difficulty: "Medium",
    category: "Arrays",
    pattern: "Divide and Conquer / Merge Sort",
    description: `
<h1>Count Inversions in an Array</h1>
<p>Given an array of integers <code>arr</code>, find the <strong>inversion count</strong> of the array.</p>
<p>Two elements <code>arr[i]</code> and <code>arr[j]</code> form an inversion if <code>arr[i] > arr[j]</code> and <code>i < j</code>. Inversion count indicates how far the array is from being sorted. If the array is already sorted, the inversion count is 0; if it is sorted in reverse order, the inversion count is maximum.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the size of the array.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the total number of inversions.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>1 &le; arr[i] &le; 10<sup>6</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "5\n2 4 1 3 5", expectedOutput: "3", isExample: true },
      { input: "5\n5 4 3 2 1", expectedOutput: "10", isExample: true },
      { input: "1\n10", expectedOutput: "0", isExample: false },
      { input: "4\n1 2 3 4", expectedOutput: "0", isExample: false },
      { input: "6\n8 4 2 1 3 5", expectedOutput: "9", isExample: false },
      { input: "8\n10 9 8 7 6 5 4 3", expectedOutput: "28", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>

using namespace std;

long long mergeAndCount(vector<int>& arr, vector<int>& temp, int left, int mid, int right) {
    int i = left;
    int j = mid + 1;
    int k = left;
    long long inv_count = 0;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
            inv_count += (mid - i + 1);
        }
    }

    while (i <= mid) {
        temp[k++] = arr[i++];
    }
    while (j <= right) {
        temp[k++] = arr[j++];
    }

    for (i = left; i <= right; i++) {
        arr[i] = temp[i];
    }

    return inv_count;
}

long long mergeSortAndCount(vector<int>& arr, vector<int>& temp, int left, int right) {
    long long inv_count = 0;
    if (left < right) {
        int mid = left + (right - left) / 2;
        inv_count += mergeSortAndCount(arr, temp, left, mid);
        inv_count += mergeSortAndCount(arr, temp, mid + 1, right);
        inv_count += mergeAndCount(arr, temp, left, mid, right);
    }
    return inv_count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            cin >> arr[i];
        }
        vector<int> temp(n);
        cout << mergeSortAndCount(arr, temp, 0, n - 1) << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `Use a modified Merge Sort algorithm to count inversions during the merge step. When merging two sorted subarrays, if <code>arr[i] > arr[j]</code>, then all elements from <code>i</code> to <code>mid</code> in the left subarray are also greater than <code>arr[j]</code> and form inversions. This allows us to count inversions in O(N log N) time and O(N) auxiliary space.`,
    hints: [
      "A brute force O(n^2) approach checks all pairs. How can we use sorting to optimize this?",
      "Recall Merge Sort. During the merge step, when an element from the right subarray is smaller than one in the left, what does it tell you about the other left elements?",
      "Implement merge sort. When arr[i] > arr[j] in merge(), add (mid - i + 1) to the count."
    ],
    companies: ["Amazon", "Google", "TCS", "Samsung R&D"]
  },
  {
    title: "Reverse Pairs",
    slug: "reverse-pairs",
    difficulty: "Hard",
    category: "Arrays",
    pattern: "Divide and Conquer / Merge Sort",
    description: `
<h1>Reverse Pairs</h1>
<p>Given an integer array <code>nums</code>, return the number of <strong>reverse pairs</strong> in the array.</p>
<p>A reverse pair is a pair <code>(i, j)</code> where <code>0 &le; i < j < nums.length</code> and <code>nums[i] > 2 * nums[j]</code>.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the size of the array.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the number of reverse pairs.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 5 * 10<sup>4</sup></code></li>
  <li><code>-2<sup>31</sup> &le; nums[i] &le; 2<sup>31</sup> - 1</code></li>
</ul>
    `,
    testSets: [
      { input: "5\n1 3 2 3 1", expectedOutput: "2", isExample: true },
      { input: "5\n2 4 3 5 1", expectedOutput: "3", isExample: true },
      { input: "1\n5", expectedOutput: "0", isExample: false },
      { input: "6\n4 2 1 6 3 1", expectedOutput: "6", isExample: false },
      { input: "5\n-5 -5 -5 -5 -5", expectedOutput: "0", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>

using namespace std;

int mergeAndCount(vector<int>& arr, int left, int mid, int right) {
    int count = 0;
    int j = mid + 1;
    for (int i = left; i <= mid; i++) {
        while (j <= right && (long long)arr[i] > 2LL * arr[j]) {
            j++;
        }
        count += (j - (mid + 1));
    }

    vector<int> temp;
    int i = left;
    j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i++]);
        } else {
            temp.push_back(arr[j++]);
        }
    }
    while (i <= mid) {
        temp.push_back(arr[i++]);
    }
    while (j <= right) {
        temp.push_back(arr[j++]);
    }

    for (int k = left; k <= right; k++) {
        arr[k] = temp[k - left];
    }
    return count;
}

int mergeSortAndCount(vector<int>& arr, int left, int right) {
    if (left >= right) return 0;
    int mid = left + (right - left) / 2;
    int count = mergeSortAndCount(arr, left, mid);
    count += mergeSortAndCount(arr, mid + 1, right);
    count += mergeAndCount(arr, left, mid, right);
    return count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            cin >> arr[i];
        }
        cout << mergeSortAndCount(arr, 0, n - 1) << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `This is a variation of Count Inversions. We use a modified Merge Sort. In the merge step, before actually merging and sorting the subarrays, we use two pointers to count the reverse pairs: for each element in the left subarray, we find how many elements in the right subarray satisfy the condition <code>nums[i] > 2 * nums[j]</code>. Since both subarrays are sorted, we can do this in linear time O(N) per merge level, leading to an overall O(N log N) time complexity.`,
    hints: [
      "We cannot check the condition directly inside the standard merge logic because the comparison involves a multiplier (2 * nums[j]).",
      "Divide the array into two halves, recursively solve for them, and then count cross-pairs where i is in the left half and j is in the right half.",
      "Before merging, use two pointers to count elements in the right half that are less than half of the current element in the left half."
    ],
    companies: ["Google", "Amazon"]
  },
  {
    title: "Kth Element of Two Sorted Arrays",
    slug: "kth-element-of-two-sorted-arrays",
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Binary search on partition index",
    description: `
<h1>Kth Element of Two Sorted Arrays</h1>
<p>Given two sorted arrays <code>arr1</code> and <code>arr2</code> of sizes <code>n</code> and <code>m</code> respectively, and an element <code>k</code>. Find the element that would be at the <code>k</code>-th position (1-indexed) in the combined sorted array.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains three space-separated integers: <code>n</code>, <code>m</code>, and <code>k</code>.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the first sorted array.</li>
  <li>The third line contains <code>m</code> space-separated integers representing the second sorted array.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print the <code>k</code>-th element in the merged sorted array.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n, m &le; 10<sup>5</sup></code></li>
  <li><code>1 &le; arr1[i], arr2[i] &le; 10<sup>6</sup></code></li>
  <li><code>1 &le; k &le; n + m</code></li>
</ul>
    `,
    testSets: [
      { input: "5 4 5\n2 3 6 7 9\n1 4 8 10", expectedOutput: "6", isExample: true },
      { input: "4 3 7\n100 112 256 349\n72 86 113", expectedOutput: "349", isExample: true },
      { input: "1 1 1\n3\n2", expectedOutput: "2", isExample: false },
      { input: "2 2 3\n1 5\n2 3", expectedOutput: "3", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int findKthElement(vector<int>& arr1, vector<int>& arr2, int k) {
    int n = arr1.size();
    int m = arr2.size();
    if (n > m) return findKthElement(arr2, arr1, k);

    int low = max(0, k - m);
    int high = min(k, n);

    while (low <= high) {
        int cut1 = (low + high) >> 1;
        int cut2 = k - cut1;

        int l1 = (cut1 == 0) ? INT_MIN : arr1[cut1 - 1];
        int l2 = (cut2 == 0) ? INT_MIN : arr2[cut2 - 1];
        int r1 = (cut1 == n) ? INT_MAX : arr1[cut1];
        int r2 = (cut2 == m) ? INT_MAX : arr2[cut2];

        if (l1 <= r2 && l2 <= r1) {
            return max(l1, l2);
        } else if (l1 > r2) {
            high = cut1 - 1;
        } else {
            low = cut1 + 1;
        }
    }
    return -1;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m, k;
    if (cin >> n >> m >> k) {
        vector<int> arr1(n), arr2(m);
        for (int i = 0; i < n; i++) cin >> arr1[i];
        for (int i = 0; i < m; i++) cin >> arr2[i];
        cout << findKthElement(arr1, arr2, k) << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `Instead of merging both arrays in O(N+M) time, we can binary search on the partition index of the smaller array. We choose <code>x</code> elements from the first array and <code>k-x</code> from the second. If the partition is valid (meaning the maximum left elements are smaller than the minimum right elements), the K-th element is <code>max(L1, L2)</code>. Otherwise, we adjust the binary search boundaries. This achieves a time complexity of O(log(min(N, M))).`,
    hints: [
      "Can we solve this without actually merging the two arrays? Think about binary search.",
      "If we partition the first array at index x, then the second array must be partitioned at k - x so that we have exactly k elements on the left side.",
      "Binary search on the size of elements we pick from the smaller array. Ensure that L1 <= R2 and L2 <= R1."
    ],
    companies: ["Google", "Amazon", "MAQ Software"]
  },
  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "Hard",
    category: "Binary Search",
    pattern: "Binary search on partition index",
    description: `
<h1>Median of Two Sorted Arrays</h1>
<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>n</code> and <code>m</code> respectively, return the <strong>median</strong> of the two sorted arrays.</p>
<p>The overall run time complexity should be <code>O(log(m+n))</code>.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains two space-separated integers: <code>n</code> and <code>m</code>.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the first sorted array.</li>
  <li>The third line contains <code>m</code> space-separated integers representing the second sorted array.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print the median as a float formatted to 5 decimal places (e.g. 2.00000 or 2.50000).</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>0 &le; n, m &le; 10<sup>5</sup></code></li>
  <li><code>n + m &ge; 1</code></li>
  <li><code>-10<sup>6</sup> &le; nums1[i], nums2[i] &le; 10<sup>6</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "2 1\n1 3\n2", expectedOutput: "2.00000", isExample: true },
      { input: "2 2\n1 3\n2 4", expectedOutput: "2.50000", isExample: true },
      { input: "0 2\n\n1 2", expectedOutput: "1.50000", isExample: false },
      { input: "1 0\n5\n", expectedOutput: "5.00000", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    int n1 = nums1.size();
    int n2 = nums2.size();
    if (n1 > n2) return findMedianSortedArrays(nums2, nums1);

    int low = 0, high = n1;
    int left = (n1 + n2 + 1) / 2;

    while (low <= high) {
        int mid1 = (low + high) >> 1;
        int mid2 = left - mid1;

        int l1 = (mid1 == 0) ? INT_MIN : nums1[mid1 - 1];
        int l2 = (mid2 == 0) ? INT_MIN : nums2[mid2 - 1];
        int r1 = (mid1 == n1) ? INT_MAX : nums1[mid1];
        int r2 = (mid2 == n2) ? INT_MAX : nums2[mid2];

        if (l1 <= r2 && l2 <= r1) {
            if ((n1 + n2) % 2 == 1) return max(l1, l2);
            return (max(l1, l2) + min(r1, r2)) / 2.0;
        } else if (l1 > r2) {
            high = mid1 - 1;
        } else {
            low = mid1 + 1;
        }
    }
    return 0.0;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    if (cin >> n >> m) {
        vector<int> nums1(n), nums2(m);
        for (int i = 0; i < n; i++) cin >> nums1[i];
        for (int i = 0; i < m; i++) cin >> nums2[i];
        double median = findMedianSortedArrays(nums1, nums2);
        cout << fixed << setprecision(5) << median << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We binary search for the correct partition point in the smaller array such that the elements on the left side of the partition are all smaller than or equal to the elements on the right side. This splits the search space in half each time, leading to O(log(min(N, M))) complexity.`,
    hints: [
      "Let's assume nums1 is the shorter array. If we make a partition in nums1, the partition in nums2 is determined automatically to keep the left side sizes equal.",
      "Check the partition condition: is the last element on the left of nums1 <= the first element on the right of nums2? And vice versa?",
      "Keep binary searching on nums1. If L1 > R2, move left; if L2 > R1, move right."
    ],
    companies: ["Google", "Amazon", "Goldman Sachs"]
  },
  {
    title: "Maximize Minimum Distance",
    slug: "maximize-minimum-distance",
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Binary search on answer",
    description: `
<h1>Maximize Minimum Distance (Aggressive Cows)</h1>
<p>You are given an array <code>positions</code> representing the coordinates of <code>n</code> stalls on a straight line, and an integer <code>c</code> representing the number of cows to place.</p>
<p>You must place the <code>c</code> cows in the stalls such that the <strong>minimum distance between any two cows is as large as possible</strong>. Return this maximum possible minimum distance.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains two space-separated integers: <code>n</code> and <code>c</code>.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the coordinates of the stalls.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the maximum possible minimum distance.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>2 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>2 &le; c &le; n</code></li>
  <li><code>0 &le; positions[i] &le; 10<sup>9</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "5 3\n1 2 8 4 9", expectedOutput: "3", isExample: true },
      { input: "6 4\n0 3 4 7 10 9", expectedOutput: "3", isExample: true },
      { input: "5 2\n4 2 1 3 9", expectedOutput: "8", isExample: false },
      { input: "4 3\n1 5 9 13", expectedOutput: "4", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

bool canPlace(const vector<int>& positions, int c, int dist) {
    int count = 1;
    int last_pos = positions[0];
    for (size_t i = 1; i < positions.size(); i++) {
        if (positions[i] - last_pos >= dist) {
            count++;
            last_pos = positions[i];
            if (count >= c) return true;
        }
    }
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, c;
    if (cin >> n >> c) {
        vector<int> positions(n);
        for (int i = 0; i < n; i++) {
            cin >> positions[i];
        }
        sort(positions.begin(), positions.end());
        int low = 1;
        int high = positions[n - 1] - positions[0];
        int ans = 0;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canPlace(positions, c, mid)) {
                ans = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        cout << ans << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `This problem requires binary searching on the answer. The search space for the minimum distance is between 1 and the difference between the maximum and minimum stall coordinates. For a candidate distance <code>mid</code>, we check if we can place all <code>c</code> cows such that adjacent cows are at least <code>mid</code> apart. Since the check function runs in O(N) time and the search space is logarithmic, the total complexity is O(N log(max_dist)).`,
    hints: [
      "If we fix a minimum distance d, can we greedily check if it is possible to place the c cows?",
      "To place cows greedily, first sort the stall positions. Always place the first cow at the first stall, and place the next cow at the first stall that is at least distance d away.",
      "Use Binary Search on the distance range [1, max_coordinate - min_coordinate] to find the largest d that works."
    ],
    companies: ["Google", "Amazon", "MAQ Software"]
  },
  {
    title: "Matrix Median",
    slug: "matrix-median",
    difficulty: "Hard",
    category: "Binary Search",
    pattern: "Binary search on value range in row-wise sorted matrix",
    description: `
<h1>Matrix Median</h1>
<p>Given a matrix of size <code>r x c</code> where each row is sorted in non-decreasing order. The total number of elements <code>r * c</code> is always odd.</p>
<p>Find the <strong>median</strong> of the matrix.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains two space-separated integers: <code>r</code> and <code>c</code>.</li>
  <li>The next <code>r</code> lines each contain <code>c</code> space-separated integers representing the matrix rows.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the median of the matrix.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; r, c &le; 1000</code></li>
  <li><code>r * c</code> is odd.</li>
  <li><code>-10<sup>9</sup> &le; matrix[i][j] &le; 10<sup>9</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "3 3\n1 3 5\n2 6 9\n3 6 9", expectedOutput: "5", isExample: true },
      { input: "1 3\n2 5 6", expectedOutput: "5", isExample: true },
      { input: "3 5\n1 2 3 3 5\n2 6 9 10 11\n3 6 9 12 15", expectedOutput: "6", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int countSmallerOrEqual(const vector<vector<int>>& matrix, int mid) {
    int count = 0;
    for (const auto& row : matrix) {
        count += upper_bound(row.begin(), row.end(), mid) - row.begin();
    }
    return count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int r, c;
    if (cin >> r >> c) {
        vector<vector<int>> matrix(r, vector<int>(c));
        int min_val = 1e9, max_val = -1e9;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                cin >> matrix[i][j];
                min_val = min(min_val, matrix[i][j]);
                max_val = max(max_val, matrix[i][j]);
            }
        }

        int low = min_val;
        int high = max_val;
        int desired = (r * c + 1) / 2;
        int ans = low;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (countSmallerOrEqual(matrix, mid) >= desired) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        cout << ans << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We can binary search the median value in the range [min_element, max_element]. For any candidate value <code>mid</code>, we count how many elements in the matrix are less than or equal to <code>mid</code>. Since each row is sorted, we can count this in O(R log C) time using binary search (<code>upper_bound</code>) for each row. The total complexity is O(32 * R log C).`,
    hints: [
      "Instead of sorting the entire R * C elements, can we use the fact that each row is already sorted?",
      "The median will have exactly (R * C + 1) / 2 elements smaller than or equal to it. Let's binary search on the value range [min_val, max_val].",
      "For a candidate value x, count how many elements are <= x in each row using upper_bound."
    ],
    companies: ["Amazon", "Google"]
  },
  {
    title: "Subarray Sum Equals K",
    slug: "subarray-sum-equals-k",
    difficulty: "Medium",
    category: "Arrays",
    pattern: "Prefix sum + Hash map",
    description: `
<h1>Subarray Sum Equals K</h1>
<p>Given an array of integers <code>nums</code> and an integer <code>k</code>, return the total number of subarrays whose sum equals to <code>k</code>.</p>
<p>A subarray is a contiguous non-empty sequence of elements within an array.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains two space-separated integers: <code>n</code> and <code>k</code>.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the number of subarrays with sum equal to <code>k</code>.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 2 * 10<sup>4</sup></code></li>
  <li><code>-1000 &le; nums[i] &le; 1000</code></li>
  <li><code>-10<sup>7</sup> &le; k &le; 10<sup>7</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "3 2\n1 1 1", expectedOutput: "2", isExample: true },
      { input: "3 3\n1 2 3", expectedOutput: "2", isExample: true },
      { input: "5 0\n0 0 0 0 0", expectedOutput: "15", isExample: false },
      { input: "4 -1\n1 -1 2 -2", expectedOutput: "2", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, k;
    if (cin >> n >> k) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) {
            cin >> nums[i];
        }

        unordered_map<int, int> prefix_counts;
        prefix_counts[0] = 1;
        int current_sum = 0;
        int count = 0;

        for (int x : nums) {
            current_sum += x;
            if (prefix_counts.find(current_sum - k) != prefix_counts.end()) {
                count += prefix_counts[current_sum - k];
            }
            prefix_counts[current_sum]++;
        }
        cout << count << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We maintain a running prefix sum. If the difference between the current prefix sum and <code>k</code> has been seen before, it means there are subarrays ending at the current index that sum to <code>k</code>. We use a hash map to store the frequencies of prefix sums. This allows us to solve the problem in O(N) time and O(N) space.`,
    hints: [
      "Let prefix_sum[i] be the sum of elements from index 0 to i. The sum of subarray nums[i...j] is prefix_sum[j] - prefix_sum[i-1].",
      "We want prefix_sum[j] - prefix_sum[i-1] == k, which is equivalent to prefix_sum[i-1] == prefix_sum[j] - k.",
      "Use a hash map to keep track of the frequency of all prefix sums seen so far as you iterate through the array."
    ],
    companies: ["Google", "Amazon", "Oracle"]
  },
  {
    title: "Longest Zero-Sum Subarray",
    slug: "longest-zero-sum-subarray",
    difficulty: "Medium",
    category: "Arrays",
    pattern: "Prefix sum + Hash map",
    description: `
<h1>Longest Zero-Sum Subarray</h1>
<p>Given an array <code>arr</code> of size <code>n</code>, find the length of the longest subarray with sum equal to <code>0</code>.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the size of the array.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the length of the longest zero-sum subarray.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>-1000 &le; arr[i] &le; 1000</code></li>
</ul>
    `,
    testSets: [
      { input: "8\n15 -2 2 -8 1 7 10 23", expectedOutput: "5", isExample: true },
      { input: "4\n1 2 3 4", expectedOutput: "0", isExample: true },
      { input: "5\n0 0 0 0 0", expectedOutput: "5", isExample: false },
      { input: "3\n2 -2 0", expectedOutput: "3", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            cin >> arr[i];
        }

        unordered_map<int, int> first_occurrence;
        first_occurrence[0] = -1;
        int current_sum = 0;
        int max_len = 0;

        for (int i = 0; i < n; i++) {
            current_sum += arr[i];
            if (first_occurrence.find(current_sum) != first_occurrence.end()) {
                max_len = max(max_len, i - first_occurrence[current_sum]);
            } else {
                first_occurrence[current_sum] = i;
            }
        }
        cout << max_len << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We compute prefix sums of the array. If a prefix sum value is repeated at two different indices <code>i</code> and <code>j</code>, it means the sum of the elements between <code>i + 1</code> and <code>j</code> is 0. We store the first occurrence of each prefix sum in a hash map to maximize the length <code>j - i</code>. This solves the problem in O(N) time and O(N) space.`,
    hints: [
      "If the sum of a subarray arr[i...j] is 0, what can you say about prefix_sum[i-1] and prefix_sum[j]?",
      "They must be equal! So the problem reduces to finding the maximum distance between two indices with the same prefix sum value.",
      "Use a hash map to store the first index where each prefix sum was seen. For each subsequent match, calculate the length and update the maximum."
    ],
    companies: ["Amazon", "Google"]
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    difficulty: "Medium",
    category: "Arrays",
    pattern: "Prefix/suffix product",
    description: `
<h1>Product of Array Except Self</h1>
<p>Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.</p>
<p>You must write an algorithm that runs in <code>O(n)</code> time and without using the division operation.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the size of the array.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print <code>n</code> space-separated integers representing the output array.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>2 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>-30 &le; nums[i] &le; 30</code></li>
  <li>The product of any prefix or suffix of <code>nums</code> is guaranteed to fit in a 32-bit integer.</li>
</ul>
    `,
    testSets: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isExample: true },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", isExample: true },
      { input: "2\n5 10", expectedOutput: "10 5", isExample: false },
      { input: "3\n0 0 5", expectedOutput: "0 0 0", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) {
            cin >> nums[i];
        }

        vector<int> result(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            result[i] = prefix;
            prefix *= nums[i];
        }

        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= suffix;
            suffix *= nums[i];
        }

        for (int i = 0; i < n; i++) {
            cout << result[i] << (i == n - 1 ? "" : " ");
        }
        cout << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We can construct the answer by multiplying prefix products and suffix products. For any element <code>nums[i]</code>, the product of all elements except itself is the product of all elements before it times the product of all elements after it. We can compute prefix products in a forward pass, and then accumulate suffix products in a backward pass using constant extra space (excluding the output array).`,
    hints: [
      "If we could use division, we could compute the total product and divide by nums[i]. How do we do it without division?",
      "Think about prefix products and suffix products. The product of elements except nums[i] is prefix_product[i-1] * suffix_product[i+1].",
      "Initialize the output array to 1. Loop from left to right to build prefix products, then loop from right to left to multiply by suffix products."
    ],
    companies: ["Amazon", "Google", "Apple"]
  },
  {
    title: "Largest Rectangle in Histogram",
    slug: "largest-rectangle-in-histogram",
    difficulty: "Hard",
    category: "Stack",
    pattern: "Monotonic Stack",
    description: `
<h1>Largest Rectangle in Histogram</h1>
<p>Given an array of integers <code>heights</code> representing the histogram's bar height where the width of each bar is 1, find the area of the largest rectangle in the histogram.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the number of bars.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the height of each bar.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the maximum area of a rectangle.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>0 &le; heights[i] &le; 10<sup>4</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "6\n2 1 5 6 2 3", expectedOutput: "10", isExample: true },
      { input: "2\n2 4", expectedOutput: "4", isExample: true },
      { input: "1\n10", expectedOutput: "10", isExample: false },
      { input: "5\n2 2 2 2 2", expectedOutput: "10", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> heights(n);
        for (int i = 0; i < n; i++) {
            cin >> heights[i];
        }

        stack<int> s;
        long long max_area = 0;
        int i = 0;
        while (i < n) {
            if (s.empty() || heights[s.top()] <= heights[i]) {
                s.push(i++);
            } else {
                int tp = s.top();
                s.pop();
                long long area = (long long)heights[tp] * (s.empty() ? i : i - s.top() - 1);
                max_area = max(max_area, area);
            }
        }
        while (!s.empty()) {
            int tp = s.top();
            s.pop();
            long long area = (long long)heights[tp] * (s.empty() ? i : i - s.top() - 1);
            max_area = max(max_area, area);
        }
        cout << max_area << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `We use a monotonic stack to find the left and right boundaries for each bar where the bar is the minimum height. By keeping indices of increasing heights in a stack, we can calculate the area whenever we find a bar shorter than the bar at the stack top. This achieves O(N) time and O(N) space complexity.`,
    hints: [
      "For each bar i, if we treat heights[i] as the height of our rectangle, what are the left and right boundaries?",
      "The left boundary is the first bar to the left that is shorter than heights[i]. The right boundary is the first bar to the right that is shorter.",
      "Use a monotonic increasing stack of indices to find these boundaries efficiently in linear time."
    ],
    companies: ["Amazon", "Google", "Sprinklr"]
  },
  {
    title: "Sum of Subarray Minimums",
    slug: "sum-of-subarray-minimums",
    difficulty: "Medium",
    category: "Stack",
    pattern: "Monotonic Stack",
    description: `
<h1>Sum of Subarray Minimums</h1>
<p>Given an array of integers <code>arr</code>, find the sum of <code>min(b)</code>, where <code>b</code> ranges over every contiguous subarray of <code>arr</code>.</p>
<p>Since the answer may be large, return the answer <strong>modulo</strong> <code>10<sup>9</sup> + 7</code>.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the size of the array.</li>
  <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the sum modulo <code>10<sup>9</sup> + 7</code>.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 3 * 10<sup>4</sup></code></li>
  <li><code>1 &le; arr[i] &le; 3 * 10<sup>4</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "4\n3 1 2 4", expectedOutput: "17", isExample: true },
      { input: "5\n11 81 94 43 3", expectedOutput: "444", isExample: true },
      { input: "1\n5", expectedOutput: "5", isExample: false },
      { input: "3\n1 2 3", expectedOutput: "10", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <stack>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) {
            cin >> arr[i];
        }

        long long MOD = 1e9 + 7;
        vector<int> ple(n), nle(n);
        stack<int> s1, s2;

        for (int i = 0; i < n; i++) {
            while (!s1.empty() && arr[s1.top()] >= arr[i]) {
                s1.pop();
            }
            ple[i] = s1.empty() ? -1 : s1.top();
            s1.push(i);
        }

        for (int i = n - 1; i >= 0; i--) {
            while (!s2.empty() && arr[s2.top()] > arr[i]) {
                s2.pop();
            }
            nle[i] = s2.empty() ? n : s2.top();
            s2.push(i);
        }

        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long left_count = i - ple[i];
            long long right_count = nle[i] - i;
            long long total = (left_count * right_count) % MOD;
            sum = (sum + total * arr[i]) % MOD;
        }
        cout << sum << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `For each element <code>arr[i]</code>, we count how many subarrays have <code>arr[i]</code> as their minimum. This is determined by the previous smaller element (index <code>ple[i]</code>) and the next smaller element (index <code>nle[i]</code>). The number of subarrays is <code>(i - ple[i]) * (nle[i] - i)</code>. We use monotonic stacks to precompute <code>ple</code> and <code>nle</code> arrays in O(N) time.`,
    hints: [
      "Instead of generating all subarrays and finding their minimums, think about the contribution of each element arr[i] as the minimum of some subarrays.",
      "How many subarrays have arr[i] as the minimum? It is (i - PLE) * (NSE - i) where PLE is previous lesser element and NSE is next smaller element.",
      "Use monotonic stacks to compute previous lesser and next smaller element indices for every element in the array."
    ],
    companies: ["Amazon", "Google"]
  },
  {
    title: "Meeting Rooms II",
    slug: "meeting-rooms-ii",
    difficulty: "Medium",
    category: "Arrays",
    pattern: "Event ordering / Line sweep",
    description: `
<h1>Meeting Rooms II</h1>
<p>Given an array of meeting time intervals consisting of start and end times <code>[[s1,e1],[s2,e2],...]</code>, find the minimum number of conference rooms required.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the number of meetings.</li>
  <li>The next <code>n</code> lines each contain two space-separated integers: <code>start</code> and <code>end</code> times.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the minimum number of rooms needed.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; n &le; 10<sup>5</sup></code></li>
  <li><code>0 &le; start &lt; end &le; 10<sup>6</sup></code></li>
</ul>
    `,
    testSets: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "2", isExample: true },
      { input: "2\n7 10\n2 4", expectedOutput: "1", isExample: true },
      { input: "4\n1 5\n5 10\n10 15\n15 20", expectedOutput: "1", isExample: false },
      { input: "3\n0 10\n0 10\n0 10", expectedOutput: "3", isExample: false }
    ],
    referenceSolution: `
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        vector<int> start(n), end(n);
        for (int i = 0; i < n; i++) {
            cin >> start[i] >> end[i];
        }
        sort(start.begin(), start.end());
        sort(end.begin(), end.end());

        int rooms = 0;
        int end_ptr = 0;
        for (int i = 0; i < n; i++) {
            if (start[i] < end[end_ptr]) {
                rooms++;
            } else {
                end_ptr++;
            }
        }
        cout << rooms << "\n";
    }
    return 0;
}
    `.trim(),
    editorial: `This is a classic scheduling / interval intersection problem. We can sort the start times and end times independently. As we iterate through meetings by start time, we check if the earliest ending meeting has already finished. If not, we allocate a new room; if it has finished, we reuse the room by incrementing the end pointer. This achieves O(N log N) time complexity.`,
    hints: [
      "We want to find the maximum number of concurrent meetings at any point in time.",
      "Can we treat start times as +1 event and end times as -1 event? Think about sorting all events chronologically.",
      "Alternatively, sort starts and ends separately. Use two pointers to track how many rooms are occupied as you process meetings in start order."
    ],
    companies: ["Google", "Amazon", "Sprinklr", "Wells Fargo"]
  }
];

async function main() {
  console.log("🧹 Deleting word-break problem if it exists...");
  try {
    await prisma.problem.deleteMany({
      where: { slug: "word-break" }
    });
    console.log("✅ Deleted word-break successfully!");
  } catch (err) {
    console.error("❌ Failed to delete word-break:", err);
  }

  console.log("🧹 Deleting meeting-rooms-ii problem if it exists...");
  try {
    await prisma.problem.deleteMany({
      where: { slug: "meeting-rooms-ii" }
    });
    console.log("✅ Deleted meeting-rooms-ii successfully!");
  } catch (err) {
    console.error("❌ Failed to delete meeting-rooms-ii:", err);
  }

  console.log("📝 Upserting 12 placement-oriented problems...");

  for (const prob of problemsData) {
    try {
      const existing = await prisma.problem.findUnique({
        where: { slug: prob.slug },
      });

      if (existing) {
        console.log(`Updating problem: ${prob.title}`);
        await prisma.problem.update({
          where: { slug: prob.slug },
          data: {
            title: prob.title,
            difficulty: prob.difficulty,
            category: prob.category,
            pattern: prob.pattern,
            description: prob.description.trim(),
            testSets: prob.testSets,
            referenceSolution: prob.referenceSolution,
            editorial: prob.editorial,
            hints: prob.hints,
            companies: prob.companies,
            isPublic: true,
            isVerified: true,
            source: "SYSTEM",
          },
        });
        console.log(`✅ Updated: ${prob.title}`);
      } else {
        console.log(`Creating problem: ${prob.title}`);
        await prisma.problem.create({
          data: {
            title: prob.title,
            slug: prob.slug,
            difficulty: prob.difficulty,
            category: prob.category,
            pattern: prob.pattern,
            description: prob.description.trim(),
            testSets: prob.testSets,
            referenceSolution: prob.referenceSolution,
            editorial: prob.editorial,
            hints: prob.hints,
            companies: prob.companies,
            isPublic: true,
            isVerified: true,
            source: "SYSTEM",
          },
        });
        console.log(`✅ Created: ${prob.title}`);
      }
    } catch (err) {
      console.error(`❌ Failed to upsert ${prob.title}:`, err);
    }
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed script crashed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
