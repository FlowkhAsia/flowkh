'use client';

import { Movie, IMAGE_BASE_URL } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { getLogoAction } from '@/app/actions';

interface BannerProps {
  movies: Movie[];
}

export default function Banner({ movies }: BannerProps) {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [movies]);

  const movie = movies?.[currentIndex];

  useEffect(() => {
    if (movie) {
      const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
      getLogoAction(movie.id, type).then(setLogoPath);
    }
  }, [movie]);

  if (!movie) return <div className="h-[65vh] lg:h-[85vh] bg-netflix-black" />;

  const imageUrl = movie.backdrop_path || movie.poster_path 
    ? `${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`
    : `https://picsum.photos/seed/${movie.id}/1920/1080?blur=2`;

  return (
    <>
      <div className="relative flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[85vh] lg:justify-end lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id + 'bg'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-0 left-0 -z-10 h-[95vh] w-full"
          >
            <Image
              src={imageUrl}
              alt={movie.title || movie.name || 'Banner Image'}
              fill
              priority
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-netflix-black to-transparent" />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key={movie.id + 'content'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="px-4 md:px-10 z-10 max-w-2xl"
          >
          {logoPath ? (
            <div className="relative h-24 w-full md:h-32 lg:h-40 max-w-md mb-4">
              <Image
                src={`${IMAGE_BASE_URL}${logoPath}`}
                alt={movie.title || movie.name || movie.original_name || 'Movie Logo'}
                fill
                className="object-contain object-left"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold md:text-4xl lg:text-7xl text-shadow-md">
              {movie.title || movie.name || movie.original_name}
            </h1>
          )}
          
          <p className="max-w-xs text-xs text-shadow-md md:max-w-lg md:text-lg lg:max-w-2xl lg:text-xl mt-4 line-clamp-3">
            {movie.overview}
          </p>

          <div className="flex space-x-3 mt-6">
            <button 
              className="flex items-center gap-2 rounded bg-white px-5 py-1.5 text-sm font-semibold text-black transition hover:bg-opacity-80 md:px-8 md:py-2.5 md:text-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`Play ${movie.title || movie.name || movie.original_name}`}
            >
              <Play className="h-5 w-5 md:h-7 md:w-7 fill-black" aria-hidden="true" />
              Play
            </button>
            <Link 
              href={`/title/${movie.media_type || 'movie'}/${movie.id}`}
              className="flex items-center gap-2 rounded bg-[gray]/70 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-opacity-80 md:px-8 md:py-2.5 md:text-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`More info about ${movie.title || movie.name || movie.original_name}`}
            >
              <Info className="h-5 w-5 md:h-7 md:w-7" aria-hidden="true" />
              More Info
            </Link>
          </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
