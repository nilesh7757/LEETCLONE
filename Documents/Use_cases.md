# System Use Cases - LogiQuest

## 1. Introduction
This document defines the behavioral specifications of **LogiQuest** via detailed use cases. Each use case maps the step-by-step interaction between system actors and system boundaries.

---

## 2. Detailed Use Cases

### UC-1: Solve a Coding Problem
*   **Primary Actor:** Registered Learner
*   **Preconditions:**
    1.  The user is authenticated and logged in.
    2.  The target problem status is set to `PUBLISHED`.
*   **Postconditions:**
    1.  The submission database table contains a new evaluation record.
    2.  The user's progress metrics (streaks, solved count) are updated in real-time.
*   **Basic Flow (Success Path):**
    1.  User views the problem list page and selects a specific problem.
    2.  System loads the workspace, mounting the problem details alongside the Monaco editor prepopulated with starter code.
    3.  User writes their solution in the editor pane.
    4.  User clicks **Run Code** to verify compilation against standard visible test inputs.
    5.  System sends the payload to Judge0 and displays execution metrics (outputs vs expected outputs).
    6.  User clicks **Submit**.
    7.  System evaluates the submission asynchronously against hidden test cases.
    8.  System writes results to PostgreSQL and publishes a Redis event.
    9.  System receives results and displays the successful `ACCEPTED` verdict to the user.
*   **Alternative Flows:**
    *   *Alt Flow 1a: Compilation/Runtime Error:* In step 5 or 7, if the sandbox returns compilation errors (`CE`) or runtime crashes (`RE`), the system displays the full trace log inside the compiler terminal panel and sets status to corresponding error.
    *   *Alt Flow 1b: Limit Exceeded (TLE/MLE):* In step 7, if code exceeds limits, the system interrupts the thread and outputs a `Time Limit Exceeded` or `Memory Limit Exceeded` verdict.
    *   *Alt Flow 1c: Submission Rate Limit Triggered:* If the user attempts more than 10 submissions in 60 seconds, the rate-limiter interrupts step 6, returning a `429 Too Many Requests` modal.

---

### UC-2: Run an AI Mock Interview Session
*   **Primary Actor:** Job Candidate
*   **Preconditions:**
    1.  Candidate is logged in.
    2.  Gemini API is online.
*   **Postconditions:**
    1.  A mock interview conversation log is saved.
    2.  An analytics review report is generated and linked to the user's dashboard.
*   **Basic Flow (Success Path):**
    1.  Candidate navigates to **Mock Interview Panel** and selects a category (e.g., "Dynamic Programming").
    2.  System initiates the conversational interface and presents a coding problem description.
    3.  Candidate enters their initial approach outline in the chat interface.
    4.  AI agent processes the text and validates the algorithmic efficiency.
    5.  Once the logic is validated, AI unlocks the Monaco editor.
    6.  Candidate writes the code and clicks **Evaluate**.
    7.  AI reviews the code for styling issues, complexity markers, and edge case coverage.
    8.  AI asks follow-up questions to test candidate's communication.
    9.  Candidate submits final answer. AI closes the session and generates a feedback report showing metrics (communication, optimization, bugs).
*   **Alternative Flows:**
    *   *Alt Flow 2a: Requesting Hints:* Candidate can type `/hint` in the chat. AI intercepts and provides a conceptual guidance prompt without revealing the code.
