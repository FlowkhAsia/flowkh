'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { Media } from '@/types/tmdb';
import { Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function WatchlistButton({ media, className, iconOnly }: { media: Media, className?: string, iconOnly?: boolean }) {
  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return (
     <button className={cn(
       iconOnly 
        ? "w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-white opacity-50"
        : "flex flex-col items-center gap-1 opacity-50", 
       className
     )}>
       <Heart className={iconOnly ? "w-5 h-5" : "w-6 h-6"} />
       {!iconOnly && <span className="text-xs">Save</span>}
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

  if (iconOnly) {
    return (
      <button 
        onClick={toggleList}
        title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={cn(
          "w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors",
          inList && "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30",
          className
        )}
      >
        {inList ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
      </button>
    );
  }

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
