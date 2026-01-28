import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "350logatec - Pametne rešitve za Logatec",
  description: "Pametne rešitve za boljše življenje v Logatcu. Koledar odvozov odpadkov in več.",
  keywords: [
    "odvoz odpadkov logatec",
    "koledar odvoza smeti logatec",
    "kdaj je odvoz odpadkov",
    "urnik odvoza embalaže",
    "biološki odpadki logatec",
    "komunala logatec",
    "smeti logatec 2026",
    "mešani odpadki logatec",
    "odvoz smeti",
    "embalaža",
    "okoliš"
  ],
  authors: [{ name: "350life" }],
  metadataBase: new URL("https://www.350logatec.si"),
  icons: {
    icon: [
      { url: "/favicon_350logatec_32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_350logatec_256x256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/favicon_350logatec_256x256.png",
  },
  openGraph: {
    title: "350logatec - Pametne rešitve za Logatec",
    description: "Pametne rešitve za boljše življenje v Logatcu. Koledar odvozov odpadkov in več.",
    url: "https://www.350logatec.si",
    siteName: "350logatec",
    locale: "sl_SI",
    type: "website",
    images: [
      {
        url: "/350life_Logatec_OG.png",
        width: 1200,
        height: 630,
        alt: "350logatec - Pametne rešitve za Logatec",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "350logatec - Pametne rešitve za Logatec",
    description: "Pametne rešitve za boljše življenje v Logatcu. Koledar odvozov odpadkov in več.",
    images: ["/350life_Logatec_OG.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '350logatec',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
