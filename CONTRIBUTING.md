# Contributing to Angel-Ai

Thank you for your interest in contributing! This project is primarily maintained by Pierre Mvita, but contributions are welcome.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Angel-Ai.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run typecheck: `npm run typecheck`
7. Commit your changes: `git commit -m "feat: description"`
8. Push to your fork: `git push origin feature/your-feature`
9. Open a Pull Request

## Development

```bash
# Server
npm run dev --workspace=apps/server

# Web
npm run dev --workspace=apps/web

# Electron (dev mode)
cd apps/electron && NEXT_DEV_SERVER_URL=http://localhost:3001 NODE_ENV=development npx electron ./dist/apps/electron/src/main.js
```

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling
- Follow existing patterns in the codebase

## Reporting Issues

Use the GitHub issue templates for bug reports and feature requests.
