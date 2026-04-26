import { Metadata } from 'next';
import { getMovieDetails, getCast, getTrailer, getGenres, getSimilar, getLogo, getTvSeason, IMAGE_BASE_URL } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, ThumbsUp, Check, ArrowLeft } from 'lucide-react';
import AddToListButton from '@/components/AddToListButton';
import TrailerButton from '@/components/TrailerButton';
import Row from '@/components/Row';
import SeasonSelector from '@/components/SeasonSelector';

import PeachifyPlayer from '@/components/PeachifyPlayer';

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ id: string, type: string }>,
  searchParams: Promise<{ season?: string, episode?: string, play?: string }>
}): Promise<Metadata> {
  const { id, type } = await params;
  const { season, episode, play } = await searchParams;
  const movieId = parseInt(id, 10);
  const movie = await getMovieDetails(movieId, type);

  if (!movie) {
    return {
      title: 'Title Not Found',
      description: 'The requested movie or TV show could not be found on Flowkh.',
    };
  }

  const title = movie.title || movie.name || movie.original_name;
  const isPlaying = (type === 'tv' && episode) || (type === 'movie' && play === 'true');
  
  let pageTitle = title;
  let description = movie.overview || `Watch ${title} on Flowkh.`;

  if (isPlaying) {
    if (type === 'tv') {
      const currentSeason = season || '1';
      const currentEpisode = episode || '1';
      pageTitle = `Watch ${title} - Season ${currentSeason} Episode ${currentEpisode}`;
      description = `Watch ${title} Season ${currentSeason} Episode ${currentEpisode} online for free on Flowkh.`;
    } else {
      pageTitle = `Watch ${title}`;
    }
  }

  const image = movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : '/og-image.jpg';

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      url: `https://flowkh.com/${type}/${id}${isPlaying ? (type === 'tv' ? `?season=${season || 1}&episode=${episode || 1}` : '?play=true') : ''}`,
      type: type === 'tv' ? 'video.tv_show' : 'video.movie',
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
    robots: isPlaying ? { index: false, follow: true } : undefined,
  };
}

export default async function MovieDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string, type: string }>,
  searchParams: Promise<{ season?: string, episode?: string, play?: string }>
}) {
  const { id, type } = await params;
  const { season, episode, play } = await searchParams;
  const movieId = parseInt(id, 10);
  
  const isPlaying = (type === 'tv' && episode) || (type === 'movie' && play === 'true');

  if (isPlaying) {
    let episodes: any[] = [];
    let showDetails: any = null;
    let similarMovies: any[] = [];
    const currentSeason = season || '1';
    const currentEpisode = episode || '1';

    if (type === 'movie') {
      try {
        similarMovies = await getSimilar(movieId, 'movie');
      } catch (e) {
        console.error("Failed to fetch similar movies", e);
      }
    } else if (type === 'tv') {
      try {
        const seasonNum = parseInt(currentSeason, 10);
        [showDetails, episodes] = await Promise.all([
          getMovieDetails(movieId, 'tv'),
          getTvSeason(movieId, seasonNum)
        ]);
      } catch (e) {
        console.error("Failed to fetch TV show details", e);
      }
    }

    return (
      <div className="w-screen h-screen bg-black flex flex-col md:flex-row overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-grow flex flex-col relative h-[40vh] md:h-full shrink-0 md:shrink">
          <PeachifyPlayer 
            tmdbId={id}
            type={type as 'movie' | 'tv'}
            season={currentSeason}
            episode={currentEpisode}
          />
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
                      href={`/${type}/${id}?season=${currentSeason}&episode=${ep.episode_number}`}
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
                    href={`/movie/${similarMovie.id}?play=true`}
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

  const movie = await getMovieDetails(movieId, type);
  
  if (!movie) {
    return (
      <main className="pt-24 md:pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Title not found</h1>
        <Link href="/" className="text-netflix-red hover:underline">Return to Home</Link>
      </main>
    );
  }

  let currentSeasonNumber = 1;
  if (type === 'tv' && movie.seasons && movie.seasons.length > 0) {
    if (season) {
      currentSeasonNumber = parseInt(season, 10);
    } else {
      currentSeasonNumber = movie.seasons.find(s => s.season_number > 0)?.season_number || 1;
    }
  }

  const [cast, trailer, allGenres, similarMovies, logoPath, episodes] = await Promise.all([
    getCast(movieId, type),
    getTrailer(movieId, type),
    getGenres(),
    getSimilar(movieId, type),
    getLogo(movieId, type),
    type === 'tv' ? getTvSeason(movieId, currentSeasonNumber) : Promise.resolve([])
  ]);

  const movieGenres = allGenres.filter(genre => movie.genre_ids?.includes(genre.id));
  const releaseDate = movie.release_date || movie.first_air_date;
  // Use movie ID to generate a deterministic pseudo-random match percentage
  const matchPercentage = 80 + (movie.id % 20);

  let durationString = '';
  if (type === 'tv') {
    const seasons = movie.number_of_seasons || (movie.seasons ? movie.seasons.length : 1);
    const episodes = movie.number_of_episodes ? ` (${movie.number_of_episodes} Episodes)` : '';
    durationString = `${seasons} Season${seasons !== 1 ? 's' : ''}${episodes}`;
  } else {
    if (movie.runtime) {
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
  }

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-20">
      <div className="relative h-[60vh] md:h-[80vh] w-full">
        <Image
          src={movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : `https://picsum.photos/seed/${movie.id}/1920/1080?blur=2`}
          alt={movie.title || movie.name || 'Movie backdrop'}
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-10 pb-10">
          {logoPath ? (
            <div className="relative w-[60%] max-w-[400px] h-[150px] mb-6">
              <Image
                src={`${IMAGE_BASE_URL}${logoPath}`}
                alt={movie.title || movie.name || 'Title Logo'}
                fill
                className="object-contain object-left-bottom"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow-md max-w-4xl">
              {movie.title || movie.name || movie.original_name}
            </h1>
          )}
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
            <Link 
              href={type === 'tv' ? `/${type}/${id}?season=${currentSeasonNumber}&episode=1` : `/${type}/${id}?play=true`}
              className="flex items-center gap-2 rounded bg-white px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg font-semibold text-black transition hover:bg-opacity-80"
              aria-label={`Play ${movie.title || movie.name || movie.original_name}`}
            >
              <Play className="h-5 w-5 md:h-7 md:w-7 fill-black" aria-hidden="true" />
              Play
            </Link>
            {trailer && <TrailerButton trailerId={trailer} />}
            <AddToListButton movie={movie} />
            <button 
              className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-white/40 bg-[#2a2a2a]/60 transition hover:border-white hover:bg-white/20"
              aria-label="Rate"
            >
              <ThumbsUp className="h-5 w-5 md:h-6 md:w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto mt-8">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-2/3">
            <div className="flex items-center gap-x-3 text-sm md:text-base mb-6">
              <span className="font-semibold text-green-400 text-lg">{matchPercentage}% Match</span>
              <span className="font-light">{releaseDate?.substring(0, 4)}</span>
              <span className="flex h-5 items-center justify-center rounded border border-white/40 px-2 text-xs">
                TV-MA
              </span>
              {durationString && <span className="font-light">{durationString}</span>}
            </div>
            
            <p className="text-base md:text-lg leading-relaxed text-white/90 mb-8">
              {movie.overview}
            </p>
          </div>
          
          <div className="md:w-1/3 flex flex-col gap-4 text-sm md:text-base">
            {cast.length > 0 && (
              <div>
                <span className="text-[#777] block mb-1">Cast:</span>
                <span className="text-white">
                  {cast.slice(0, 5).map(c => c.name).join(', ')}
                  {cast.length > 5 && <span className="text-[#777] italic">, more</span>}
                </span>
              </div>
            )}

            {movieGenres.length > 0 && (
              <div>
                <span className="text-[#777] block mb-1">Genres:</span>
                <span className="text-white">
                  {movieGenres.map((genre, i) => (
                    <span key={genre.id}>
                      <Link href={`/search?q=${encodeURIComponent(genre.name)}`} className="hover:underline">
                        {genre.name}
                      </Link>
                      {i < movieGenres.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div>
              <span className="text-[#777] block mb-1">This {type === 'tv' ? 'show' : 'movie'} is:</span>
              <span className="text-white">Exciting, Suspenseful</span>
            </div>
          </div>
        </div>

        {type === 'tv' && episodes && episodes.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">Episodes</h3>
              {movie.seasons ? (
                <SeasonSelector seasons={movie.seasons} currentSeason={currentSeasonNumber.toString()} appendEpisode={false} />
              ) : (
                <span className="text-lg text-gray-300">Season {currentSeasonNumber}</span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {episodes.map((episode) => {
                const airDate = episode.air_date ? new Date(episode.air_date) : null;
                const isReleased = airDate ? airDate <= new Date() : true;
                const formattedAirDate = airDate ? airDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                
                const imageSrc = episode.still_path 
                  ? `${IMAGE_BASE_URL}${episode.still_path}` 
                  : (movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : `https://picsum.photos/seed/${episode.id}/300/170?blur=2`);

                const innerContent = (
                  <>
                    <div className="hidden md:flex items-center justify-center text-2xl font-light text-gray-400 w-12 shrink-0">
                      {episode.episode_number}
                    </div>
                    <div className="relative w-32 md:w-40 h-20 md:h-24 shrink-0 rounded overflow-hidden bg-[#141414]">
                      <Image
                        src={imageSrc}
                        alt={episode.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {!isReleased ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="text-white text-[10px] md:text-xs font-semibold px-1.5 py-0.5 md:px-2 md:py-1 bg-black/80 rounded text-center">
                            Coming {formattedAirDate}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 cursor-pointer">
                          <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium truncate pr-2 text-sm md:text-base">
                          <span className="md:hidden mr-1">{episode.episode_number}.</span>
                          {episode.name}
                        </h4>
                        <span className="text-xs md:text-sm text-gray-400 shrink-0">{episode.runtime ? `${episode.runtime}m` : ''}</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-400 line-clamp-2 md:line-clamp-3">{episode.overview || 'No overview available.'}</p>
                    </div>
                  </>
                );

                if (isReleased) {
                  return (
                    <Link 
                      key={episode.id} 
                      href={`/${type}/${id}?season=${currentSeasonNumber}&episode=${episode.episode_number}`} 
                      className="flex flex-row gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-[#2a2a2a]/40 transition border border-white/5 hover:bg-[#2a2a2a]"
                      aria-label={`Play Episode ${episode.episode_number}: ${episode.name}`}
                    >
                      {innerContent}
                    </Link>
                  );
                }

                return (
                  <div 
                    key={episode.id} 
                    className="flex flex-row gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-[#2a2a2a]/40 transition border border-white/5 opacity-70"
                    aria-label={`Episode ${episode.episode_number}: ${episode.name}, Coming ${formattedAirDate}`}
                  >
                    {innerContent}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {similarMovies && similarMovies.length > 0 && (
        <div className="mt-16 pb-16">
          <Row title="More Like This" movies={similarMovies} />
        </div>
      )}
    </main>
  );
}
