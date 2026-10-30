import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger" | "primary";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-white text-black hover:bg-gray-100",
  ghost: "bg-transparent text-white/80 hover:bg-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  primary: "bg-emerald-500 text-black hover:bg-emerald-400",
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

