export default function LoadingPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--ground)] text-[var(--text)]">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
      <p className="text-sm font-medium text-[var(--muted)]">Loading AngelAi…</p>
      <p className="mt-1 text-xs text-[var(--faint)]">Preparing your interview assistant</p>
    </div>
  );
}
