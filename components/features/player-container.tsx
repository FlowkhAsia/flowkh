'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface PlayerContainerProps {
  src: string;
}

export function PlayerContainer({ src }: PlayerContainerProps) {
  const [showUI, setShowUI] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleMouseMove = () => {
    setShowUI(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setShowUI(false);
    }, 5000);
  };

  useEffect(() => {
    // Initial timeout
    timeoutRef.current = window.setTimeout(() => {
      setShowUI(false);
    }, 5000);

    return () => {
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
    <div 
      className="fixed inset-0 bg-black z-[100] w-full h-screen relative"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* Back Button Container */}
      <div className={`absolute top-6 left-6 md:top-10 md:left-12 z-[110] transition-opacity duration-500 ease-in-out ${showUI ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={handleClose}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-white hover:bg-zinc-800/60 hover:scale-105 transition-all group"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>

      {/* Frame / Video Container */}
      {/* We apply pointer-events-auto to the iframe to ensure it can be interacted with, while mouse events bubble if possible or at least don't break our overlay */}
      <iframe
        src={src}
        allowFullScreen
        allow="autoplay; encrypted-media"
        className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
      />
      
      {/* Bottom Player Controls Container (If any custom controls were to be added) */}
      <div className={`absolute bottom-0 left-0 right-0 z-[110] p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 ease-in-out ${showUI ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Placeholder for matched instruction */}
      </div>
    </div>
  );
}
