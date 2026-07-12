# Software Requirements Specification (SRS) - Functional Requirements

## 1. Introduction

This document details the complete functional requirements (FRs) for **LogiQuest**. Each requirement is uniquely identified with a tracking ID and contains descriptions of input criteria, system operations, and expected output states.

---

## 2. User Authentication & Profile System

### 2.1 Identity Management
*   **FR-AUTH-01 (Multi-Provider Authentication):** The system shall support secure user logins using standard social OAuth 2.0 (Google, GitHub) and email-password credentials managed via NextAuth.
*   **FR-AUTH-02 (Password Security):** For credential-based users, the system must encrypt passwords using bcrypt hashing with a salt factor of 10 prior to database write.
*   **FR-AUTH-03 (One-Time Password / OTP):** The system shall generate and send 6-digit OTP codes via email (Nodemailer) for password recovery and account verification workflows.

### 2.2 Role-Based Access Control (RBAC)
*   **FR-AUTH-04 (Access Level Roles):** The system must assign one of three distinct access control tiers upon user creation:

| Role | Authorizations | Access Limits |
| :--- | :--- | :--- |
| **`USER`** | Solves problems, joins contests, posts comments/blogs. | Restrict access to problem creation and global system metrics. |
| **`MODERATOR`** | Solves problems, deletes flagged posts, approves community problems. | Cannot access system logs, create official contests, or change user roles. |
| **`ADMIN`** | Full CRUD on problems, contests, user accounts, and system parameters. | Direct access to all metrics, global database administration, and analytics. |

### 2.3 User Profile & Gamification
*   **FR-AUTH-05 (Streaks Tracking):** The system shall increment a user's daily streak count when they submit a solution that passes all test cases (status `ACCEPTED`) within a 24-hour UTC block. If no accepted submission occurs within a 24-hour block, the streak must reset to 0.
*   **FR-AUTH-06 (Achievement Badges):** The system shall automatically award achievement badges (e.g., "First Accept", "100 Solves", "Arena Master") when a user matches predefined SQL queries in the database.
*   **FR-AUTH-07 (Elo Rating system):** The system shall display a user's contest history, listing all attended contests and rating changes plotted over time using Recharts.

---

## 3. Core Problem Solving & Workspace

### 3.1 Problem Directory
*   **FR-PROB-01 (Filtering & Pagination):** The system shall provide a search catalog for coding tasks. Users must be able to filter by difficulty (Easy, Medium, Hard), Category (Arrays, DP, Graphs), status (Unsolved, Solved, Attempted), and search terms.
*   **FR-PROB-02 (Boilerplate Generation):** The workspace must load starter boilerplates for the selected programming language (Python, C++, JS, Java) and database engine (SQL/SQLite).

### 3.2 Code Editor Environment
*   **FR-PROB-03 (Monaco Integration):** The workspace shall feature a fully integrated **Monaco Editor** interface supporting:
    *   Syntactical autocomplete and code suggestions.
    *   Toggling code themes (e.g., dark, light).
    *   Setting code layouts (e.g., vertical split, horizontal split).
*   **FR-PROB-04 (Draft Autosave):** The client shall save the active code draft to the browser's LocalStorage every 5 seconds to prevent accidental data loss.

### 3.3 Code Execution Engine
*   **FR-PROB-05 (Local Execution - Run):** When a user clicks "Run Code", the system shall send the code and default test cases to Judge0. The response must display:
    *   Status (Accepted, Failed, CE, RE).
    *   Standard Input (stdin).
    *   User output compared line-by-line with the expected output.
    *   Execution time (ms) and memory usage (kb).
*   **FR-PROB-06 (Official Evaluation - Submit):** When a user clicks "Submit", the system shall send the code to Judge0 to run against all hidden and visible test cases.
*   **FR-PROB-07 (Execution Limits):** The system must enforce code execution limits at the container level:
    *   Maximum CPU Time Limit: 2.0 seconds (customizable per problem).
    *   Maximum Memory Limit: 256MB (customizable per problem).
    *   Disabled network interfaces.

---

## 4. Contest Arena

*   **FR-COMP-01 (Contest Management):** Admins must be able to schedule future contests. A contest consists of:
    *   Start time, End time, Registration windows.
    *   A set of problems with assigned weights/points.
*   **FR-COMP-02 (Registrations):** Users must register for a contest before the start time to participate.
*   **FR-COMP-03 (Real-Time Leaderboards):** During a live contest, the system shall compute scoring based on:
    *   Points awarded per problem solved.
    *   Time penalty (minutes taken from contest start to successful submission + 20 penalty minutes per failed submission).
*   **FR-COMP-04 (Announcements):** Contest admins shall be able to broadcast dynamic announcements, which will appear instantly as modal notifications for all active contest participants.

---

## 5. AI Agent Workspace

*   **FR-AI-01 (Automated AST Code Audit):** When a user triggers an audit for an accepted submission, the system shall call Gemini Pro / Groq to perform:
    *   Time and Space complexity evaluations (Big-O notation).
    *   Anti-pattern detection (e.g., nested loops, redundant allocations).
    *   Code optimization suggestions.
*   **FR-AI-02 (Interactive Mock Interview):** The system shall support a conversational mock interview room. The AI agent will:
    *   Select a random problem from the user's target difficulty.
    *   Engage in a structured chat to ask the user to explain their logic first.
    *   Block compilation until the user outlines a valid algorithmic approach.
    *   Provide progressive hints if requested, without revealing the solution directly.
    *   Generate a final scoring summary mapping communication skills, code correctness, and optimal approach selection.

---

## 6. Architect & Vetting Tools (Problems Editor)

*   **FR-ARCH-01 (Problem Composer):** Verified users with Moderator or Admin status shall be able to create new draft problems, write editorial explanations, and specify visible/hidden test cases.
*   **FR-ARCH-02 (Sandbox Verification):** The system shall reject drafts unless the creator writes a verified reference solution that passes 100% of the specified test cases in the sandbox environment.
*   **FR-ARCH-03 (Vetting Lifecycle):** A new problem must traverse a controlled lifecycle:
    `Draft` ➡️ `Vetting` (Moderators attempt to solve/break test cases) ➡️ `Published` (Available to all users).
