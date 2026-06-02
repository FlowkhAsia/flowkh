import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { Movie } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';

export function HeroBanner({ movie }: { movie: Movie }) {
  if (!movie) return null;

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px]">
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title || 'Hero Background'}
          fill
          priority
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </div>

      <div className="absolute inset-0 w-full px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-24 md:pb-32 lg:pb-36 z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
            {movie.title}
          </h1>
          <p className="text-base md:text-lg text-neutral-300 line-clamp-3 mb-8 drop-shadow-md">
            {movie.overview}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium transition-colors hover:bg-neutral-200"
            >
              <Play className="w-5 h-5 fill-black" />
              Watch Trailer
            </Link>
            <Link 
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 bg-neutral-800/80 backdrop-blur-md text-white px-6 py-3 rounded-full font-medium transition-colors hover:bg-neutral-700"
            >
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
