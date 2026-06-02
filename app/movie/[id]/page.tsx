import Image from 'next/image';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { MovieDetails, Credits, TMDBResponse, Movie, Video } from '@/types/tmdb';
import { Play, Star, Calendar, Clock, Loader2 } from 'lucide-react';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const movie = await fetchTMDB<MovieDetails>(`/movie/${id}`);
    return {
      title: `${movie.title} - Cinemate`,
      description: movie.overview,
    };
  } catch {
    return { title: 'Movie Not Found' };
  }
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!process.env.TMDB_API_KEY) {
     return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>
  }

  const [movie, credits, similar, videos] = await Promise.all([
    fetchTMDB<MovieDetails>(`/movie/${id}`),
    fetchTMDB<Credits>(`/movie/${id}/credits`),
    fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/similar`),
    fetchTMDB<{results: Video[]}>(`/movie/${id}/videos`)
  ]);

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 10);
  const director = credits.crew.find(c => c.job === 'Director');

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero Banner with Trailer or Backdrop */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
         {trailer ? (
           <div className="absolute inset-0 z-0">
             <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailer.key}`}
                allow="autoplay; encrypted-media"
                className="w-full h-full object-cover scale-[1.2] md:scale-105 opacity-50"
                style={{ pointerEvents: 'none' }}
             />
           </div>
         ) : (
           <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              fill
              priority
              className="object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
         
         {/* Title area overlays the hero image */}
         <div className="absolute bottom-0 w-full top-auto py-12 md:py-20 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            <div className="hidden md:block shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-48 lg:w-64">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                width={300}
                height={450}
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-neutral-300 mb-6 w-full">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {movie.vote_average.toFixed(1)}
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                )}
                {movie.runtime && movie.runtime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </div>
                )}
              </div>
              
              <p className="text-lg text-neutral-200 mb-8 max-w-3xl drop-shadow-md">
                {movie.overview}
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                {trailer && (
                  <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-white/10">
                    <Play className="w-5 h-5 fill-black" />
                    Play Trailer
                  </a>
                )}
                <WatchlistButton media={{...movie, media_type: 'movie', genre_ids: movie.genres?.map(g => g.id) || []}} />
              </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Top Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {mainCast.map(actor => (
                   <div key={actor.id} className="bg-neutral-900/50 rounded-xl overflow-hidden border border-neutral-800/50">
                      <div className="aspect-[3/4] relative bg-neutral-800">
                         {actor.profile_path ? (
                           <Image 
                             src={getImageUrl(actor.profile_path)}
                             alt={actor.name}
                             fill
                             className="object-cover"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                         )}
                      </div>
                      <div className="p-3">
                         <div className="font-medium text-sm text-white line-clamp-1">{actor.name}</div>
                         <div className="text-xs text-neutral-400 line-clamp-1">{actor.character}</div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
         </div>
         
         {/* Sidebar Info */}
         <div className="space-y-8 bg-neutral-900/30 p-6 rounded-2xl border border-neutral-800/50 h-fit">
            <h3 className="text-lg font-semibold border-b border-neutral-800 pb-2">Information</h3>
            
            {director && (
              <div>
                <span className="block text-sm text-neutral-500 mb-1">Director</span>
                <span className="font-medium">{director.name}</span>
              </div>
            )}
            
            {movie.genres?.length > 0 && (
              <div>
                <span className="block text-sm text-neutral-500 mb-2">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(g => (
                    <span key={g.id} className="text-xs px-2.5 py-1 bg-neutral-800 rounded-full text-neutral-300">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <span className="block text-sm text-neutral-500 mb-1">Status</span>
              <span className="font-medium">{movie.status}</span>
            </div>
            
            {(movie.budget > 0) && (
              <div>
                <span className="block text-sm text-neutral-500 mb-1">Budget</span>
                <span className="font-medium">${(movie.budget / 1000000).toFixed(1)}M</span>
              </div>
            )}
            
            {(movie.revenue > 0) && (
              <div>
                <span className="block text-sm text-neutral-500 mb-1">Revenue</span>
                <span className="font-medium">${(movie.revenue / 1000000).toFixed(1)}M</span>
              </div>
            )}
         </div>
      </div>
      
      {similar.results.length > 0 && (
        <div className="mt-8 relative z-20">
          <MediaCarousel title="More Like This" items={similar.results.map(m => ({...m, media_type: 'movie'}))} />
        </div>
      )}
    </div>
  );
}
