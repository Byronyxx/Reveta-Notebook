import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
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
  title: "Reveta Notebook",
  description: "Advanced Agentic Coding Environment",
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
        {children}
      </body>
    </html>
  );
}
