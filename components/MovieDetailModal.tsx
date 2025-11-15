import React, { useEffect, useState } from 'react';
import { Movie, MovieDetail } from '../types';
import { getDetails, getImageUrl } from '../services/tmdb';
import { CheckIcon, CloseIcon, PlayIcon, PlusIcon } from './icons/Icons';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
  isInWatchlist: (id: number, type: 'movie' | 'tv') => boolean;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (id: number, type: 'movie' | 'tv') => void;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movie, onClose, onPlay, isInWatchlist, onAddToWatchlist, onRemoveFromWatchlist }) => {
  const [details, setDetails] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!movie.media_type) return;
      setLoading(true);
      try {
        const movieDetails = await getDetails(movie.media_type, movie.id);
        setDetails(movieDetails);
      } catch (error) {
        console.error('Failed to fetch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movie]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const inWatchlist = movie.media_type ? isInWatchlist(movie.id, movie.media_type) : false;
  
  const handleWatchlistClick = () => {
    if (!movie.media_type) return;
    if (inWatchlist) {
      onRemoveFromWatchlist(movie.id, movie.media_type);
    } else {
      onAddToWatchlist(movie);
    }
  };

  // TV shows from the raw TMDB API have 'name' instead of 'title', so we check for it on the 'details' object.
  const title = details?.title || (details as any)?.name || movie.title;
  const releaseDate = (details as any)?.release_date || (details as any)?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear().toString() : 'N/A';

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-netflix-dark rounded-lg w-full max-w-3xl max-h-full overflow-y-auto animate-fade-in-up">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/60 rounded-full h-9 w-9 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          
          <div className="relative pt-[56.25%]">
            {loading ? (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse"></div>
            ) : (
              <>
                <img
                  src={getImageUrl((details as any)?.backdrop_path, 'original')}
                  alt={title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/50 to-transparent"></div>
              </>
            )}
          </div>
          
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => onPlay(movie)}
                    className="flex items-center justify-center bg-white text-black font-bold rounded px-6 py-2 hover:bg-gray-200 transition"
                    >
                    <PlayIcon className="h-6 w-6 mr-2" />
                    Play
                  </button>
                  <button 
                     onClick={handleWatchlistClick}
                     className="h-11 w-11 rounded-full border-2 border-gray-400 text-white flex items-center justify-center hover:border-white transition bg-black/40"
                     aria-label={inWatchlist ? "Remove from My List" : "Add to My List"}
                    >
                     {inWatchlist ? <CheckIcon className="h-7 w-7"/> : <PlusIcon className="h-7 w-7"/>}
                   </button>
            </div>
          </div>
        </div>

        <div className="p-8 text-white">
          {loading ? (
             <p>Loading...</p>
          ) : details ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="flex items-center space-x-4 mb-4 text-gray-400">
                        <span className="text-green-500 font-bold">{Math.round((details as any).vote_average * 10)}% Match</span>
                        <span>{year}</span>
                        {details.runtime && <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
                        {(details as any).number_of_seasons && <span>{(details as any).number_of_seasons} Season{(details as any).number_of_seasons > 1 ? 's' : ''}</span>}
                    </div>
                    <p>{details.description}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-2">Cast: <span className="text-white">{(details as any).credits?.cast.slice(0, 3).map((c: any) => c.name).join(', ')}</span></p>
                    <p className="text-sm text-gray-400 mb-2">Genres: <span className="text-white">{(details as any).genres?.map((g: any) => g.name).join(', ')}</span></p>
                </div>
            </div>
          ) : (
            <p>Could not load details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;