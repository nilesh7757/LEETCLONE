import { PrismaClient, ProblemType } from '@prisma/client';

const prisma = new PrismaClient();

const placementProblems = [
  {
    title: "Optimal Route to Campus",
    slug: "optimal-route-campus",
    difficulty: "Hard",
    category: "Advanced Graphs",
    companyTags: ["Atlassian", "DE Shaw", "Google"],
    companies: ["Atlassian", "DE Shaw", "Google"],
    description: `You are trying to reach the campus. You have a weighted undirected graph of N nodes (intersections) and M edges (roads). You have exactly K "Teleportation Tickets" that allow you to traverse any road for 0 cost. Return the minimum cost to reach node N from node 1.\n\n**Constraints:**\n- 1 <= N <= 10^4\n- 0 <= K <= 10`,
    testSets: [
      {
        input: "5 6 1\n1 2 2\n1 3 5\n2 4 6\n3 4 1\n4 5 2\n2 5 10",
        expectedOutput: "3",
        isExample: true
      }
    ],
    hints: [
      "Represent the state as (currentNode, ticketsUsed).",
      "Run Dijkstra on a 2D distance array dist[node][k]."
    ],
    editorial: `### Study Resources\n- [TakeUForward: Dijkstra's Algorithm](https://takeuforward.org/data-structure/dijkstras-algorithm-using-priority-queue-g-32/)\n- [GeeksforGeeks: Shortest Path with K edges](https://www.geeksforgeeks.org/shortest-path-with-exactly-k-edges-in-a-directed-and-weighted-graph/)`,
    type: ProblemType.CODING,
    isPublic: true,
    isVerified: true,
    source: "SYSTEM",
  },
  {
    title: "Meesho Delivery Network",
    slug: "meesho-delivery-network",
    difficulty: "Medium",
    category: "Binary Search",
    companyTags: ["Meesho", "Amazon", "Microsoft"],
    companies: ["Meesho", "Amazon", "Microsoft"],
    description: `Meesho wants to deliver P packages within D days. You are given an array of package weights. You must load packages in contiguous segments. Find the minimum weight capacity a delivery truck must have to ship all packages within D days.\n\n**Constraints:**\n- 1 <= P <= 5 * 10^4\n- 1 <= D <= 5 * 10^4`,
    testSets: [
      {
        input: "1 2 3 4 5 6 7 8 9 10\n5",
        expectedOutput: "15",
        isExample: true
      },
      {
        input: "3 2 2 4 1 4\n3",
        expectedOutput: "6",
        isExample: true
      }
    ],
    hints: [
      "If you know a capacity C, can you simulate the delivery to see if it takes <= D days?",
      "Binary search the capacity C between max(weights) and sum(weights)."
    ],
    editorial: `### Study Resources\n- [TakeUForward: Capacity to Ship Packages](https://takeuforward.org/arrays/capacity-to-ship-packages-within-d-days/)\n- [GeeksforGeeks: Allocate Minimum Pages](https://www.geeksforgeeks.org/allocate-minimum-number-pages/)`,
    type: ProblemType.CODING,
    isPublic: true,
    isVerified: true,
    source: "SYSTEM",
  },
  {
    title: "Sprinklr Social Viral Reach",
    slug: "sprinklr-viral-reach",
    difficulty: "Hard",
    category: "Trees",
    companyTags: ["Sprinklr", "Media.net", "Tower Research"],
    companies: ["Sprinklr", "Media.net", "Tower Research"],
    description: `You are given a social network formatted as a Tree with N users. Each user has an influence score (which can be negative). You must select a connected subgraph of users to maximize the total influence score. Return the maximum possible sum.\n\n**Constraints:**\n- 1 <= N <= 10^5\n- -10^4 <= score[i] <= 10^4`,
    testSets: [
      {
        input: "5\n-1 5 3 -2 4\n1 2\n1 3\n2 4\n2 5",
        expectedOutput: "12",
        isExample: true
      }
    ],
    hints: [
      "Use DFS. For each node, calculate the max connected subgraph sum within its subtree that includes the node itself.",
      "DP[u] = val[u] + sum(max(0, DP[v])) for all children v."
    ],
    editorial: `### Study Resources\n- [TakeUForward: DP on Trees](https://takeuforward.org/dynamic-programming/striver-dp-series-dynamic-programming-problems/)\n- [GeeksforGeeks: Maximum Subtree Sum](https://www.geeksforgeeks.org/find-maximum-path-sum-in-a-tree/)`,
    type: ProblemType.CODING,
    isPublic: true,
    isVerified: true,
    source: "SYSTEM",
  },
  {
    title: "UnifyApps Data Pipeline",
    slug: "unifyapps-data-pipeline",
    difficulty: "Medium",
    category: "Graphs",
    companyTags: ["UnifyApps", "Microsoft", "Goldman Sachs"],
    companies: ["UnifyApps", "Microsoft", "Goldman Sachs"],
    description: `UnifyApps runs a data pipeline consisting of N tasks. You are given prerequisite pairs [A, B] meaning task A must finish before task B. Each task takes time[i] to run. Tasks without dependencies can run in parallel. What is the minimum time to complete all tasks?\n\n**Constraints:**\n- 1 <= N <= 10^4`,
    testSets: [
      {
        input: "3\n1 2 3\n2\n0 1\n0 2",
        expectedOutput: "4",
        isExample: true
      }
    ],
    hints: [
      "This is the Longest Path in a Directed Acyclic Graph (DAG).",
      "Use Kahn's Algorithm (BFS Topological Sort) and maintain an array earliest_start[i]."
    ],
    editorial: `### Study Resources\n- [TakeUForward: Kahn's Algorithm](https://takeuforward.org/data-structure/kahns-algorithm-topological-sort-algorithm-bfs-g-22/)\n- [GeeksforGeeks: Parallel Courses](https://www.geeksforgeeks.org/minimum-time-taken-by-each-job-to-be-completed-given-by-a-directed-acyclic-graph/)`,
    type: ProblemType.CODING,
    isPublic: true,
    isVerified: true,
    source: "SYSTEM",
  },
  {
    title: "Maximum XOR Subarray",
    slug: "maximum-xor-subarray",
    difficulty: "Hard",
    category: "Tries",
    companyTags: ["Google", "Directi", "Sprinklr"],
    companies: ["Google", "Directi", "Sprinklr"],
    description: `Given an array of integers, find the contiguous subarray with the maximum XOR sum. This tests advanced bitwise operations and Trie data structures.\n\n**Constraints:**\n- 1 <= N <= 10^5\n- 0 <= arr[i] <= 2^31 - 1`,
    testSets: [
      {
        input: "4\n1 2 3 4",
        expectedOutput: "7",
        isExample: true
      },
      {
        input: "5\n8 1 2 12 7",
        expectedOutput: "15",
        isExample: true
      }
    ],
    hints: [
      "A subarray XOR from L to R is PrefixXOR[R] ^ PrefixXOR[L-1].",
      "Insert all prefix XORs into a Binary Trie. For each prefix, find the maximum XOR by traversing the opposite bits in the Trie."
    ],
    editorial: `### Study Resources\n- [TakeUForward: Maximum XOR of Two Numbers](https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/)\n- [GeeksforGeeks: Max XOR Subarray](https://www.geeksforgeeks.org/find-the-maximum-subarray-xor-in-a-given-array/)`,
    type: ProblemType.CODING,
    isPublic: true,
    isVerified: true,
    source: "SYSTEM",
  }
];

async function main() {
  console.log("Starting seeding of DA-IICT Placement problems...");
  for (const p of placementProblems) {
    const upserted = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        difficulty: p.difficulty,
        category: p.category,
        description: p.description,
        testSets: p.testSets,
        hints: p.hints,
        editorial: p.editorial,
        companyTags: p.companyTags,
        companies: p.companies,
        type: p.type,
        isPublic: p.isPublic,
        isVerified: p.isVerified,
        source: p.source,
      },
      create: {
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        category: p.category,
        description: p.description,
        testSets: p.testSets,
        hints: p.hints,
        editorial: p.editorial,
        companyTags: p.companyTags,
        companies: p.companies,
        type: p.type,
        isPublic: p.isPublic,
        isVerified: p.isVerified,
        source: p.source,
      }
    });
    console.log(`Upserted problem: ${upserted.title} (slug: ${upserted.slug})`);
  }
  console.log("Successfully injected DA-IICT Placement problems!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
