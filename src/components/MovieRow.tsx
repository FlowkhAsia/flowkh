import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  onSeeAll?: () => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, myList, onToggleMyList, onSelectMovie, onSeeAll }) => {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
          <h2 className="cursor-pointer text-lg font-bold text-white transition duration-200 md:text-2xl">
            {title}
          </h2>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors duration-200"
          >
            See All &gt;
          </button>
        )}
      </div>

      <div className="group/row relative md:-ml-2 overflow-hidden">
        <button
            onClick={() => handleClick('left')}
            aria-label="Scroll left"
            className="absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:lg:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100"
        >
            <ChevronLeftIcon className="w-full h-full" />
        </button>
        <div ref={rowRef} className="flex items-center space-x-2 md:space-x-4 overflow-x-scroll scrollbar-hide md:p-2 overscroll-x-contain snap-x snap-mandatory scroll-smooth">
          {movies.map((movie) => (
            <MovieCard
              key={`${movie.id}-${title}`}
              movie={movie}
              onSelectMovie={onSelectMovie}
              onToggleMyList={onToggleMyList}
              isAdded={myList.some(item => item.id === movie.id)}
              isCarouselItem={true}
            />
          ))}
        </div>
        <button
            onClick={() => handleClick('right')}
            aria-label="Scroll right"
            className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:lg:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100"
        >
            <ChevronRightIcon className="w-full h-full" />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;