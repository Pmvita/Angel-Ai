# angel AI

Invisible real-time AI assistant for interviews and meetings. Listen, Vision, Ask, Notes — with translation, export, and a kill switch.

## Features

- **Listen** — live transcription from your mic (Web Speech API)
- **Vision** — periodic screen capture + AI analysis (summary, key points, action items, detected text)
- **Ask** — Q&A over the live transcript (OpenAI, Anthropic, Google, OpenRouter, LM Studio, custom)
- **Notes** — manual + auto-generated from transcript
- **Translation** — real-time segment translation
- **Export** — Markdown, PDF, TXT, JSON, or email
- **Kill switch** — `Cmd/Ctrl+Shift+S` hides the overlay instantly
- **Activation** — free download, one-time purchase to unlock full features

## Run (dev)

```bash
# Terminal 1
cd apps/server && npm run dev

# Terminal 2
cd apps/web && npm run dev

# Terminal 3
cd apps/electron && npm run dev
```

Or from the repo root: `npm run dev` (turbo).

## Build the desktop installer

```bash
npm run build --workspace=apps/web
cd apps/electron && npm run build
```

Output: `apps/electron/dist/angel AI Setup 2.0.0.exe` — fully standalone (bundled server + web UI).

## Configuration

- **AI provider / API key**: set in the overlay Settings tab
- **Stripe (optional)**: set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` env vars to enable paid activation
- **Data directory**: defaults to user app-data; override with `angel_DATA_DIR`

## Zoom / screen-share caveat

The overlay is a visible window and is **not** hidden from screen capture. In voice-only or camera-only interviews it's invisible to the interviewer. If a screen share is requested, hide the overlay first (kill switch or tray) or move it to a non-shared monitor.

## License

MIT
EOF