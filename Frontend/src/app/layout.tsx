import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AudioForge — Professional Audio Editor",
  description: "Professional audio editing with real-time listener analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
