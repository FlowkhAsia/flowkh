import React from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';

interface CategoryRowProps {
    title: string;
    movies: Movie[];
    onMovieClick: (movie: Movie) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ title, movies, onMovieClick }) => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scrollbar-hide">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                ))}
            </div>
            {/* Fix: Replaced non-standard <style jsx global> with a standard <style> tag to resolve TypeScript error. */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};