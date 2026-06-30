# Software Requirements Specification (SRS) - Functional Requirements

## 1. Introduction
This document defines the functional requirements for LogiQuest. It specifies the software behaviors, user interactions, and system responses required to deliver a comprehensive competitive programming and interview preparation platform.

## 2. User Authentication and Account Management
- **FR-AUTH-01 (OAuth 2.0 Integration):** The system shall allow users to authenticate securely using Google and GitHub OAuth providers via NextAuth.
- **FR-AUTH-02 (Credential Auth):** The system shall support traditional email/password registration with bcrypt-secured hashing.
- **FR-AUTH-03 (Role-Based Access Control):** The system shall enforce three user tiers:
  - `USER`: Can solve problems, join contests, and participate in discussions.
  - `MODERATOR`: Can vet user-submitted problems and manage community posts.
  - `ADMIN`: Full access to create official contests, manage all users, and view system analytics.
- **FR-AUTH-04 (Profile Management):** Users shall be able to view their coding history, contest ratings (Elo system), daily streaks, and earned achievement badges.

## 3. Core Problem Solving Engine (Workspace)
- **FR-PROB-01 (Problem Repository):** The system shall display a paginated catalog of problems, sortable by difficulty (Easy/Medium/Hard) and filterable by tags (e.g., Array, Dynamic Programming).
- **FR-PROB-02 (Integrated Editor):** The system shall embed the Monaco Editor, providing syntax highlighting, auto-indentation, and basic autocomplete for JavaScript, Python, C++, Java, and SQL.
- **FR-PROB-03 (Local Execution):** Users shall be able to click "Run Code" to execute their code against standard example test cases, receiving output, compilation errors, or runtime errors directly in the UI.
- **FR-PROB-04 (Submission Evaluation):** Users shall be able to click "Submit" to evaluate their code against hidden test cases. The system shall evaluate the code securely via the Judge0 engine.
- **FR-PROB-05 (Evaluation Statuses):** The system shall correctly identify and return standard algorithmic statuses: Accepted (AC), Wrong Answer (WA), Time Limit Exceeded (TLE), Memory Limit Exceeded (MLE), Compilation Error (CE), and Runtime Error (RE).

## 4. Real-Time Collaboration & Multiplayer Modes
- **FR-COLLAB-01 (Pair Programming):** The system shall allow users to generate a unique "Collaboration Room" link and invite peers.
- **FR-COLLAB-02 (State Synchronization):** The system shall synchronize code edits in real-time between all participants in a room using Operational Transformation to prevent race conditions.
- **FR-COLLAB-03 (Live Chat):** Collaboration rooms shall feature an integrated real-time text chat window powered by Socket.IO.

## 5. Contest and Arena Management
- **FR-COMP-01 (Contest Creation):** Admins shall be able to create a contest by defining a start time, end time, and attaching a set of problems with assigned point values.
- **FR-COMP-02 (Live Leaderboard):** During an active contest, the system shall maintain a dynamically updating leaderboard ranking participants based on points scored and time penalties.
- **FR-COMP-03 (Rating Updates):** Upon contest conclusion, the system shall automatically recalculate and apply Elo rating changes to all participants.

## 6. AI & Interview Simulator
- **FR-AI-01 (Code Audit):** Upon a successful code submission, users shall have the option to request an "AI Code Audit", providing them with AST-based feedback on cyclomatic complexity, variable naming, and refactoring suggestions.
- **FR-AI-02 (Mock Interviewing):** The system shall simulate a technical interview via a conversational AI interface. The AI will pose a problem, require the user to explain their approach before coding, and provide hints dynamically based on the user's progress.
