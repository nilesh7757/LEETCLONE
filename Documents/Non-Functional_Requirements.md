# Software Requirements Specification (SRS) - Non-Functional Requirements

## 1. Introduction

This document specifies the non-functional requirements (NFRs) for **LogiQuest**. These constraints define the system's operational standards, security parameters, reliability targets, and compliance requirements to ensure enterprise-grade stability and user satisfaction.

---

## 2. Performance & User Experience (UX)

The platform must deliver a fast, responsive user interface to support real-time interaction.

### 2.1 Core Web Vitals Targets
The frontend application must satisfy the following performance targets under typical desktop and mobile connections:

| Metric | Target | Measurement Condition |
| :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | $\le 2.0\text{ seconds}$ | Over standard 4G network profiles. |
| **Cumulative Layout Shift (CLS)** | $\le 0.1$ | Zero unexpected layout shifts on load. |
| **Interaction to Next Paint (INP)** | $\le 100\text{ ms}$ | Immediate UI responsiveness upon clicking elements. |

### 2.2 System Latency Limits
*   **NFR-PERF-01 (API Response Latency):** 95% of read API queries (e.g., retrieving lists or user profiles) must respond within **200ms**.
*   **NFR-PERF-02 (Code Execution Roundtrip):** The interval between clicking "Submit" and receiving compilation results must not exceed **2.5 seconds** (for non-TLE executions).

---

## 3. Scalability & System Capacity

### 3.1 Load & Concurrency Bounds
*   **NFR-SCAL-01 (Concurrent Connections):** The server infrastructure shall support a minimum baseline of **5,000 concurrent active WebSocket connections** (for contests and live updates) without degradation.
*   **NFR-SCAL-02 (Peak Request Spikes):** The system must handle up to **30,000 requests per minute** during the first 5 minutes of official contest launches.
*   **NFR-SCAL-03 (Connection Pooling):** PostgreSQL database connections must be managed via PgBouncer or Prisma connection pooling to prevent database lockups under high write loads.

---

## 4. Security & Compliance

LogiQuest executes user-generated code and processes credentials, necessitating a strict security footprint.

### 4.1 Remote Code Execution (RCE) Sandboxing
*   **NFR-SEC-01 (Container Isolation):** All code compilation and runs must execute inside a containerized sandbox (Judge0).
*   **NFR-SEC-02 (Network Block):** Sandbox containers must have all network interfaces disabled to prevent curl/wget data exfiltration.
*   **NFR-SEC-03 (Resource Caps):** Maximum container allocations are restricted to:
    *   CPU Time: 2.0s maximum.
    *   RAM Limits: 256MB maximum.
    *   Process Limits: Maximum 20 simultaneous threads.

### 4.2 Network & Session Security
*   **NFR-SEC-04 (Encryption in Transit & Rest):** All web and WebSocket traffic must enforce TLS 1.3. Database volumes must use AES-256 transparent data encryption.
*   **NFR-SEC-05 (Next.js Security Headers):** The Next.js web application must configure the following headers in `next.config.ts`:
    *   `Content-Security-Policy (CSP)` (strict script/object sources).
    *   `Strict-Transport-Security (HSTS)` (max-age: 2 years).
    *   `X-Frame-Options` (`DENY` to prevent clickjacking).
    *   `X-Content-Type-Options` (`nosniff`).
*   **NFR-SEC-06 (Token Rate Limiting):** A Redis-backed sliding window rate limiter must cap submissions to **10 runs or submissions per minute per IP address**.

---

## 5. Availability & Reliability

### 5.1 Service Availability Targets
*   **NFR-AVAIL-01 (Uptime SLA):** The platform must maintain a **99.9% uptime SLA** (excluding scheduled bi-weekly maintenance windows).
*   **NFR-AVAIL-02 (Disaster Recovery Targets):**

| Parameter | Objective | Description |
| :--- | :--- | :--- |
| **Recovery Time Objective (RTO)** | $\le 1\text{ hour}$ | Max acceptable duration to restore service after outage. |
| **Recovery Point Objective (RPO)** | $\le 5\text{ minutes}$ | Max acceptable data loss from backup logs. |

### 5.2 Fault Tolerance
*   **NFR-AVAIL-03 (Graceful Degradation):** In the event of third-party service outages (e.g., Gemini API, Groq, Cloudinary), the core coding sandbox, contest submission pipeline, and database queries must remain operational.

---

## 6. Maintainability, Portability & Accessibility

*   **NFR-USAB-01 (Accessibility Standard):** The user interface must align with **WCAG 2.1 Level AA** standards. All pages must support keyboard navigation, correct focus states, high contrast ratios, and screen-reader tags (`aria-labels`).
*   **NFR-MAINT-01 (Centralized Logging):** The system must generate structured logs (JSON) via a logging utility (Winston/Pino) piped to external tools for tracing error logs.
*   **NFR-MAINT-02 (Test Coverage):** Core features (`src/features/*`) and core APIs must maintain a minimum of **80% code coverage** via unit and integration tests.
