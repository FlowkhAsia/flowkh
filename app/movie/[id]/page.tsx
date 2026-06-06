import Image from 'next/image';
import Link from 'next/link';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { MovieDetails, Credits, TMDBResponse, Movie, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';
import { BackButton } from '@/components/features/back-button';
import { PlayerBackButton } from '@/components/features/player-back-button';

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

export default async function MoviePage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const isPlaying = searchParams.play === 'true';
  
  if (!process.env.TMDB_API_KEY) {
     return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>
  }

  const [movie, credits, similar, videos, images] = await Promise.all([
    fetchTMDB<MovieDetails>(`/movie/${id}`),
    fetchTMDB<Credits>(`/movie/${id}/credits`),
    fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/similar`),
    fetchTMDB<{results: Video[]}>(`/movie/${id}/videos`),
    fetchTMDB<TMDBImages>(`/movie/${id}/images`, { include_image_language: 'en,null' }).catch(() => ({} as TMDBImages))
  ]);

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 10);
  const director = credits.crew.find(c => c.job === 'Director');
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-[100] w-full h-full overflow-hidden">
        <PlayerBackButton href={`/movie/${id}`} />
        <iframe
          src={`https://www.vidkh.site/movie/${movie.id}?autoPlay=true`}
          allowFullScreen
          allow="autoplay; encrypted-media"
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 pb-20">
      <BackButton />
      
      {/* Hero Banner Backdrop */}
      <div className="relative h-[70vh] md:h-[80vh] w-full">
           <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              fill
              priority
              className="object-cover object-center opacity-70"
              referrerPolicy="no-referrer"
            />
           <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-0" />
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-0" />
           
           <div className="absolute bottom-12 left-4 md:left-16 z-20 max-w-2xl space-y-4">
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
              
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold text-zinc-400 mb-4">
                 {movie.vote_average > 0 && (
                   <div className="flex items-center gap-1">
                     <Icons.star className="w-4 h-4 text-red-500 fill-red-500" />
                     <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                   </div>
                 )}
                 {movie.vote_average > 0 && <span>&bull;</span>}
                 {movie.release_date && (
                   <>
                     <span>{new Date(movie.release_date).getFullYear()}</span>
                     <span>&bull;</span>
                   </>
                 )}
                 {movie.runtime && movie.runtime > 0 && (
                   <>
                     <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                   </>
                 )}
                 {movie.genres?.length > 0 && (
                   <>
                     <span>&bull;</span>
                     <div className="flex flex-wrap gap-2">
                        {movie.genres.slice(0, 3).map(g => (
                           <span key={g.id} className="text-zinc-300">
                              {g.name}
                           </span>
                        ))}
                     </div>
                   </>
                 )}
                 {director && (
                   <span className="hidden">
                     <span>&bull;</span>
                     <span>Dir. {director.name}</span>
                   </span>
                 )}
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-xl font-normal mb-8 line-clamp-3">
                 {movie.overview}
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <Link href={`/movie/${id}?play=true`} className="bg-white text-black font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-zinc-200 transition">
                  <Icons.play className="w-5 h-5 fill-black" />
                  Play
                </Link>
                <WatchlistButton media={{...movie, media_type: 'movie', genre_ids: movie.genres?.map(g => g.id) || []}} className="" iconOnly />
                
                {similar.results.length > 0 && (
                  <a href="#similar" className="bg-zinc-800/60 border border-zinc-700/50 text-white font-medium text-sm px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-zinc-700 transition">
                     <Icons.list className="w-4 h-4" />
                     Similars
                  </a>
                )}
              </div>
           </div>
        </div>
      <div className="w-full px-4 md:px-16 py-8 space-y-12 mt-4">
         <div className="max-w-screen-xl mx-auto space-y-12">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                 <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                 Top Cast
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                 {mainCast.map(actor => (
                   <div key={actor.id} className="w-[140px] md:w-[160px] shrink-0 group relative rounded-xl overflow-hidden bg-neutral-900">
                      <div className="aspect-[2/3] relative w-full h-full">
                         {actor.profile_path ? (
                           <Image 
                             src={getImageUrl(actor.profile_path)}
                             alt={actor.name}
                             fill
                             className="object-cover transition-transform duration-500 group-hover:scale-110"
                             referrerPolicy="no-referrer"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-800">No Image</div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                           <div className="relative z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                             <div className="font-bold text-white text-sm line-clamp-1">{actor.name}</div>
                             <div className="text-xs font-medium text-neutral-300 mt-1 line-clamp-1">{actor.character}</div>
                           </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
         </div>
      </div>
      
      {similar.results.length > 0 && (
        <div id="similar" className="mt-8 relative z-20 scroll-mt-24">
          <MediaCarousel title="More Like This" items={similar.results.map(m => ({...m, media_type: 'movie'}))} />
        </div>
      )}
    </div>
  );
}
