import * as React from "react";

export interface PanelProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function Panel({ children, title, className, headerClassName, bodyClassName }: PanelProps) {
  return (
    <section className={["rounded-lg border border-[var(--border)] bg-[var(--surface)]", className].filter(Boolean).join(" ")}>
      {title ? (
        <header className={["flex items-center justify-between px-4 py-3 border-b border-[var(--rule)]", headerClassName].filter(Boolean).join(" ")}>
          <h3 className="text-sm font-medium text-[var(--text)]">{title}</h3>
        </header>
      ) : null}
      <div className={["px-4 py-3", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
}
