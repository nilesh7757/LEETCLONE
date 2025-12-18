import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const systemDesignProblems = [
  {
    title: "Design a URL Shortener (TinyURL)",
    slug: "design-url-shortener",
    difficulty: "Easy",
    category: "System Design",
    type: "SYSTEM_DESIGN",
    description: `
      <h2>1. Problem Statement</h2>
      <p>Design a service like <strong>TinyURL</strong> that creates short aliases for long URLs. When a user clicks the short link, they should be redirected to the original long URL efficiently.</p>
      
      <h2>2. Requirements</h2>
      <h3>Functional Requirements:</h3>
      <ul>
        <li><strong>Shortening:</strong> Generate a unique, short alias for a given long URL.</li>
        <li><strong>Redirection:</strong> Redirect users to the original URL with minimal latency.</li>
        <li><strong>Custom Aliases:</strong> Allow users to specify their own short links (within constraints).</li>
        <li><strong>Expiration:</strong> Support automatic deletion of links after a set period.</li>
      </ul>

      <h3>Non-Functional Requirements:</h3>
      <ul>
        <li><strong>High Availability:</strong> The redirection service must never go down.</li>
        <li><strong>Low Latency:</strong> Redirection should feel instantaneous to the user.</li>
        <li><strong>Unpredictability:</strong> Short links should not be guessable to prevent scraping.</li>
      </ul>

      <h2>3. Capacity Estimation</h2>
      <ul>
        <li><strong>New URLs:</strong> 100 Million per month.</li>
        <li><strong>Read Requests:</strong> 10 Billion per month (100:1 Read/Write ratio).</li>
      </ul>
    `,
    referenceSolution: "The candidate should discuss: 1. Hashing vs KGS, 2. Database partitioning, 3. Caching with Redis, 4. Handling collisions.",
    testSets: []
  },
  {
    title: "Design a Scalable Notification System",
    slug: "design-notification-system",
    difficulty: "Medium",
    category: "System Design",
    type: "SYSTEM_DESIGN",
    description: `
      <h2>1. Problem Statement</h2>
      <p>Design a system capable of sending <strong>millions of notifications</strong> per day across multiple channels including Email, SMS, and Push Notifications.</p>
      
      <h2>2. Requirements</h2>
      <h3>Functional Requirements:</h3>
      <ul>
        <li>Support for <strong>Multiple Platforms</strong> (iOS, Android, Web).</li>
        <li>Support for <strong>Multiple Channels</strong> (SMS, Email, In-app).</li>
        <li><strong>Prioritization:</strong> High-priority alerts (OTP) should be delivered faster than newsletters.</li>
        <li><strong>Scheduling:</strong> Users should be able to receive notifications at specific times.</li>
      </ul>

      <h3>Non-Functional Requirements:</h3>
      <ul>
        <li><strong>Reliability:</strong> Guaranteed delivery (at-least-once).</li>
        <li><strong>Scalability:</strong> Must handle sudden bursts (e.g., flash sales).</li>
        <li><strong>Rate Limiting:</strong> Don't spam users; respect daily limits.</li>
      </ul>
    `,
    referenceSolution: "Solution must include: 1. Message Queues (Kafka), 2. Notification Workers, 3. Preference Service, 4. Analytics/Tracking.",
    testSets: []
  },
  {
    title: "Design a Global Ride-Sharing Service (Uber)",
    slug: "design-uber",
    difficulty: "Hard",
    category: "System Design",
    type: "SYSTEM_DESIGN",
    description: `
      <h2>1. Problem Statement</h2>
      <p>Design a real-time ride-sharing service like <strong>Uber</strong> or <strong>Lyft</strong> that connects millions of passengers with nearby drivers globally.</p>
      
      <h2>2. Core Features</h2>
      <ol>
        <li><strong>Real-time Tracking:</strong> Constant GPS updates from drivers.</li>
        <li><strong>Matching:</strong> Connect a passenger to the optimal nearby driver.</li>
        <li><strong>Dynamic Pricing:</strong> Surge pricing based on demand and supply.</li>
        <li><strong>Payments:</strong> Integration with payment gateways.</li>
      </ol>

      <h2>3. Technical Challenges</h2>
      <ul>
        <li><strong>Geospatial Indexing:</strong> How to quickly find drivers in a specific radius? (QuadTrees, Geohashing, S2).</li>
        <li><strong>Real-time State:</strong> Handling thousands of location pings per second using WebSockets.</li>
        <li><strong>Matching Consistency:</strong> Ensuring two passengers aren't assigned the same driver.</li>
      </ul>
    `,
    referenceSolution: "Key points: 1. Geospatial Databases, 2. WebSocket management, 3. Trip State Machine, 4. Matcher Engine logic.",
    testSets: []
  },
  {
    title: "Design an API Rate Limiter",
    slug: "design-rate-limiter",
    difficulty: "Medium",
    category: "System Design",
    type: "SYSTEM_DESIGN",
    description: `
      <h2>1. Problem Statement</h2>
      <p>Design a <strong>Rate Limiter</strong> middleware that throttles incoming requests to an API to prevent abuse and ensure service availability.</p>
      
      <h2>2. Requirements</h2>
      <ul>
        <li>Limit requests by <strong>IP Address</strong>, <strong>User ID</strong>, or <strong>API Key</strong>.</li>
        <li>Should return <strong>HTTP 429</strong> (Too Many Requests) when limits are hit.</li>
        <li>Must be <strong>Distributed</strong> (shared state across multiple API servers).</li>
      </ul>

      <h2>3. Algorithms to Discuss</h2>
      <ul>
        <li><strong>Token Bucket:</strong> Simple, handles bursts.</li>
        <li><strong>Leaking Bucket:</strong> Smooths out traffic.</li>
        <li><strong>Sliding Window Counter:</strong> Most accurate for boundary cases.</li>
      </ul>
    `,
    referenceSolution: "Evaluation: 1. Redis Lua scripts for atomicity, 2. Middleware vs API Gateway, 3. Client notification (Retry-After headers).",
    testSets: []
  },
  {
    title: "Design a Distributed Key-Value Store",
    slug: "design-distributed-kv-store",
    difficulty: "Hard",
    category: "System Design",
    type: "SYSTEM_DESIGN",
    description: `
      <h2>1. Problem Statement</h2>
      <p>Design a distributed, highly available, and scalable <strong>Key-Value Store</strong> similar to Amazon's DynamoDB or Apache Cassandra.</p>
      
      <h2>2. Requirements</h2>
      <ul>
        <li><strong>Scalability:</strong> Horizontal scaling to handle petabytes of data.</li>
        <li><strong>Availability:</strong> No single point of failure (Masterless architecture).</li>
        <li><strong>Tunable Consistency:</strong> Users can choose between consistency and speed (CAP Theorem).</li>
      </ul>

      <h2>3. Key Design Concepts</h2>
      <ol>
        <li><strong>Consistent Hashing:</strong> For data partitioning and minimal re-shuffling.</li>
        <li><strong>Replication:</strong> Storing data on multiple nodes for fault tolerance.</li>
        <li><strong>Gossip Protocol:</strong> For decentralized failure detection.</li>
        <li><strong>Conflict Resolution:</strong> Handling concurrent writes (Vector Clocks).</li>
      </ol>
    `,
    referenceSolution: "Concepts to cover: 1. Partitions, 2. Quorum Consensus (R+W > N), 3. Merkle Trees, 4. Hinted Handoff.",
    testSets: []
  }
];

async function main() {
  console.log("Adding Enhanced System Design problems...");
  
  for (const prob of systemDesignProblems) {
    const cleanDescription = prob.description
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();

    const upserted = await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: {
        type: prob.type as any,
        description: cleanDescription,
        referenceSolution: prob.referenceSolution,
        category: prob.category,
        difficulty: prob.difficulty
      },
      create: {
        ...prob,
        description: cleanDescription,
        type: prob.type as any,
      },
    });
    console.log(`- ${upserted.title} (${upserted.difficulty})`);
  }

  console.log("Enhanced System Design seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });