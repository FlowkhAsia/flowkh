import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { MyListProvider } from '@/context/MyListContext';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flowkh',
  description: 'Flowkh - Movie streaming app built with Next.js and TMDB API',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-netflix-black text-white" suppressHydrationWarning>
        <MyListProvider>
          <Navbar />
          {children}
        </MyListProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
