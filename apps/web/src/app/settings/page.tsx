import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="mesh-bg min-h-screen px-6 py-12 text-[var(--text)]">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">AngelAi</p>
        <h1 className="font-display mb-4 text-3xl font-bold">Settings</h1>
        <p className="mb-8 text-[var(--muted)]">
          Configure AngelAi in the desk Settings tab — provider, API key, translation, kill switch, and more.
        </p>
        <Link
          href="/app/"
          className="inline-block rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-[var(--ground)] hover:bg-[var(--primary-hover)]"
        >
          Open desk
        </Link>
      </div>
    </main>
  );
}
