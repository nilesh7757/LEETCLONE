import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runAI } from "@/lib/gemini";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { z } from "zod";

const ObstacleSchema = z.object({
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
  question: z.string(),
  codeBlock: z.string().optional(),
  language: z.string().optional(),
  options: z.array(z.string()).length(4),
  correctOptionIndex: z.number().min(0).max(3),
  hint: z.string(),
  explanation: z.string(),
  realWorldConnection: z.string(),
});

type Obstacle = z.infer<typeof ObstacleSchema>;

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { topic = "RANDOM", difficulty = "MEDIUM", score = 0, recentQuestions = [] } = body;

  const validTopics = ["DBMS", "OS", "SYSTEM_DESIGN", "OOPS", "CODING_LOGIC", "RANDOM"];
  const targetTopic = validTopics.includes(topic) ? topic : "RANDOM";

  const validDifficulties = ["EASY", "MEDIUM", "HARD", "EXPERT"];
  const targetDifficulty = validDifficulties.includes(difficulty) ? difficulty : "MEDIUM";

  const systemPrompt = `You are an elite Technical Interviewer and MCP Assessor. Your goal is to generate a highly detailed, deep, and challenging interview/assessment question on a Core Computer Science topic.

CRITICAL INSTRUCTIONS:
1. Generate one unique question/obstacle matching the topic: "${targetTopic}" (if "RANDOM", pick one of: DBMS, OS, System Design, OOPS, Coding Logic/Complexity) and difficulty level: "${targetDifficulty}".
2. Ensure the question tests DEEP conceptual knowledge or practical system mechanics.
   - For DBMS: Cover topics like normalization anomalies, transaction isolation levels (Phantom reads, Write skew), locking mechanisms (2PL, Intent Locks), Indexing structures (B+ trees, LSM trees), WAL, query executors (Hash joins vs Sort Merge joins).
   - For OS: Cover virtual memory (paging, thrashing, TLB miss handles), concurrency (deadlock recovery, semaphores vs condition variables), scheduling (MLFQ, priority inversion), CPU architecture (context switches, user vs kernel space, syscalls).
   - For System Design: Cover consistent hashing, replication conflicts, CAP/PACELC trade-offs, cache invalidation strategies (write-behind, stampede avoidance), gossip protocols, consensus (Raft/Paxos basics).
   - For OOPS: Cover memory layout (vtable pointers), SOLID principles in practical patterns, diamond inheritance resolution, composition vs inheritance, dynamic vs static binding.
   - For Coding Logic/Complexity: Cover bitwise algorithms, recursive recurrence relations, pointer arithmetic, custom hashing to avoid collision/anti-hash tests, time/space complexity analysis of tricky loops.
3. If coding or SQL is involved, provide a valid code block or query in the "codeBlock" property and specify the programming language (e.g. "cpp", "javascript", "sql", "java") in "language".
4. Provide EXACTLY 4 plausible multiple-choice options in the "options" array. They must be distinct and non-obvious.
5. Provide the correct index (0-3) in "correctOptionIndex".
6. Provide a subtle, useful conceptual "hint".
7. Provide a detailed, deep "explanation" explaining why the correct option is correct and why each of the other options is incorrect or suboptimal. This is for high-end interview preparation.
8. Provide a "realWorldConnection" showing how this concept manifests in real production systems (e.g. "How PostgreSQL implements Multi-Version Concurrency Control using tuple visibility", "How the Linux kernel scheduler CFS runs processes", "How Redis handles cache stampedes with key locking").
9. Do not repeat questions similar to these: ${JSON.stringify(recentQuestions.slice(-5))}.

Return ONLY a JSON object that strictly adheres to the following structure:
{
  "topic": "${targetTopic === "RANDOM" ? "Selected Topic" : targetTopic}",
  "subtopic": "Subtopic Name",
  "difficulty": "${targetDifficulty}",
  "question": "The question or scenario description...",
  "codeBlock": "optional code block",
  "language": "optional programming language",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 0,
  "hint": "Hint pointing to the correct intuition...",
  "explanation": "Extremely thorough explanation...",
  "realWorldConnection": "Connection to Linux kernel, Postgres, Redis, AWS, etc..."
}`;

  const userPrompt = `Generate a challenging ${targetDifficulty} question/obstacle on the topic of ${targetTopic}. The user's current session score is ${score}. Make sure the questions get progressively trickier as difficulty scales.`;

  try {
    const data = await runAI(userPrompt, systemPrompt, ObstacleSchema) as Obstacle;
    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error("AI Generation for CS Core Obstacle failed:", error instanceof Error ? error.message : String(error));
    
    // Fail-safe default questions to prevent crashes
    const defaultObstacles: Record<string, Obstacle> = {
      DBMS: {
        topic: "DBMS",
        subtopic: "Transaction Isolation",
        difficulty: "MEDIUM",
        question: "Under which SQL isolation level can 'Write Skew' anomalies occur, and why?",
        options: [
          "Serializable, because locks are released early",
          "Repeatable Read, because it prevents phantom reads but doesn't lock the read ranges, allowing concurrent transactions to overlap updates on disjoint rows that violate a cross-row constraint",
          "Read Committed, because it uses shared locks that are released immediately after read",
          "Read Uncommitted, due to dirty reads occurring before transaction commit"
        ],
        correctOptionIndex: 1,
        hint: "Write skew occurs when two concurrent transactions read overlapping datasets, but make updates to disjoint datasets, violating a cross-record constraint.",
        explanation: "In Repeatable Read (using MVCC), write skew can occur because the transaction reads a consistent snapshot. Transaction A reads balance of X and Y, updates X; Transaction B reads balance of X and Y, updates Y. Both commit successfully, but the combined condition (e.g., X + Y >= 0) is violated. Serializable isolation prevents this.",
        realWorldConnection: "PostgreSQL implements Repeatable Read using Snapshot Isolation which is susceptible to Write Skew. To prevent it, PostgreSQL uses Serializable Snapshot Isolation (SSI) which tracks read-write conflicts in memory.",
      },
      OS: {
        topic: "OS",
        subtopic: "Virtual Memory & Paging",
        difficulty: "MEDIUM",
        question: "What is 'Thrashing' in virtual memory systems, and how does the operating system mitigate it?",
        options: [
          "CPU cache misalignment; solved by hardware prefetching",
          "Excessive disk swapping when the sum of working sets exceeds available physical memory; solved by local page replacement policies and working-set model tracking",
          "A process hogging the scheduling queue; solved by MLFQ scheduling",
          "Memory fragmentation inside the heap; solved by compaction"
        ],
        correctOptionIndex: 1,
        hint: "Think about what happens when a system spends more time swapping pages in and out of disk than executing instructions.",
        explanation: "Thrashing occurs when the system spends more time swapping pages than executing instructions. This happens because the active working sets of running processes exceed the physical page frames available. The OS mitigates it by tracking the Working Set Model or using Page Fault Frequency (PFF) schemes to suspend/swap out low-priority processes.",
        realWorldConnection: "The Linux kernel uses the OOM (Out of Memory) Killer as a last resort, but also implements pressure stall information (PSI) tracking to detect thrashing early, and uses cgroups to limit memory consumption.",
      },
      SYSTEM_DESIGN: {
        topic: "SYSTEM_DESIGN",
        subtopic: "Consistent Hashing",
        difficulty: "MEDIUM",
        question: "In consistent hashing, what is the primary purpose of introducing 'Virtual Nodes' (VNodes) for physical storage servers on the hash ring?",
        options: [
          "To secure database credentials through encryption",
          "To allow horizontal scaling without redistributing any keys",
          "To achieve a uniform data distribution across physical servers and minimize imbalance (hotspots), especially when physical servers have unequal capacities",
          "To route read requests to slave nodes and write requests to master nodes"
        ],
        correctOptionIndex: 2,
        hint: "Physical nodes might be sparse on the hash ring, leading to uneven partition sizes.",
        explanation: "Without virtual nodes, physical nodes are mapped to a single point on the ring, which can lead to high variance in partition sizes and data distribution. Virtual nodes (VNodes) map a single physical server to multiple points on the ring, ensuring a uniform key distribution and avoiding hotspots.",
        realWorldConnection: "Distributed databases like Amazon DynamoDB, Apache Cassandra, and caching servers like Memcached use virtual nodes to balance cluster loading dynamically.",
      },
      OOPS: {
        topic: "OOPS",
        subtopic: "Polymorphism & vtables",
        difficulty: "HARD",
        question: "How does a C++ compiler implement runtime polymorphism (dynamic dispatch) under the hood, and what is the memory cost per object instance?",
        options: [
          "By injecting an if-else check in every function; no memory cost",
          "By adding a hidden virtual pointer (vptr) in each object instance pointing to a class-wide virtual table (vtable) containing function pointers. Memory cost is 1 pointer size per object instance.",
          "By copying the entire compiled machine code of the virtual functions inside each object's heap space. Memory cost is the size of function instructions.",
          "By resolving symbols dynamically at load-time using dll links; memory cost is zero."
        ],
        correctOptionIndex: 1,
        hint: "Dynamic dispatch requires mapping a call to the correct subclass function override at runtime. What pointer is added to the object layout?",
        explanation: "When a class has virtual functions, the compiler inserts a hidden pointer (usually at the start of the object layout), called the virtual pointer (vptr). This pointer points to a static table for that class (the vtable) containing pointers to the actual overrides. Thus, each object incurs a memory overhead of one pointer (8 bytes on a 64-bit machine).",
        realWorldConnection: "In high-performance gaming engines, dereferencing the vptr to look up the vtable causes a cache-miss penalty (pointer indirection), which is why ECS (Entity Component System) architectures often avoid deep inheritance and virtual functions.",
      },
      CODING_LOGIC: {
        topic: "CODING_LOGIC",
        subtopic: "Complexity & Hashing",
        difficulty: "HARD",
        question: "Why can using std::unordered_map with the default hash in C++ result in a worst-case O(N^2) time complexity on competitive programming websites (like Codeforces), and how do you resolve it?",
        options: [
          "Because the default hash function is O(N) to compute; resolved by using std::map instead.",
          "Because malicious test cases (anti-hash tests) can trigger key collisions, causing all elements to map to the same bucket and turning lookups into O(N) linked-list traversals. Resolved by writing a custom hash function with a randomized high-resolution timer seed.",
          "Because std::unordered_map stores keys in sorted order, causing tree rebalancing overhead; resolved by using std::unordered_set.",
          "Because unordered_map uses quadratic probing which loops infinitely; resolved by allocating more memory."
        ],
        correctOptionIndex: 1,
        hint: "Think about collision attacks. If an attacker knows the hash function (which is deterministic in std::hash), they can craft keys that hash to the same bucket.",
        explanation: "In C++, std::unordered_map uses a deterministic hash function (std::hash). On competitive coding platforms, opponents or test designers can construct input keys that collide under this hash, forcing all elements into a single bucket. This degrades lookup/insert from O(1) to O(N), resulting in O(N^2) total runtime (TLE). The solution is a custom hash function using a random splitmix64 seed.",
        realWorldConnection: "Web servers are also vulnerable to Hash Collision DoS attacks. For example, malicious users can send HTTP POST parameters designed to cause hash collisions in the server's parameter map, overloading the CPU.",
      }
    };

    const fbTopic = targetTopic === "RANDOM" ? "DBMS" : targetTopic;
    const defaultObstacle = defaultObstacles[fbTopic] || defaultObstacles["DBMS"];
    return NextResponse.json(defaultObstacle);
  }
});
