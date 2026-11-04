# Angel-Ai

[![GitHub release](https://img.shields.io/github/v/release/Pmvita/Angel-Ai?style=flat-square&color=blue)](https://github.com/Pmvita/Angel-Ai/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-lightgrey?style=flat-square)](https://github.com/Pmvita/Angel-Ai/releases)
[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/Pmvita/Angel-Ai?style=flat-square)](https://github.com/Pmvita/Angel-Ai/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Pmvita/Angel-Ai?style=flat-square)](https://github.com/Pmvita/Angel-Ai/issues)

> **Invisible real-time AI assistant for interviews and meetings.** Listen, Vision, Ask, Notes — with translation, export, and a kill switch.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙️ **Listen** | Live transcription from your mic (Web Speech API) |
| 👁️ **Vision** | Periodic screen capture + AI analysis (summary, key points, action items, detected text) |
| 💬 **Ask** | Q&A over the live transcript (OpenAI, Anthropic, Google, OpenRouter, LM Studio, custom) |
| 📝 **Notes** | Manual + auto-generated from transcript |
| 🌐 **Translation** | Real-time segment translation |
| 📤 **Export** | Markdown, PDF, TXT, JSON, or email |
| 🔒 **Kill Switch** | `Cmd/Ctrl+Shift+S` hides the overlay instantly |
| 💳 **Activation** | Free download, one-time purchase to unlock full features |

## 📥 Download

Download the latest installer from the [Releases page](https://github.com/Pmvita/Angel-Ai/releases).

- **Windows:** `Angel-Ai Setup X.X.X.exe`
- **macOS:** Build from source (see below)

## 🚀 Quick Start (Dev)

```bash
# Terminal 1 — Server
cd apps/server && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev

# Terminal 3 — Electron
cd apps/electron && npm run dev
```

Or from the repo root: `npm run dev` (turbo).

## 🏗️ Build Desktop Installer

```bash
npm run build --workspace=apps/web
cd apps/electron && npm run build
```

Output: `apps/electron/dist/Angel-Ai Setup X.X.X.exe` — fully standalone (bundled server + web UI).

## ⚙️ Configuration

- **AI provider / API key**: set in the overlay Settings tab
- **Stripe (optional)**: set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` env vars to enable paid activation
- **Data directory**: defaults to user app-data; override with `angel_DATA_DIR`

## ⚠️ Zoom / Screen-Share Caveat

The overlay is a visible window and is **not** hidden from screen capture. In voice-only or camera-only interviews it's invisible to the interviewer. If a screen share is requested, hide the overlay first (kill switch or tray) or move it to a non-shared monitor.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔒 Security

Report security vulnerabilities to **Petermvita@hotmail.com**. See [SECURITY.md](SECURITY.md) for details.

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Pierre Mvita](https://github.com/Pmvita)
