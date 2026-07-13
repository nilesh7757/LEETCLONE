# API Specification & Design Document - LogiQuest

## 1. Introduction
This document details the REST API endpoints and WebSocket event specifications for LogiQuest. The API follows a strict JSON structure, utilizes standard HTTP status codes, and enforces session-based cookie authentication.

## 2. API Global Standards

### 2.1 Authentication & Authorization
All secured endpoints require valid session-based cookies managed automatically by NextAuth.js.
- **Roles:** Verified through the server session payload (e.g. `user.role === "ADMIN"` or `"USER"`).

### 2.2 Standard Error Response
```json
{
  "success": false,
  "error": "Error details or message description"
}
```

## 3. REST Endpoints

### 3.1 Problem Domain
#### `GET /api/problems`
Fetches a paginated, filterable list of coding and SQL problems.
- **Query Params:**
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
  - `difficulty` (Easy | Medium | Hard)
  - `category` (string, e.g., "Binary Search")
  - `tags` (string, comma-separated tags)
- **Response (200 OK):**
```json
{
  "problems": [
    {
      "id": "uuid-1234",
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "Easy",
      "category": "Array",
      "tags": ["Array", "Hash Table"]
    }
  ],
  "pagination": {
    "total": 62,
    "page": 1,
    "limit": 10,
    "pages": 7
  }
}
```

#### `GET /api/problems/[slug]/details`
Retrieves detailed problem metadata including description, templates, and active user drafts.
- **Response (200 OK):** Problem entity with descriptions, base boilerplate coding templates, constraints, and public example test sets.

### 3.2 Submission & Code Execution Domain
#### `POST /api/submission`
Submits code for evaluation against a problem. Executes sandboxed test suites via Judge0 asynchronously and triggers progress tracking.
- **Payload:**
```json
{
  "problemId": "uuid-1234",
  "language": "python",
  "code": "def twoSum(nums, target):\n    return []"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "submission": {
    "id": "sub-9876",
    "status": "Accepted",
    "runtime": 35.2,
    "testCaseResults": [
      {
        "status": "Accepted",
        "runtime": 35.2
      }
    ]
  }
}
```

#### `POST /api/run`
Runs code against custom sample test inputs without creating an official submission.
- **Payload:**
```json
{
  "code": "...",
  "language": "javascript",
  "problemId": "uuid-1234",
  "customInput": "..."
}
```
- **Response (200 OK):** Compiled output stdout, execution status, and runtime metrics.

### 3.3 AI Audits
#### `GET /api/submission/[id]/complexity`
Retrieves dynamic AI audit complexity analysis and feedback for a submission.
- **Response (200 OK):** Returns structured analysis containing time complexity, space complexity, and specific refactoring guidelines.

## 4. WebSocket (Socket.IO) Protocol

### 4.1 Connection & Configuration
- **Connection URL:** Configured dynamically via `NEXT_PUBLIC_SOCKET_URL` (defaults to `localhost:3001` in local development).
- **Handshake:** Connection established on the default namespace.

### 4.2 Collaboration Events
- **Client Emits:**
  - `join_collab({ roomId, username, image, dbUserId })`: Registers the user's socket to a collaborative editing workspace.
  - `code_update({ roomId, code, language })`: Broadcasts the active source code buffer update to all peer programmers in the workspace.
  - `cursor_move({ roomId, position, username })`: Transmits cursor movements (`{ row, column }`) to display real-time peer positions.
  - `leave_collab({ roomId })`: Explicitly unsubscribes from the active editor session.
- **Server Emits (Broadcast):**
  - `user_joined({ username, socketId })`: Notifies the room that a new collaborator has joined.
  - `code_update({ code, language })`: Relays the updated code buffer to other room participants.
  - `cursor_move({ position, username })`: Broadcasts peer cursor positions.
  - `collaborators_change(updatedList)`: Pushes list updates of active session users.
