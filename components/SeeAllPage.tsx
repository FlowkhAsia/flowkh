import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Movie } from '../types';
import { fetchCategoryPageData } from '../services/geminiService';
import MovieCard from './MovieCard';

interface SeeAllPageProps {
  categoryKey: string;
  categoryTitle: string;
  onSelectMovie: (movie: Movie) => void;
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

const SeeAllPage: React.FC<SeeAllPageProps> = ({ categoryKey, categoryTitle, onSelectMovie, myList, onToggleMyList }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFirstPage = async () => {
      setIsLoading(true);
      const { results, totalPages: newTotalPages } = await fetchCategoryPageData(categoryKey, 1);
      setMovies(results);
      setTotalPages(newTotalPages);
      setCurrentPage(1);
      setIsLoading(false);
    };

    fetchFirstPage();
  }, [categoryKey]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    setIsLoadingMore(true);
    let pageToFetch = currentPage;
    let newFoundResults: Movie[] = [];
    const MAX_ATTEMPTS = 5;
    let attempts = 0;

    while (newFoundResults.length === 0 && pageToFetch < totalPages && attempts < MAX_ATTEMPTS) {
      pageToFetch++;
      attempts++;
      try {
        const { results } = await fetchCategoryPageData(categoryKey, pageToFetch);
        if (results.length > 0) {
          newFoundResults = results;
        }
      } catch (error) {
        console.error(`Failed to fetch page ${pageToFetch} for ${categoryKey}:`, error);
        break;
      }
    }

    if (newFoundResults.length > 0) {
      setMovies(prevMovies => [...prevMovies, ...newFoundResults]);
    }
    setCurrentPage(pageToFetch);
    setIsLoadingMore(false);
  }, [isLoadingMore, currentPage, totalPages, categoryKey]);

  useEffect(() => {
    if (isLoading || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && currentPage < totalPages) {
          handleLoadMore();
        }
      },
      {
        rootMargin: '400px', // Load more when user is 400px away from the bottom
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, currentPage, totalPages, handleLoadMore]);

  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">{categoryTitle}</h1>

      {isLoading ? (
        <div className="flex justify-center items-center p-4 min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {movies.length > 0 ? (
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
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">No content found in this category.</p>
            </div>
          )}

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
      )}
    </div>
  );
};

export default SeeAllPage;