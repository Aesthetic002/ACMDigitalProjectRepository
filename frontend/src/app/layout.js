"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/hooks/useTheme';
import Providers from '@/components/Providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Providers>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
