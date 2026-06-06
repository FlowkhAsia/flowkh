'use client';

import * as React from 'react';
import { MovieCard } from '@/components/ui/movie-card';
import { Media } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export function MediaCarousel({ title, items }: MediaCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftPos, setScrollLeftPos] = React.useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
        
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX); // scroll distance
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative">
      <div className="px-4 sm:px-8 lg:px-12 mb-2 z-10 relative flex items-center gap-2.5 md:gap-3">
        <div className="w-1 h-5 md:h-6 bg-red-600 rounded-sm"></div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          {title}
        </h2>
      </div>
      <div className="relative group/carousel">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-6 bottom-6 z-20 bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center w-12 rounded-r-xl pointer-events-auto"
        >
          <Icons.chevronLeft className="w-8 h-8" />
        </button>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex whitespace-nowrap overflow-x-scroll scrollbar-hide gap-4 px-4 sm:px-8 lg:px-12 pb-4 pt-3 w-full select-none transition-cursor",
            isDown ? "cursor-grabbing" : "cursor-grab",
            !isDown && "scroll-smooth"
          )} 
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] relative whitespace-normal">
              <MovieCard media={item} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-6 bottom-6 z-10 bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center w-12 rounded-l-xl pointer-events-auto"
        >
          <Icons.chevronRight className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}
