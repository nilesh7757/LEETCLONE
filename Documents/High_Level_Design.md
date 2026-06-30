# High-Level Design (HLD) Document - LogiQuest

## 1. Introduction
The High-Level Design (HLD) document defines the architecture and system flow for LogiQuest, a highly scalable, real-time code evaluation and collaborative learning platform. The architecture is designed to handle thousands of concurrent users, providing a seamless experience for real-time multiplayer coding, instantaneous AI feedback, and code execution.

## 2. System Architecture Overview

LogiQuest employs a **Microservices-oriented Hybrid Monolith Architecture**. It separates real-time stateful workloads (Socket.IO) from stateless request-response workloads (Next.js) to ensure independent scalability and fault tolerance.

### 2.1 Core Architectural Tiers
1. **Presentation Tier (Client):** Next.js App Router (React 19) serving statically generated (SSG) and server-side rendered (SSR) pages. Monaco Editor is leveraged for the coding environment.
2. **Application Tier (Backend Services):**
   - **Next.js Server Actions & API Routes:** Handles business logic, auth, CRUD operations, and stateless API calls.
   - **Socket.IO Node.js Server:** A dedicated, stateful Node.js server managing WebSocket connections, collaboration rooms, and real-time cursor/code synchronizations.
3. **Execution Tier (Judge0):** A sandboxed container execution environment deployed via Docker to safely compile and run untrusted code.
4. **AI & Inference Tier:** Integrations with Google Gemini and Groq for real-time AST parsing, code audits, and conversational AI mock interviews.
5. **Data & Persistence Tier:**
   - **PostgreSQL:** Primary ACID-compliant relational database.
   - **Redis (Upstash):** High-speed in-memory datastore for caching, rate limiting, and pub/sub message brokering between stateless and stateful tiers.

## 3. Detailed Component Architecture

### 3.1 Next.js Application Server
- **Routing & Rendering:** Utilizes Next.js App Router. Pages like `/problems` are ISR (Incremental Static Regeneration) cached, while `/problems/[id]/workspace` are SSR or Client-side rendered to fetch real-time state.
- **Authentication:** NextAuth.js implements OAuth 2.0 (Google, GitHub) and JWT-based session management.

### 3.2 Real-Time Collaboration Engine
- **State Synchronization:** Uses Operational Transformation (OT) or CRDTs (Conflict-free Replicated Data Types) via Yjs to resolve concurrent code edits in the Monaco editor.
- **Redis Pub/Sub:** Since the Socket.IO server may horizontally scale to multiple instances, Redis Pub/Sub acts as a backplane. When User A (on Node 1) types, Node 1 publishes the change to Redis. Node 2 receives it and emits it to User B in the same collaboration room.

### 3.3 Remote Code Execution (RCE) Engine
- **Sandboxing:** Code is sent via HTTP REST to Judge0, which uses `isolate` (Linux kernel namespaces, cgroups) to securely execute code with strict CPU time limits, memory limits, and disabled network access.
- **Asynchronous Webhooks:** To avoid blocking threads, Next.js fires the payload to Judge0 with a `webhook_url`. Judge0 executes the code and POSTs the result back to the Next.js Webhook handler. Next.js saves to PostgreSQL and triggers a Redis event, which the Socket server catches to notify the client.

## 4. Scalability and High Availability (HA) Strategies

### 4.1 Horizontal Scaling
- **Stateless Next.js Nodes:** Deployed on Vercel, scaling instantly from 0 to N nodes based on HTTP traffic.
- **Stateful Socket Nodes:** Deployed on container orchestration (e.g., Kubernetes/AWS ECS) behind an Application Load Balancer with sticky sessions enabled.

### 4.2 Caching Strategy (Redis)
- **Problem Descriptions & Leaderboards:** Cached in Redis with a TTL of 1 hour. Leaderboards use Redis Sorted Sets (`ZADD`, `ZREVRANGE`) for O(log(N)) insertions and O(1) reads for top-K players.
- **Session Caching:** JWT sessions are validated without hitting PostgreSQL for every API request.

## 5. Security Posture
- **Code Execution Security:** Strict unprivileged user execution, restricted `/tmp` file access, drop all Linux capabilities (`cap_drop`).
- **Network Security:** TLS 1.3 across all endpoints. CORS restricted to allowed domains. WebSockets protected by origin checks and JWT verification upon upgrade request.
- **Rate Limiting:** Redis-based token bucket algorithm preventing API abuse and brute-force attacks (max 10 submissions/minute per user).

## 6. Disaster Recovery & Backups
- **PostgreSQL:** Write-Ahead Logging (WAL) enabled with automated nightly snapshots and Point-in-Time Recovery (PITR) up to 7 days.
- **Redis:** Configured with AOF (Append-Only File) persisting every second to avoid data loss on Socket/Leaderboard states.
