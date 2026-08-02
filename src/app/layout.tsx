/**
 * Tray'd Trading Platform - Root Layout
 * @description Main application layout with theme provider and app shell
 */

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";

// ============================================================
// FONTS
// ============================================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://trayd.com'),
  title: {
    default: "Tray'd - Professional Crypto & Forex Trading Platform",
    template: "%s | Tray'd",
  },
  description: "Enterprise-grade cryptocurrency and forex trading platform. Trade BTC, ETH, Forex pairs, and more with professional tools.",
  keywords: [
    "cryptocurrency",
    "trading",
    "forex",
    "bitcoin",
    "ethereum",
    "DeFi",
    "trading platform",
    "crypto exchange",
    "professional trading",
    "margin trading",
    "futures trading",
  ],
  authors: [{ name: "Tray'd Team" }],
  creator: "Tray'd",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trayd.com",
    siteName: "Tray'd",
    title: "Tray'd - Professional Crypto & Forex Trading Platform",
    description: "Enterprise-grade cryptocurrency and forex trading platform with advanced tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tray'd Trading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tray'd - Professional Crypto & Forex Trading Platform",
    description: "Trade crypto and forex like a pro with Tray'd.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// ============================================================
// ROOT LAYOUT COMPONENT
// ============================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tray'd" />
        
        {/* Prevent FOUC of custom properties */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('trayd-ui-preferences');
                if (theme) {
                  const parsed = JSON.parse(theme);
                  if (parsed.state?.theme === 'dark' || 
                      (!parsed.state?.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider defaultTheme="dark">
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
          <Sonner position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
