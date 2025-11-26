"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Movie, ActorDetail } from '../types';
import MovieCard from './MovieCard';
import { UserCircleIcon, CalendarIcon } from './icons/Icons';

interface ActorCreditsPageContentProps {
  actor: ActorDetail;
  credits: Movie[];
  backdropUrl?: string;
}

const ActorCreditsPageContent: React.FC<ActorCreditsPageContentProps> = ({ actor, credits, backdropUrl }) => {
  const router = useRouter();
  const [myList, setMyList] = useState<Movie[]>([]);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);
  const creditsPerPage = 16;
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedList = localStorage.getItem('myList');
    if (storedList) {
      setMyList(JSON.parse(storedList));
    }
  }, []);

  const onSelectMovie = (movie: Movie) => {
    router.push(`/${movie.media_type}/${movie.id}`);
  };

  const onToggleMyList = (movie: Movie) => {
    setMyList((prevList) => {
      const isAdded = prevList.some((item) => item.id === movie.id);
      const newList = isAdded ? prevList.filter((item) => item.id !== movie.id) : [...prevList, movie];
      localStorage.setItem('myList', JSON.stringify(newList));
      return newList;
    });
  };

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + creditsPerPage);
  }, []);
  
  const visibleCredits = useMemo(() => credits.slice(0, visibleCount), [credits, visibleCount]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && visibleCount < credits.length) {
                handleLoadMore();
            }
        },
        { rootMargin: '400px' }
    );

    observer.observe(loaderRef.current);
    return () => {
      if(loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [visibleCount, credits.length, handleLoadMore]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };
  
  const needsTruncation = actor.biography && actor.biography.length > 350;

  return (
    <div className="pb-24 min-h-screen animate-fade-in-cinematic">
        <div className="relative pt-24 pb-12 md:pb-20 px-4 md:px-16 overflow-hidden">
            {backdropUrl && (
                <div className="absolute inset-0">
                    <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
                </div>
            )}
            {!backdropUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-[#1f1f1f]" />}

            <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                <div className="w-48 md:w-56 flex-shrink-0">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl">
                        {actor.profilePath ? (
                            <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <UserCircleIcon className="w-24 h-24 text-zinc-600"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bebas tracking-wider mb-4">{actor.name}</h1>
                    
                    {actor.birthday && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                            <CalendarIcon className="w-5 h-5"/>
                            <span>Born {formatDate(actor.birthday)}</span>
                            {actor.place_of_birth && <span>in {actor.place_of_birth}</span>}
                        </div>
                    )}
                    
                    <div className="relative max-w-3xl mx-auto md:mx-0">
                        <p className={`text-gray-300 leading-relaxed transition-all duration-300 ease-in-out text-sm md:text-base ${needsTruncation && !isBioExpanded ? 'line-clamp-6' : ''}`}>
                            {actor.biography || "No biography available."}
                        </p>
                        {needsTruncation && (
                            <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-white font-semibold mt-2 hover:underline">
                                {isBioExpanded ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
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
                                key={`${movie.id}-${actor.id}`} 
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

export default ActorCreditsPageContent;