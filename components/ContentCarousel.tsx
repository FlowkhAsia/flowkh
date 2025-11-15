
import React, { useRef } from 'react';
import type { Movie } from '../types';
import MovieCard from './MovieCard';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ContentCarouselProps {
  title: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, movies, onSelectMovie, myList, onToggleMyList }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-4 md:my-8 relative group">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 ml-4 sm:ml-6 lg:ml-8">{title}</h2>
      <div className="absolute top-1/2 -left-4 z-20 hidden md:group-hover:block">
        <button onClick={() => scroll('left')} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition">
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex overflow-x-scroll scrollbar-hide space-x-2 md:space-x-4 px-4 sm:px-6 lg:px-8"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[14.28%]">
            <MovieCard 
              movie={movie} 
              onSelectMovie={onSelectMovie} 
              onToggleMyList={onToggleMyList}
              isAdded={myList.some(item => item.id === movie.id)}
            />
          </div>
        ))}
      </div>
      <div className="absolute top-1/2 -right-4 z-20 hidden md:group-hover:block">
        <button onClick={() => scroll('right')} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition">
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default ContentCarousel;
