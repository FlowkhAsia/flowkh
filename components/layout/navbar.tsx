'use client';

import Image from 'next/image';
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
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center group gap-0.5">
           <Image src="/logo.png" alt="KFLIX Logo" width={120} height={40} className="h-8 w-auto object-contain" unoptimized />
           <span className="font-black text-3xl tracking-tighter text-white mt-0.5">FLIX</span>
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
