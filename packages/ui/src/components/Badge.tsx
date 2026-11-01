import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--active)] text-[var(--text)]",
  secondary: "bg-[var(--raised)] text-[var(--muted)]",
  success: "bg-[rgba(16,185,129,0.15)] text-[#10b981]",
  warning: "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]",
  destructive: "bg-[rgba(240,68,56,0.15)] text-[#f04438]",
  outline: "bg-transparent text-[var(--muted)] border border-[var(--border)]",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border border-[var(--border)]",
        variantClasses[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
