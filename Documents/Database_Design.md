# Database Schema & Data Modeling Document - LogiQuest

## 1. Introduction
This document defines the relational data models for LogiQuest using PostgreSQL via Prisma ORM. It details the Entity-Relationship rules, indexing strategies, and normalization principles designed to handle high-frequency reads (leaderboards) and writes (submissions).

## 2. Entity-Relationship (ER) Schema

The database utilizes a highly normalized schema with over 30 core models partitioned into logical domains to isolate state, manage transaction locks, and optimize indexes:

### 2.1 User & Social Domain
- **`User`**: Central profile storing identity, password hashes, and aggregated stats (rating, arcadePoints, streak, solvedCount).
- **`UserBadge` & `Badge`**: Tracks gamified unlockable credentials.
- **`Account` / `Session`**: Managed link credentials for NextAuth integrations.

### 2.2 Problem & Content Domain
- **`Problem`**: Central algorithm records storing metadata, difficulty, category, tags, and embedded `testSets` (JSON representation containing `input`, `expectedOutput`, and `isExample`).
- **`LearningResource`**: Reference materials linked to coding problems.

### 2.3 Submissions & RCE Domain
- **`Submission`**: Detailed record of user attempts, storing the raw `code`, target `language` name, final execution `status` (e.g. AC, TLE, WA), float `runtime` duration, and dynamic `testCaseResults` JSON metadata.
- **`Draft`**: Caches active editor sessions.

### 2.4 Competitive & Collaborative Arena Domain
- **`Contest`**: Stores contest metadata, duration parameters, and status indicators.
- **`ContestRegistration`**: Links registered users to active contests.
- **`UserRatingHistory`**: Records historical contest performances and rating fluctuations.

### 2.5 Communication & Social Domain
- **`Conversation` & `Message`**: Coordinates peer-to-peer real-time chat.
- **`Comment` & `CommentVote`**: Nested forums for problem discussions.
- **`Notification`**: Direct developer updates.
- **`Report`**: User feedback system flag reports.

## 3. Indexing & Optimization Strategy

### 3.1 B-Tree Indexes
- `idx_submission_user_problem`: Composite index on `Submission(userId, problemId)` to rapidly calculate whether a user has solved a specific problem (O(log N) lookup).
- `idx_problem_difficulty_published`: Composite index on `Problem(difficulty, isPublished)` for rapid rendering of the main problems pagination UI.

### 3.2 Full-Text Search Recommendation
- To support advanced text search scale, a PostgreSQL `tsvector` index on `Problem.description` and `Problem.title` is recommended. Currently, queries utilize standard SQL patterns.

## 4. Archival & Partitioning Recommendations
- **Range Partitioning:** As the `Submission` table scales, implementing table partitioning based on the `createdAt` timestamp (Monthly intervals) is recommended to isolate recent records.

---

## 5. Capacity & Scaling Analysis (Documented Constraints)
*   **Test Case Schema Limits (`testSets` Json):** Storing test cases as a JSON blob inside the `Problem` table works efficiently for 10–25 test cases per problem. If a problem scales beyond 25 test cases, it should be migrated to a dedicated, normalized `TestCase` relational table to avoid document bloat and slow read queries on the `Problem` table.
*   **Recommended Scale:** 15–25 test cases per problem is the reliable range with the current relational-embedded architecture.
