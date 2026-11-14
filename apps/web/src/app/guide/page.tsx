import Link from "next/link";

export default function GuidePage() {
  const steps = [
    {
      title: "1. Start listening",
      body: "Open the desk and click the mic button to start a session. Speech is captured via your browser/Electron mic and streamed into the transcript.",
    },
    {
      title: "2. Vision analysis",
      body: "While listening in the desktop app, screenshots are captured every few seconds and analyzed by your AI provider. Results show summary, key points, action items, and detected text.",
    },
    {
      title: "3. Ask questions",
      body: "Type a question in the Ask tab. The AI answers using the live transcript as context. Supports OpenAI, Anthropic, Google, OpenRouter, LM Studio, and custom endpoints.",
    },
    {
      title: "4. Notes",
      body: "Add manual notes or let auto-notes capture highlights. Pin important ones; export or email them later.",
    },
    {
      title: "5. Translation",
      body: "Enable real-time translation in Settings to translate each transcript segment to your target language.",
    },
    {
      title: "6. Export",
      body: "Export sessions as Markdown, PDF, TXT, or JSON, or email them directly from the footer.",
    },
    {
      title: "7. Kill switch",
      body: "Arm the kill switch to instantly hide the overlay and stop capture. Toggle from Settings or the tray icon (`Cmd/Ctrl+Shift+S`).",
    },
    {
      title: "8. Zoom / screen-share caveat",
      body: "The overlay is a visible window. It is NOT hidden from screen capture. If an interviewer asks you to share your screen, hide the overlay first (kill switch or tray) or move it to a second monitor not being shared. Voice-only / camera-only interviews are safe.",
    },
  ];
  return (
    <main className="mesh-bg min-h-screen px-6 py-12 text-[var(--text)]">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">AngelAi</p>
        <h1 className="font-display text-4xl font-bold mb-2">Guide</h1>
        <p className="mb-8 text-[var(--muted)]">How to use AngelAi for interviews and meetings.</p>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/80 p-5">
              <h2 className="mb-1 font-display text-lg font-semibold text-[var(--primary)]">{s.title}</h2>
              <p className="text-sm text-[var(--body)]">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <Link href="/app/" className="text-[var(--primary)] hover:underline">
            Open desk →
          </Link>
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--text)]">
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
