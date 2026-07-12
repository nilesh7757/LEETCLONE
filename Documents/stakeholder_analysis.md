# Stakeholder Analysis & Engagement Matrix - LogiQuest

## 1. Introduction
This document maps and analyzes the stakeholders of **LogiQuest**. Managing the expectations, requirements, and technical constraints of each stakeholder group is critical to delivering a stable, high-performance product that aligns with both user and business goals.

---

## 2. Stakeholder Classifications & Expectations

We divide stakeholders into four categories based on their proximity to the project core and their role in the system lifecycle.

### 2.1 Primary Stakeholders (End Users)
These are the active consumers of the platform whose core metrics are tied directly to product usability and value.

*   **Students & Learners:**
    *   *Expectations:* Low learning curve, highly interactive algorithm visualizers, clean and helpful error explanations, and clear learning progressions (Study Plans).
    *   *Impact Level:* High. Their usage numbers represent the primary growth metric.
*   **Job Candidates:**
    *   *Expectations:* Realistic FAANG-level mock coding environments, detailed AI-generated architectural reviews, time/complexity evaluations, and interview simulation roadmaps.
    *   *Impact Level:* High. They drive premium feature inquiries and word-of-mouth growth.
*   **Competitive Programmers:**
    *   *Expectations:* Precise time/memory scoring, low-latency live leaderboards, fair scoring penalty calculations, and zero cheating vectors.
    *   *Impact Level:* High. They stress-test the live contest execution engine.

### 2.2 Secondary Stakeholders (System Contributors)
These individuals supply contents or utilize the platform for secondary commercial/educational purposes.

*   **Problem Setters & Contributors:**
    *   *Expectations:* An easy-to-use coding dashboard to create problems, input test cases, run test builds, write editorials, and vet drafts before publication.
    *   *Impact Level:* Medium. They supply the database with content.
*   **Technical Interviewers & Mentors:**
    *   *Expectations:* Detailed performance tracking metrics, system-generated candidate reviews, and code compilation history.
    *   *Impact Level:* Medium. They represent potential enterprise customer channels.

### 2.3 Internal Stakeholders
The team members responsible for building, operating, and managing LogiQuest.

*   **Platform Administrators:**
    *   *Expectations:* System health dashboards, user moderation controls (delete/flag content), DB backup status metrics, and easy configuration files.
*   **Development & QA Team:**
    *   *Expectations:* Clear architectural specifications, modular codebase, highly mocked test configurations, linting checks, and low-friction CI/CD.

### 2.4 External Stakeholders
Third-party providers who supply infrastructure or services essential to system performance.

*   **API & Execution Providers (Judge0, Gemini, Groq, Cloudinary):**
    *   *Expectations:* Secure payload transmission, predictable API usage spikes, and proper billing controls.
*   **Hosting Providers (Vercel, AWS/GCP Database Hosts):**
    *   *Expectations:* Clean container specifications, configuration scaling limits, and standard logging outputs.

---

## 3. Influence-Interest Grid (Engagement Strategy)

To manage stakeholder alignment, we classify stakeholders based on their **Power/Influence** and **Interest** levels:

| Stakeholder Group | Power/Influence | Interest | Engagement Strategy | Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Admins & Devs** | High | High | **Manage Closely** | Daily standups, CI/CD pipeline automation, instant error alerting. |
| **End Users (Learners/Candidates)**| Medium | High | **Keep Informed** | Feature release announcements, feedback surveys, user guides. |
| **External Providers (Judge0/Gemini)**| High | Low | **Keep Satisfied** | Robust service fallbacks, API payload monitoring, error retry logic. |
| **Ad-Hoc Blog/Discussion Users** | Low | Low | **Monitor (Minimum Effort)**| Automated community filtering, spam controls, flagging tools. |

---

## 4. Third-Party Dependency Impact Assessment

LogiQuest integrates several critical external service APIs. Below is the risk and backup mitigation plan for each:

### 4.1 Judge0 Code Execution
*   *Risk:* Server downtime or rate-limit exhaustion halts user compilations and contest runs.
*   *Mitigation:* Queue submissions using Redis. If the Judge0 cloud API fails, Next.js will return a graceful error message indicating temporary service disruption, holding the user's local code draft in LocalStorage.

### 4.2 Google Gemini & Groq AI Engines
*   *Risk:* API downtime prevents mock interview chats and AST code audits.
*   *Mitigation:* Core code submissions are completely decoupled from AI. Users can still run, submit, and score code. AI reviews are put into a "Retry" queue or greyed out until endpoints are responsive.

### 4.3 Cloudinary (Image Hosting)
*   *Risk:* User avatar uploads or blog image insertions fail.
*   *Mitigation:* Local fallback server assets are served for profile avatars. If upload fails, show standard placeholder and retry upload during background sync.
