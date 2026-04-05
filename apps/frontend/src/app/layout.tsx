import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./StoreProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ZEP Metaverse – Virtual Tech Office",
  description: "A 2D spatial metaverse platform – explore a futuristic tech office with real-time multiplayer avatars.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} style={{ height: "100%" }}>
      <body style={{ margin: 0 }}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
