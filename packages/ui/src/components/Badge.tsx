import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  secondary: "bg-white/[0.06] text-white/70 border border-white/10",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  destructive: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
  outline: "bg-white/[0.03] text-white/60 border border-white/10",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variantClasses[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}

