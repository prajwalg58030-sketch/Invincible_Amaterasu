import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INVINCIBLE: World Model SIEM Defense",
  description: "Temporal Network State Transition & Kill-Chain Anticipator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}