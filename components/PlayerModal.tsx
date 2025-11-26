import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon } from './icons/Icons';
import { fetchExternalIds, fetchSeasonEpisodes, fetchTVSeasons } from '../services/geminiService';
import { Episode, Season } from '../types';

interface PlayerModalProps {
  contentToPlay: {
    id: number;
    media_type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    title: string;
  };
  onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ contentToPlay, onClose }) => {
  const [currentContent, setCurrentContent] = useState(contentToPlay);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimeout = useRef<number | null>(null);
  const [selectedServer, setSelectedServer] = useState('VidStorm');
  
  // Server Dropdown State
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const serverDropdownRef = useRef<HTMLDivElement>(null);
  
  // Season & Episode State
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(contentToPlay.season);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // When the initial contentToPlay prop changes, update the internal state
  useEffect(() => {
    setCurrentContent(contentToPlay);
    setSelectedSeasonNumber(contentToPlay.season);
  }, [contentToPlay]);
  
  // Effect to fetch seasons for TV shows
  useEffect(() => {
    const getSeasons = async () => {
        if (currentContent.media_type === 'tv') {
            setIsLoadingSeasons(true);
            const fetchedSeasons = await fetchTVSeasons(currentContent.id);
            setSeasons(fetchedSeasons);
            setIsLoadingSeasons(false);
        } else {
            setSeasons([]);
        }
    };
    getSeasons();
  }, [currentContent.id, currentContent.media_type]);

  // Effect to fetch episodes for the selected season
  useEffect(() => {
    const fetchEpisodes = async () => {
        if (currentContent.media_type === 'tv' && selectedSeasonNumber) {
            setIsLoadingEpisodes(true);
            const fetchedEpisodes = await fetchSeasonEpisodes(currentContent.id, selectedSeasonNumber);
            setEpisodes(fetchedEpisodes);
            setIsLoadingEpisodes(false);
        } else {
            setEpisodes([]);
        }
    };
    fetchEpisodes();
  }, [currentContent.id, currentContent.media_type, selectedSeasonNumber]);

  // Effect to close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target as Node)) {
            setIsServerDropdownOpen(false);
        }
        if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
            setIsSeasonDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main effect for player controls and key bindings
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const scheduleHide = () => {
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
        hideControlsTimeout.current = window.setTimeout(() => {
            setControlsVisible(false);
            setIsServerDropdownOpen(false);
            setIsSeasonDropdownOpen(false);
        }, 3000);
    };

    const handleMouseMove = () => {
        setControlsVisible(true);
        scheduleHide();
    };

    scheduleHide();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.style.overflow = 'auto';
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onClose]);

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
    const { id, media_type, season, episode } = currentContent;
    const seasonNum = season || 1;
    const episodeNum = episode || 1;

    switch (selectedServer) {
        case 'VidStorm':
            if (media_type === 'movie') return `https://vidstorm.ru/movie/${id}`;
            return `https://vidstorm.ru/tv/${id}/${seasonNum}/${episodeNum}`;
        case 'VidSrcV2': // Alternate 1
            if (media_type === 'movie') return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
            return `https://vidsrc.cc/v2/embed/tv/${id}/${seasonNum}/${episodeNum}?autoPlay=true`;
        case 'Videasy': // Alternate 2
            if (media_type === 'movie') return `https://player.videasy.net/movie/${id}?autoplay=true`;
            return `https://player.videasy.net/tv/${id}/${seasonNum}/${episodeNum}?autoplay=true`;
        case 'VidSrcMe': // Alternate 3
            if (media_type === 'movie') return `https://vidsrcme.ru/embed/movie?tmdb=${id}`;
            return `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${seasonNum}&episode=${episodeNum}`;
        case 'VidPlus': // Alternate 4
            if (media_type === 'movie') return `https://player.vidplus.to/embed/movie/${id}?autoplay=true`;
            return `https://player.vidplus.to/embed/tv/${id}/${seasonNum}/${episodeNum}?autoplay=true`;
        case 'MoviesAPI': // Alternate 5
            if (media_type === 'movie') return `https://moviesapi.club/movie/${id}`;
            return `https://moviesapi.club/tv/${id}-${seasonNum}-${episodeNum}`;
        case 'VidLink': // Alternate 6
            if (media_type === 'movie') return `https://vidlink.pro/movie/${id}`;
            return `https://vidlink.pro/tv/${id}/${seasonNum}/${episodeNum}`;
        default:
            return '';
    }
  };
  
  const handleEpisodeClick = (episode: Episode) => {
    const baseTitle = contentToPlay.title.split(' - ')[0] || contentToPlay.title;
    setCurrentContent(prev => ({
        ...prev,
        season: selectedSeasonNumber,
        episode: episode.episode_number,
        title: `${baseTitle} - S${selectedSeasonNumber}E${episode.episode_number} - ${episode.name}`
    }));
  };


  const playerUrl = getPlayerUrl();

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-50 flex flex-col lg:flex-row animate-fade-scale-in">
        {/* Main Player Area */}
        <div className="w-full lg:flex-1 aspect-video lg:aspect-auto relative bg-black">
            {playerUrl ? (
            <iframe
                key={playerUrl} // Re-mount iframe when src changes
                src={playerUrl}
                title="Content Player"
                frameBorder="0"
                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
            ></iframe>
            ) : (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                <p className="text-lg">Loading player...</p>
                <p className="text-sm text-gray-400">This may take a moment.</p>
                </div>
            </div>
            )}

             {/* Top Controls Overlay */}
            <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between p-4 md:p-6 transition-opacity duration-300 pointer-events-none ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={onClose}
                    className="text-white bg-black/20 rounded-full p-2 hover:bg-black/50 transition-colors pointer-events-auto z-10"
                    aria-label="Back"
                >
                    <ArrowLeftIcon className="w-7 h-7" />
                </button>
                <div className="absolute inset-x-0 top-0 flex items-center justify-center h-full pointer-events-none">
                   <h2 className="text-white text-lg md:text-xl font-semibold drop-shadow-lg text-center px-20 truncate">
                        {currentContent.title}
                    </h2>
                </div>
                {/* Placeholder for right side of top bar to balance layout */}
                <div className="w-24 pointer-events-auto"></div> 
            </div>
        </div>
        
        {/* Sidebar */}
        <div className="flex-1 w-full lg:w-[350px] lg:flex-none bg-[#2d2d2d] flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-700">
            <div className="p-4 border-b border-zinc-700">
                <div className="relative" ref={serverDropdownRef}>
                    <button
                        onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e1e] rounded-md text-white font-semibold hover:bg-zinc-700 transition-colors"
                    >
                        <span>Server: {servers.find(s => s.name === selectedServer)?.displayName || selectedServer}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isServerDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-full bg-zinc-800 rounded-md shadow-lg z-40 animate-fade-scale-in border border-zinc-700 max-h-60 overflow-y-auto custom-scrollbar">
                            <ul>
                                {servers.map(({ name, displayName }) => {
                                    const isSelected = selectedServer === name;
                                    return (
                                        <li key={name}>
                                            <button
                                                onClick={() => {
                                                    setSelectedServer(name);
                                                    setIsServerDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'text-gray-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <span>{displayName}</span>
                                                {isSelected && <CheckIcon className="w-5 h-5" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            {currentContent.media_type === 'tv' && (
                <>
                <div className="p-4 border-b border-zinc-700">
                    {isLoadingSeasons ? (
                        <div className="w-full h-[48px] bg-zinc-800/50 rounded-md animate-pulse"></div>
                    ) : seasons.length > 0 ? (
                        <div className="relative" ref={seasonDropdownRef}>
                            <button
                                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e1e] rounded-md text-white font-semibold hover:bg-zinc-700 transition-colors"
                            >
                                <span>{seasons.find(s => s.season_number === selectedSeasonNumber)?.name || `Season ${selectedSeasonNumber}`}</span>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSeasonDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full bg-zinc-800 rounded-md shadow-lg z-30 animate-fade-scale-in border border-zinc-700 max-h-60 overflow-y-auto custom-scrollbar">
                                    <ul>
                                        {seasons.map((season) => (
                                            <li key={season.id}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSeasonNumber(season.season_number);
                                                        setIsSeasonDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                                                        selectedSeasonNumber === season.season_number
                                                            ? 'bg-white/20 text-white'
                                                            : 'text-gray-300 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {season.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
                <div className="flex-1 overflow-y-auto p-2 episodes-scrollbar">
                     {isLoadingEpisodes ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-2 border-zinc-500 border-solid border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <ul className="space-y-1.5 p-2">
                            {episodes.map(ep => (
                                <li key={ep.id}>
                                    <button 
                                        onClick={() => handleEpisodeClick(ep)}
                                        className={`w-full text-left p-3 rounded-md transition-colors text-sm font-semibold border border-transparent ${currentContent.episode === ep.episode_number ? 'bg-[var(--brand-color)] text-white' : 'bg-[#1e1e1e] hover:bg-zinc-700 text-zinc-300 border-zinc-700'}`}
                                    >
                                        Episode {ep.episode_number}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                </>
            )}
        </div>
    </div>
  );
};

export default PlayerModal;