import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitBuddy — AI Fitness Plan Generator",
  description:
    "Gemini-powered personal trainer. Structured 7-day workout plans (Gemini Pro), goal-aligned nutrition intel (Gemini Flash), and plans that evolve with your feedback.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${jetbrains.variable}`}
    >
      <body className="u-noise bg-void font-sans text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
