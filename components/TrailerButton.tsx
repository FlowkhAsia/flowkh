'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrailerButtonProps {
  trailerId: string;
}

export default function TrailerButton({ trailerId }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded bg-white/20 px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg font-semibold text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Play Trailer"
      >
        <Play className="h-5 w-5 md:h-7 md:w-7" aria-hidden="true" />
        Play Trailer
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl z-10"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close trailer"
              >
                <span aria-hidden="true">✕</span>
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
