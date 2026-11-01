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
    <section className={["relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]", className].filter(Boolean).join(" ")}>
      {title ? (
        <header className={["flex items-center justify-between px-4 py-3 border-b border-white/10", headerClassName].filter(Boolean).join(" ")}>
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
        </header>
      ) : null}
      <div className={["px-4 py-3", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
}

