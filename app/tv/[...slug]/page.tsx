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
import { EpisodesSection } from '@/components/features/episodes-section';

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
                <EpisodesSection 
                  show={show} 
                  seasonData={seasonData} 
                  seasonNum={seasonNum} 
                  episodeNum={episodeNum} 
                  isPlaying={isPlaying} 
                />
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
