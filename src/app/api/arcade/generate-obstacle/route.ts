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

// Comprehensive list of subtopics for deep CS exploration
const SUBTOPICS_MAP: Record<string, string[]> = {
  DBMS: [
    "B+ Tree structure and leaf node pointers vs B-Tree node layout",
    "Write-Ahead Logging (WAL) and ARIES recovery algorithm (Analysis, Redo, Undo)",
    "Transaction Isolation: Write Skew and Phantom Reads in Repeatable Read isolation level",
    "Two-Phase Locking (2PL) - Strict vs Rigorous 2PL and lock escalation",
    "Multi-Version Concurrency Control (MVCC) visibility checks and vacuuming/garbage collection",
    "Execution Plan Operators: Hash Join (Grace, Hybrid) vs Sort-Merge Join vs Index Nested Loop Join",
    "Database Normalization: 4NF, 5NF (Project-Join Normal Form) and Multi-valued dependencies",
    "Index types: Clustered vs Non-clustered, Cover index, LSM-trees vs B-trees for write-heavy workloads",
    "Database Sharding: Consistent hashing, hot partition avoidance, and distributed transaction 2PC (Two-Phase Commit)",
    "Query optimization: Cost-based optimizer statistics, index selectivity, and query rewrite rules",
    "Anomalies: Dirty Read, Non-repeatable Read, Phantom Read, Lost Update, Write Skew"
  ],
  OS: [
    "Virtual Memory: Translation Lookaside Buffer (TLB) shootdowns and multi-level page tables memory overhead",
    "Page Replacement Algorithms: Clock algorithm, LRU approximation, Thrashing, and Working Set Model",
    "Process Synchronization: Priority Inversion and Priority Inheritance protocols in RTOS",
    "CPU Scheduling: Multi-Level Feedback Queue (MLFQ) parameter tuning and starvation prevention",
    "Deadlock prevention and avoidance: Banker's Algorithm safety state check vs Resource Allocation Graph cycles",
    "System Call dispatch: Context switching overhead, User vs Kernel Mode transitions, and Interrupt handling",
    "Thread Memory Models: User threads vs Kernel threads mapping (1:1 vs M:N) and thread-local storage (TLS)",
    "Inter-Process Communication: Shared memory synchronization vs Message Queues copy overhead and Pipes page sizes",
    "File Systems: Inode structure, journaling (data vs ordered vs writeback mode), and directory lookups",
    "Linux Scheduler: Completely Fair Scheduler (CFS) red-black tree layout and virtual runtime (vruntime) calculation"
  ],
  SYSTEM_DESIGN: [
    "Distributed Consensus: Raft vs Paxos leader election and log replication safety invariants",
    "Consistent Hashing: Virtual nodes allocation and key redistribution on node failure/addition",
    "Cache Invalidation: Cache-aside vs Write-through vs Write-behind, and Cache Stampede (Thundering Herd) mitigation using mutex locks",
    "High Availability & Replication: Single-leader replication lag, read-after-write consistency, and monotonic read guarantees",
    "CAP Theorem: AP vs CP trade-offs in distributed systems and PACELC extension details",
    "Rate Limiting: Token Bucket vs Leaky Bucket vs Sliding Window Log algorithms trade-offs and Redis implementation",
    "Message Queues: Kafka partition offsets, consumer group rebalancing, and at-least-once vs exactly-once delivery guarantees",
    "Scale and Latency: CDN caching strategies, DNS routing, Anycast, and Load Balancers (Layer 4 TCP vs Layer 7 HTTP)",
    "NoSQL vs RDBMS: Column family stores (HBase) vs Document stores (MongoDB) vs Key-Value stores (Redis) vs Relational models",
    "Distributed Transactions: Saga pattern (Choreography vs Orchestration) vs Outbox pattern for microservices reliability"
  ],
  OOPS: [
    "C++ Compiler Layout: vptr (virtual pointer) offset in objects, vtable structure, and memory overhead of multiple inheritance",
    "Polymorphism Mechanics: Dynamic Dispatch (Runtime binding) vs Static Dispatch (Template metaprogramming / Overloading) performance costs",
    "SOLID Design: Liskov Substitution Principle (LSP) violation signs and Interface Segregation vs Single Responsibility",
    "Design Patterns: Creational (Abstract Factory, Singleton safety in double-checked locking), Structural (Decorator, Adapter, Proxy)",
    "Behavioral Patterns: Strategy pattern vs State pattern state transitions, and Observer pattern weak references",
    "Composition vs Inheritance: Fragile base class problem and coupling trade-offs",
    "Diamond Problem: Virtual base classes in C++ and how Java/Python resolve multiple inheritance conflicts",
    "Encapsulation & Abstraction: Data hiding limits, friend classes in C++, reflection in Java, and package-private access control"
  ],
  CODING_LOGIC: [
    "Time & Space Complexity: Analyzing recursion recurrence relations using Master Theorem and recursion trees",
    "Bit Manipulation: Bit masking, count set bits (Brian Kernighan's algorithm), and checking power of two",
    "Hashing: Custom hashing function design to bypass anti-hash test cases (O(N^2) collision attacks on std::unordered_map)",
    "Pointer Arithmetic: Pointer offsets, multidimensional array indexing math, and memory alignment constraints",
    "Sorting & Searching logic: Pivot selection impact in Quicksort (worst-case O(N^2) avoidance) and TimSort merge runs",
    "Amortized Analysis: Dynamic array doubling capacity cost analysis (Aggregate, Accounting, and Potential methods)"
  ]
};

// Fallback questions database (multi-choice per topic)
const FALLBACK_QUESTIONS: Record<string, Obstacle[]> = {
  DBMS: [
    {
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
    {
      topic: "DBMS",
      subtopic: "Indexing structures",
      difficulty: "HARD",
      question: "Why do relational databases like MySQL (InnoDB) prefer B+ Trees over B-Trees for primary key indexing?",
      options: [
        "B+ Trees consume significantly less memory because they do not store keys in internal nodes.",
        "B+ Trees store actual row data or record pointers only in the leaf nodes, creating highly compact internal nodes with maximum fan-out. This minimizes tree height and disk I/O, while sequential sibling leaf pointers enable fast range scans.",
        "B+ Trees have O(1) hash complexity for search operations.",
        "B+ Trees avoid node splitting during write operations, maintaining perfect linear structures."
      ],
      correctOptionIndex: 1,
      hint: "Think about range query traversal and fan-out comparison between B-tree and B+ tree node pointers.",
      explanation: "In B+ Trees, internal nodes only store keys and page pointers, which maximizes the fan-out factor (number of pointers per node). This results in a shallow tree height, minimizing disk seek times. Additionally, because leaf nodes are linked sequentially, scanning a range of keys only requires sequential traversal of leaf nodes rather than vertical tree traversal.",
      realWorldConnection: "MySQL's InnoDB engine uses B+ Trees for its clustered indexes. Leaf nodes contain the actual row data, whereas secondary indexes contain the primary key value as a pointer to the clustered index."
    }
  ],
  OS: [
    {
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
    {
      topic: "OS",
      subtopic: "CPU Scheduling",
      difficulty: "HARD",
      question: "What is 'Priority Inversion' and how does the priority inheritance protocol resolve it?",
      options: [
        "When a high-priority thread runs infinitely, blocking low-priority threads; resolved by preemption ticks.",
        "When a low-priority thread holds a shared resource needed by a high-priority thread, and a medium-priority thread preempts the low-priority thread, indirectly blocking the high-priority thread. Resolved by temporarily boosting the low-priority thread's priority to match the high-priority thread's level.",
        "When processes are scheduled in reverse order of their arrival; resolved by FIFO priority queues.",
        "When user space calls kernel space directly; resolved by double buffering."
      ],
      correctOptionIndex: 1,
      hint: "Think about a low-priority process holding a lock that a high-priority process needs, but a medium-priority process keeps interrupting the low-priority one.",
      explanation: "Priority Inversion happens when a medium-priority thread preempts a low-priority thread that holds a lock needed by a high-priority thread. Because the low-priority thread cannot run, it cannot release the lock, causing the high-priority thread to wait indefinitely. Priority Inheritance solves this by temporarily raising the priority of the lock holder to that of the waiting high-priority thread.",
      realWorldConnection: "The Mars Pathfinder mission in 1997 famously suffered from system resets caused by priority inversion in its VxWorks RTOS. It was resolved by enabling priority inheritance on the mutexes."
    }
  ],
  SYSTEM_DESIGN: [
    {
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
    }
  ],
  OOPS: [
    {
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
    }
  ],
  CODING_LOGIC: [
    {
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
  ]
};

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { topic = "RANDOM", difficulty = "MEDIUM", score = 0, recentQuestions = [] } = body;

  const validTopics = ["DBMS", "OS", "SYSTEM_DESIGN", "OOPS", "CODING_LOGIC", "RANDOM"];
  let targetTopic = validTopics.includes(topic) ? topic : "RANDOM";

  // If RANDOM, select a topic sector dynamically
  if (targetTopic === "RANDOM") {
    const list = ["DBMS", "OS", "SYSTEM_DESIGN", "OOPS", "CODING_LOGIC"];
    targetTopic = list[Math.floor(Math.random() * list.length)];
  }

  const validDifficulties = ["EASY", "MEDIUM", "HARD", "EXPERT"];
  const targetDifficulty = validDifficulties.includes(difficulty) ? difficulty : "MEDIUM";

  // Pick a random subtopic to ensure maximum prompt entropy & cover all syllabus points
  const subtopics = SUBTOPICS_MAP[targetTopic] || ["General Architecture"];
  const selectedSubtopic = subtopics[Math.floor(Math.random() * subtopics.length)];

  // Create a completely random seed to bypass low temperature determinism
  const randomSeed = Math.floor(Math.random() * 1000000);

  const systemPrompt = `You are an elite Technical Interviewer and MCP Assessor. Your goal is to generate a highly detailed, deep, and challenging interview/assessment question on a Core Computer Science topic.

CRITICAL INSTRUCTIONS:
1. Generate one completely unique question/obstacle matching the topic: "${targetTopic}", and specifically focusing on this sub-topic detail: "${selectedSubtopic}".
2. Set the complexity matching difficulty level: "${targetDifficulty}".
3. Ensure the question tests DEEP conceptual knowledge or practical system mechanics.
4. You MUST NOT repeat or base the question on any of these recently answered questions: ${JSON.stringify(recentQuestions.slice(-6))}. Do not make them similar.
5. If coding or SQL is involved, provide a valid code block or query in the "codeBlock" property and specify the programming language (e.g. "cpp", "javascript", "sql", "java") in "language".
6. Provide EXACTLY 4 plausible multiple-choice options in the "options" array. They must be distinct and non-obvious.
7. Provide the correct index (0-3) in "correctOptionIndex".
8. Provide a subtle, useful conceptual "hint".
9. Provide a detailed, deep "explanation" explaining why the correct option is correct and why each of the other options is incorrect or suboptimal. This is for high-end interview preparation.
10. Provide a "realWorldConnection" showing how this concept manifests in real production systems (e.g. "How PostgreSQL implements Multi-Version Concurrency Control using tuple visibility", "How the Linux kernel scheduler CFS runs processes", "How Redis handles cache stampedes with key locking").
11. Random Seed Context: ${randomSeed}. Use this seed to introduce variability in phrasing and style.

Return ONLY a JSON object that strictly adheres to the following structure:
{
  "topic": "${targetTopic}",
  "subtopic": "${selectedSubtopic}",
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

  const userPrompt = `Generate a challenging ${targetDifficulty} question/obstacle on the topic of ${targetTopic} focusing on ${selectedSubtopic}. Random Seed: ${randomSeed}. Current Score: ${score}. Ensure it is different from: ${JSON.stringify(recentQuestions.slice(-5))}`;

  try {
    const data = await runAI(userPrompt, systemPrompt, ObstacleSchema) as Obstacle;
    
    // Safety check to ensure we got a valid object
    if (!data || !data.question || !Array.isArray(data.options) || data.options.length !== 4) {
      throw new Error("Invalid AI generated output format");
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    logger.error("AI Generation for CS Core Obstacle failed:", error instanceof Error ? error.message : String(error));
    
    // Choose a fallback question randomly to avoid repetition in case of API failure
    const defaults = FALLBACK_QUESTIONS[targetTopic] || FALLBACK_QUESTIONS["DBMS"];
    const fallback = defaults[Math.floor(Math.random() * defaults.length)];
    
    return NextResponse.json(fallback);
  }
});
