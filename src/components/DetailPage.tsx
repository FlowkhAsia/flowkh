import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Movie, MovieDetail, Actor, Season, Episode } from '../types';
import { fetchDetailPageData, fetchSeasonEpisodes } from '../services/geminiService';
import { 
    PlayIcon, 
    PlusIcon, 
    CheckIcon,
    DownloadIcon,
    StarIcon, 
    CalendarIcon,
    ClockIcon,
    ChevronDownIcon,
    SearchIcon,
    VideoCameraIcon,
    CloseIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from './icons/Icons';
import MovieCard from './MovieCard';
import ActorCard from './ActorCard';
import AdsterraBanner from './AdsterraBanner';

interface DetailPageProps {
  movieId: number;
  mediaType: 'movie' | 'tv';
  onSelectMovie: (movie: Movie) => void;
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
  onSelectActor: (actor: Actor) => void;
  autoPlay?: boolean;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
  initialSeasonNumber?: number;
  initialEpisodeNumber?: number;
}

const DetailPage: React.FC<DetailPageProps> = ({ movieId, mediaType, onSelectMovie, myList, onToggleMyList, onSelectActor, autoPlay = false, navigate, initialSeasonNumber, initialEpisodeNumber }) => {
  const [details, setDetails] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Actor[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentPlayingInfo, setCurrentPlayingInfo] = useState({
    id: movieId,
    media_type: mediaType,
    season: mediaType === 'tv' ? (initialSeasonNumber || 1) : undefined,
    episode: mediaType === 'tv' ? (initialEpisodeNumber || 1) : undefined,
    title: '',
  });
  const [selectedServer, setSelectedServer] = useState('VidStorm');
  
  // Episodes state
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const episodesRef = useRef<HTMLDivElement>(null);
  const similarSectionRef = useRef<HTMLDivElement>(null);
  const similarRowRef = useRef<HTMLDivElement>(null);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const actorsRowRef = useRef<HTMLDivElement>(null);

  // Trailer Modal state
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch episodes when season changes
  useEffect(() => {
    const getEpisodes = async () => {
        if (mediaType === 'tv' && selectedSeason) {
            setEpisodesLoading(true);
            const fetchedEpisodes = await fetchSeasonEpisodes(movieId, selectedSeason.season_number);
            setEpisodes(fetchedEpisodes);
            setEpisodesLoading(false);
        }
    };
    getEpisodes();
  }, [selectedSeason, movieId, mediaType]);
  
  const handleEpisodePlay = useCallback((seasonNumber: number, episode: Episode) => {
    setCurrentPlayingInfo({ 
        id: movieId, 
        media_type: 'tv', 
        season: seasonNumber, 
        episode: episode.episode_number,
        title: `${details?.title || ''}: S${seasonNumber}E${episode.episode_number} - ${episode.name}`,
    });
    setIsPlaying(true);
    navigate?.(`/tv/${movieId}/${seasonNumber}/${episode.episode_number}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId, details?.title, navigate]);

  const handlePlay = useCallback(async () => {
    if (details?.media_type === 'tv' && selectedSeason) {
        let episodesToPlay = episodes;
        // If episodes for the current season are not loaded, fetch them.
        if (episodesToPlay.length === 0) {
            setEpisodesLoading(true);
            episodesToPlay = await fetchSeasonEpisodes(movieId, selectedSeason.season_number);
            setEpisodes(episodesToPlay);
            setEpisodesLoading(false);
        }

        if (episodesToPlay.length > 0) {
            const episodeToPlay = (autoPlay && initialEpisodeNumber && episodesToPlay.some(e => e.episode_number === initialEpisodeNumber))
              ? episodesToPlay.find(e => e.episode_number === initialEpisodeNumber)!
              : episodesToPlay[0];
            handleEpisodePlay(selectedSeason.season_number, episodeToPlay);
            return;
        }
    }
    // For movies
    setCurrentPlayingInfo({
        id: movieId,
        media_type: mediaType,
        title: details?.title || '',
        season: mediaType === 'tv' ? 1 : undefined,
        episode: mediaType === 'tv' ? 1 : undefined,
    });
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [details, selectedSeason, episodes, movieId, mediaType, handleEpisodePlay, autoPlay, initialEpisodeNumber]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setDetails(null);
        setEpisodes([]);
        const { details, cast, similar } = await fetchDetailPageData(movieId, mediaType);
        setDetails(details);
        setCast(cast);
        setSimilar(similar);
        document.title = `${details.title} | flowkh`;

        setCurrentPlayingInfo(prev => ({
            ...prev,
            id: details.id,
            media_type: details.media_type,
            season: details.media_type === 'tv' ? (initialSeasonNumber || 1) : undefined,
            episode: details.media_type === 'tv' ? (initialEpisodeNumber || 1) : undefined,
            title: details.title,
        }));

        if(details.media_type === 'tv' && details.seasons && details.seasons.length > 0) {
            const seasonToSelect = initialSeasonNumber 
                ? details.seasons.find(s => s.season_number === initialSeasonNumber)
                : undefined;
            const firstSeason = details.seasons.find(s => s.season_number > 0) || details.seasons[0];
            setSelectedSeason(seasonToSelect || firstSeason);
        }
      } catch (err) {
        setError('Failed to load details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    setIsPlaying(autoPlay);
    loadDetails();
  }, [movieId, mediaType, autoPlay, initialSeasonNumber]);

  useEffect(() => {
    if (autoPlay && !loading && details) {
        const timer = setTimeout(() => {
            handlePlay();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [autoPlay, loading, details, handlePlay]);
  
  // Effect to lock body scroll when trailer modal is open
  useEffect(() => {
    if (showTrailer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showTrailer]);

  // Effect to close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
            setIsSeasonDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Player logic
  const servers = useMemo(() => [
    { name: 'VidStorm', displayName: 'Primary' },
    { name: 'VidSrcV2', displayName: 'Alternate 1' },
    { name: 'Videasy', displayName: 'Alternate 2' },
    { name: 'VidSrcMe', displayName: 'Alternate 3' },
    { name: 'VidPlus', displayName: 'Alternate 4' },
    { name: 'MoviesAPI', displayName: 'Alternate 5' },
    { name: 'VidLink', displayName: 'Alternate 6' }
  ], []);

  const getPlayerUrl = () => {
    const { id, media_type, season, episode } = currentPlayingInfo;
    const seasonNum = season || 1;
    const episodeNum = episode || 1;

    switch (selectedServer) {
        case 'VidStorm':
            if (media_type === 'movie') return `https://vidstorm.ru/movie/${id}`;
            return `https://vidstorm.ru/tv/${id}/${seasonNum}/${episodeNum}`;
        case 'VidSrcV2':
            if (media_type === 'movie') return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
            return `https://vidsrc.cc/v2/embed/tv/${id}/${seasonNum}/${episodeNum}?autoPlay=true`;
        case 'Videasy':
            if (media_type === 'movie') return `https://player.videasy.net/movie/${id}?autoplay=true`;
            return `https://player.videasy.net/tv/${id}/${seasonNum}/${episodeNum}?autoplay=true`;
        case 'VidSrcMe':
            if (media_type === 'movie') return `https://vidsrcme.ru/embed/movie?tmdb=${id}`;
            return `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${seasonNum}&episode=${episodeNum}`;
        case 'VidPlus':
            if (media_type === 'movie') return `https://player.vidplus.to/embed/movie/${id}?autoplay=true`;
            return `https://player.vidplus.to/embed/tv/${id}/${seasonNum}/${episodeNum}?autoplay=true`;
        case 'MoviesAPI':
            if (media_type === 'movie') return `https://moviesapi.club/movie/${id}`;
            return `https://moviesapi.club/tv/${id}-${seasonNum}-${episodeNum}`;
        case 'VidLink':
            if (media_type === 'movie') return `https://vidlink.pro/movie/${id}`;
            return `https://vidlink.pro/tv/${id}/${seasonNum}/${episodeNum}`;
        default: return '';
    }
  };
  
  const playerUrl = getPlayerUrl();

  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    return episodes.filter(ep => 
        ep.name.toLowerCase().includes(episodeSearch.toLowerCase()) ||
        ep.overview.toLowerCase().includes(episodeSearch.toLowerCase())
    );
  }, [episodes, episodeSearch]);

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToSimilar = () => {
    similarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollRow = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
        const { scrollLeft, clientWidth } = ref.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
        ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen pt-16">
        <div className="w-16 h-16 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4 pt-16">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <p className="text-gray-400">Please try navigating back home.</p>
      </div>
    );
  }

  const isAdded = myList.some((item) => item.id === details.id);
  const isTV = details.media_type === 'tv';

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <>
    <div className="relative">
      {/* Hero Section / Player */}
      {isPlaying ? (
        <div className="relative w-full">
            {/* Backdrop Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={details.backdropUrl.replace('/w780/', '/original/')}
                    alt=""
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
            </div>

            {/* Player and Controls Layer */}
            <div className="relative z-10">
                <div className="relative overflow-hidden pt-20">
                    {/* Player Centered */}
                    <div className="relative z-10 px-4 md:px-16 flex justify-center">
                        <div className="w-full max-w-6xl aspect-video shadow-2xl bg-black rounded-lg overflow-hidden">
                            {playerUrl ? (
                                <iframe
                                    key={playerUrl}
                                    src={playerUrl}
                                    title="Content Player"
                                    frameBorder="0"
                                    allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-center">
                                    <div>
                                        <p className="text-lg">Loading player...</p>
                                        <p className="text-sm text-gray-400">This may take a moment.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Server Selection Bar */}
                    <div className="w-full max-w-6xl mx-auto mt-4 px-4 md:px-16 pb-4">
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-black/30 rounded-lg backdrop-blur-sm">
                            <span className="text-sm font-semibold text-gray-300 mr-2 shrink-0">Servers:</span>
                            {servers.map(({ name, displayName }) => (
                                <button
                                    key={name}
                                    onClick={() => setSelectedServer(name)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                        selectedServer === name
                                            ? 'bg-white text-black'
                                            : 'bg-zinc-700/80 hover:bg-zinc-600'
                                    }`}
                                >
                                    {displayName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="relative h-[80vh] sm:h-[90vh] md:h-screen overflow-hidden">
            {/* Background Layer */}
            <div className="absolute top-0 left-0 w-full h-full">
                <img 
                    src={details.backdropUrl.replace('/w780/', '/original/')} 
                    alt={details.title} 
                    className="object-cover w-full h-full" 
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#141414] to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-16">
                <div className="max-w-3xl space-y-2 md:space-y-4">
                    {details.logoUrl ? (
                        <img 
                        src={details.logoUrl} 
                        alt={`${details.title} Logo`} 
                        className="w-auto max-w-[60%] md:max-w-[50%] max-h-16 md:max-h-32 object-contain object-left drop-shadow-lg"
                        />
                    ) : (
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bebas tracking-wider text-shadow-lg">{details.title}</h1>
                    )}
                    
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-2 text-xs md:text-sm text-gray-200">
                        <div className="flex items-center gap-1.5 bg-black/40 border border-white/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <StarIcon className="w-4 h-4 text-yellow-400"/><span>{details.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/40 border border-white/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <CalendarIcon className="w-4 h-4 opacity-80"/><span>{details.releaseYear}</span>
                        </div>
                        {details.runtime > 0 && 
                          <div className="flex items-center gap-1.5 bg-black/40 border border-white/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <ClockIcon className="w-4 h-4 opacity-80"/><span>{isTV ? `${details.runtime}m` : formatRuntime(details.runtime)}</span>
                          </div>
                        }
                        {details.genres.slice(0, 3).map(genre => (
                            <div key={genre} className="bg-black/40 border border-white/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">{genre}</div>
                        ))}
                    </div>

                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-shadow-md max-w-xl line-clamp-2 md:line-clamp-3 text-gray-300">{details.description}</p>
                    
                    <div className="flex items-center space-x-3 pt-2 md:pt-4 flex-wrap gap-y-2">
                        <button onClick={handlePlay} className="flex items-center gap-x-2 rounded-lg bg-white px-4 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-base font-bold text-black transition hover:bg-gray-300">
                            <PlayIcon className="h-5 sm:h-6 w-5 sm:w-6 text-black" /> Play
                        </button>
                        <button 
                            onClick={() => onToggleMyList(details)} 
                            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/40 backdrop-blur-sm border border-white/50 hover:bg-white/10 transition" 
                            aria-label={isAdded ? "Remove from My List" : "Add to My List"}
                            title={isAdded ? "Remove from My List" : "Add to My List"}
                        >
                            {isAdded ? <CheckIcon className="h-5 sm:h-6 w-5 sm:w-6"/> : <PlusIcon className="h-5 sm:h-6 w-5 sm:w-6"/>}
                        </button>
                        {details.trailerUrl && (
                            <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/50 hover:bg-white/10 transition font-semibold">
                                <VideoCameraIcon className="w-5 sm:h-6 w-5 sm:w-6"/>
                                Trailer
                            </button>
                        )}
                        {isTV ? (
                            <button onClick={scrollToEpisodes} className="px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/50 hover:bg-white/10 transition font-semibold">Episodes</button>
                        ) : (
                             <a 
                                href={`https://dl.vidsrc.vip/movie/${details.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/40 backdrop-blur-sm border border-white/50 hover:bg-white/10 transition" 
                                aria-label="Download"
                                title="Download Movie"
                              >
                                <DownloadIcon className="w-5 sm:h-6 w-5 sm:w-6"/>
                            </a>
                        )}
                        <button onClick={scrollToSimilar} className="hidden sm:block px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/50 hover:bg-white/10 transition font-semibold">Similar</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      <div className="px-4 md:px-16 py-12 space-y-12 md:space-y-16">
        {/* Episodes Section */}
        {isTV && details.seasons && selectedSeason && (
            <section ref={episodesRef}>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                    <h2 className="text-2xl font-bold">Episodes</h2>
                </div>

                {/* Toolbar */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mb-6 bg-[#2c2c2c] p-3 rounded-lg border border-gray-700/50">
                    {/* Season Selector */}
                    <div className="relative w-full" ref={seasonDropdownRef}>
                        <div onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)} className="flex items-center justify-between w-full px-4 py-2.5 bg-[#1f1f1f] rounded-md cursor-pointer hover:bg-[#333]">
                            <span className="font-semibold">{selectedSeason.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {isSeasonDropdownOpen && (
                            <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-[#1f1f1f] rounded-md shadow-lg z-20 animate-fade-scale-in custom-scrollbar border border-gray-700/50">
                                <ul className="py-1">
                                    {(details.seasons || []).filter(s => s.episode_count > 0).map(season => {
                                        const isSelected = selectedSeason.id === season.id;
                                        return (
                                            <li
                                                key={season.id}
                                                onClick={() => { setSelectedSeason(season); setIsSeasonDropdownOpen(false); }}
                                                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${ isSelected ? 'bg-white/10 font-semibold' : 'hover:bg-white/5' }`}
                                            >
                                                <span>{season.name}</span>
                                                {isSelected && <CheckIcon className="w-5 h-5" />}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                    {/* Episode Search */}
                    <div className="relative w-full flex items-center">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                        <input
                            type="text"
                            placeholder="Search episode..."
                            value={episodeSearch}
                            onChange={(e) => setEpisodeSearch(e.target.value)}
                            className="w-full bg-[#1f1f1f] border-0 rounded-md focus:ring-2 focus:ring-[var(--brand-color)] text-white py-2.5 pl-10 pr-4"
                        />
                    </div>
                </div>
                
                {/* Episode List */}
                {episodesLoading ? (
                    <div className="flex justify-center items-center p-4 min-h-[40vh]">
                      <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto episodes-scrollbar pr-2 -mr-2">
                        {filteredEpisodes.length > 0 ? filteredEpisodes.map(episode => {
                            const isReleased = (() => {
                                if (!episode.air_date) return true;
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const [year, month, day] = episode.air_date.split('-').map(Number);
                                const releaseDate = new Date(year, month - 1, day);
                                return releaseDate <= today;
                            })();
                            const airDate = episode.air_date ? new Date(episode.air_date.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
                            
                            const isPlayingEpisode = isPlaying &&
                                                     currentPlayingInfo.media_type === 'tv' &&
                                                     selectedSeason?.season_number === currentPlayingInfo.season &&
                                                     episode.episode_number === currentPlayingInfo.episode;

                            return (
                                <div 
                                    key={episode.id} 
                                    onClick={() => selectedSeason && isReleased && handleEpisodePlay(selectedSeason.season_number, episode)}
                                    className={`flex items-center gap-4 bg-[#2a2a2a] p-2 rounded-lg group transition-all duration-200 ${isReleased ? 'cursor-pointer hover:bg-[#383838]' : 'cursor-not-allowed opacity-70'} ${isPlayingEpisode ? 'bg-[var(--brand-color)]/30 border border-[var(--brand-color)]/80' : 'border border-transparent'}`}
                                >
                                    <div className="relative w-32 sm:w-40 md:w-48 flex-shrink-0 aspect-video rounded-md overflow-hidden bg-zinc-800">
                                        <img src={episode.still_path || details.backdropUrl} alt={episode.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async"/>
                                        {isReleased ? (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                {isPlayingEpisode ? (
                                                    <div className="flex items-center gap-2 text-white text-sm font-bold bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/30">
                                                        <svg className="w-5 h-5 animate-pulse text-[var(--brand-color)]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.5V19.5L18 12L6 4.5Z"></path></svg>
                                                        <span>Playing</span>
                                                    </div>
                                                ) : (
                                                    <PlayIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-zinc-800/90 border border-zinc-600 text-zinc-300 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-lg backdrop-blur-sm">
                                                Coming Soon
                                            </div>
                                        )}
                                        <span className="absolute bottom-1 left-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none">{episode.episode_number}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className={`text-base font-bold truncate ${isPlayingEpisode ? 'text-[var(--brand-color)]' : 'text-white'}`}>{episode.name}</h3>
                                            {episode.runtime && isReleased && <span className="text-sm text-gray-400 flex-shrink-0 ml-4">{episode.runtime}m</span>}
                                        </div>
                                        {!isReleased && airDate && (
                                            <p className="text-xs text-gray-400 mt-1">Releases on: {airDate}</p>
                                        )}
                                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                            {episode.overview || 'No description available for this episode.'}
                                        </p>
                                    </div>
                                     <a 
                                        href={`https://dl.vidsrc.vip/tv/${movieId}/${selectedSeason.season_number}/${episode.episode_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-auto flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#2d2d2d] hover:bg-[#3f3f3f] transition-colors" 
                                        aria-label={`Download episode ${episode.episode_number}`}
                                        title={`Download Episode ${episode.episode_number}`}
                                    >
                                        <DownloadIcon className="w-6 h-6 text-gray-300"/>
                                    </a>
                                </div>
                            )
                        }) : (
                            <div className="text-center text-gray-400 py-16">
                                <p className="text-xl">No episodes found</p>
                                <p className="text-sm mt-1">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        )}

        <AdsterraBanner />

        {/* Actors Section */}
        {cast.length > 0 && (
            <section>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                    <h2 className="text-2xl font-bold">Actors</h2>
                </div>
                <div className="group/row relative md:-ml-2">
                    <button
                        aria-label="Scroll actors left"
                        onClick={() => scrollRow(actorsRowRef, 'left')} 
                        className="absolute top-0 bottom-0 left-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus:opacity-100 pointer-events-none md:pointer-events-auto"
                    >
                        <ChevronLeftIcon className="w-full h-full" />
                    </button>
                    <div ref={actorsRowRef} className="flex items-start space-x-2 sm:space-x-4 md:space-x-5 overflow-x-scroll scrollbar-hide md:p-2 overscroll-x-contain scroll-smooth">
                        {cast.map(actor => (
                            <ActorCard 
                                key={actor.id} 
                                actor={actor} 
                                onSelectActor={onSelectActor}
                            />
                        ))}
                    </div>
                    <button
                        aria-label="Scroll actors right"
                        onClick={() => scrollRow(actorsRowRef, 'right')} 
                        className="absolute top-0 bottom-0 right-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus:opacity-100 pointer-events-none md:pointer-events-auto"
                    >
                        <ChevronRightIcon className="w-full h-full" />
                    </button>
                </div>
            </section>
        )}

        {/* You may like Section */}
        {similar.length > 0 && (
        <section ref={similarSectionRef}>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                <h2 className="text-2xl font-bold">You may like</h2>
            </div>
            <div className="group/row relative md:-ml-2">
                 <button
                    aria-label="Scroll similar titles left"
                    onClick={() => scrollRow(similarRowRef, 'left')}
                    className="absolute top-0 bottom-0 left-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus:opacity-100 pointer-events-none md:pointer-events-auto"
                >
                    <ChevronLeftIcon className="w-full h-full" />
                </button>
                <div ref={similarRowRef} className="flex items-start space-x-2 sm:space-x-4 md:space-x-5 overflow-x-scroll scrollbar-hide md:p-2 overscroll-x-contain scroll-smooth">
                    {similar.map((s_movie) => (
                        <MovieCard 
                            key={s_movie.id} 
                            movie={s_movie} 
                            onSelectMovie={onSelectMovie}
                            onToggleMyList={onToggleMyList}
                            isAdded={myList.some(item => item.id === s_movie.id)}
                            isCarouselItem={true}
                        />
                    ))}
                </div>
                <button
                    aria-label="Scroll similar titles right"
                    onClick={() => scrollRow(similarRowRef, 'right')}
                    className="absolute top-0 bottom-0 right-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition [@media(hover:hover)]:hover:scale-125 [@media(hover:hover)]:group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus:opacity-100 pointer-events-none md:pointer-events-auto"
                >
                    <ChevronRightIcon className="w-full h-full" />
                </button>
            </div>
        </section>
        )}
      </div>
    </div>

    {/* Trailer Modal */}
    {showTrailer && details.trailerUrl && (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-scale-in" 
            onClick={() => setShowTrailer(false)}
        >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <iframe
                    src={`${details.trailerUrl}?autoplay=1&rel=0`}
                    title="Trailer player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                ></iframe>
                <button 
                    onClick={() => setShowTrailer(false)}
                    aria-label="Close trailer"
                    className="absolute -top-3 -right-3 md:-top-5 md:-right-5 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors"
                >
                    <CloseIcon className="w-7 h-7"/>
                </button>
            </div>
        </div>
    )}
    </>
  );
};

export default DetailPage;