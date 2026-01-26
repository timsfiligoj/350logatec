import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
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
  openGraph: {
    title: "350logatec - Pametne rešitve za Logatec",
    description: "Pametne rešitve za boljše življenje v Logatcu. Koledar odvozov odpadkov in več.",
    url: "https://www.350logatec.si",
    siteName: "350logatec",
    locale: "sl_SI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "350logatec - Pametne rešitve za Logatec",
    description: "Pametne rešitve za boljše življenje v Logatcu. Koledar odvozov odpadkov in več.",
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
      </body>
    </html>
  );
}
