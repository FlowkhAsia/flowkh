import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { getDiscover, getTrending } from '../services/tmdb';

interface CategoryPageProps {
  title: string;
  mediaType?: 'movie' | 'tv' | 'all';
  movies?: Movie[];
  onSelectMovie: (movie: Movie) => void;
  // FIX: Add missing props for MovieCard
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ title, mediaType, movies: initialMovies, onSelectMovie, myList, onToggleMyList }) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies || []);
  const [loading, setLoading] = useState(!initialMovies);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialMovies) {
        setMovies(initialMovies);
        setLoading(false);
        setHasMore(false);
        return;
    }
    
    // Reset on type change
    setMovies([]);
    setPage(1);
    setHasMore(true);

  }, [mediaType, initialMovies]);

  useEffect(() => {
    if (initialMovies || !mediaType) return;

    const fetchContent = async (pageNum: number) => {
      setLoading(true);
      try {
        let newMovies: Movie[] = [];
        if (mediaType === 'all') {
            newMovies = await getTrending('all', 'week');
            setHasMore(false);
        } else {
            const discovered = await getDiscover(mediaType, { page: pageNum, 'sort_by': 'popularity.desc' });
            newMovies = discovered;
            if (discovered.length < 20) {
                setHasMore(false);
            }
        }
        setMovies(prev => pageNum === 1 ? newMovies : [...prev, ...newMovies]);
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchContent(page);
  }, [mediaType, title, page, initialMovies]);
  
  const loadMore = () => {
    if (!loading && hasMore) {
        setPage(prevPage => prevPage + 1);
    }
  }

  return (
    <div className="pt-24 container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map(movie => (
          // FIX: Added missing props `onToggleMyList` and `isAdded` to satisfy MovieCardProps.
          <MovieCard 
            key={`${movie.id}-${movie.media_type}`} 
            movie={movie} 
            onSelectMovie={onSelectMovie}
            onToggleMyList={onToggleMyList}
            isAdded={myList.some(item => item.id === movie.id)}
          />
        ))}
      </div>
      {loading && <p className="text-center mt-8">Loading...</p>}
      {!loading && hasMore && (
        <div className="text-center mt-8">
            <button onClick={loadMore} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700 transition">
                Load More
            </button>
        </div>
      )}
       {!loading && movies.length === 0 && <p className="text-gray-400">This list is empty.</p>}
    </div>
  );
};

export default CategoryPage;