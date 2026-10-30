import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-emerald-500 text-black",
  secondary: "bg-white/10 text-white/80",
  success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  destructive: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  outline: "bg-white/5 text-white/60 border border-white/20",
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

