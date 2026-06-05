'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

interface PlayerBackButtonProps {
  href: string; // Keep href for backward compatibility, although we might not strictly need it if we replace pathname
}

export function PlayerBackButton({ href }: PlayerBackButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const showButtonAndResetTimeout = useCallback(() => {
    setIsVisible(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    // Initial timeout
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // This catches mouse movements over the non-iframe parts of the screen
    window.addEventListener('mousemove', showButtonAndResetTimeout);
    window.addEventListener('touchstart', showButtonAndResetTimeout);
    
    return () => {
      window.removeEventListener('mousemove', showButtonAndResetTimeout);
      window.removeEventListener('touchstart', showButtonAndResetTimeout);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [showButtonAndResetTimeout]);

  return (
    <>
      {/* 
        This invisible overlay covers the iframe when the back button is hidden. 
        It catches the FIRST mouse movement or touch, reveals the back button, 
        and disappears instantly so subsequent interactions go to the iframe.
      */}
      {!isVisible && (
        <div 
          className="fixed inset-0 z-[105]"
          onPointerMove={showButtonAndResetTimeout}
          onTouchStart={showButtonAndResetTimeout}
        />
      )}
      
      <Link 
        href={href}
        replace
        className={`fixed top-6 left-6 md:top-10 md:left-12 z-[110] w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-white hover:bg-zinc-800/60 hover:scale-105 transition-all group duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <Icons.chevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      </Link>
    </>
  );
}

