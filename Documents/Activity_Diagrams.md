# Activity Diagrams & Workflows - LogiQuest

This document details the functional workflows of the **LogiQuest** platform. Each diagram outlines the interaction sequence, logical conditions, and data transactions between users, system services, database engines, and third-party APIs.

---

## 1. Code Execution & Submission Lifecycle

This workflow tracks the process of running and submitting code, showcasing how stateless Next.js routes, background Judge0 containers, Redis Pub/Sub, and Socket.IO servers coordinate to update the client workspace.

```mermaid
graph TD
    Start([User clicks Submit]) --> LimitCheck{Check Redis Rate Limit}
    LimitCheck -->|Exceeded| Blocked[Show 429 Too Many Requests Modal]
    LimitCheck -->|OK| CreatePending[Create PENDING Submission in PostgreSQL]
    CreatePending --> SendToJudge0[Send code + test cases to Judge0 API]
    SendToJudge0 --> PendingWait[Client displays submission spinner]
    
    %% Judge0 Asynchronous processing
    SendToJudge0 -.-> Judge0Exec[Judge0 sandboxed execution]
    Judge0Exec --> WebhookTrigger[Trigger Next.js Webhook /api/v1/webhooks/judge0]
    
    %% Webhook handling
    WebhookTrigger --> ProcessVerdict[Map execution results & compute overall status]
    ProcessVerdict --> UpdateDB[Update Submission status in PostgreSQL]
    UpdateDB --> RedisPub[Publish verdict message to Redis Pub/Sub channel]
    RedisPub --> SocketCatch[Socket.IO server intercepts Redis channel message]
    SocketCatch --> ClientPush[Emit submission_update event to client WebSocket]
    
    PendingWait --> ClientSync{Receive WebSocket event?}
    ClientPush --> ClientSync
    ClientSync -->|Yes| UpdateUI[Update Code Workspace UI: Show status Accepted/WA/TLE/MLE]
    ClientSync -->|Timeout / No Event| PollingFallback[Fallback: Client polls REST API status]
    PollingFallback --> UpdateUI
    UpdateUI --> End([Process Completed])
```

---

## 2. Contest Arena Scheduling & Leaderboard Scoring

This workflow models the lifecycle of user registrations, score penalty adjustments during active solving phases, Redis Sorted Set leaderboard calculations, and post-contest Elo rating updates.

```mermaid
graph TD
    StartContest([Contest scheduled by Admin]) --> Register[Users register before startTime]
    Register --> ContestStart{Check start time}
    ContestStart -->|Not Started| Lobby[Display countdown timer]
    ContestStart -->|Started| UnlockProblems[Unlock problem workspace for registered users]
    
    %% Solving loop
    UnlockProblems --> SolveLoop[Submit solution for contest problem]
    SolveLoop --> ScoreCheck{Verdict == ACCEPTED?}
    ScoreCheck -->|No| AddPenalty[Add 20-minute penalty to user dashboard]
    ScoreCheck -->|Yes| AddPoints[Award problem points]
    
    AddPenalty --> CalcScore[Recalculate score = points - total penalty]
    AddPoints --> CalcScore
    
    CalcScore --> UpdateLeaderboard[Update Redis Sorted Set ZSET scores]
    UpdateLeaderboard --> BroadcastLeaderboard[Broadcast updated standings to Socket.IO contest room]
    BroadcastLeaderboard --> ShowLiveStandings[Clients display real-time leaderboard]
    
    UnlockProblems --> TimerCheck{Check end time}
    TimerCheck -->|Active| SolveLoop
    TimerCheck -->|Ended| EndContest[Freeze leaderboard & block further submissions]
    EndContest --> EloUpdate[Calculate Elo ratings change for all participants]
    EloUpdate --> CommitRatings[Write updated ratings to PostgreSQL profiles]
```

---

## 3. AI Mock Interview Simulator

This workflow maps the multi-stage interactive mock interview, showing how the candidate's strategic strategy discussion acts as a gate to unlock the code editing board.

```mermaid
graph TD
    StartMock([Candidate starts AI Mock Interview]) --> SelectTopic[Select DSA category & difficulty]
    SelectTopic --> SelectProblem[AI selects matching problem]
    SelectProblem --> RenderStatement[Display problem statement in candidate view]
    RenderStatement --> LockEditor[Lock Monaco editor - typing disabled]
    
    LockEditor --> AskApproach[AI asks candidate to explain strategy in chat]
    AskApproach --> CandidatesChat[Candidate types conceptual solution]
    CandidatesChat --> CheckStrategy{AI validates logic?}
    CheckStrategy -->|Invalid / Suboptimal| SuggestHint[AI provides hints and guides candidate]
    SuggestHint --> AskApproach
    CheckStrategy -->|Valid| UnlockEditor[AI unlocks Monaco Editor for writing]
    
    UnlockEditor --> WriteCode[Candidate writes code solution]
    WriteCode --> ExecuteCode[Candidate runs code against inputs]
    ExecuteCode --> ReviewCode{AI audits execution results}
    ReviewCode -->|Bugs / Logic flaws| AskFollowUp[AI asks follow-up questions in chat]
    AskFollowUp --> CandidatesChat
    ReviewCode -->|Correct & Optimal| FinishSession[Candidate completes interview]
    
    FinishSession --> GenerateReport[AI streams detailed score review and creates custom Study Plan]
    GenerateReport --> SaveHistory[Save interview history in PostgreSQL]
```

---

## 4. Architect & Vetting Pipeline

This workflow details the validation lifecycle required to compile and verify problems before moderators approve them for public access.

```mermaid
graph TD
    StartVet([Admin/Moderator creates draft problem]) --> FillMetadata[Define description, limits, and test cases]
    FillMetadata --> WriteRef[Write reference solution in target language]
    WriteRef --> RunSandbox[Compile reference solution in Judge0 sandbox]
    RunSandbox --> VerifyTests{Reference solution passes all test cases?}
    VerifyTests -->|No| FixProblem[Fix description, test cases, or reference code]
    FixProblem --> WriteRef
    VerifyTests -->|Yes| SaveDraft[Save problem state as VETTING]
    
    SaveDraft --> ModeratorTest[Other Moderators attempt to solve and review details]
    ModeratorTest --> ModApprove{Vetting feedback positive?}
    ModApprove -->|Request Changes| FixProblem
    ModApprove -->|Approved| PublishProblem[Update status to PUBLISHED]
    PublishProblem --> UserAccess[Problem visible in global user directories]
```
