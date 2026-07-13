# Low-Level Design (LLD) Document - LogiQuest

## 1. Introduction
The Low-Level Design specifies the detailed internal implementation, class structures, algorithms, and design patterns utilized in LogiQuest.

## 2. Design Patterns Utilized

### 2.1 Route Handlers & Service Tier
To separate routing logic from business calculations, LogiQuest utilizes Route Handlers combined with helper services.
- **Route Handlers (`src/app/api/`)**: Handle HTTP request extraction, request validations, and authorization checks.
- **Prisma Client (`src/lib/prisma.ts`)**: Direct database interface, utilizing transactional operations and index-backed queries.

### 2.2 Observer Pattern (Pub/Sub)
Implemented across the Next.js backend and Socket.IO server via Redis.
- **Publisher:** Next.js Webhook API.
- **Subscriber:** Socket.IO Room Manager.
- **Event:** `SUBMISSION_UPDATE`. When a Judge0 payload arrives, the Observer pushes the state to all subscribed clients in a specific `roomId`.

### 2.3 AI Provider Architecture
AI features (Code Coach audits, dynamic editorial generator, and mock interview evaluation) are orchestrated directly through API clients.
- **Gemini SDK (`src/lib/gemini.ts`)**: Invokes Gemini models (e.g. Gemini 2.5 Flash/Pro) using specialized system prompt contexts.
- **System prompts**: Custom prompts analyze compilation logs, runtime outputs, and syntax trees to generate structured step-by-step guidance.

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

  public handleCodeChange(socket: Socket, roomId: string, code: string): void {
    // Broadcasts the updated code buffer to other room participants
    socket.to(roomId).emit('code_update', { code });
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

### 4.2 Contest Leaderboard Ranking (Database Querying)
- Contest standings are calculated dynamically from submission records in the relational database.
- When a query is requested:
  - Fetch user submission metadata (accepted count, timestamp of ACs, failed attempts).
  - Calculate Score = `Number of accepted problems` and Penalty = `Time taken from start + (Failed attempts * 20 mins)`.
  - Order results dynamically by Score (descending), then by Penalty (ascending).

## 5. Error Handling & Validation
- **Callback Validation:** Incoming webhooks from Judge0 are verified via submission tokens. If a webhook payload fails validation, the system drops the request and logs the error, ensuring database integrity.
- **Runtime Rate Limiting:** Utilizes rate-limiting configurations at the middleware level to prevent API exhaustion.
