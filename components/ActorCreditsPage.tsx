import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Movie, Actor, ActorDetail } from '../types';
import { fetchActorCredits } from '../services/geminiService';
import MovieCard from './MovieCard';
import { UserCircleIcon, CalendarIcon } from './icons/Icons';

interface ActorCreditsPageProps {
  actorId: number;
  onSelectMovie: (movie: Movie) => void;
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

const ActorCreditsPage: React.FC<ActorCreditsPageProps> = ({ actorId, onSelectMovie, myList, onToggleMyList }) => {
  const [actorDetails, setActorDetails] = useState<ActorDetail | null>(null);
  const [credits, setCredits] = useState<Movie[]>([]);
  const [backdropUrl, setBackdropUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);
  const creditsPerPage = 16;
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadActorData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setActorDetails(null);
        const { actor: fetchedActor, credits: fetchedCredits, backdropUrl: fetchedBackdrop } = await fetchActorCredits(actorId);
        setActorDetails(fetchedActor);
        setCredits(fetchedCredits);
        setBackdropUrl(fetchedBackdrop);
        document.title = `${fetchedActor.name} | kisskh`;
      } catch (err) {
        setError("Failed to load actor's credits. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadActorData();
  }, [actorId]);

  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    setVisibleCount(prev => prev + creditsPerPage);
  }, [isLoading]);
  
  const visibleCredits = useMemo(() => credits.slice(0, visibleCount), [credits, visibleCount]);

  useEffect(() => {
    if (isLoading || !loaderRef.current) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && visibleCount < credits.length) {
                handleLoadMore();
            }
        },
        { rootMargin: '400px' }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [isLoading, visibleCount, credits.length, handleLoadMore]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen pt-16">
        <div className="w-16 h-16 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !actorDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4 pt-16">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <p>Please try navigating back home.</p>
      </div>
    );
  }
  
  const needsTruncation = actorDetails.biography && actorDetails.biography.length > 350;

  return (
    <div className="pb-24 min-h-screen animate-fade-in-cinematic">
        {/* Hero Section */}
        <div className="relative pt-24 pb-12 md:pb-20 px-4 md:px-16 overflow-hidden">
            {/* Backdrop Image */}
            {backdropUrl && (
                <div className="absolute inset-0">
                    <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
                </div>
            )}
            {!backdropUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-[#1f1f1f]" />}


            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                <div className="w-48 md:w-56 flex-shrink-0">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl">
                        {actorDetails.profilePath ? (
                            <img src={actorDetails.profilePath} alt={actorDetails.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <UserCircleIcon className="w-24 h-24 text-zinc-600"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{actorDetails.name}</h1>
                    
                    {actorDetails.birthday && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                            <CalendarIcon className="w-5 h-5"/>
                            <span>Born {formatDate(actorDetails.birthday)}</span>
                            {actorDetails.place_of_birth && <span>in {actorDetails.place_of_birth}</span>}
                        </div>
                    )}
                    
                    <div className="relative max-w-3xl mx-auto md:mx-0">
                        <p 
                            className={`text-gray-300 leading-relaxed transition-all duration-300 ease-in-out text-sm md:text-base ${needsTruncation && !isBioExpanded ? 'line-clamp-6' : ''}`}
                        >
                            {actorDetails.biography || "No biography available."}
                        </p>
                        {needsTruncation && (
                            <button 
                                onClick={() => setIsBioExpanded(!isBioExpanded)}
                                className="text-white font-semibold mt-2 hover:underline"
                            >
                                {isBioExpanded ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Credits Section */}
        <div className="px-4 md:px-16">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
                <h2 className="text-2xl font-bold">Known For</h2>
            </div>

            {credits.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {visibleCredits.map((movie) => (
                            <MovieCard 
                                key={`${movie.id}-${actorId}`} 
                                movie={movie} 
                                onSelectMovie={onSelectMovie}
                                onToggleMyList={onToggleMyList}
                                isAdded={myList.some(item => item.id === movie.id)}
                                display="poster" 
                            />
                        ))}
                    </div>

                    {visibleCredits.length < credits.length && (
                      <div ref={loaderRef} className="mt-12 text-center h-10" />
                    )}
                </>
            ) : (
                <p className="text-gray-400">No credits found.</p>
            )}
        </div>
    </div>
  );
};

export default ActorCreditsPage;