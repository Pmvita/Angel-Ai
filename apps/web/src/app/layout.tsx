import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angel-Ai — Invisible Real-time Assistant",
  description: "Listen, Vision, Ask, Notes for interviews and meetings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-[var(--ground)] text-[var(--text)] font-sans">{children}</body>
    </html>
  );
}

