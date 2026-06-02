'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { MovieCard } from '@/components/ui/movie-card';
import { Heart, HeartCrack } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WatchlistPage() {
  const { items } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="pt-32 px-4 text-center min-h-screen">Loading your watchlist...</div>;
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 p-12">
          <div className="bg-neutral-900 p-4 rounded-full mb-4">
             <HeartCrack className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-neutral-500 max-w-sm">
            Save shows and movies to keep track of what you want to watch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((media) => (
            <div key={media.id} className="relative group">
               <MovieCard media={media} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
