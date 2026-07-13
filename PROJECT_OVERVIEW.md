# LogiQuest: Advanced Interactive Learning & Interview Platform

LogiQuest is a high-fidelity, full-stack platform designed to provide a robust environment for competitive programming, interview preparation, and collaborative learning. It integrates cutting-edge technologies like real-time WebSockets, background task queues for code execution, and multi-model AI agents to offer a superior developer experience.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) with React 19.
- **Styling:** Tailwind CSS 4 (PostCSS configuration) for modern, utility-first UI design.
- **Code Editor:** Monaco Editor (`@monaco-editor/react`) for a VS-Code-like editing experience.
- **Animations:** Framer Motion for smooth, interactive UI transitions.
- **Data Visualization:** Recharts for performance analytics and submission history.
- **Rich Text:** Tiptap for editorials and blog post creation.
- **Icons:** Lucide React.

### Backend & Infrastructure
- **API Architecture:** Next.js Server Actions and Route Handlers with custom middleware for error handling and rate limiting.
- **Database:** PostgreSQL managed via Prisma ORM (v5.22.0).
- **Caching:** Redis (Upstash/ioredis) for high-performance caching and WebSocket state.
- **Real-time Engine:** Socket.io with a custom Node.js server (`server.js`) for contests and chat.
- **Authentication:** Next-Auth v5 (Beta) with Prisma adapter, supporting OAuth and Credentials.
- **Email:** Nodemailer for OTP and password reset workflows.
- **Media:** Cloudinary for image and asset management.

### Execution & AI
- **Code Execution:** High-reliability Judge0 Cloud Engine integration. Supports:
  - JavaScript (Node.js 22)
  - Python (3.12)
  - C++ (GCC 14)
  - Java (OpenJDK 17)
  - SQL (SQLite 3)
- **AI Suite:** Integrated support for multiple LLM providers:
  - **Google Gemini:** Pro and Flash models for real-time code audit and feedback.
  - **OpenAI & Groq:** For high-speed inference in mock interviews and roadmaps.

---

## 🛠️ Core Features

### 1. Problem Solving System
- **Diverse Types:** Supports Coding, SQL, Shell, Interactive, System Design, and Reading problems.
- **Advanced Metadata:** Time/Memory limits, hints, blueprints, editorials, and pattern-based categorization.
- **Verification Workflow:** Problems go through STABLE, UNSTABLE, and VETTING phases with verified solutions in multiple languages.
- **Starter Code & Snippets:** Automatic generation of boilerplate and personal code snippets.

### 2. Competitive Coding (Arena)
- **Live Contests:** Real-time leaderboards and scoring (Classic/Tactical protocols).
- **Contest Management:** Official and user-created contests with access codes and vetting phases.
- **Announcements:** Live notifications during contests.

### 3. Learning & Career
- **Study Plans:** Curated learning paths with progress tracking and daily reminders.
- **Mock Interviews:** AI-simulated interview environment that generates tailored roadmaps and feedback based on performance.
- **Arcade:** Gamified coding challenges including "Bug Sniper" and "Architect" modes.

### 4. Community & Social
- **Discussion System:** Threaded comments with voting and markdown support.
- **Blog:** User-generated content with tags and media integration.
- **Social Graph:** Follow/Follower system and real-time private messaging.
- **Streaks & Badges:** Gamification via daily streaks, solved counts, and awarded achievement badges.

---

## 🏗️ Project Architecture

```text
D:\LEETCLONE\
├── prisma/               # Database schema and migrations
├── public/               # Static assets (logos, audio)
├── server.js             # Custom Socket.io server
└── src/
    ├── app/              # Next.js App Router (Pages & API routes)
    ├── components/       # Shared UI components (Hero, Layout, etc.)
    ├── features/         # Domain-driven feature modules (Auth, Problems, AI)
    ├── lib/              # Core services (Code execution, Gemini, Mail)
    └── types/            # Global TypeScript definitions
```

### Domain-Driven Features
The project follows a "Features" pattern to encapsulate logic:
- `src/features/ai`: AI agents, feedback logic, and chat persistence.
- `src/features/arena`: Contest logic and real-time state management.
- `src/features/architect`: Tools for problem creation and vetting.
- `src/features/visualizer`: Interactive data structure visualizations (e.g., Linked List Visualizer).

---

## 📊 Data Model (Prisma)

The database consists of over 30 models. Key relationships include:
- **User:** Central entity managing ratings, streaks, submissions, and social connections.
- **Problem & Submission:** Tracks code, complexity (Time/Space), test results, and AI audit feedback.
- **Contest & Registration:** Manages time-bound events and participants.
- **StudyPlan & Enrollment:** Links users to curated learning paths.
- **Conversation & Message:** Powers the real-time social layer.

---

## 🚀 Development & Deployment

### Local Setup
1. **Docker:** Use `docker-compose up` to spin up necessary services (PostgreSQL, Redis).
2. **Environment:** Configure `.env` with API keys (Judge0, Gemini, Cloudinary).
3. **Database:** Run `npx prisma migrate dev` and `npx prisma db seed`.
4. **Run:** `npm run dev` for the frontend and `npm run socket` for WebSockets.

### Testing
- **Unit & Integration:** Powered by Jest and React Testing Library (`src/__tests__`).
- **Prisma Mocking:** Uses `jest-mock-extended` for database isolation during tests.

### Deployment
- Configured for **Vercel** (`vercel.json`) with standard Next.js optimizations.
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`) for automated linting and testing.

---

## 📜 License
This project is licensed under the LICENSE terms included in the repository.
