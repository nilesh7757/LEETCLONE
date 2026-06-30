import { PrismaClient, ProblemType, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ==========================================
  // PROBLEM 1: Number of Ways to Arrive at Destination
  // ==========================================
  const problem1Slug = "number-of-ways-to-arrive-at-destination";
  const description1HTML = `
<p>You are in a city that consists of <code>n</code> intersections numbered from <code>0</code> to <code>n - 1</code> with bi-directional roads between some intersections. You want to travel from intersection <code>0</code> (the starting point) to intersection <code>n - 1</code> (the destination) in the <strong>shortest amount of time</strong>.</p>

<p>You are given:</p>
<ul>
  <li><code>n</code>: The number of intersections.</li>
  <li>A list of roads where each road is represented as three integers <code>[u, v, time]</code> meaning it takes <code>time</code> minutes to travel between intersections <code>u</code> and <code>v</code>.</li>
</ul>

<p>Return <strong>the number of ways</strong> you can arrive at your destination in the shortest amount of time. Since the answer may be large, return it <strong>modulo</strong> <code>10<sup>9</sup> + 7</code>.</p>

<h2>Input Format:</h2>
<p>The input consists of multiple lines:</p>
<ul>
  <li>The first line of input contains two space-separated integers:
    <ul>
      <li><code>n</code>: The number of intersections.</li>
      <li><code>m</code>: The number of roads.</li>
    </ul>
  </li>
  <li>The next <code>m</code> lines each contain three space-separated integers <code>u</code>, <code>v</code>, and <code>w</code> representing a bi-directional road between intersection <code>u</code> and intersection <code>v</code> with a travel time of <code>w</code>.</li>
</ul>

<h2>Output Format:</h2>
<ul>
  <li>Print a single integer representing the number of paths that achieve the minimum total travel time from intersection <code>0</code> to intersection <code>n - 1</code>, modulo <code>10<sup>9</sup> + 7</code>.</li>
</ul>

<h2>Example 1:</h2>
<pre>
Input:
n = 7, m = 10
roads = 
0 6 7
0 1 2
1 2 3
1 3 3
6 3 3
3 5 1
6 5 1
2 5 1
0 4 5
4 6 2

Output: 4

Explanation:
The shortest travel time from intersection 0 to intersection 6 is 7 minutes.
There are exactly 4 paths that yield a total travel time of 7 minutes:
1. 0 → 6 (Time: 7)
2. 0 → 4 → 6 (Time: 5 + 2 = 7)
3. 0 → 1 → 2 → 5 → 6 (Time: 2 + 3 + 1 + 1 = 7)
4. 0 → 1 → 3 → 5 → 6 (Time: 2 + 3 + 1 + 1 = 7)
</pre>

<h2>Example 2:</h2>
<pre>
Input:
n = 2, m = 1
roads =
0 1 3

Output: 1

Explanation:
There is only one path from intersection 0 to 1 which takes 3 minutes.
</pre>

<h2>Constraints:</h2>
<ul>
  <li><code>2 ≤ n ≤ 200</code></li>
  <li><code>1 ≤ m ≤ n * (n - 1) / 2</code></li>
  <li><code>0 ≤ u, v ≤ n - 1</code></li>
  <li><code>u ≠ v</code></li>
  <li><code>1 ≤ w ≤ 10<sup>9</sup></code></li>
  <li>All intersections are connected. There are no self-loops or duplicate roads in the input.</li>
</ul>

<br />
<hr style="border: 0; border-top: 1px solid #333;" />
<br />

<details style="border: 1px solid #222; border-radius: 12px; padding: 16px; background-color: #0b0b0c; cursor: pointer;">
  <summary style="font-weight: 800; font-size: 14px; color: #3b82f6; outline: none; list-style: none;">
    💡 Click to view Detailed Explanation & C++ Solution
  </summary>
  <div style="margin-top: 12px; cursor: default; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
    <h3>Algorithm: Dijkstra + Dynamic Programming</h3>
    <p>To count the number of shortest paths in a weighted graph, we can adapt Dijkstra's algorithm. In addition to a <code>dist</code> array tracking the shortest distance to each node, we maintain a <code>ways</code> array where <code>ways[i]</code> stores the number of paths to node <code>i</code> with distance <code>dist[i]</code>.</p>
    
    <ol>
      <li>Initialize <code>dist[0] = 0</code> and <code>dist[i] = ∞</code> for all other nodes.</li>
      <li>Initialize <code>ways[0] = 1</code> and <code>ways[i] = 0</code> for all other nodes.</li>
      <li>Use a min-priority queue (min-heap) storing pairs of <code>{distance, node}</code>, pushing <code>{0, 0}</code> initially.</li>
      <li>While the priority queue is not empty, pop the minimum element <code>{d, u}</code>.</li>
      <li>If <code>d > dist[u]</code>, skip processing (this is a stale path).</li>
      <li>For each neighbor <code>v</code> of <code>u</code> with road weight <code>w</code>:
        <ul>
          <li><strong>If we find a shorter path to <code>v</code></strong> (i.e. <code>d + w < dist[v]</code>):
            <ul>
              <li>Update <code>dist[v] = d + w</code>.</li>
              <li>Reset <code>ways[v] = ways[u]</code> (since all shortest paths to <code>v</code> must now go through <code>u</code>).</li>
              <li>Push <code>{dist[v], v}</code> to the queue.</li>
            </ul>
          </li>
          <li><strong>If we find an alternate path of equal length to <code>v</code></strong> (i.e. <code>d + w == dist[v]</code>):
            <ul>
              <li>Add the paths through <code>u</code> to <code>ways[v]</code>: <code>ways[v] = (ways[v] + ways[u]) % (10^9 + 7)</code>.</li>
            </ul>
          </li>
        </ul>
      </li>
    </ol>
    
    <h4 style="color: #fff; margin-top: 16px;">C++ Source Code:</h4>
    <pre style="background-color: #111; color: #f4f4f5; padding: 14px; border-radius: 8px; border: 1px solid #222; overflow-x: auto; font-family: monospace;">
#include &lt;iostream&gt;
#include &lt;vector&gt;
#include &lt;queue&gt;

using namespace std;

void solve() {
    int n, m;
    if (!(cin &gt;&gt; n &gt;&gt; m)) return;
    
    vector&lt;vector&lt;pair&lt;int, long long&gt;&gt;&gt; adj(n);
    for (int i = 0; i < m; ++i) {
        int u, v;
        long long w;
        cin &gt;&gt; u &gt;&gt; v &gt;&gt; w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
    
    long long MOD = 1e9 + 7;
    vector&lt;long long&gt; dist(n, 1e18); // Represents infinity
    vector&lt;long long&gt; ways(n, 0);
    
    // Min-heap: {distance, node}
    priority_queue&lt;pair&lt;long long, int&gt;, vector&lt;pair&lt;long long, int&gt;&gt;, greater&lt;pair&lt;long long, int&gt;&gt;&gt; pq;
    
    dist[0] = 0;
    ways[0] = 1;
    pq.push({0, 0});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        
        if (d &gt; dist[u]) continue;
        
        for (auto&amp; edge : adj[u]) {
            int v = edge.first;
            long long w = edge.second;
            
            if (d + w &lt; dist[v]) {
                dist[v] = d + w;
                ways[v] = ways[u];
                pq.push({dist[v], v});
            } else if (d + w == dist[v]) {
                ways[v] = (ways[v] + ways[u]) % MOD;
            }
        }
    }
    
    cout &lt;&lt; ways[n - 1] &lt;&lt; endl;
}

int main() {
    // Optimize input/output operations
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    solve();
    return 0;
}
    </pre>
  </div>
</details>
`;

  // Upsert Learning Resource for Problem 1
  const resource1Id = "striver-dijkstra-destinations-resource";
  const resource1Title = "Striver's Dijkstra Shortest Paths - takeUforward";
  const resource1Url = "https://takeuforward.org/graph/g-40-number-of-ways-to-arrive-at-destination/";

  console.log("Upserting Learning Resource 1...");
  const res1 = await prisma.learningResource.upsert({
    where: { id: resource1Id },
    update: {
      title: resource1Title,
      url: resource1Url,
      type: ResourceType.WEBSITE,
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    },
    create: {
      id: resource1Id,
      title: resource1Title,
      url: resource1Url,
      type: ResourceType.WEBSITE,
      topic: "Graph",
      creator: "Striver (takeUforward)",
      isPublic: true,
    }
  });

  console.log(`Upserting Problem 1: Number of Ways to Arrive at Destination`);
  await prisma.problem.upsert({
    where: { slug: problem1Slug },
    update: {
      description: description1HTML,
      resources: {
        connect: { id: res1.id }
      }
    },
    create: {
      title: "Number of Ways to Arrive at Destination",
      slug: problem1Slug,
      difficulty: "Medium",
      category: "Graph",
      description: description1HTML,
      timeLimit: 2,
      memoryLimit: 256,
      isPublic: true,
      type: ProblemType.CODING,
      referenceSolution: `import sys
import heapq

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    m = int(input_data[1])
    adj = [[] for _ in range(n)]
    idx = 2
    for _ in range(m):
        if idx >= len(input_data):
            break
        u = int(input_data[idx])
        v = int(input_data[idx+1])
        w = int(input_data[idx+2])
        adj[u].append((v, w))
        adj[v].append((u, w))
        idx += 3
    MOD = 10**9 + 7
    dist = [float('inf')] * n
    ways = [0] * n
    dist[0] = 0
    ways[0] = 1
    pq = [(0, 0)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                ways[v] = ways[u]
                heapq.heappush(pq, (dist[v], v))
            elif dist[u] + w == dist[v]:
                ways[v] = (ways[v] + ways[u]) % MOD
    print(ways[n-1])

if __name__ == '__main__':
    solve()`,
      testSets: [
        {
          input: "7 10\n0 6 7\n0 1 2\n1 2 3\n1 3 3\n6 3 3\n3 5 1\n6 5 1\n2 5 1\n0 4 5\n4 6 2",
          isExample: true,
          expectedOutput: "4"
        },
        {
          input: "2 1\n0 1 3",
          isExample: true,
          expectedOutput: "1"
        },
        {
          input: "5 6\n0 1 1\n1 2 1\n2 3 1\n3 4 1\n0 2 2\n2 4 2",
          isExample: false,
          expectedOutput: "4"
        },
        {
          input: "3 3\n0 1 1\n1 2 2\n0 2 3",
          isExample: false,
          expectedOutput: "2"
        },
        {
          input: "4 4\n0 1 1\n1 2 1\n2 3 1\n0 3 4",
          isExample: false,
          expectedOutput: "1"
        },
        {
          input: "4 6\n0 1 1\n0 2 1\n0 3 2\n1 2 1\n1 3 1\n2 3 1",
          isExample: false,
          expectedOutput: "3"
        },
        {
          input: "3 3\n0 1 1000000000\n1 2 1000000000\n0 2 2000000000",
          isExample: false,
          expectedOutput: "2"
        },
        {
          input: "4 3\n0 1 1000000000\n1 2 1000000000\n2 3 1000000000",
          isExample: false,
          expectedOutput: "1"
        },
        {
          input: "7 8\n0 1 1\n0 2 1\n1 3 1\n2 3 1\n3 4 1\n3 5 1\n4 6 1\n5 6 1",
          isExample: false,
          expectedOutput: "4"
        }
      ],
      editorial: "Use Dijkstra's algorithm tracking distances and shortest path counts (ways) mod 10^9+7.",
      source: "DAIICT_PLACEMENTS",
      resources: {
        connect: { id: res1.id }
      }
    }
  });


  // ==========================================
  // PROBLEM 2: Maximum Profit in Job Scheduling (Medium-Hard / LeetCode 1235)
  // ==========================================
  const problem2Slug = "maximum-profit-in-job-scheduling";
  const description2HTML = `
<p>You have <code>n</code> jobs, where each job is represented by a start time, end time, and profit. You want to choose a subset of these jobs such that no two jobs overlap in time, and your total profit is maximized.</p>

<p>If you choose a job that ends at time <code>X</code>, you can start another job that starts at time <code>X</code> (i.e. jobs can touch at boundaries).</p>

<h2>Input Format:</h2>
<ul>
  <li>The first line contains a single integer <code>n</code> representing the number of jobs.</li>
  <li>The next <code>n</code> lines each contain three space-separated integers: <code>start_time</code>, <code>end_time</code>, and <code>profit</code> for the job.</li>
</ul>

<h2>Output Format:</h2>
<ul>
  <li>Print a single integer representing the maximum profit you can achieve.</li>
</ul>

<h2>Example 1:</h2>
<pre>
Input:
n = 4
1 3 50
2 4 10
3 5 40
3 6 70

Output: 120
Explanation: We choose the first job [1-3, profit 50] and the fourth job [3-6, profit 70], resulting in a total profit of 120.
</pre>

<h2>Example 2:</h2>
<pre>
Input:
n = 3
1 5 20
2 6 30
3 7 40

Output: 40
Explanation: All jobs overlap, so we can only pick one. The best choice is the third job with profit 40.
</pre>

<h2>Constraints:</h2>
<ul>
  <li><code>1 ≤ n ≤ 5 * 10<sup>4</sup></code></li>
  <li><code>1 ≤ start_time &lt; end_time ≤ 10<sup>9</sup></code></li>
  <li><code>1 ≤ profit ≤ 10<sup>4</sup></code></li>
</ul>

<br />
<hr style="border: 0; border-top: 1px solid #333;" />
<br />

<details style="border: 1px solid #222; border-radius: 12px; padding: 16px; background-color: #0b0b0c; cursor: pointer;">
  <summary style="font-weight: 800; font-size: 14px; color: #3b82f6; outline: none; list-style: none;">
    💡 Click to view Detailed Explanation & C++ Solution
  </summary>
  <div style="margin-top: 12px; cursor: default; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
    <h3>Algorithm: Dynamic Programming + Binary Search</h3>
    <p>This is a variation of the Weighted Interval Scheduling problem. A naive DP solution runs in <code>O(N^2)</code> which will time out for <code>N = 5 * 10^4</code>. To optimize it to <code>O(N log N)</code>, we sort the jobs and use binary search (lower_bound/upper_bound) to find non-overlapping intervals.</p>
    
    <ol>
      <li>Create a custom structure/class for <code>Job</code> storing <code>start</code>, <code>end</code>, and <code>profit</code>.</li>
      <li>Sort all jobs in ascending order of their <strong>end times</strong>.</li>
      <li>Define a DP array <code>dp</code> of size <code>N</code>, where <code>dp[i]</code> represents the maximum profit achievable using the first <code>i</code> jobs (0-indexed).</li>
      <li>For the base case: <code>dp[0] = jobs[0].profit</code>.</li>
      <li>For each job <code>i</code> from <code>1</code> to <code>N-1</code>, we have two options:
        <ul>
          <li><strong>Option 1 (Exclude Job <code>i</code>)</strong>: The profit is simply the same as the previous step: <code>dp[i-1]</code>.</li>
          <li><strong>Option 2 (Include Job <code>i</code>)</strong>: We get <code>jobs[i].profit</code>. We must add this to the maximum profit of the latest job that ended before or at <code>jobs[i].start</code>. We can find this job index using <strong>Binary Search</strong> on the sorted job end times.</li>
        </ul>
      </li>
      <li>The answer will be stored in <code>dp[N-1]</code>.</li>
    </ol>
    
    <h4 style="color: #fff; margin-top: 16px;">C++ Source Code:</h4>
    <pre style="background-color: #111; color: #f4f4f5; padding: 14px; border-radius: 8px; border: 1px solid #222; overflow-x: auto; font-family: monospace;">
#include &lt;iostream&gt;
#include &lt;vector&gt;
#include &lt;algorithm&gt;

using namespace std;

struct Job {
    int start, end, profit;
};

// Sort jobs by end time
bool jobComparator(const Job&amp; a, const Job&amp; b) {
    return a.end &lt; b.end;
}

// Binary search to find the latest non-overlapping job
int findLatestNonOverlapping(const vector&lt;Job&gt;&amp; jobs, int index) {
    int low = 0, high = index - 1;
    int ans = -1;
    
    while (low &lt;= high) {
        int mid = low + (high - low) / 2;
        if (jobs[mid].end &lt;= jobs[index].start) {
            ans = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return ans;
}

void solve() {
    int n;
    if (!(cin &gt;&gt; n)) return;
    
    vector&lt;Job&gt; jobs(n);
    for (int i = 0; i &lt; n; ++i) {
        cin &gt;&gt; jobs[i].start &gt;&gt; jobs[i].end &gt;&gt; jobs[i].profit;
    }
    
    sort(jobs.begin(), jobs.end(), jobComparator);
    
    vector&lt;int&gt; dp(n);
    dp[0] = jobs[0].profit;
    
    for (int i = 1; i &lt; n; ++i) {
        int currentProfit = jobs[i].profit;
        int l = findLatestNonOverlapping(jobs, i);
        if (l != -1) {
            currentProfit += dp[l];
        }
        dp[i] = max(dp[i - 1], currentProfit);
    }
    
    cout &lt;&lt; dp[n - 1] &lt;&lt; endl;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    solve();
    return 0;
}
    </pre>
  </div>
</details>
`;

  // Upsert Learning Resource for Problem 2
  const resource2Id = "gfg-weighted-job-scheduling-resource";
  const resource2Title = "Weighted Job Scheduling Guide - GeeksforGeeks";
  const resource2Url = "https://www.geeksforgeeks.org/weighted-job-scheduling/";

  console.log("Upserting Learning Resource 2...");
  const res2 = await prisma.learningResource.upsert({
    where: { id: resource2Id },
    update: {
      title: resource2Title,
      url: resource2Url,
      type: ResourceType.WEBSITE,
      topic: "Dynamic Programming",
      creator: "GeeksforGeeks",
      isPublic: true,
    },
    create: {
      id: resource2Id,
      title: resource2Title,
      url: resource2Url,
      type: ResourceType.WEBSITE,
      topic: "Dynamic Programming",
      creator: "GeeksforGeeks",
      isPublic: true,
    }
  });

  console.log(`Upserting Problem 2: Maximum Profit in Job Scheduling`);
  await prisma.problem.upsert({
    where: { slug: problem2Slug },
    update: {
      title: "Maximum Profit in Job Scheduling",
      difficulty: "Hard",
      category: "Dynamic Programming",
      description: description2HTML,
      timeLimit: 2,
      memoryLimit: 256,
      isPublic: true,
      type: ProblemType.CODING,
      referenceSolution: `import sys
import bisect

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    jobs = []
    idx = 1
    for _ in range(n):
        if idx >= len(input_data):
            break
        start = int(input_data[idx])
        end = int(input_data[idx+1])
        profit = int(input_data[idx+2])
        jobs.append((start, end, profit))
        idx += 3
    jobs.sort(key=lambda x: x[1])
    dp = [0] * (n + 1)
    end_times = [0] * (n + 1)
    for i in range(1, n + 1):
        start, end, profit = jobs[i-1]
        idx_prev = bisect.bisect_right(end_times, start, 0, i) - 1
        dp[i] = max(dp[i-1], profit + dp[idx_prev])
        end_times[i] = end
    print(dp[n])

if __name__ == '__main__':
    solve()`,
      testSets: [
        {
          input: "4\n1 3 50\n2 4 10\n3 5 40\n3 6 70",
          isExample: true,
          expectedOutput: "120"
        },
        {
          input: "3\n1 5 20\n2 6 30\n3 7 40",
          isExample: true,
          expectedOutput: "40"
        },
        {
          input: "3\n1 2 50\n2 3 20\n3 4 30",
          isExample: false,
          expectedOutput: "100"
        },
        {
          input: "4\n1 2 100\n2 3 200\n3 4 300\n1 4 400",
          isExample: false,
          expectedOutput: "600"
        },
        {
          input: "3\n100000000 200000000 1000\n150000000 250000000 2000\n200000000 300000000 1500",
          isExample: false,
          expectedOutput: "2500"
        },
        {
          input: "1\n1 100 5",
          isExample: false,
          expectedOutput: "5"
        },
        {
          input: "5\n1 4 10\n2 5 20\n4 7 15\n5 8 30\n7 9 10",
          isExample: false,
          expectedOutput: "50"
        }
      ],
      editorial: "Sort the jobs by their end times. Use DP with binary search (bisect/lower_bound) to find non-overlapping intervals in O(N log N) time.",
      source: "DAIICT_PLACEMENTS",
      resources: {
        connect: { id: res2.id }
      }
    },
    create: {
      title: "Maximum Profit in Job Scheduling",
      slug: problem2Slug,
      difficulty: "Hard",
      category: "Dynamic Programming",
      description: description2HTML,
      timeLimit: 2,
      memoryLimit: 256,
      isPublic: true,
      type: ProblemType.CODING,
      referenceSolution: `import sys
import bisect

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    jobs = []
    idx = 1
    for _ in range(n):
        if idx >= len(input_data):
            break
        start = int(input_data[idx])
        end = int(input_data[idx+1])
        profit = int(input_data[idx+2])
        jobs.append((start, end, profit))
        idx += 3
    jobs.sort(key=lambda x: x[1])
    dp = [0] * (n + 1)
    end_times = [0] * (n + 1)
    for i in range(1, n + 1):
        start, end, profit = jobs[i-1]
        idx_prev = bisect.bisect_right(end_times, start, 0, i) - 1
        dp[i] = max(dp[i-1], profit + dp[idx_prev])
        end_times[i] = end
    print(dp[n])

if __name__ == '__main__':
    solve()`,
      testSets: [
        {
          input: "4\n1 3 50\n2 4 10\n3 5 40\n3 6 70",
          isExample: true,
          expectedOutput: "120"
        },
        {
          input: "3\n1 5 20\n2 6 30\n3 7 40",
          isExample: true,
          expectedOutput: "40"
        },
        {
          input: "3\n1 2 50\n2 3 20\n3 4 30",
          isExample: false,
          expectedOutput: "100"
        },
        {
          input: "4\n1 2 100\n2 3 200\n3 4 300\n1 4 400",
          isExample: false,
          expectedOutput: "600"
        },
        {
          input: "3\n100000000 200000000 1000\n150000000 250000000 2000\n200000000 300000000 1500",
          isExample: false,
          expectedOutput: "2500"
        },
        {
          input: "1\n1 100 5",
          isExample: false,
          expectedOutput: "5"
        },
        {
          input: "5\n1 4 10\n2 5 20\n4 7 15\n5 8 30\n7 9 10",
          isExample: false,
          expectedOutput: "50"
        }
      ],
      editorial: "Sort the jobs by their end times. Use DP with binary search (bisect/lower_bound) to find non-overlapping intervals in O(N log N) time.",
      source: "DAIICT_PLACEMENTS",
      resources: {
        connect: { id: res2.id }
      }
    }
  });

  console.log("SUCCESS!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
