import Image from 'next/image';
import Link from 'next/link';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { TVShowDetails, Credits, TMDBResponse, TVShow, Video, TMDBImages } from '@/types/tmdb';
import { Icons } from '@/components/ui/icons';
import { WatchlistButton } from '@/components/features/watchlist-button';
import { MediaCarousel } from '@/components/features/media-carousel';
import { BackButton } from '@/components/features/back-button';
import { PlayerBackButton } from '@/components/features/player-back-button';
import { PeachifyPlayer } from '@/components/features/peachify-player';

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const id = slug[0];
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
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await props.params;
  const id = slug[0];
  const searchParams = await props.searchParams;
  const isPlaying = searchParams.play === 'true';
  const seasonNum = slug[1] || searchParams.season || '1';
  const episodeNum = slug[2] || searchParams.episode || '1';
  
  if (!process.env.TMDB_API_KEY) {
     return <div className="pt-32 text-center text-red-400">API Key missing. Cannot fetch TMDB.</div>
  }

  const [show, credits, similar, videos, seasonData, images] = await Promise.all([
    fetchTMDB<TVShowDetails>(`/tv/${id}`),
    fetchTMDB<Credits>(`/tv/${id}/credits`),
    fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/similar`),
    fetchTMDB<{results: Video[]}>(`/tv/${id}/videos`),
    fetchTMDB<any>(`/tv/${id}/season/${seasonNum}`).catch(() => null),
    fetchTMDB<TMDBImages>(`/tv/${id}/images`, { include_image_language: 'en,null' }).catch(() => ({} as TMDBImages))
  ]);

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
  const mainCast = credits.cast.slice(0, 10);
  const logo = images.logos?.length > 0 ? images.logos[0] : null;

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-[100] w-full h-full overflow-hidden">
        <PlayerBackButton href={`/tv/${id}/${seasonNum}`} />
        <PeachifyPlayer
          type="tv"
          mediaId={show.id.toString()}
          season={Number(seasonNum)}
          episode={Number(episodeNum)}
          autoPlay={true}
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
              src={getImageUrl(show.backdrop_path, 'original')}
              alt={show.name}
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
                       alt={show.name}
                       fill
                       className="object-contain object-left-bottom drop-shadow-2xl"
                    />
                 </div>
              ) : (
                 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
                    {show.name}
                 </h1>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold text-zinc-400 mb-4">
                 {show.vote_average > 0 && (
                   <div className="flex items-center gap-1">
                     <Icons.star className="w-4 h-4 text-red-500 fill-red-500" />
                     <span className="text-white">{show.vote_average.toFixed(1)}</span>
                   </div>
                 )}
                 {show.vote_average > 0 && <span>&bull;</span>}
                 {show.first_air_date && (
                   <>
                     <span>{new Date(show.first_air_date).getFullYear()}</span>
                     <span>&bull;</span>
                   </>
                 )}
                 <span>{show.number_of_seasons} Seasons</span>
                 {show.genres?.length > 0 && (
                   <>
                     <span>&bull;</span>
                     <div className="flex flex-wrap gap-2">
                        {show.genres.slice(0, 3).map(g => (
                           <span key={g.id} className="text-zinc-300">
                              {g.name}
                           </span>
                        ))}
                     </div>
                   </>
                 )}
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-xl font-normal mb-8 line-clamp-3">
                 {show.overview}
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <Link href={`/tv/${id}/${seasonNum}/1?play=true`} className="bg-white text-black font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-zinc-200 transition">
                  <Icons.play className="w-5 h-5 fill-black" />
                  Play
                </Link>
                <WatchlistButton media={{...show, media_type: 'tv', genre_ids: show.genres?.map(g => g.id) || []}} className="" iconOnly />
                
                <a href="#episodes" className="bg-zinc-800/60 border border-zinc-700/50 text-white font-medium text-sm px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-zinc-700 transition">
                   <Icons.list className="w-4 h-4" />
                   Episodes
                </a>
              </div>
           </div>
        </div>
      <div className="w-full px-4 md:px-16 py-8 space-y-12 mt-4">
         <div className="max-w-screen-xl mx-auto space-y-12">
            {show.seasons && show.seasons.filter(s => s.season_number > 0).length > 0 && (
              <div id="episodes" className="relative group scroll-mt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                     <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                     Episodes
                  </h2>

                  <div className="flex flex-wrap items-center gap-4">
                     {/* Search Input */}
                     <div className="relative flex items-center bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-lg w-full md:w-64 transition-colors focus-within:border-zinc-500">
                        <Icons.search className="w-4 h-4 text-zinc-500 absolute left-3" />
                        <input 
                           type="text" 
                           placeholder="Search episodes..." 
                           className="bg-transparent border-none outline-none text-sm text-zinc-300 w-full pl-6 placeholder:text-zinc-500"
                        />
                     </div>

                     {/* Season Dropdown */}
                     <div className="relative group/dropdown">
                       <button className="bg-zinc-900/60 border border-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition">
                          Season {seasonNum}
                          <Icons.chevronDown className="w-4 h-4 text-zinc-400" />
                       </button>
                       <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                          <div className="max-h-60 overflow-y-auto">
                             {show.seasons?.filter(s => s.season_number > 0).map(s => (
                                <Link 
                                   key={s.id} 
                                   href={`/tv/${show.id}/${s.season_number}#episodes`}
                                   className={`block px-4 py-2 text-sm hover:bg-zinc-800 ${seasonNum === s.season_number.toString() ? 'text-white bg-zinc-800 font-medium' : 'text-zinc-400'}`}
                                >
                                   {s.name}
                                </Link>
                             ))}
                          </div>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Episodes List */}
                {seasonData?.episodes && (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                    {seasonData.episodes.map((ep: any) => {
                      const isCurrent = isPlaying && seasonNum === ep.season_number.toString() && episodeNum === ep.episode_number.toString();
                      return (
                        <Link
                          key={ep.id}
                          href={`/tv/${show.id}/${ep.season_number}/${ep.episode_number}?play=true`}
                          className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl transition-colors ${
                            isCurrent ? 'bg-neutral-800 border border-neutral-700' : 'hover:bg-neutral-900/50 border border-transparent'
                          }`}
                        >
                          <div className="relative w-full sm:w-48 shrink-0 aspect-video bg-neutral-900 rounded-lg overflow-hidden group/ep">
                           {ep.still_path ? (
                             <Image 
                               src={getImageUrl(ep.still_path, 'w500')}
                               alt={ep.name}
                               fill
                               className="object-cover transition-transform duration-300 group-hover:scale-105"
                               referrerPolicy="no-referrer"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                           )}
                           <div className="absolute inset-0 bg-black/20 group-hover/ep:bg-black/40 transition-colors flex items-center justify-center">
                             <Icons.play className="w-8 h-8 text-white fill-white opacity-0 group-hover/ep:opacity-100 transition-opacity drop-shadow-lg" />
                           </div>
                           {ep.runtime && (
                              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                                {ep.runtime}m
                              </div>
                           )}
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-2 mb-1">
                               <h4 className={`font-medium text-lg leading-tight truncate ${isCurrent ? 'text-white' : 'text-neutral-200'}`}>
                                 {ep.episode_number}. {ep.name}
                               </h4>
                            </div>
                            <p className="text-sm text-neutral-400 line-clamp-3 mt-1 leading-relaxed">
                               {ep.overview || 'No description available.'}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="pt-8">
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
        <div className="mt-8 relative z-20">
          <MediaCarousel title="More Like This" items={similar.results.map(m => ({...m, media_type: 'tv'}))} />
        </div>
      )}
    </div>
  );
}
