import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

const problemData = {
  title: "Task Scheduler",
  slug: "task-scheduler",
  difficulty: "Medium",
  category: "Greedy",
  pattern: "Frequency counting + Idle slot filling",
  description: `
<h1>Task Scheduler</h1>
<p>You are given an array of CPU tasks, each represented by a single uppercase letter (<code>A</code> to <code>Z</code>), and a non-negative integer <code>n</code> representing the cooldown period between two same tasks.</p>

<p>Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there is a constraint: <strong>identical tasks must be separated by at least <code>n</code> intervals</strong> due to cooling time.</p>

<p>Return the minimum number of intervals the CPU will take to finish all the given tasks. The CPU can sit idle during a cooling interval if no other task is available.</p>

<h2>Input Format</h2>
<ul>
  <li>The first line contains a single integer <code>t</code> representing the total number of tasks.</li>
  <li>The second line contains <code>t</code> space-separated uppercase characters representing the tasks.</li>
  <li>The third line contains a single integer <code>n</code> representing the cooldown period.</li>
</ul>

<h2>Output Format</h2>
<ul>
  <li>Print a single integer representing the minimum number of intervals needed.</li>
</ul>

<h2>Constraints:</h2>
<ul>
  <li><code>1 &le; t &le; 10<sup>4</sup></code></li>
  <li><code>tasks[i]</code> is an uppercase English letter.</li>
  <li><code>0 &le; n &le; 100</code></li>
</ul>
  `.trim(),
  testSets: [
    // 3 Example cases
    { input: "6\nA A A B B B\n2", expectedOutput: "8", isExample: true },
    { input: "5\nA A A B B\n2", expectedOutput: "7", isExample: true },
    { input: "6\nA A A A A A\n2", expectedOutput: "16", isExample: true },
    // 27 Hidden cases (all verified by compiled C++ solution)
    { input: "6\nA A A B B B\n0", expectedOutput: "6", isExample: false },
    { input: "1\nA\n0", expectedOutput: "1", isExample: false },
    { input: "4\nA B C D\n0", expectedOutput: "4", isExample: false },
    { input: "1\nA\n5", expectedOutput: "1", isExample: false },
    { input: "3\nA A A\n3", expectedOutput: "9", isExample: false },
    { input: "4\nA A A A\n1", expectedOutput: "7", isExample: false },
    { input: "5\nB B B B B\n2", expectedOutput: "13", isExample: false },
    { input: "2\nA A\n3", expectedOutput: "5", isExample: false },
    { input: "4\nA B C D\n3", expectedOutput: "4", isExample: false },
    { input: "3\nA B C\n100", expectedOutput: "3", isExample: false },
    { input: "4\nA A B B\n3", expectedOutput: "6", isExample: false },
    { input: "6\nA A A B B B\n5", expectedOutput: "14", isExample: false },
    { input: "6\nA A B B C C\n2", expectedOutput: "6", isExample: false },
    { input: "8\nA A B B C C D D\n2", expectedOutput: "8", isExample: false },
    { input: "9\nA A A B B B C C C\n2", expectedOutput: "9", isExample: false },
    { input: "12\nA A A A B B B B C C C C\n1", expectedOutput: "12", isExample: false },
    { input: "10\nA A A A A B B B C C\n1", expectedOutput: "10", isExample: false },
    { input: "3\nA A A\n100", expectedOutput: "203", isExample: false },
    { input: "4\nA A A A\n50", expectedOutput: "154", isExample: false },
    { input: "2\nA B\n1", expectedOutput: "2", isExample: false },
    { input: "2\nA A\n1", expectedOutput: "3", isExample: false },
    { input: "2\nA A\n0", expectedOutput: "2", isExample: false },
    { input: "7\nA A A B B C C\n2", expectedOutput: "7", isExample: false },
    { input: "8\nA A A A B B C D\n2", expectedOutput: "10", isExample: false },
    { input: "10\nA A A B B B C C D D\n2", expectedOutput: "10", isExample: false },
    { input: "11\nA A A A B B B C C D E\n3", expectedOutput: "13", isExample: false },
    { input: "15\nA A A A A B B B B C C C D D E\n2", expectedOutput: "15", isExample: false },
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
    cin >> n;
    vector<char> tasks(n);
    for (int i = 0; i < n; i++) cin >> tasks[i];
    int cooldown;
    cin >> cooldown;

    // Count frequency of each task
    vector<int> freq(26, 0);
    for (char c : tasks) freq[c - 'A']++;

    // Find max frequency and how many tasks share it
    int maxFreq = *max_element(freq.begin(), freq.end());
    int maxCount = 0;
    for (int f : freq) {
        if (f == maxFreq) maxCount++;
    }

    // Formula: (maxFreq - 1) * (cooldown + 1) + maxCount
    // If tasks fill up all idle gaps, answer is just n
    int formulaResult = (maxFreq - 1) * (cooldown + 1) + maxCount;
    int ans = max(n, formulaResult);

    cout << ans << "\\n";
    return 0;
}
  `.trim(),
  editorial: `This problem has an elegant O(N) greedy solution based on frequency counting.

### Key Insight
The most frequent task dictates the schedule. If the highest frequency task appears <code>maxFreq</code> times, it creates <code>maxFreq - 1</code> "gaps" of size <code>cooldown + 1</code> each (the task itself plus the cooldown slots). Other tasks and idle slots fill these gaps.

### The Formula
<pre>
result = (maxFreq - 1) * (cooldown + 1) + maxCount
</pre>
Where <code>maxCount</code> is the number of tasks that share the maximum frequency (they all need one extra slot at the end).

### Why max(n, formula)?
If there are enough distinct tasks to fill all the idle slots (and more), no idle time is needed. In that case, the answer is simply the total number of tasks <code>n</code>.

### Complexity
- **Time:** O(N) where N is the number of tasks (one pass to count frequencies, one pass to find max).
- **Space:** O(1) since there are at most 26 distinct task types.`,
  hints: [
    "Which task type constrains the schedule the most? It is the one with the highest frequency.",
    "If the most frequent task appears maxFreq times, you need at least (maxFreq - 1) cooldown gaps between them. Each gap is of size (cooldown + 1).",
    "The total minimum intervals = max(total_tasks, (maxFreq - 1) * (cooldown + 1) + number_of_tasks_with_max_frequency)."
  ],
  companies: ["Facebook", "Amazon", "Google", "Microsoft", "Bloomberg"]
};

async function main() {
  console.log("📚 Upserting Learning Resources for Task Scheduler...");

  const res1Id = "striver-task-scheduler";
  await prisma.learningResource.upsert({
    where: { id: res1Id },
    update: {
      title: "Task Scheduler - Greedy Approach Explained",
      url: "https://takeuforward.org/data-structure/task-scheduler/",
      type: ResourceType.WEBSITE,
      topic: "Greedy",
      creator: "Striver (takeUforward)",
      description: "Comprehensive article explaining the greedy formula approach for the Task Scheduler problem with dry-run examples.",
      isPublic: true,
    },
    create: {
      id: res1Id,
      title: "Task Scheduler - Greedy Approach Explained",
      url: "https://takeuforward.org/data-structure/task-scheduler/",
      type: ResourceType.WEBSITE,
      topic: "Greedy",
      creator: "Striver (takeUforward)",
      description: "Comprehensive article explaining the greedy formula approach for the Task Scheduler problem with dry-run examples.",
      isPublic: true,
    }
  });
  console.log("   ✅ Striver resource ready.");

  const res2Id = "neetcode-task-scheduler";
  await prisma.learningResource.upsert({
    where: { id: res2Id },
    update: {
      title: "Task Scheduler - LeetCode 621 - Python",
      url: "https://www.youtube.com/watch?v=s8p8ukTyA2I",
      type: ResourceType.VIDEO,
      topic: "Greedy",
      creator: "NeetCode",
      description: "Visual walkthrough of the Task Scheduler problem using the greedy idle-slot filling approach.",
      isPublic: true,
    },
    create: {
      id: res2Id,
      title: "Task Scheduler - LeetCode 621 - Python",
      url: "https://www.youtube.com/watch?v=s8p8ukTyA2I",
      type: ResourceType.VIDEO,
      topic: "Greedy",
      creator: "NeetCode",
      description: "Visual walkthrough of the Task Scheduler problem using the greedy idle-slot filling approach.",
      isPublic: true,
    }
  });
  console.log("   ✅ NeetCode resource ready.");

  console.log("📝 Upserting Task Scheduler problem (30 verified test cases)...");
  const created = await prisma.problem.upsert({
    where: { slug: problemData.slug },
    update: {
      title: problemData.title,
      difficulty: problemData.difficulty,
      category: problemData.category,
      pattern: problemData.pattern,
      description: problemData.description,
      testSets: problemData.testSets,
      referenceSolution: problemData.referenceSolution,
      editorial: problemData.editorial,
      hints: problemData.hints,
      companies: problemData.companies,
      isPublic: true,
      isVerified: true,
      source: "SYSTEM",
      resources: {
        set: [],
        connect: [
          { id: res1Id },
          { id: res2Id }
        ]
      }
    },
    create: {
      title: problemData.title,
      slug: problemData.slug,
      difficulty: problemData.difficulty,
      category: problemData.category,
      pattern: problemData.pattern,
      description: problemData.description,
      testSets: problemData.testSets,
      referenceSolution: problemData.referenceSolution,
      editorial: problemData.editorial,
      hints: problemData.hints,
      companies: problemData.companies,
      isPublic: true,
      isVerified: true,
      source: "SYSTEM",
      resources: {
        connect: [
          { id: res1Id },
          { id: res2Id }
        ]
      }
    }
  });

  console.log(`🎉 Seeded successfully! Problem ID: ${created.id}`);
  console.log(`   Test cases: ${problemData.testSets.length} (${problemData.testSets.filter(t => t.isExample).length} examples + ${problemData.testSets.filter(t => !t.isExample).length} hidden)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
