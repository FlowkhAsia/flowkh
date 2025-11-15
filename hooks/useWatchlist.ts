
import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types';

const WATCHLIST_KEY = 'streamflix-watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem(WATCHLIST_KEY);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
      console.error('Failed to parse watchlist from localStorage', error);
      localStorage.removeItem(WATCHLIST_KEY);
    }
  }, []);

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some(item => item.id === movie.id && item.media_type === movie.media_type)) {
        return prev;
      }
      const newWatchlist = [movie, ...prev];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);
  
  const removeFromWatchlist = useCallback((movieId: number, mediaType: 'movie' | 'tv') => {
    setWatchlist((prev) => {
        const newWatchlist = prev.filter(item => !(item.id === movieId && item.media_type === mediaType));
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
        return newWatchlist;
    });
  }, []);

  const isInWatchlist = useCallback((movieId: number, mediaType?: 'movie' | 'tv') => {
    if (!mediaType) return false;
    return watchlist.some(item => item.id === movieId && item.media_type === mediaType);
  }, [watchlist]);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
};
