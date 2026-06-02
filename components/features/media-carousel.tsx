'use client';

import * as React from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import { Media } from '@/types/tmdb';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export function MediaCarousel({ title, items }: MediaCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
        
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 group">
      <div className="px-4 sm:px-8 lg:px-12 mb-2 z-10 relative">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          {title}
        </h2>
      </div>
      <div className="relative group/carousel">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-8 bottom-12 z-20 bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center w-12 rounded-r-xl"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div 
          ref={scrollRef}
          className="flex whitespace-nowrap overflow-x-scroll scroll-smooth scrollbar-hide gap-4 px-4 sm:px-8 lg:px-12 pb-8 pt-4 w-full" 
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] relative whitespace-normal">
              <MovieCard media={item} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-4 bottom-12 z-10 bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center w-12 rounded-l-xl"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}
