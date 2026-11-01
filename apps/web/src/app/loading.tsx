import React from "react";

export default function LoadingPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--ground)] text-[var(--text)]">
      <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin mb-4" />
      <p className="text-[var(--muted)] text-sm font-medium">Loading Angel-Ai...</p>
      <p className="text-[var(--faint)] text-xs mt-1">Preparing your interview assistant</p>
    </div>
  );
}
