import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--active)] text-[var(--text)]",
  secondary: "bg-[var(--raised)] text-[var(--muted)]",
  success: "bg-[#dcfae5] text-[#04250e]",
  warning: "bg-[#fffbeb] text-[#92400e]",
  destructive: "bg-[#ffedea] text-[#831c1e]",
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
