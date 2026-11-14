# AngelAi

[![GitHub release](https://img.shields.io/github/v/release/Pmvita/Angel-Ai?style=flat-square&color=blue)](https://github.com/Pmvita/Angel-Ai/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-lightgrey?style=flat-square)](https://github.com/Pmvita/Angel-Ai/releases)
[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Invisible real-time AI assistant for interviews and meetings.** Listen, Vision, Ask, Notes — with translation, export, and a kill switch.

**Status:** Working monorepo (web + Express/Socket.IO API + Electron). Full Listen/Vision/Ask/Notes against a real LLM needs an API key in Settings (or `OPENAI_API_KEY`). Stripe/SMTP are optional.

**Live web demo:** https://angel-ai-lemon.vercel.app (reachable again). **Note:** production still serves the last pushed `origin/main` build (branded Angel-Ai). Local tree is fully rebranded to **AngelAi** — commit/push when ready to publish the new branding + landing/desk split.

**GitHub:** https://github.com/Pmvita/Angel-Ai (existing remote — keep; do not create an AngelAi duplicate)

---

## Features

| Feature | Description |
|---------|-------------|
| **Listen** | Live transcription from your mic (Web Speech API) |
| **Vision** | Periodic screen capture + AI analysis (desktop app) |
| **Ask** | Q&A over the live transcript (OpenAI, Anthropic, Google, OpenRouter, LM Studio, custom) |
| **Notes** | Manual + auto-generated from transcript |
| **Translation** | Real-time segment translation |
| **Export** | Markdown, PDF, TXT, JSON, or email |
| **Kill Switch** | `Cmd/Ctrl+Shift+S` hides the overlay instantly |
| **Activation** | Free download; optional Stripe unlock |

## Download

Latest installer: [Releases](https://github.com/Pmvita/Angel-Ai/releases)

- **Windows:** `AngelAi Setup X.X.X.exe` (or `Angel-Ai Setup` on older builds)
- **macOS:** Build from source (see below)

## Quick Start (Dev)

On Windows, if the path under `Projects\1) Full-Stack...` hangs npm, use a short junction:

```powershell
cmd /c mklink /J C:\Users\user\Desktop\angel-ai-build "C:\Users\user\Desktop\MAIN\Projects\1) Full-Stack Engineering\angel-ai-clone"
cd C:\Users\user\Desktop\angel-ai-build
npm install
```

```bash
# Terminal 1 — Server (required for full AI features)
cd apps/server && npm run dev

# Terminal 2 — Web (http://localhost:3001)
cd apps/web && npm run dev

# Terminal 3 — Electron (optional desktop overlay)
cd apps/electron && npm run dev
```

Or from the repo root: `npm run dev` (turbo).

Copy `.env.example` → `apps/server/.env` if you want server-side defaults.

### Smoke check

```bash
curl http://localhost:4000/api/health
# open http://localhost:3001/  (landing)
# open http://localhost:3001/app/  (desk)
```

## Build Desktop Installer

```bash
npm run build --workspace=@angel/web
# For Electron static assets with relative paths:
# set ELECTRON_BUILD=1 before the web build on Windows: $env:ELECTRON_BUILD="1"
cd apps/electron && npm run build
```

Output: `apps/electron/dist/` — standalone installer (bundled server + web UI).

## Configuration

- **AI provider / API key**: desk Settings tab
- **Stripe (optional)**: `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`
- **Data directory**: defaults under cwd / app-data; override with `angel_DATA_DIR`

## Zoom / Screen-Share Caveat

The overlay is a visible window and is **not** hidden from screen capture. Hide it first (kill switch or tray) or move it to a non-shared monitor before screen sharing.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Report vulnerabilities to **Petermvita@hotmail.com**. See [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

---

Built by [Pierre Mvita](https://github.com/Pmvita)
