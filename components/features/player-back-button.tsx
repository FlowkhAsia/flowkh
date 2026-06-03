'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface PlayerBackButtonProps {
  href: string; // Keep href for backward compatibility, although we might not strictly need it if we replace pathname
}

export function PlayerBackButton({ href }: PlayerBackButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Initial timeout
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    // Replaces the URL to remove query parameters like ?play=true
    router.replace(pathname);
  };

  return (
    <button 
      onClick={handleClose}
      className={`absolute top-6 left-6 md:top-10 md:left-12 z-[110] w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-white hover:bg-zinc-800/60 hover:scale-105 transition-all group duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
}

