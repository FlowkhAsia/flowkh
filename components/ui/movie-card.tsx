'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, TrendingUp, Calendar, Star, Info } from 'lucide-react';
import { Media, Movie, TVShow } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

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
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('group relative flex flex-col gap-2 rounded-xl overflow-hidden', className)}
    >
      <Link href={linkPath} className="block relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-neutral-800">
        <Image
          src={getImageUrl(media.poster_path, 'w500')}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
           <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-white">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {media.vote_average ? media.vote_average.toFixed(1) : 'NR'}
              </span>
           </div>
           <div className="flex items-center gap-2 group/btn cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-medium text-sm transition-colors hover:bg-neutral-200">
             <Play className="w-4 h-4 fill-black" />
             View Details
           </div>
        </div>
      </Link>
      <div className="px-1">
        <h3 className="font-medium text-sm md:text-base text-neutral-100 line-clamp-1 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          {releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown Year'}
        </p>
      </div>
    </motion.div>
  );
}
