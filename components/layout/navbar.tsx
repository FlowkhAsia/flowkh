'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Popcorn, Heart } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const isDetailsPage = pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/');

  if (isDetailsPage) {
    return null;
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-black/60 backdrop-blur-lg border-b border-white/10">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
             <Popcorn className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-xl tracking-tight text-white">Cinemate</span>
        </Link>
        <nav className="flex items-center gap-6">
           <Link href="/search" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
             <Search className="w-4 h-4" />
             <span className="hidden sm:inline">Search</span>
           </Link>
           <Link href="/watchlist" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
             <Heart className="w-4 h-4" />
             <span className="hidden sm:inline">Watchlist</span>
           </Link>
        </nav>
      </div>
    </header>
  );
}
