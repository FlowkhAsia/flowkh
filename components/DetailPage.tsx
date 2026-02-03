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
    ChevronLeftIcon,
    ChevronRightIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
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
  const [selectedServer, setSelectedServer] = useState('VidSrcV2');

  // Inline Trailer state
  const [showInlineTrailer, setShowInlineTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const trailerIframeRef = useRef<HTMLIFrameElement>(null);

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

  // Server dropdown state
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const serverDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch episodes when season changes
  useEffect(() => {
    const controller = new AbortController();
    
    const getEpisodes = async () => {
        if (mediaType === 'tv' && selectedSeason) {
            setEpisodesLoading(true);
            try {
              const fetchedEpisodes = await fetchSeasonEpisodes(movieId, selectedSeason.season_number, controller.signal);
              if (!controller.signal.aborted) {
                setEpisodes(fetchedEpisodes);
              }
            } catch (err) {
              if (err instanceof Error && err.name === 'AbortError') return;
              console.error("Failed to load episodes", err);
              if (!controller.signal.aborted) setEpisodes([]);
            } finally {
              if (!controller.signal.aborted) setEpisodesLoading(false);
            }
        }
    };

    getEpisodes();
    
    return () => controller.abort();
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
    setShowInlineTrailer(false); 
    navigate?.(`/tv/${movieId}/${seasonNumber}/${episode.episode_number}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId, details?.title, navigate]);

  const handlePlay = useCallback(async () => {
    if (details?.media_type === 'tv' && selectedSeason) {
        let episodesToPlay = episodes;
        if (episodesToPlay.length === 0) {
            setEpisodesLoading(true);
            try {
              episodesToPlay = await fetchSeasonEpisodes(movieId, selectedSeason.season_number);
              setEpisodes(episodesToPlay);
            } catch (err) {
              console.error("Play action failed to fetch episodes", err);
            } finally {
              setEpisodesLoading(false);
            }
        }

        if (episodesToPlay.length > 0) {
            const episodeToPlay = (initialEpisodeNumber && episodesToPlay.some(e => e.episode_number === initialEpisodeNumber))
              ? episodesToPlay.find(e => e.episode_number === initialEpisodeNumber)!
              : episodesToPlay[0];
            handleEpisodePlay(selectedSeason.season_number, episodeToPlay);
            return;
        }
    }
    setCurrentPlayingInfo({
        id: movieId,
        media_type: mediaType,
        title: details?.title || '',
        season: mediaType === 'tv' ? 1 : undefined,
        episode: mediaType === 'tv' ? 1 : undefined,
    });
    setIsPlaying(true);
    setShowInlineTrailer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [details, selectedSeason, episodes, movieId, mediaType, handleEpisodePlay, initialEpisodeNumber]);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setDetails(null);
        setEpisodes([]);
        setSelectedSeason(null);
        
        const { details: fetchedDetails, cast: fetchedCast, similar: fetchedSimilar } = await fetchDetailPageData(movieId, mediaType, controller.signal);
        
        if (controller.signal.aborted) return;

        setDetails(fetchedDetails);
        setCast(fetchedCast);
        setSimilar(fetchedSimilar);
        document.title = `${fetchedDetails.title} | flowkh`;

        setCurrentPlayingInfo(prev => ({
            ...prev,
            id: fetchedDetails.id,
            media_type: fetchedDetails.media_type,
            season: fetchedDetails.media_type === 'tv' ? (initialSeasonNumber || 1) : undefined,
            episode: fetchedDetails.media_type === 'tv' ? (initialEpisodeNumber || 1) : undefined,
            title: fetchedDetails.title,
        }));

        if(fetchedDetails.media_type === 'tv' && fetchedDetails.seasons && fetchedDetails.seasons.length > 0) {
            const seasonToSelect = initialSeasonNumber 
                ? fetchedDetails.seasons.find(s => s.season_number === initialSeasonNumber)
                : undefined;
            const firstSeason = fetchedDetails.seasons.find(s => s.season_number > 0) || fetchedDetails.seasons[0];
            setSelectedSeason(seasonToSelect || firstSeason);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Failed to load details. Please check your internet connection and try again.');
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    setIsPlaying(autoPlay);
    loadDetails();

    return () => controller.abort();
  }, [movieId, mediaType, autoPlay, initialSeasonNumber, initialEpisodeNumber]);

  // Autoplay trailer logic
  useEffect(() => {
    if (details?.trailerUrl && !isPlaying && !loading) {
        const timer = setTimeout(() => {
            setShowInlineTrailer(true);
        }, 1500); 
        return () => clearTimeout(timer);
    } else {
        setShowInlineTrailer(false);
    }
  }, [details, isPlaying, loading]);

  const sendPlayerCommand = useCallback((command: string) => {
    if (trailerIframeRef.current && trailerIframeRef.current.contentWindow) {
        trailerIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: [] }),
          '*'
        );
      }
  }, []);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    sendPlayerCommand(nextMuteState ? 'mute' : 'unMute');
  }, [isMuted, sendPlayerCommand]);

  const handleTrailerButtonClick = useCallback(() => {
    if (!showInlineTrailer) {
        setShowInlineTrailer(true);
        setIsMuted(false);
        setTimeout(() => sendPlayerCommand('unMute'), 800);
    } else {
        if (isMuted) {
            setIsMuted(false);
            sendPlayerCommand('unMute');
        } else {
            setShowInlineTrailer(false);
            setIsMuted(true);
        }
    }
  }, [showInlineTrailer, isMuted, sendPlayerCommand]);

  useEffect(() => {
    if (autoPlay && !loading && details && !isPlaying) {
        const timer = setTimeout(() => {
            handlePlay();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [autoPlay, loading, details, handlePlay, isPlaying]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
            setIsSeasonDropdownOpen(false);
        }
        if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target as Node)) {
            setIsServerDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const servers = useMemo(() => [
    { name: 'VidSrcV2', displayName: 'Primary' },
    { name: 'VidStorm', displayName: 'Alternate 1' },
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
        case 'VidSrcV2': return `https://vidsrc.cc/v2/embed/${media_type}/${id}${media_type === 'tv' ? `/${seasonNum}/${episodeNum}` : ''}?autoPlay=true`;
        case 'VidStorm':
            if (media_type === 'movie') return `https://vidstorm.ru/movie/${id}`;
            return `https://vidstorm.ru/tv/${id}/${seasonNum}/${episodeNum}`;
        case 'Videasy': return `https://player.videasy.net/${media_type}/${id}${media_type === 'tv' ? `/${seasonNum}/${episodeNum}` : ''}?autoplay=true`;
        case 'VidSrcMe': return `https://vidsrcme.ru/embed/${media_type === 'movie' ? 'movie' : 'tv'}?tmdb=${id}${media_type === 'tv' ? `&season=${seasonNum}&episode=${episodeNum}` : ''}`;
        case 'VidPlus': return `https://player.vidplus.to/embed/${media_type}/${id}${media_type === 'tv' ? `/${seasonNum}/${episodeNum}` : ''}?autoplay=true`;
        case 'MoviesAPI': return `https://moviesapi.club/${media_type}/${media_type === 'movie' ? id : `${id}-${seasonNum}-${episodeNum}`}`;
        case 'VidLink': return `https://vidlink.pro/${media_type}/${id}${media_type === 'tv' ? `/${seasonNum}/${episodeNum}` : ''}`;
        default: return '';
    }
  };
  
  const playerUrl = getPlayerUrl();

  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    const query = episodeSearch.toLowerCase();
    return episodes.filter(ep => 
        ep.name.toLowerCase().includes(query) ||
        ep.overview.toLowerCase().includes(query) ||
        ep.episode_number.toString().includes(query)
    );
  }, [episodes, episodeSearch]);

  const scrollToEpisodes = () => episodesRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToSimilar = () => similarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
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
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition">Retry</button>
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

  const optimizedBackdrop = details.backdropUrl?.replace('/w780/', '/w1280/') || '';
  const videoId = details.trailerUrl?.split('/').pop()?.split('?')[0] || '';
  const stableTrailerUrl = videoId ? `${details.trailerUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&iv_load_policy=3&enablejsapi=1` : '';

  return (
    <div className="relative">
      {/* Hero Section / Player */}
      {isPlaying ? (
        <div className="relative w-full z-30">
            <div className="absolute inset-0 overflow-hidden">
                <img src={optimizedBackdrop} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
            </div>

            <div className="relative z-10">
                <div className="relative pt-20">
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
                                    referrerPolicy="origin"
                                    className="w-full h-full"
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-center text-white">
                                    <p className="text-lg">Loading player...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full max-w-6xl mx-auto mt-4 px-4 md:px-16 pb-4">
                        <div className="p-2 bg-zinc-800 rounded-lg backdrop-blur-sm border border-zinc-700 shadow-sm">
                            <div className="hidden md:flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-gray-300 mr-2 shrink-0">Servers:</span>
                                {servers.map(({ name, displayName }) => (
                                    <button
                                        key={name}
                                        onClick={() => setSelectedServer(name)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${selectedServer === name ? 'bg-zinc-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'}`}
                                    >
                                        {displayName}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:hidden" ref={serverDropdownRef}>
                                <div onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)} className="flex items-center justify-between w-full px-4 py-2.5 bg-zinc-700 rounded-md cursor-pointer hover:bg-zinc-600">
                                    <span className="font-semibold text-white">Server: {servers.find(s => s.name === selectedServer)?.displayName}</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-300 transition-transform ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                                {isServerDropdownOpen && (
                                    <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-zinc-800 rounded-md shadow-lg z-20 animate-fade-scale-in custom-scrollbar border border-zinc-700">
                                        <ul className="py-1">
                                            {servers.map(({ name, displayName }) => {
                                                const isSelected = selectedServer === name;
                                                return (
                                                    <li key={name} onClick={() => { setSelectedServer(name); setIsServerDropdownOpen(false); }} className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${ isSelected ? 'bg-zinc-700 font-semibold text-white' : 'hover:bg-zinc-700/50 text-gray-300' }`}>
                                                        <span>{displayName}</span>
                                                        {isSelected && <CheckIcon className="w-5 h-5" />}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="relative h-[50vh] sm:h-[90vh] md:h-screen overflow-hidden bg-black">
            <div className="absolute top-0 left-0 w-full h-full z-0">
                {showInlineTrailer && stableTrailerUrl ? (
                    <div className="relative w-full h-full scale-[1.3] pointer-events-none overflow-hidden">
                         <iframe
                            ref={trailerIframeRef}
                            src={stableTrailerUrl}
                            title="Trailer background"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            className="w-full h-full object-cover"
                        ></iframe>
                        <div className="absolute inset-0 z-10" />
                        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,20,20,0.4)_70%,rgba(20,20,20,0.8)_100%)]" />
                    </div>
                ) : (
                    <img src={optimizedBackdrop} alt={details.title} className="object-cover w-full h-full animate-fast-fade-in" />
                )}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${showInlineTrailer ? 'opacity-30' : 'opacity-50'} bg-[#141414] z-10`} />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#141414] to-transparent z-10" />
            </div>

            {showInlineTrailer && !isPlaying && (
                <button 
                    onClick={handleToggleMute}
                    className={`absolute bottom-10 right-10 z-[40] p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/60 transition-all hover:scale-110 shadow-xl cursor-pointer pointer-events-auto ${isMuted ? 'animate-pulse' : ''}`}
                    aria-label={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                >
                    {isMuted ? <SpeakerXMarkIcon className="w-6 h-6 text-white" /> : <SpeakerWaveIcon className="w-6 h-6 text-white" />}
                </button>
            )}

            <div className="relative z-20 h-full flex flex-col justify-center px-4 md:px-16 pointer-events-none">
                <div className="max-w-3xl space-y-2 md:space-y-4 pointer-events-auto">
                    {details.logoUrl ? (
                        <img src={details.logoUrl} alt={`${details.title} Logo`} className="w-auto max-w-[60%] md:max-w-[50%] max-h-16 md:max-h-32 object-contain object-left drop-shadow-lg" />
                    ) : (
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bebas tracking-wider text-white drop-shadow-sm">{details.title}</h1>
                    )}
                    
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-2 text-xs md:text-sm text-gray-300">
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <StarIcon className="w-4 h-4 text-yellow-500"/><span>{details.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <CalendarIcon className="w-4 h-4 text-gray-300"/><span>{details.releaseYear}</span>
                        </div>
                        {details.runtime > 0 && 
                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-medium">
                            <ClockIcon className="w-4 h-4 text-gray-300"/><span>{isTV ? `${details.runtime}m` : formatRuntime(details.runtime)}</span>
                          </div>
                        }
                    </div>

                    <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-xl line-clamp-2 md:line-clamp-3 text-gray-100 font-medium drop-shadow-sm">{details.description}</p>
                    
                    <div className="flex items-center space-x-3 pt-2 md:pt-4 flex-wrap gap-y-2">
                        <button onClick={handlePlay} className="flex items-center gap-x-2 rounded-lg bg-white px-4 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-base font-bold text-black transition hover:bg-gray-200">
                            <PlayIcon className="h-5 sm:h-6 w-5 sm:w-6 text-black" /> Play
                        </button>
                        <button onClick={() => onToggleMyList(details)} className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition text-white">
                            {isAdded ? <CheckIcon className="h-5 sm:h-6 w-5 sm:w-6"/> : <PlusIcon className="h-5 sm:h-6 w-5 sm:w-6"/>}
                        </button>
                        {details.trailerUrl && (
                            <button onClick={handleTrailerButtonClick} className={`flex items-center gap-2 px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg backdrop-blur-sm border transition font-semibold ${showInlineTrailer && !isMuted ? 'bg-[var(--brand-color)] border-[var(--brand-color)] text-white' : 'bg-white/20 border-white/30 hover:bg-white/30 text-white'}`}>
                                <VideoCameraIcon className="w-5 sm:h-6 w-5 sm:w-6"/>
                                {showInlineTrailer ? (isMuted ? 'Unmute Trailer' : 'Hide Trailer') : 'Watch Trailer'}
                            </button>
                        )}
                        {isTV ? (
                            <button onClick={scrollToEpisodes} className="px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition font-semibold text-white">Episodes</button>
                        ) : (
                             <a href={`https://dl.vidsrc.vip/movie/${details.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition text-white" title="Download Movie">
                                <DownloadIcon className="w-5 sm:h-6 w-5 sm:w-6"/>
                            </a>
                        )}
                        <button onClick={scrollToSimilar} className="hidden sm:block px-4 py-1.5 text-sm sm:px-5 sm:py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition font-semibold text-white">Similar</button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      <div className="px-4 md:px-16 py-12 space-y-12 md:space-y-16">
        {isTV && details.seasons && selectedSeason && (
            <section ref={episodesRef}>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Episodes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mb-6 bg-zinc-800 p-3 rounded-lg border border-zinc-700 shadow-sm">
                    <div className="relative w-full" ref={seasonDropdownRef}>
                        <div onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)} className="flex items-center justify-between w-full px-4 py-2.5 bg-zinc-700 rounded-md cursor-pointer hover:bg-zinc-600">
                            <span className="font-semibold text-gray-200">{selectedSeason.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {isSeasonDropdownOpen && (
                            <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-zinc-800 rounded-md shadow-lg z-20 animate-fade-scale-in border border-zinc-700">
                                <ul className="py-1">
                                    {(details.seasons || []).filter(s => s.episode_count > 0).map(season => {
                                        const isSelected = selectedSeason.id === season.id;
                                        return (
                                            <li key={season.id} onClick={() => { setSelectedSeason(season); setIsSeasonDropdownOpen(false); }} className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${ isSelected ? 'bg-zinc-700 font-semibold text-white' : 'hover:bg-zinc-700/50 text-gray-300' }`}>
                                                <span>{season.name}</span>
                                                {isSelected && <CheckIcon className="w-5 h-5" />}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="relative w-full flex items-center">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                        <input type="text" placeholder="Search by title, overview, or number..." value={episodeSearch} onChange={(e) => setEpisodeSearch(e.target.value)} className="w-full bg-zinc-700 border-0 rounded-md focus:ring-2 focus:ring-[var(--brand-color)] text-white py-2.5 pl-10 pr-4 placeholder-gray-500" />
                    </div>
                </div>
                
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
                                return new Date(year, month - 1, day) <= today;
                            })();
                            const isPlayingEpisode = isPlaying && currentPlayingInfo.media_type === 'tv' && selectedSeason?.season_number === currentPlayingInfo.season && episode.episode_number === currentPlayingInfo.episode;

                            return (
                                <div key={episode.id} onClick={() => selectedSeason && isReleased && handleEpisodePlay(selectedSeason.season_number, episode)} className={`flex items-center gap-4 bg-zinc-800 p-2 rounded-lg group transition-all duration-200 shadow-sm border ${isReleased ? 'cursor-pointer hover:bg-zinc-700 border-zinc-700' : 'cursor-not-allowed opacity-70 border-transparent'} ${isPlayingEpisode ? 'bg-[var(--brand-color)]/10 border-[var(--brand-color)]/50' : ''}`}>
                                    <div className="relative w-32 sm:w-40 md:w-48 flex-shrink-0 aspect-video rounded-md overflow-hidden bg-zinc-900">
                                        <img src={episode.still_path || details.backdropUrl} alt={episode.name} className="w-full h-full object-cover" loading="lazy" />
                                        {isReleased ? (
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                                {isPlayingEpisode ? (
                                                    <div className="flex items-center gap-2 text-white text-sm font-bold bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/30">
                                                        <svg className="w-5 h-5 animate-pulse text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.5V19.5L18 12L6 4.5Z"></path></svg>
                                                        <span>Playing</span>
                                                    </div>
                                                ) : (
                                                    <PlayIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-black/60 border border-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">Coming Soon</div>
                                        )}
                                        <span className="absolute bottom-1 left-2 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded">{episode.episode_number}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className={`text-base font-bold truncate ${isPlayingEpisode ? 'text-[var(--brand-color)]' : 'text-gray-100'}`}>{episode.name}</h3>
                                            {episode.runtime && isReleased && <span className="text-sm text-gray-400 ml-4">{episode.runtime}m</span>}
                                        </div>
                                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{episode.overview || 'No description available for this episode.'}</p>
                                    </div>
                                     <a href={`https://dl.vidsrc.vip/tv/${movieId}/${selectedSeason.season_number}/${episode.episode_number}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-auto flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors" title={`Download Episode ${episode.episode_number}`}>
                                        <DownloadIcon className="w-6 h-6 text-gray-300"/>
                                    </a>
                                </div>
                            )
                        }) : <p className="text-center text-gray-500 py-16">No episodes found</p>}
                    </div>
                )}
            </section>
        )}

        {cast.length > 0 && (
            <section>
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                    <h2 className="text-2xl font-bold text-white">Actors</h2>
                </div>
                <div className="group/row relative md:-ml-2">
                    <button onClick={() => scrollContainer(actorsRowRef, 'left')} className="absolute top-0 bottom-0 left-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition group-hover/row:opacity-100 bg-white/70 rounded-full text-black hover:bg-white"><ChevronLeftIcon className="w-full h-full p-1" /></button>
                    <div ref={actorsRowRef} className="flex items-start space-x-2 sm:space-x-4 md:space-x-5 overflow-x-scroll scrollbar-hide md:p-2 overscroll-x-contain scroll-smooth">
                        {cast.map(actor => <ActorCard key={actor.id} actor={actor} onSelectActor={onSelectActor} />)}
                    </div>
                    <button onClick={() => scrollContainer(actorsRowRef, 'right')} className="absolute top-0 bottom-0 right-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition group-hover/row:opacity-100 bg-white/70 rounded-full text-black hover:bg-white"><ChevronRightIcon className="w-full h-full p-1" /></button>
                </div>
            </section>
        )}

        {similar.length > 0 && (
        <section ref={similarSectionRef}>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                <h2 className="text-2xl font-bold text-white">You may like</h2>
            </div>
            <div className="group/row relative md:-ml-2">
                 <button onClick={() => scrollContainer(similarRowRef, 'left')} className="absolute top-0 bottom-0 left-0 z-40 my-auto h-9 w-9 cursor-pointer opacity-0 transition group-hover/row:opacity-100 bg-white/70 rounded-full text-black hover:bg-white"><ChevronLeftIcon className="w-full h-full p-1" /></button>
                <div ref={similarRowRef} className="flex items-start space-x-2 sm:space-x-4 md:space-x-5 overflow-x-scroll scrollbar-hide md:p-2 overscroll-x-contain snap-x snap-mandatory scroll-smooth">
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
                <button onClick={() => scrollContainer(similarRowRef, 'right')} className="absolute top-0 bottom-0 right-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition group-hover/row:opacity-100 bg-white/70 rounded-full text-black hover:bg-white"><ChevronRightIcon className="w-full h-full p-1" /></button>
            </div>
        </section>
        )}

        <AdsterraBanner />
      </div>
    </div>
  );
};

export default DetailPage;