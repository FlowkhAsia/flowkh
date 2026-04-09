'use client';

import { useMyList } from '@/context/MyListContext';
import { IMAGE_BASE_URL, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MyListPage() {
  const { myList } = useMyList();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="pt-24 md:pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white">
        <h1 className="text-2xl font-semibold mb-8">My List</h1>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white">
      <h1 className="text-2xl font-semibold mb-8">My List</h1>
      
      {myList.length === 0 ? (
        <p className="text-gray-400">You haven&apos;t added any movies to your list yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-24">
          {myList.map((movie) => {
            const imagePath = movie.poster_path || movie.backdrop_path;
            const imageUrl = imagePath 
              ? `${IMAGE_BASE_URL}${imagePath}`
              : `https://picsum.photos/seed/${movie.id}/400/600?blur=2`;

            return (
              <Link 
                key={movie.id} 
                href={`/title/${movie.media_type || 'movie'}/${movie.id}`}
                aria-label={`View details for ${movie.title || movie.name || movie.original_name}`}
                className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded block"
              >
                <div className="relative group cursor-pointer transition duration-200 ease-out hover:scale-105">
                  <div className="aspect-[2/3] relative rounded overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={movie.title || movie.name || 'Movie poster'}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white text-xs md:text-sm font-semibold truncate w-full text-shadow-md mb-1">
                        {movie.title || movie.name || movie.original_name}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
