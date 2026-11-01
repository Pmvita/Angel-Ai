import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger" | "primary";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-white text-[var(--text)] border border-[var(--control)] hover:bg-[var(--raised)]",
  ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]",
  danger: "bg-transparent text-[var(--negative)] border border-[var(--negative)] hover:bg-[var(--negative)] hover:text-white",
  primary: "bg-[var(--primary)] text-white hover:opacity-90",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs h-7",
  md: "px-3 py-1.5 text-sm h-8",
  lg: "px-4 py-2 text-sm h-9",
};

export function Button({ children, className, variant = "default", size = "md", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
