# Agile User Stories - LogiQuest

## Epic 1: Problem Solving & Workspace

### US-1.1: Advanced Problem Filtering
*   **Statement:**
    > **As a** registered learner,
    > **I want to** filter and sort coding problems by difficulty, category, and solve-status,
    > **so that** I can focus on targeted concepts during practice sessions.
*   **Acceptance Criteria:**
    *   **AC 1:** Given a user is on the problems directory page, when they click "Medium" difficulty, the list must only render problems with medium difficulty tag.
    *   **AC 2:** When selecting a specific category tag (e.g., "Dynamic Programming"), the list must filter recursively to match the selection.
    *   **AC 3:** The URL search parameters must update dynamically (e.g., `/problems?difficulty=MEDIUM&tag=dp`) to allow direct link sharing.

### US-1.2: Code Compilation & Verification
*   **Statement:**
    > **As a** coder,
    > **I want to** execute code drafts against sample and hidden inputs inside an embedded code editor,
    > **so that** I can verify solution correctness instantly.
*   **Acceptance Criteria:**
    *   **AC 1:** Given a user has entered code in the Monaco Editor, when they click "Run Code", the terminal pane must output the compilation log and execution time.
    *   **AC 2:** When clicking "Submit", the editor must block writing, send the payload to Judge0, and update the UI with status updates (`PENDING` -> `RUNNING` -> `ACCEPTED` or error state).

---

## Epic 2: AI Interview Preparation

### US-2.1: AI-Powered Oral & Coding Mock Interview
*   **Statement:**
    > **As a** job seeker,
    > **I want to** undergo a mock interview session led by an AI agent,
    > **so that** I can practice speaking through my logic and solving challenges under pressure.
*   **Acceptance Criteria:**
    *   **AC 1:** Given a candidate starts an interview, the AI must display the problem statement but keep the code editor disabled.
    *   **AC 2:** The candidate must provide an overview of their approach in chat. If the AI validates the approach, the editor must become writeable.
    *   **AC 3:** When the candidate runs code, the AI must inspect the output structure and query the user about potential optimization improvements.

---

## Epic 3: Gamification & Engagement

### US-3.1: Daily Streak Preservation
*   **Statement:**
    > **As a** learner,
    > **I want to** maintain a daily streak counter,
    > **so that** I am motivated to solve coding challenges daily.
*   **Acceptance Criteria:**
    *   **AC 1:** Given a user submits an `ACCEPTED` solution, the system must check their last solve timestamp. If it is within 24 hours of the current day, increment streak count by 1.
    *   **AC 2:** If the user fails to submit an accepted solution within a calendar day, the streak must reset to 0 upon their next login.
