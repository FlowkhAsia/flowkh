import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getTvSeason, getMovieDetails, IMAGE_BASE_URL } from '@/lib/tmdb';

export default async function WatchPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ type: string, id: string }>,
  searchParams: Promise<{ season?: string, episode?: string }>
}) {
  const { type, id } = await params;
  const { season, episode } = await searchParams;

  let embedUrl = '';
  let episodes: any[] = [];
  let showDetails: any = null;
  const currentSeason = season || '1';
  const currentEpisode = episode || '1';

  if (type === 'movie') {
    embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
  } else if (type === 'tv') {
    embedUrl = `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
    try {
      const movieId = parseInt(id, 10);
      const seasonNum = parseInt(currentSeason, 10);
      [showDetails, episodes] = await Promise.all([
        getMovieDetails(movieId, 'tv'),
        getTvSeason(movieId, seasonNum)
      ]);
    } catch (e) {
      console.error("Failed to fetch TV show details", e);
    }
  } else {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        Invalid media type
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Main Player Area */}
      <div className="flex-grow flex flex-col relative h-[40vh] md:h-full shrink-0 md:shrink">
        <div className="absolute top-4 left-4 z-50">
          <Link 
            href={`/title/${type}/${id}`} 
            className="flex items-center gap-2 text-white hover:text-gray-300 transition bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Go back to details"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
        <iframe 
          src={embedUrl} 
          title={`Video player for ${type === 'movie' ? 'movie' : 'TV show'}`}
          className="w-full h-full border-0" 
          allowFullScreen 
          allow="autoplay; fullscreen"
        ></iframe>
      </div>

      {/* Episodes Sidebar (Only for TV Shows) */}
      {type === 'tv' && episodes && episodes.length > 0 && (
        <div className="w-full md:w-80 lg:w-96 bg-[#141414] h-[60vh] md:h-full overflow-y-auto border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0">
          <div className="p-4 sticky top-0 bg-[#141414]/95 backdrop-blur z-10 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white truncate">
              {showDetails?.name || 'Episodes'}
            </h2>
            <p className="text-sm text-gray-400">Season {currentSeason}</p>
          </div>
          
          <div className="flex flex-col p-2 gap-2">
            {episodes.map((ep) => {
              const airDate = ep.air_date ? new Date(ep.air_date) : null;
              const isReleased = airDate ? airDate <= new Date() : true;
              const isCurrent = ep.episode_number.toString() === currentEpisode;
              
              const imageSrc = ep.still_path 
                ? `${IMAGE_BASE_URL}${ep.still_path}` 
                : (showDetails?.backdrop_path ? `${IMAGE_BASE_URL}${showDetails.backdrop_path}` : `https://picsum.photos/seed/${ep.id}/300/170?blur=2`);

              const innerContent = (
                <div className="flex gap-3 items-center">
                  <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden bg-[#2a2a2a]">
                    <Image
                      src={imageSrc}
                      alt={ep.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {!isReleased ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-white text-[10px] font-semibold px-1 py-0.5 bg-black/80 rounded">
                          Coming
                        </span>
                      </div>
                    ) : isCurrent ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-white text-xs font-bold">Playing</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {ep.episode_number}. {ep.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ep.runtime ? `${ep.runtime}m` : ''}
                    </span>
                  </div>
                </div>
              );

              if (isReleased && !isCurrent) {
                return (
                  <Link 
                    key={ep.id} 
                    href={`/watch/tv/${id}?season=${currentSeason}&episode=${ep.episode_number}`}
                    className="group p-2 rounded hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={`Play Episode ${ep.episode_number}: ${ep.name}`}
                  >
                    {innerContent}
                  </Link>
                );
              }

              return (
                <div 
                  key={ep.id} 
                  className={`p-2 rounded ${isCurrent ? 'bg-white/10' : 'opacity-50'}`}
                  aria-label={isCurrent ? `Currently playing Episode ${ep.episode_number}: ${ep.name}` : `Episode ${ep.episode_number}: ${ep.name}, Coming ${airDate?.toLocaleDateString()}`}
                >
                  {innerContent}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
