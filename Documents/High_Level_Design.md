# High-Level Design (HLD) Document - LogiQuest

## 1. Introduction
The High-Level Design (HLD) document defines the system topology, component interactions, and architectural patterns of **LogiQuest**. The design ensures sub-2.5s code execution cycles, dynamic live contest updates, and database operations optimized for sudden traffic spikes.

---

## 2. System Architecture & Topology

LogiQuest utilizes a **Microservices-oriented Hybrid Monolith Architecture**. Stateful WebSocket communication is decoupled from stateless HTTP request-response actions to guarantee high availability and independent scaling.

```text
                                  +---------------------------------------+
                                  |            Client Browser             |
                                  |      (React 19 / Monaco Editor)       |
                                  +-------------------+---------------+---+
                                                      |               |
                                     HTTP API Calls / |               | Stateful WS Connection
                                     Server Actions   |               | (Socket.IO)
                                                      v               v
                                  +-------------------+---+       +---+---------------+
                                  |  Next.js Server   |       | Socket.IO Server  |
                                  |  (Stateless API)  |       | (Stateful Room)   |
                                  +---------+---------+---+       +---+-----------+---+
                                            |         |               |           |
                              Prisma Client |         | Redis Pub/Sub |           | Redis Adapter
                                            v         +---------------+           v
                                   +--------+--------+            +---------------+
                                   |  PostgreSQL DB  |            |  Redis Cache  |
                                   | (Primary/Read)  |            | (Cache / Pub) |
                                   +-----------------+            +---------------+
                                            |
                         Webhook Callback   |   POST Run payload
                                            v   (async)
                                   +--------+--------+
                                   | Judge0 API RCE  |
                                   | (Docker Sandbox)|
                                   +-----------------+
```

---

## 3. Tiered Component Architecture

### 3.1 Presentation Tier (Client)
*   **Next.js 16 (App Router):** Renders statically optimized landing pages and dynamic workspace layouts.
*   **Monaco Editor Pane:** Embeds `@monaco-editor/react` as the primary development console. Uses local caching to store active user code drafts.
*   **Framer Motion:** Animates layout adjustments and structural state changes.

### 3.2 Application & Real-Time Tier
*   **Stateless Next.js Server:** Handles credentials, database transactions (Prisma client), rate limiting, and administrative API endpoints.
*   **Stateful Socket.IO Node.js Server:** A separate event-driven process managing contest rooms, chat, and live announcements.

### 3.3 Execution Tier (Remote Code Execution - RCE)
*   **Judge0 Sandbox:** An isolated Linux namespace sandboxing engine that compiles and executes untrusted code. It exposes a callback webhook endpoint to report outcomes asynchronously.

---

## 4. Scalability & High Availability (HA) Model

### 4.1 Stateful WebSockets Horizontal Scaling
Since the stateful Socket.IO server maintains connections for contests and chat rooms, we resolve horizontal scalability by implementing:
*   **Sticky Sessions:** The Application Load Balancer (ALB) directs handshake upgrades from the same user IP to the same container node.
*   **Redis Socket.IO Adapter (`@socket.io/redis-adapter`):** The Socket.IO server instances publish events (e.g. chat messages, contest updates) to a Redis channel. Every socket container listens to Redis, relaying room updates to connected browser clients globally regardless of which server node they are on.

### 4.2 Caching Strategy & Redis Cache-Aside Model
*   **Read-Caching:** Problem listings, descriptions, and user profile badges are cached in Redis with a Time-To-Live (TTL) of 1 hour.
*   **Leaderboard Aggregations:** Leaderboard standings are stored using **Redis Sorted Sets (ZSET)**. This maps the ranking lookup runtime complexity to $O(\log N)$ for writes and $O(1)$ for reads.

---

## 5. Security Architecture

*   **RCE Containment:** Host operating system directories are fully protected. Judge0 drops root privileges, disables DNS/network interfaces, and throttles container CPU execution.
*   **NextAuth Session Audits:** JWT tokens are encrypted using HS256/AES keys stored securely in system environments.
*   **API Security & Firewalls:** The system utilizes a token bucket rate-limiter configuration stored in Redis, blocking connections that exceed 10 submission runs per minute per IP address.
