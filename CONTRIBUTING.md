# Contributing to LEETCLONE

Thank you for your interest in contributing to LEETCLONE!

## How to Contribute

1. **Fork the Repository**: Create a personal fork of the project on GitHub.
2. **Clone the Fork**: `git clone https://github.com/YOUR_USERNAME/LEETCLONE.git`
3. **Create a Branch**: `git checkout -b feature/your-feature-name`
4. **Make Changes**: Implement your feature or bug fix.
5. **Run Tests**: Ensure all tests pass with `npm test`.
6. **Commit Changes**: Use clear and descriptive commit messages.
7. **Push to GitHub**: `git push origin feature/your-feature-name`
8. **Submit a Pull Request**: Provide a detailed description of your changes.

## Development Setup

- Install dependencies: `npm install`
- Copy `.env.example` to `.env` and fill in the required values.
- Start the development server: `npm run dev`
- Start the socket server: `npm run socket`

## Code Style

- Follow the existing project structure and naming conventions.
- Use TypeScript for all new code.
- Ensure proper error handling using the `apiHandler` utility for API routes.
- Use the `logger` for all logging.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.
