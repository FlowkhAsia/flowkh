import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { MyListProvider } from '@/context/MyListContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://flowkh.com'),
  title: {
    default: 'Flowkh - Watch TV Shows Online, Watch Movies Online',
    template: '%s | Flowkh',
  },
  description: 'Flowkh is a streaming platform to watch your favorite movies and TV shows online for free. Discover new releases, popular series, and classic films.',
  keywords: ['movies', 'tv shows', 'streaming', 'watch online', 'flowkh', 'free movies', 'cinema'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flowkh.com',
    siteName: 'Flowkh',
    title: 'Flowkh - Watch TV Shows Online, Watch Movies Online',
    description: 'Flowkh is a streaming platform to watch your favorite movies and TV shows online for free.',
    images: [
      {
        url: '/og-image.jpg', // You can add a default OG image to public/og-image.jpg later
        width: 1200,
        height: 630,
        alt: 'Flowkh Streaming',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flowkh - Watch TV Shows Online, Watch Movies Online',
    description: 'Flowkh is a streaming platform to watch your favorite movies and TV shows online for free.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-netflix-black text-white" suppressHydrationWarning>
        <MyListProvider>
          <Navbar />
          {children}
        </MyListProvider>
      </body>
    </html>
  );
}
