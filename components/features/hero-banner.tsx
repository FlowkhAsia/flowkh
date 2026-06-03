import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Star } from 'lucide-react';
import { Movie, TMDBImage } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';

export function HeroBanner({ movie, logo }: { movie: Movie, logo?: TMDBImage | null }) {
  if (!movie) return null;

  return (
    <div className="relative h-[85vh] md:h-[90vh] w-full">
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title || 'Hero Background'}
          fill
          priority
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
      </div>

      <div className="absolute bottom-[15%] left-4 md:left-16 max-w-xl z-20 space-y-4">
        {logo ? (
           <div className="relative w-48 md:w-80 h-24 md:h-32 mb-4">
              <Image 
                 src={getImageUrl(logo.file_path, 'w500')} 
                 alt={movie.title}
                 fill
                 className="object-contain object-left-bottom drop-shadow-2xl"
              />
           </div>
        ) : (
           <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
             {movie.title}
           </h1>
        )}
        
        <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-zinc-400 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-white">{movie.vote_average?.toFixed(1)}</span>
          </div>
          <span>&bull;</span>
          <span>{movie.release_date?.substring(0, 4)}</span>
        </div>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-lg font-normal mb-8 line-clamp-3">
          {movie.overview}
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <Link 
            href={`/movie/${movie.id}?play=true`}
            className="bg-white text-black px-6 md:px-8 py-2.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2 hover:bg-zinc-200 transition"
          >
            <Play className="w-5 h-5 fill-black" />
            Play
          </Link>
          <Link 
            href={`/movie/${movie.id}`}
            className="bg-zinc-800/60 backdrop-blur-sm text-white border border-zinc-700/50 px-6 md:px-8 py-2.5 rounded-full font-semibold text-sm md:text-base flex items-center gap-2 hover:bg-zinc-700 transition"
          >
            <Info className="w-5 h-5" />
            See More
          </Link>
        </div>
      </div>
    </div>
  );
}
