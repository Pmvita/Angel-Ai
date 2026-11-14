import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AngelAi — Invisible Real-time Interview Assistant",
  description:
    "Listen, Vision, Ask, and Notes for interviews and meetings. Real-time transcription, screen analysis, and multi-provider AI Q&A.",
  openGraph: {
    title: "AngelAi",
    description: "Invisible real-time AI assistant for interviews and meetings.",
    type: "website",
    siteName: "AngelAi",
  },
  twitter: {
    card: "summary_large_image",
    title: "AngelAi",
    description: "Invisible real-time AI assistant for interviews and meetings.",
  },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[var(--ground)] text-[var(--text)]">{children}</body>
    </html>
  );
}
