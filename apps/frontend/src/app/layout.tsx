import type { Metadata } from "next";
import { Inter, Press_Start_2P, Nunito, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./StoreProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const pressStart2P = Press_Start_2P({ weight: '400', subsets: ["latin"], variable: "--font-press-start-2p" });
const nunito = Nunito({ weight: ['400', '700', '800', '900'], subsets: ["latin"], variable: "--font-nunito" });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ["latin"], variable: "--font-share-tech-mono" });

export const metadata: Metadata = {
  title: "VORTEX – Dashboard",
  description: "DASHBOARD // MY WORLDS — FPV METAVERSE · WALK · TALK · BUILD · DOMINATE",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable} ${nunito.variable} ${shareTechMono.variable}`} style={{ height: "100%" }}>
      <body style={{ margin: 0 }}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
