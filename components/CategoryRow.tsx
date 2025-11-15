
import React from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';

// FIX: Updated props to satisfy MovieCard requirements. Renamed onMovieClick and added myList and onToggleMyList.
interface CategoryRowProps {
    title: string;
    movies: Movie[];
    onSelectMovie: (movie: Movie) => void;
    myList: Movie[];
    onToggleMyList: (movie: Movie) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ title, movies, onSelectMovie, myList, onToggleMyList }) => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scrollbar-hide">
                {movies.map(movie => (
                    // FIX: Passed correct props to MovieCard. 'onClick' was changed to 'onSelectMovie' and missing props were added.
                    <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onSelectMovie={onSelectMovie} 
                        onToggleMyList={onToggleMyList}
                        isAdded={myList.some(item => item.id === movie.id)}
                    />
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
