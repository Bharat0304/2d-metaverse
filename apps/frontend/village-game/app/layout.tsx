import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdant Village — Metaverse",
  description: "A pixel-art village metaverse — walk, talk, explore.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
