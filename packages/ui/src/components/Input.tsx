import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label ? <label className="text-xs font-medium text-white/70 block">{label}</label> : null}
      <input
        className={[
          "w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors",
          error ? "border-rose-500 focus:ring-rose-500" : "",
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}

