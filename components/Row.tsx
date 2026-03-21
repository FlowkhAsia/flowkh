'use client';

import { Movie, IMAGE_BASE_URL } from '@/lib/tmdb';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';

interface RowProps {
  title: string;
  movies: Movie[];
}

export default function Row({ title, movies }: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-0.5 md:space-y-2 px-4 md:px-10 mb-8">
      <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <ChevronLeft
          className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1 ${
            !isMoved && 'hidden'
          }`}
          onClick={() => handleClick('left')}
        />
        
        <div
          ref={rowRef}
          className="flex items-center space-x-2.5 overflow-x-scroll scroll-smooth scrollbar-hide md:space-x-4 md:p-2"
        >
          {movies.map((movie) => {
            const imagePath = movie.poster_path || movie.backdrop_path;
            const imageUrl = imagePath 
              ? `${IMAGE_BASE_URL}${imagePath}`
              : `https://picsum.photos/seed/${movie.id}/400/600?blur=2`;

            return (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative cursor-pointer transition duration-200 ease-out md:hover:z-50 h-64 min-w-[160px] md:h-80 md:min-w-[200px]"
              >
                <Image
                  src={imageUrl}
                  alt={movie.title || movie.name || 'Movie poster'}
                  fill
                  className="rounded-sm object-cover md:rounded"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                   <p className="text-white text-xs md:text-sm font-semibold truncate w-full text-shadow-md">
                     {movie.title || movie.name || movie.original_name}
                   </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <ChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
}
