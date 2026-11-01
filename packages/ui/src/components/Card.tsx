import * as React from "react";

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-[var(--border)] bg-[var(--surface)]",
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
