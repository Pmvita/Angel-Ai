import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger" | "primary";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]",
  ghost: "bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white",
  danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/20",
  primary: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ children, className, variant = "default", size = "md", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
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

