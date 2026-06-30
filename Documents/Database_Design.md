# Database Schema & Data Modeling Document - LogiQuest

## 1. Introduction
This document defines the relational data models for LogiQuest using PostgreSQL via Prisma ORM. It details the Entity-Relationship rules, indexing strategies, and normalization principles designed to handle high-frequency reads (leaderboards) and writes (submissions).

## 2. Entity-Relationship (ER) Schema

### 2.1 User Domain
**Table: `User`**
Stores core user identity, credentials, and global rating.
- `id` (UUID, Primary Key)
- `email` (String, UNIQUE, Indexed)
- `username` (String, UNIQUE, Indexed)
- `passwordHash` (String, Nullable for OAuth)
- `rating` (Integer, Default 1500)
- `role` (Enum: USER, MODERATOR, ADMIN)
- `createdAt` / `updatedAt` (DateTime)

**Table: `Session` / `Account`** (Managed by NextAuth)
Standard OAuth linking tables for Google/GitHub integrations.

### 2.2 Problem Domain
**Table: `Problem`**
- `id` (UUID, Primary Key)
- `title` (String, Indexed)
- `slug` (String, UNIQUE, Indexed) - Used for SEO-friendly URLs (`/problems/two-sum`)
- `description` (Text)
- `difficulty` (Enum: EASY, MEDIUM, HARD)
- `timeLimit` (Float, seconds)
- `memoryLimit` (Integer, MB)
- `isPublished` (Boolean, Default: false)

**Table: `ProblemTags` (Many-to-Many)**
Junction table linking `Problem` to a `Tag` table (e.g., Dynamic Programming, Arrays).

**Table: `TestCase`**
- `id` (UUID, Primary Key)
- `problemId` (UUID, Foreign Key -> Problem, Indexed)
- `stdin` (Text)
- `expectedOutput` (Text)
- `isHidden` (Boolean) - Hidden test cases are not shown to users.

### 2.3 Submission & Execution Domain
**Table: `Submission`**
The highest frequency write-table. Highly indexed for analytical queries.
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key -> User, Indexed)
- `problemId` (UUID, Foreign Key -> Problem, Indexed)
- `languageId` (Integer)
- `sourceCode` (Text)
- `statusId` (Integer, mapped to Judge0 statuses, e.g., 3=AC, 4=WA)
- `executionTimeMs` (Float)
- `memoryUsedKb` (Integer)
- `createdAt` (DateTime, Indexed for time-series querying)

### 2.4 Contest Domain
**Table: `Contest`**
- `id` (UUID, Primary Key)
- `title` (String)
- `startTime` (DateTime, Indexed)
- `endTime` (DateTime, Indexed)

**Table: `ContestProblem` (Many-to-Many)**
- `contestId` (UUID, FK -> Contest)
- `problemId` (UUID, FK -> Problem)
- `points` (Integer) - Dynamic scoring weight per problem.

**Table: `ContestRegistration`**
- `contestId` (UUID)
- `userId` (UUID)
- Composite Primary Key `(contestId, userId)`

## 3. Indexing & Optimization Strategy

### 3.1 B-Tree Indexes
- `idx_submission_user_problem`: Composite index on `Submission(userId, problemId)` to rapidly calculate whether a user has solved a specific problem (O(log N) lookup).
- `idx_problem_difficulty_published`: Composite index on `Problem(difficulty, isPublished)` for rapid rendering of the main problems pagination UI.

### 3.2 Full-Text Search
- PostgreSQL `tsvector` column is generated on the `Problem.description` and `Problem.title` fields to support highly efficient full-text searching (e.g., searching for "binary tree traversal").

## 4. Archival & Partitioning Strategies
- The `Submission` table will grow exponentially. A table partitioning strategy based on `createdAt` (Partitioning by Range: Monthly) is recommended to ensure query performance on recent submissions remains fast, while older data is archived.
