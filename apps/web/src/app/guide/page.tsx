import Link from "next/link";

export default function GuidePage() {
  const steps = [
    { title: "1. Start listening", body: "Click the mic button (or press Cmd/Ctrl+Shift+S) to start a session. Speech is captured via your browser/Electron mic and streamed to the transcript." },
    { title: "2. Vision analysis", body: "While listening in the desktop app, screenshots are captured every few seconds and analyzed by your AI provider. Results show summary, key points, action items, and detected text." },
    { title: "3. Ask questions", body: "Type a question in the Ask tab. The AI answers using the live transcript as context. Supports OpenAI, Anthropic, Google, OpenRouter, LM Studio, and custom endpoints." },
    { title: "4. Notes", body: "Add manual notes or let auto-notes capture highlights. Pin important ones; export or email them later." },
    { title: "5. Translation", body: "Enable real-time translation in Settings to translate each transcript segment to your target language." },
    { title: "6. Export", body: "Export sessions as Markdown, PDF, TXT, or JSON, or email them directly from the footer." },
    { title: "7. Kill switch", body: "Arm the kill switch to instantly hide the overlay and stop capture. Toggle from Settings or the tray icon." },
  ];
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Guide</h1>
      <p className="text-white/60 mb-8">How to use angel AI for interviews and meetings.</p>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-emerald-400 mb-1">{s.title}</h2>
            <p className="text-white/70 text-sm">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/" className="text-emerald-400 hover:underline">← Back to overlay</Link>
      </div>
    </main>
  );
}

