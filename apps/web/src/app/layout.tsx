import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "angel AI — Invisible Real-time Assistant",
  description: "Listen, Vision, Ask, Notes for interviews and meetings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-black text-white font-sans">{children}</body>
    </html>
  );
}

