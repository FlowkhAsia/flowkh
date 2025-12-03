import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Movie } from '../types';
import { PlayIcon, InfoIcon } from './icons/Icons';

interface HeroProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movies, onSelectMovie, onPlayMovie }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % (movies.length || 1));
  }, [movies.length]);

  useEffect(() => {
    if (movies.length > 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(nextSlide, 7000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, movies.length, nextSlide]);


  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const handlePlay = () => onPlayMovie(currentMovie);

  return (
    <div className="relative h-[50vh] sm:h-[70vh] md:h-[95vh] w-full pointer-events-none">
        {/* Background Image Fader */}
        <div className="absolute inset-0">
            {movies.map((movie, index) => (
              <img
                key={movie.id}
                src={movie.backdropUrl.replace('/w780/', '/original/')}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
        </div>
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fff5f8] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="px-4 md:px-16 pb-24 sm:pb-32 md:pb-40">
            <div className="max-w-xs sm:max-w-md md:max-w-xl space-y-2 md:space-y-4 animate-fade-in-cinematic pointer-events-auto" key={currentMovie.id}>
                {currentMovie.logoUrl ? (
                  <img 
                      src={currentMovie.logoUrl} 
                      alt={`${currentMovie.title} Logo`} 
                      className="max-h-12 sm:max-h-16 md:max-h-28 max-w-full object-contain object-left drop-shadow-lg" 
                  />
                ) : (
                  <h2 className="text-4xl md:text-6xl font-bebas tracking-wider text-[#4a0424] drop-shadow-sm">{currentMovie.title}</h2>
                )}

                <p className="text-sm md:text-base text-[#5e1b35] line-clamp-3 drop-shadow-sm font-medium">{currentMovie.description}</p>
                
                <div className="flex items-center space-x-3 pt-2 md:pt-4">
                  <button 
                      onClick={handlePlay} 
                      className="flex items-center gap-x-2 rounded-lg bg-[#4a0424] px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white transition hover:bg-[#831843]"
                  >
                      <PlayIcon className="h-5 md:h-6 w-5 md:h-6 text-white" /> Play
                  </button>
                  <button 
                      onClick={() => onSelectMovie(currentMovie)} 
                      className="flex items-center gap-x-2 rounded-lg bg-white/40 backdrop-blur-sm border border-[#831843]/50 px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-[#4a0424] transition hover:bg-white/60"
                  >
                      <InfoIcon className="h-5 md:h-6 w-5 md:h-6" /> See More
                  </button>
                </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Hero;