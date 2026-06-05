'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

export function Navbar() {
  const pathname = usePathname();

  const isDetailsPage = pathname?.startsWith('/movie/') || pathname?.startsWith('/tv/');

  if (isDetailsPage) {
    return null;
  }

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="w-full px-4 md:px-16 h-[80px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
             <Icons.popcorn className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-xl tracking-tight text-white">Cinemate</span>
        </Link>
        <nav className="flex items-center space-x-6 md:space-x-8 text-sm font-medium">
           <Link href="/search" className="text-zinc-400 hover:text-white transition duration-200 cursor-pointer flex items-center gap-2.5">
             <Icons.search className="w-5 h-5" />
             <span className="hidden sm:inline">Search</span>
           </Link>
           <Link href="/watchlist" className="text-zinc-400 hover:text-white transition duration-200 cursor-pointer flex items-center gap-2.5">
             <Icons.heart className="w-5 h-5" />
             <span className="hidden sm:inline">Watchlist</span>
           </Link>
        </nav>
      </div>
    </header>
  );
}
