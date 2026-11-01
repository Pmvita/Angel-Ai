import * as React from "react";

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-2",
  md: "p-3",
  lg: "p-5",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

