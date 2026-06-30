# Low-Level Design (LLD) Document - LogiQuest

## 1. Introduction
The Low-Level Design specifies the detailed internal implementation, class structures, algorithms, and design patterns utilized in LogiQuest.

## 2. Design Patterns Utilized

### 2.1 Repository & Service Pattern
To decouple the business logic from the Next.js routing and Prisma ORM, LogiQuest implements a Service Layer.
- **ProblemService.ts**: Contains methods like `getProblemById`, `submitSolution`.
- **ProblemRepository.ts**: Handles Prisma queries. The Service calls the Repository, abstracting DB specifics.

### 2.2 Observer Pattern (Pub/Sub)
Implemented across the Next.js backend and Socket.IO server via Redis.
- **Publisher:** Next.js Webhook API.
- **Subscriber:** Socket.IO Room Manager.
- **Event:** `SUBMISSION_UPDATE`. When a Judge0 payload arrives, the Observer pushes the state to all subscribed clients in a specific `roomId`.

### 2.3 Strategy Pattern (AI Integration)
The system supports multiple LLMs (Gemini, Groq, OpenAI). The `AIService` class utilizes the Strategy Pattern:
- `IAIProvider` interface defines `generateAudit(prompt: string)`.
- `GeminiProvider` and `GroqProvider` implement this interface.
- This allows hot-swapping AI providers based on rate limits or subscription tiers without rewriting business logic.

## 3. Core Modules & Class Interfaces

### 3.1 Code Execution Module

```typescript
interface ISubmissionPayload {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit: number;
  memory_limit: number;
}

class JudgeZeroService {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl: string, apiKey: string) {}

  public async submitBatch(submissions: ISubmissionPayload[], callbackUrl: string): Promise<string[]> {
    // 1. Constructs Judge0 batch submission payload
    // 2. Injects callback_url
    // 3. POST /submissions/batch
    // 4. Returns array of submission tokens
  }
}
```

### 3.2 Real-Time Collaboration Module (Socket.io)

```typescript
class CollaborationRoomManager {
  // Map of roomId to set of UserSocketIds
  private rooms: Map<string, Set<string>> = new Map();
  
  public joinRoom(socket: Socket, roomId: string, userDetails: User): void {
    socket.join(roomId);
    this.rooms.get(roomId).add(socket.id);
    // Broadcast user joined
    socket.to(roomId).emit('user_joined', userDetails);
  }

  public handleCodeChange(socket: Socket, roomId: string, delta: any): void {
    // CRDT / Yjs integration point for conflict resolution
    socket.to(roomId).emit('code_delta_update', delta);
  }
}
```

## 4. Algorithmic Workflows

### 4.1 Evaluation Algorithm
When a user submits code against a problem with 50 test cases:
1. Fetch all test cases for `problemId`.
2. Construct a batch payload of 50 execution requests for Judge0.
3. Upon asynchronous webhook callbacks, aggregate results into a `SubmissionResult` object.
4. **Status Mapping Logic:**
   - If any `status == 4 (WA)`, overarching status is `WA`.
   - If any `status == 5 (TLE)`, overarching status is `TLE`.
   - If all `status == 3 (AC)`, overarching status is `AC`.
5. Only if overarching status is `AC`, trigger `UserRatingService.updateRating(userId)`.

### 4.2 Contest Leaderboard Ranking (Redis ZSET)
- Each contest has a key: `contest:{contestId}:leaderboard`.
- When a user solves a problem:
  - Calculate Penalty = `Time taken from start + (Failed attempts * 20 mins)`.
  - Score = `Number of accepted problems`.
  - Redis sorted set ranks by score (descending), then by penalty (ascending).
- To achieve multi-factor sorting in a single ZSET score: `(Score * 10000000) - Penalty`. Thus, higher score wins.

## 5. Error Handling & Retry Mechanisms
- **Exponential Backoff:** If Judge0 API is rate-limited (HTTP 429), the Next.js service employs an exponential backoff retry up to 3 times (1s, 2s, 4s).
- **Dead Letter Queue (DLQ):** Failed asynchronous callbacks are pushed to a Redis DLQ for manual inspection, ensuring no lost submissions.
