import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

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
  keywords: ["odvoz odpadkov", "Logatec", "smeti", "embalaža", "biološki odpadki", "komunala", "okoliš"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
