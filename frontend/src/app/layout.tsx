import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://syntrax.ai'),
  title: {
    default: "Syntrax.ai | The Miracle Document Extraction Engine",
    template: "%s | Syntrax.ai"
  },
  description: "Stop wasting time on manual data entry. Syntrax uses advanced AI to extract structured data from PDF, Images, and Scans with 99.9% accuracy. The ultimate solution for Enterprise automation.",
  keywords: ["AI OCR", "Document Extraction", "Invoice Processing", "IDP", "Automated Data Entry", "PDF to JSON", "Syntrax", "Enterprise AI"],
  authors: [{ name: "Syntrax Team" }],
  creator: "Syntrax.ai",
  publisher: "Syntrax Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://syntrax.ai',
    title: 'Syntrax.ai | Transform Chaos into Clarity',
    description: 'The world\'s most advanced AI document processing platform. Extract data instantly. Zero training required.',
    siteName: 'Syntrax.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Syntrax AI Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntrax.ai | The Future of Data Extraction',
    description: 'Stop typing. Start automating. The miracle solution for your documents.',
    images: ['/og-image.png'],
    creator: '@syntrax_ai',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

import NextAuthSessionProvider from "../providers/SessionProvider";
// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <NextAuthSessionProvider>
            {children}
            <ChatWidget />
          </NextAuthSessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
