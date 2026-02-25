[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/nilesh7757/LEETCLONE)
# LEETCLONE - A High-Performance LeetCode Clone

LEETCLONE is a full-stack platform for competitive programming, featuring real-time collaborative coding, AI-powered code analysis, and competitive contests.

## Key Features

- **Real-time Collaboration**: Code together using Socket.IO integration.
- **AI-Powered Insights**: Get feedback on code complexity and audit your solutions using Gemini and Groq.
- **Contest System**: Participate in official and community contests with real-time leaderboards.
- **DSA Visualizer**: Visualize data structures and algorithms in action.
- **Study Plans**: Curated paths for mastering specific topics.
- **Mock Interviews**: Practice technical interviews with AI-driven feedback.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **AI**: Google Gemini & Groq (Llama-3.3-70b)
- **Styling**: Tailwind CSS & Framer Motion
- **Testing**: Jest & React Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nilesh7757/LEETCLONE.git
   cd LEETCLONE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. Database Setup:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Run the development servers:
   ```bash
   # Terminal 1: Next.js App
   npm run dev

   # Terminal 2: Socket.IO Server
   npm run socket
   ```

## Testing

Run the test suite:
```bash
npm test
```

## Security & Best Practices

- **Rate Limiting**: API routes are protected by IP-based rate limiting.
- **Security Headers**: Production-ready headers configured in `next.config.ts`.
- **Structured Logging**: Centralized logging utility for consistent observability.
- **Error Handling**: Unified error handling using `apiHandler` and `ApiError` patterns.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
