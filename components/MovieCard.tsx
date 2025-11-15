import React from 'react';
import { Movie } from '../types';
import { BookmarkPlusIcon, BookmarkSolidIcon, StarIcon } from './icons/Icons';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onToggleMyList: (movie: Movie) => void;
  isAdded: boolean;
  display?: 'backdrop' | 'poster';
  isCarouselItem?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelectMovie, onToggleMyList, isAdded, display = 'poster', isCarouselItem = false }) => {
  const isBackdrop = display === 'backdrop';

  const imageUrl = isBackdrop ? movie.backdropUrl : movie.posterUrl;
  const aspectRatioClass = isBackdrop ? 'aspect-video' : 'aspect-[2/3]';
  
  const carouselWidthClass = isCarouselItem
    ? isBackdrop
      ? 'w-48 sm:w-52 md:w-60 lg:w-72'
      : 'w-40 sm:w-44 md:w-48 lg:w-52'
    : '';

  const containerClasses = [
    'relative',
    aspectRatioClass,
    carouselWidthClass,
    isCarouselItem ? 'flex-shrink-0 snap-start' : '',
    'cursor-pointer',
    'group',
    'overflow-hidden',
    'rounded-md',
    'hover:z-20',
  ].join(' ');
  
  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMyList(movie);
  };

  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className={containerClasses}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        draggable="false"
        src={imageUrl}
        alt={movie.title}
        loading="lazy"
        decoding="async"
        className="object-cover w-full h-full select-none transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:scale-105"
      />
      
      <button
        onClick={handleToggleList}
        className="absolute top-0 left-0 w-10 h-12 flex items-start justify-start p-1.5 z-10 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300"
        title={isAdded ? "Remove from My List" : "Add to My List"}
        aria-label={isAdded ? "Remove from My List" : "Add to My List"}
      >
        {isAdded ? (
            <BookmarkSolidIcon className="w-7 h-7 text-yellow-400" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
        ) : (
            <BookmarkPlusIcon className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }}/>
        )}
      </button>

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end ${isBackdrop ? 'p-4' : 'p-3'} pointer-events-none`}>
        <div>
          <h3 className={`text-white font-bold line-clamp-2 leading-tight ${isBackdrop ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>{movie.title}</h3>
          <div className="flex items-center text-xs text-gray-300 mt-1.5 space-x-2">
            <span>{movie.releaseYear}</span>
            <div className="flex items-center gap-1 border border-white/40 rounded px-1 py-0.5 text-[10px] font-medium">
                <StarIcon className="w-2.5 h-2.5 text-yellow-400" />
                <span>{movie.rating.toFixed(1)}</span>
            </div>
            <span className="uppercase text-[10px]">{movie.media_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;