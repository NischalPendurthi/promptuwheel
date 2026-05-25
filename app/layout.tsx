import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptU Wheel — Keyword Brainstorming",
  description: "Spin the wheel, get a random keyword, and brainstorm what you know.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
