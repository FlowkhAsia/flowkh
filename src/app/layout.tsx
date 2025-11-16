import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from '../contexts/ThemeContext';
import AppClientLayout from '../components/AppClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'flowkh - Discover Movies & TV Shows',
    template: '%s | flowkh',
  },
  description: 'Explore a vast library of movies and TV shows. Get recommendations, create your watchlist, and discover your next favorite title with flowkh, a modern streaming app interface.',
  keywords: ['movies', 'tv shows', 'streaming', 'flowkh', 'react', 'tailwind', 'discover', 'watchlist'],
  authors: [{ name: 'flowkh Team' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://flowkh.vercel.app/',
    title: 'flowkh - Discover Movies & TV Shows',
    description: 'Explore a vast library of movies and TV shows. Get recommendations, create your watchlist, and discover your next favorite title with flowkh.',
    images: 'https://flowkh.vercel.app/og-image.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'flowkh - Discover Movies & TV Shows',
    description: 'Explore a vast library of movies and TV shows. Get recommendations, create your watchlist, and discover your next favorite title with flowkh.',
    images: 'https://flowkh.vercel.app/og-image.jpg',
  },
  metadataBase: new URL('https://flowkh.vercel.app'),
  manifest: '/manifest.json',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130 40' width='130' height='40'%3E%3Ctext x='0' y='30' style='font-family:Bebas Neue,cursive;font-size:36px' fill='white'%3EFLOW%3C/text%3E%3Cg transform='translate(75, 0)'%3E%3Crect x='0' y='1' width='55' height='38' rx='6' fill='%23E50914'/%3E%3Ctext x='27.5' y='30' style='font-family:Bebas Neue,cursive;font-size:36px' fill='%23202020' text-anchor='middle'%3EKH%3C/text%3E%3C/g%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('flowkh-theme') || 'red';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  console.error("Could not set theme from localStorage", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppClientLayout>
            {children}
          </AppClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}