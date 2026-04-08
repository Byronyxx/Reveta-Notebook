import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import { ChromaticMoodProvider } from '@/lib/chromatic-moods'
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://reveta.app'),
  title: "Reveta Notebook",
  description: "Advanced Agentic Coding Environment",
  openGraph: {
    title: "Reveta Notebook",
    description: "Advanced Agentic Coding Environment",
    url: "/",
    siteName: "Reveta Notebook",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Reveta Notebook Cover" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reveta Notebook",
    description: "Advanced Agentic Coding Environment",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const saved = localStorage.getItem('reveta-theme');
            if (saved === 'light') {
              document.documentElement.setAttribute('data-theme', 'light');
            } else {
              document.documentElement.setAttribute('data-theme', 'dark');
            }

            const savedMotion = localStorage.getItem('reveta-motion');
            if (savedMotion === 'comfort') {
              document.documentElement.setAttribute('data-comfort-mode', 'true');
            }
          })()
        `}} />
        <ChromaticMoodProvider>
          {children}
        </ChromaticMoodProvider>
      </body>
    </html>
  );
}
