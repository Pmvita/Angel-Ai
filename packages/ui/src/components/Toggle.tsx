import * as React from "react";

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked = false, onCheckedChange, disabled, className, ...props }: ToggleProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onCheckedChange?.(e.target.checked);
  };

  return (
    <label
      className={[
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <span className={`relative inline-block w-8 h-4 rounded-full transition-colors ${checked ? "bg-[var(--positive)]" : "bg-[var(--border)]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 inline-block w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </span>
      {label ? <span className="text-xs text-[var(--text)]">{label}</span> : null}
    </label>
  );
}
