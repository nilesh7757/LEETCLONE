# Software Requirements Specification (SRS) - Non-Functional Requirements

## 1. Introduction
This document defines the non-functional requirements (NFRs) for LogiQuest, encompassing system performance, scalability, security, reliability, and usability constraints necessary to ensure enterprise-grade stability.

## 2. Performance Metrics
- **NFR-PERF-01 (Page Load Time):** The Next.js frontend shall achieve a Largest Contentful Paint (LCP) of under 2.5 seconds on a standard 4G network connection.
- **NFR-PERF-02 (API Latency):** 95% of stateless read APIs (e.g., fetching problem lists) shall return a response within 200ms.
- **NFR-PERF-03 (Execution Turnaround):** The round-trip time from code submission to receiving Judge0 evaluation results shall not exceed 3 seconds for standard algorithms (excluding user-caused TLE scenarios).
- **NFR-PERF-04 (WebSocket Latency):** Real-time code synchronization in collaboration rooms shall exhibit sub-100ms latency to prevent disjointed editing experiences.

## 3. Scalability and Capacity
- **NFR-SCAL-01 (Concurrent Users):** The architecture shall support a baseline of 5,000 concurrent active connections.
- **NFR-SCAL-02 (Contest Spikes):** The system must dynamically scale to handle spikes of up to 50,000 requests per minute during the first 5 minutes of a major contest.
- **NFR-SCAL-03 (Database Scaling):** The PostgreSQL database must support connection pooling (via PgBouncer or Prisma Accelerate) to manage sudden influxes of query connections without exhausting DB resources.

## 4. Security & Compliance
- **NFR-SEC-01 (Sandboxed Execution):** All user-submitted code MUST execute in highly restricted Docker containers via Judge0, with zero network egress, maximum 2GB RAM limits, and stringent CPU time quotas.
- **NFR-SEC-02 (Data Encryption):** Data at rest (PostgreSQL) must be encrypted using AES-256. Data in transit must be secured via TLS 1.3 across all HTTP and WebSocket connections.
- **NFR-SEC-03 (Rate Limiting & DDoS Mitigation):** A Redis-backed sliding window rate limiter shall restrict users to 10 submissions per minute. The infrastructure shall sit behind a WAF (Web Application Firewall) to mitigate layer 7 DDoS attacks.
- **NFR-SEC-04 (XSS & CSRF Protection):** The Next.js frontend shall implement strict Content Security Policies (CSP). Form submissions and API actions shall utilize NextAuth CSRF tokens.

## 5. Availability & Reliability
- **NFR-AVAIL-01 (Uptime SLA):** The platform shall guarantee a 99.9% uptime (excluding scheduled maintenance windows).
- **NFR-AVAIL-02 (Data Backups):** Database backups shall occur daily with a retention policy of 30 days. Point-In-Time-Recovery (PITR) shall be enabled to allow restoration to any minute within the last 7 days.
- **NFR-AVAIL-03 (Graceful Degradation):** If the AI evaluation microservice (Gemini/Groq) fails, the core code execution platform must remain fully operational.

## 6. Maintainability and Usability
- **NFR-USAB-01 (Accessibility):** The UI shall adhere to WCAG 2.1 AA standards, ensuring proper contrast ratios, aria-labels for screen readers, and keyboard navigability across the editor and problem lists.
- **NFR-MAINT-01 (Logging):** Centralized structured logging (e.g., Winston/Pino piped to DataDog or AWS CloudWatch) shall be implemented for all backend services to ensure traceability of errors and performance bottlenecks.
- **NFR-MAINT-02 (Testing):** The codebase shall maintain a minimum of 80% test coverage for all core business logic (unit tests via Jest, integration tests via React Testing Library).
