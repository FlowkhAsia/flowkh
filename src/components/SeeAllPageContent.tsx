"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Movie } from '../types';
import { fetchCategoryPageData } from '../services/geminiService';
import MovieCard from './MovieCard';

interface SeeAllPageContentProps {
  categoryKey: string;
  categoryTitle: string;
  initialMovies: Movie[];
  initialTotalPages: number;
}

const SeeAllPageContent: React.FC<SeeAllPageContentProps> = ({ categoryKey, categoryTitle, initialMovies, initialTotalPages }) => {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [myList, setMyList] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const storedList = localStorage.getItem('myList');
    if (storedList) setMyList(JSON.parse(storedList));
  }, []);

  const onSelectMovie = (movie: Movie) => router.push(`/${movie.media_type}/${movie.id}`);
  
  const onToggleMyList = (movie: Movie) => {
    setMyList((prevList) => {
      const isAdded = prevList.some((item) => item.id === movie.id);
      const newList = isAdded ? prevList.filter((item) => item.id !== movie.id) : [...prevList, movie];
      localStorage.setItem('myList', JSON.stringify(newList));
      return newList;
    });
  };

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
        const { results } = await fetchCategoryPageData(categoryKey, nextPage);
        if (results.length > 0) {
            setMovies(prevMovies => [...prevMovies, ...results]);
        }
        setCurrentPage(nextPage);
    } catch (error) {
        console.error(`Failed to fetch page ${nextPage} for ${categoryKey}:`, error);
    } finally {
        setIsLoadingMore(false);
    }
  }, [isLoadingMore, currentPage, totalPages, categoryKey]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && currentPage < totalPages) {
          handleLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(loaderRef.current);

    return () => {
        if (loaderRef.current) {
            observer.unobserve(loaderRef.current);
        }
    };
  }, [isLoadingMore, currentPage, totalPages, handleLoadMore]);

  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <h1 className="text-4xl font-bebas tracking-wider mb-8">{categoryTitle}</h1>

      {movies.length > 0 ? (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {movies.map((movie) => (
                <MovieCard 
                key={`${movie.id}-${categoryKey}`} 
                movie={movie} 
                onSelectMovie={onSelectMovie}
                onToggleMyList={onToggleMyList}
                isAdded={myList.some(item => item.id === movie.id)}
                display="poster" 
                />
            ))}
            </div>

            {currentPage < totalPages && (
                <div ref={loaderRef} className="mt-12 text-center h-20 flex items-center justify-center">
                {isLoadingMore && (
                    <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                </div>
            )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">No content found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default SeeAllPageContent;