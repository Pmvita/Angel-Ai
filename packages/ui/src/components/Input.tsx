import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label ? <label className="text-xs font-medium text-[var(--muted)] block">{label}</label> : null}
      <input
        className={[
          "w-full rounded-md border border-[var(--control)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] placeholder-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors",
          error ? "border-[var(--negative)]" : "",
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {error ? <p className="text-xs text-[var(--negative)]">{error}</p> : null}
    </div>
  );
}
