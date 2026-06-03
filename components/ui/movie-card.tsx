'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { Media, Movie, TVShow } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  media: Media;
  className?: string;
  priority?: boolean;
}

export function MovieCard({ media, className, priority = false }: MovieCardProps) {
  const isMovie = 'title' in media;
  const title = isMovie ? (media as Movie).title : (media as TVShow).name;
  const releaseDate = isMovie ? (media as Movie).release_date : (media as TVShow).first_air_date;
  
  // Provide a safe media type for URLs since the API might not always return media_type in list views
  const linkPath = `/${isMovie ? 'movie' : 'tv'}/${media.id}`;

  return (
    <div className={cn('group relative w-full rounded-xl overflow-hidden bg-neutral-900', className)}>
      <Link href={linkPath} className="block relative aspect-[2/3] w-full h-full">
        <Image
          src={getImageUrl(media.poster_path, 'w500')}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
          <div className="relative z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
            <h3 className="font-bold text-white text-sm md:text-base line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-neutral-300">
                {releaseDate ? new Date(releaseDate).getFullYear() : ''}
              </span>
              {'vote_average' in media && media.vote_average > 0 && (
                <>
                  <span className="text-neutral-500 text-xs">&bull;</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-red-500 fill-red-500" />
                    <span className="text-xs font-medium text-white">{media.vote_average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
