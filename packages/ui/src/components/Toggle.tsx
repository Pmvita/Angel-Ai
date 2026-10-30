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
        "inline-flex items-center gap-2 cursor-pointer select-none rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 transition-colors hover:bg-white/5",
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
      <span className="relative inline-block w-6 h-3 rounded-full bg-white/20 peer-checked:bg-emerald-500 transition-colors">
        <span
          className={`inline-block w-3 h-3 rounded-full bg-white shadow transform transition-all duration-200 ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </span>
      {label ? <span className="text-xs text-white/80">{label}</span> : null}
    </label>
  );
}

