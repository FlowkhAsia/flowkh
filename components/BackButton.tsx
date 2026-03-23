'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  
  const handleBack = () => {
    // If there is history to go back to, use router.back()
    // window.history.length > 2 is a common check because a new tab starts with length 1 or 2
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else if (typeof document !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      // Fallback to home if they landed directly on this page
      router.push('/');
    }
  };
  
  return (
    <button 
      onClick={handleBack}
      className="flex items-center gap-2 text-white hover:text-gray-300 transition bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      <span className="font-semibold">Back</span>
    </button>
  );
}
