import { Metadata } from 'next';
import { Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getTvSeason, getMovieDetails, getSimilar, IMAGE_BASE_URL } from '@/lib/tmdb';
import SeasonSelector from '@/components/SeasonSelector';

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ id: string, type: string }>,
  searchParams: Promise<{ season?: string, episode?: string }>
}): Promise<Metadata> {
  const { id, type } = await params;
  const { season, episode } = await searchParams;
  const movieId = parseInt(id, 10);
  const movie = await getMovieDetails(movieId, type);

  if (!movie) {
    return {
      title: 'Watch on Flowkh',
      description: 'Watch movies and TV shows online for free on Flowkh.',
    };
  }

  const title = movie.title || movie.name || movie.original_name;
  let pageTitle = `Watch ${title}`;
  let description = movie.overview || `Watch ${title} on Flowkh.`;

  if (type === 'tv') {
    const currentSeason = season || '1';
    const currentEpisode = episode || '1';
    pageTitle = `Watch ${title} - Season ${currentSeason} Episode ${currentEpisode}`;
    description = `Watch ${title} Season ${currentSeason} Episode ${currentEpisode} online for free on Flowkh.`;
  }

  const image = movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : '/og-image.jpg';

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      url: `https://flowkh.com/watch/${type}/${id}${type === 'tv' ? `?season=${season || 1}&episode=${episode || 1}` : ''}`,
      type: 'video.other',
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description,
      images: [image],
    },
    robots: {
      index: false, // Usually you don't want to index the actual player page to avoid duplicate content/thin content, but we'll allow it or set to noindex depending on preference. Let's set index: false for player pages to focus SEO on the title pages.
      follow: true,
    }
  };
}

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
  let similarMovies: any[] = [];
  const currentSeason = season || '1';
  const currentEpisode = episode || '1';

  if (type === 'movie') {
    embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
    try {
      const movieId = parseInt(id, 10);
      similarMovies = await getSimilar(movieId, 'movie');
    } catch (e) {
      console.error("Failed to fetch similar movies", e);
    }
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
            {showDetails?.seasons ? (
              <SeasonSelector seasons={showDetails.seasons} currentSeason={currentSeason} appendEpisode={true} />
            ) : (
              <p className="text-sm text-gray-400">Season {currentSeason}</p>
            )}
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
                    className="group p-2 rounded hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/50 border-l-4 border-transparent"
                    aria-label={`Play Episode ${ep.episode_number}: ${ep.name}`}
                  >
                    {innerContent}
                  </Link>
                );
              }

              return (
                <div 
                  key={ep.id} 
                  className={`p-2 rounded ${isCurrent ? 'bg-[#2a2a2a] border-l-4 border-netflix-red' : 'opacity-50 border-l-4 border-transparent'}`}
                  aria-label={isCurrent ? `Currently playing Episode ${ep.episode_number}: ${ep.name}` : `Episode ${ep.episode_number}: ${ep.name}, Coming ${airDate?.toLocaleDateString()}`}
                >
                  {innerContent}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Similar Movies Sidebar (Only for Movies) */}
      {type === 'movie' && similarMovies && similarMovies.length > 0 && (
        <div className="w-full md:w-80 lg:w-96 bg-[#141414] h-[60vh] md:h-full overflow-y-auto border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0">
          <div className="p-4 sticky top-0 bg-[#141414]/95 backdrop-blur z-10 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white truncate">
              More Like This
            </h2>
          </div>
          
          <div className="flex flex-col p-2 gap-2">
            {similarMovies.map((similarMovie) => {
              const imageSrc = similarMovie.backdrop_path 
                ? `${IMAGE_BASE_URL}${similarMovie.backdrop_path}` 
                : (similarMovie.poster_path ? `${IMAGE_BASE_URL}${similarMovie.poster_path}` : `https://picsum.photos/seed/${similarMovie.id}/300/170?blur=2`);

              const innerContent = (
                <div className="flex gap-3 items-center">
                  <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden bg-[#2a2a2a]">
                    <Image
                      src={imageSrc}
                      alt={similarMovie.title || similarMovie.name || 'Movie'}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate text-gray-300 group-hover:text-white">
                      {similarMovie.title || similarMovie.name || similarMovie.original_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {similarMovie.release_date ? similarMovie.release_date.substring(0, 4) : ''}
                    </span>
                  </div>
                </div>
              );

              return (
                <Link 
                  key={similarMovie.id} 
                  href={`/watch/movie/${similarMovie.id}`}
                  className="group p-2 rounded hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={`Play ${similarMovie.title || similarMovie.name || similarMovie.original_name}`}
                >
                  {innerContent}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
