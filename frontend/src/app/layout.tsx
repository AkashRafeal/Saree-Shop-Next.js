import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import React, { Suspense } from 'react';
import './globals.css';
import { Providers } from './providers';
import { ScrollToTop } from '@/components/common/ScrollToTop';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SareeAura | Luxury Indian Saree E-Commerce Platform',
  description: 'Discover handcrafted luxury Indian sarees, Banarasi brocades, Kanchipuram silks, and designer ensembles.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased bg-[#FAF6F0] text-[#1A1A1A] min-h-screen flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
