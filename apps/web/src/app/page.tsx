"use client";

import Link from "next/link";
import { Mic, Eye, MessageSquare, FileText, Shield, Download } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Listen",
    body: "Live transcription from your mic so you never lose the thread mid-interview.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "Periodic screen capture with AI summary, key points, and action items.",
  },
  {
    icon: MessageSquare,
    title: "Ask",
    body: "Question the live transcript with OpenAI, Anthropic, Google, OpenRouter, or local models.",
  },
  {
    icon: FileText,
    title: "Notes",
    body: "Manual and auto notes, translation, and export to Markdown, PDF, TXT, or email.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen mesh-bg text-[var(--text)]">
      <div className="absolute inset-0 grid-fade pointer-events-none" aria-hidden />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] font-display text-sm font-bold text-[var(--ground)]">
            A
          </div>
          <span className="font-display text-lg font-bold tracking-tight">AngelAi</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/guide/" className="hidden px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)] sm:inline">
            Guide
          </Link>
          <Link href="/pricing/" className="hidden px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)] sm:inline">
            Pricing
          </Link>
          <Link
            href="/app/"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--ground)] transition hover:bg-[var(--primary-hover)]"
          >
            Open desk
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Interview & meeting desk
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            AngelAi
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--body)] sm:text-lg">
            Invisible real-time assistance for high-stakes conversations — listen, see the screen,
            ask the transcript, and ship notes before the call ends.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app/"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--ground)] transition hover:bg-[var(--primary-hover)]"
            >
              Try the web desk
            </Link>
            <a
              href="https://github.com/Pmvita/Angel-Ai/releases"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
            >
              <Download className="h-4 w-4" />
              Download desktop
            </a>
          </div>
          <p className="mt-4 text-xs text-[var(--faint)]">
            Full Listen / Vision / Ask / Notes needs the local API (`apps/server`) or the desktop app.
            The web desk falls back to a browser demo when the API is offline.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/80 p-5 backdrop-blur-sm transition hover:border-[var(--primary)]/40"
            >
              <f.icon className="mb-3 h-5 w-5 text-[var(--primary)]" aria-hidden />
              <h2 className="font-display text-base font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
            </article>
          ))}
        </div>

        <aside className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
          <div>
            <h2 className="font-display text-sm font-bold">Kill switch & screen-share caveat</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              `Cmd/Ctrl+Shift+S` hides the overlay instantly. The window is visible to screen capture —
              hide it or move it to a non-shared monitor before sharing your screen.
            </p>
          </div>
        </aside>
      </section>

      <footer className="relative z-10 border-t border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--faint)]">
        AngelAi v2.1.6 · MIT ·{" "}
        <a className="text-[var(--muted)] hover:text-[var(--primary)]" href="https://github.com/Pmvita/Angel-Ai">
          GitHub
        </a>
      </footer>
    </main>
  );
}
