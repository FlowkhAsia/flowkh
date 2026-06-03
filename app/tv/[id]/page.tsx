import Image from 'next/image';
import Link from 'next/link';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { TVShowDetails, Credits, TMDBResponse, TVShow, Video } from '@/types/tmdb';
import { Play, Star, Calendar, Loader2 } from 'lucide-react';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const show = await fetchTMDB<TVShowDetails>(`/tv/${id}`);
    return {
      title: `${show.name} - Cinemate`,
      description: show.overview,
    };
  } catch {
    return { title: 'TV Show Not Found' };
  }
}

export default async function TVShowPage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const isPlaying = searchParams.play === 'true';
  const seasonNum = searchParams.season || '1';
  const episodeNum = searchParams.episode || '1';
  
  if (!process.env.TMDB_API_KEY) {
     return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>
  }

  const [show, credits, similar, videos] = await Promise.all([
    fetchTMDB<TVShowDetails>(`/tv/${id}`),
    fetchTMDB<Credits>(`/tv/${id}/credits`),
    fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/similar`),
    fetchTMDB<{results: Video[]}>(`/tv/${id}/videos`)
  ]);

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 10);

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero Banner with Player or Backdrop */}
      {isPlaying ? (
        <div className="w-full pt-16 bg-black z-20 relative">
          <div className="w-full aspect-video max-w-7xl mx-auto">
            <iframe
              src={`https://vidkh.site/tv/${show.id}/${seasonNum}/${episodeNum}?autoPlay=true`}
              allowFullScreen
              allow="autoplay; encrypted-media"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[60vh] md:h-[80vh]">
           <Image
              src={getImageUrl(show.backdrop_path, 'original')}
              alt={show.name}
              fill
              priority
              className="object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
           
           <div className="absolute bottom-0 w-full top-auto py-12 md:py-20 z-10 px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row gap-8 items-end">
              <div className="hidden md:block shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-48 lg:w-64">
                <Image
                  src={getImageUrl(show.poster_path)}
                  alt={show.name}
                  width={300}
                  height={450}
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl">{show.name}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-neutral-300 mb-6 w-full">
                  {show.vote_average > 0 && (
                    <div className="flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {show.vote_average.toFixed(1)}
                    </div>
                  )}
                  {show.first_air_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(show.first_air_date).getFullYear()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                     <span className="font-medium text-white">{show.number_of_seasons}</span> Seasons
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="font-medium text-white">{show.number_of_episodes}</span> Episodes
                  </div>
                </div>
                
                <p className="text-lg text-neutral-200 mb-8 max-w-3xl drop-shadow-md">
                  {show.overview}
                </p>
                
                <div className="flex flex-wrap items-center gap-6">
                  {!isPlaying && (
                    <Link href={`/tv/${id}?play=true`} className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-white/10">
                      <Play className="w-5 h-5 fill-black border-0" />
                      Watch Series
                    </Link>
                  )}
                  <WatchlistButton media={{...show, media_type: 'tv', genre_ids: show.genres?.map(g => g.id) || []}} />
                </div>
              </div>
           </div>
        </div>
      )}

      <div className={`w-full px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 ${isPlaying ? 'mt-8' : 'mt-16'}`}>
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-12">
            {show.seasons && show.seasons.filter(s => s.season_number > 0).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Episodes</h2>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                  {show.seasons.filter(s => s.season_number > 0).map((s) => (
                     <div key={s.id} className="space-y-3 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800">
                        <h4 className="font-semibold text-lg text-white">{s.name}</h4>
                        <div className="flex flex-wrap gap-2">
                           {Array.from({ length: s.episode_count }).map((_, i) => {
                             const ep = (i + 1).toString();
                             const isCurrent = seasonNum === s.season_number.toString() && episodeNum === ep;
                             return (
                               <Link 
                                 key={i} 
                                 href={`/tv/${show.id}?play=true&season=${s.season_number}&episode=${ep}`}
                                 className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                   isCurrent
                                     ? 'bg-red-600 text-white' 
                                     : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                 }`}
                               >
                                 {ep}
                               </Link>
                             );
                           })}
                        </div>
                     </div>
                  ))}
                </div>
              </div>
            )}

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
                             referrerPolicy="no-referrer"
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
            
            {show.genres?.length > 0 && (
              <div>
                <span className="block text-sm text-neutral-500 mb-2">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map(g => (
                    <span key={g.id} className="text-xs px-2.5 py-1 bg-neutral-800 rounded-full text-neutral-300">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <span className="block text-sm text-neutral-500 mb-1">Status</span>
              <span className="font-medium">{show.status}</span>
            </div>
            
            {show.origin_country?.length > 0 && (
              <div>
                <span className="block text-sm text-neutral-500 mb-1">Country</span>
                <span className="font-medium">{show.origin_country.join(', ')}</span>
              </div>
            )}
         </div>
      </div>
      
      {similar.results.length > 0 && (
        <div className="mt-8 relative z-20">
          <MediaCarousel title="More Like This" items={similar.results.map(m => ({...m, media_type: 'tv'}))} />
        </div>
      )}
    </div>
  );
}
