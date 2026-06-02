'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { Media } from '@/types/tmdb';
import { Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function WatchlistButton({ media, className }: { media: Media, className?: string }) {
  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return (
     <button className={cn("flex flex-col items-center gap-1 opacity-50", className)}>
       <Heart className="w-6 h-6" />
       <span className="text-xs">Save</span>
     </button>
  );

  const inList = isInWatchlist(media.id);

  const toggleList = () => {
    if (inList) {
      removeItem(media.id);
    } else {
      addItem(media);
    }
  };

  return (
    <button 
      onClick={toggleList}
      className={cn(
        "flex flex-col items-center gap-2 group transition-all",
        className
      )}
    >
      <div className={cn(
        "p-3 rounded-full border transition-colors",
        inList 
          ? "bg-red-500 border-red-500 text-white" 
          : "bg-black/40 border-neutral-600 text-white group-hover:border-white hover:bg-neutral-800"
      )}>
        {inList ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
      </div>
      <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
        {inList ? 'Saved' : 'Watchlist'}
      </span>
    </button>
  );
}
