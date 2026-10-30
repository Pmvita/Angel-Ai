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
        "rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm",
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

