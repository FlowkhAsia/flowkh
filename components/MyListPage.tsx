import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface MyListPageProps {
  myList: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onToggleMyList: (movie: Movie) => void;
}

const MyListPage: React.FC<MyListPageProps> = ({ myList, onSelectMovie, onToggleMyList }) => {
  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
        <h1 className="text-lg md:text-2xl font-bold">My List</h1>
      </div>

      {myList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {myList.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onSelectMovie={onSelectMovie}
              onToggleMyList={onToggleMyList}
              isAdded={myList.some(item => item.id === movie.id)}
              display="poster" 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 h-[50vh]">
          <p className="text-2xl text-gray-300">Your list is empty.</p>
          <p className="mt-2 text-gray-500">Add shows and movies to your list to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default MyListPage;