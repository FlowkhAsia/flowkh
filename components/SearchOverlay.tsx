import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { searchContent } from '../services/geminiService';
import { SearchIcon, XCircleIcon, StarIcon } from './icons/Icons';
import MovieCard from './MovieCard';

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectMovie, myList, onToggleMyList }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when overlay opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when overlay closes
      setSearchQuery('');
      setResults([]);
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { results: newResults } = await searchContent(debouncedSearchQuery, 'multi', 1);
        setResults(newResults);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);
  
  const handleSelect = (movie: Movie) => {
    onClose();
    onSelectMovie(movie);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-3xl mx-auto mt-[10vh] bg-zinc-900/95 rounded-xl shadow-2xl border border-zinc-700 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center p-4 border-b border-zinc-700/80">
          <SearchIcon className="h-6 w-6 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies and TV shows..."
            className="w-full bg-transparent text-white placeholder-zinc-400 text-lg focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
              <XCircleIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : debouncedSearchQuery && results.length === 0 ? (
            <div className="text-center p-16 text-zinc-400">
              <p>No results found for "{debouncedSearchQuery}"</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((movie) => (
                <li
                  key={movie.id}
                  onClick={() => handleSelect(movie)}
                  className="bg-zinc-800/50 hover:bg-zinc-700/80 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center p-3 gap-4">
                    <div className="w-16 flex-shrink-0">
                        <div className="aspect-[2/3] bg-zinc-700 rounded-md overflow-hidden">
                           <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                      <div className="flex items-center text-xs text-gray-400 mt-1.5 space-x-2">
                        <span>{movie.releaseYear}</span>
                        <div className="flex items-center gap-1 border border-white/20 rounded px-1 py-0.5 text-[10px] font-medium">
                            <StarIcon className="w-2.5 h-2.5 text-yellow-400" />
                            <span>{movie.rating.toFixed(1)}</span>
                        </div>
                        <span className="uppercase text-[10px]">{movie.media_type}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center p-16 text-zinc-500">
                <p>Find your next favorite show.</p>
             </div>
          )}
        </div>

        <div className="p-3 border-t border-zinc-700/80 text-right text-xs text-zinc-500">
            Press <kbd className="font-sans border border-zinc-600 bg-zinc-700/50 rounded-sm px-1.5 py-0.5">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;