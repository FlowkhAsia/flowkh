import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cinemate | Discover Movies & TV Shows',
  description: 'A fully functional streaming and discovery web application for movies and TV shows.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased min-h-screen`} suppressHydrationWarning>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
