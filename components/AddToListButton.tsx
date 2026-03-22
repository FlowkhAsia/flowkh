'use client';

import { useMyList } from '@/context/MyListContext';
import { Movie } from '@/lib/tmdb';
import { Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddToListButtonProps {
  movie: Movie;
}

export default function AddToListButton({ movie }: AddToListButtonProps) {
  const { isInList, addMovie, removeMovie } = useMyList();
  const [isMounted, setIsMounted] = useState(false);
  const isAdded = isInList(movie.id);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleToggleList = () => {
    if (isAdded) {
      removeMovie(movie.id);
    } else {
      addMovie(movie);
    }
  };

  if (!isMounted) {
    return (
      <button 
        className="group flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-white/40 bg-[#2a2a2a]/60 transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Loading list status"
        disabled
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleToggleList}
      className="group flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-white/40 bg-[#2a2a2a]/60 transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label={isAdded ? "Remove from My List" : "Add to My List"}
    >
      {isAdded ? (
        <Check className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
      ) : (
        <Plus className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
      )}
    </button>
  );
}
