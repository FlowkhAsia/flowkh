import { Metadata } from 'next';
import { searchMovies, IMAGE_BASE_URL } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    return {
      title: 'Search',
      description: 'Search for movies and TV shows on Flowkh.',
    };
  }

  return {
    title: `Search results for "${query}"`,
    description: `Find movies and TV shows related to "${query}" on Flowkh.`,
    robots: {
      index: false,
      follow: true,
    }
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    return (
      <main className="pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white">
        <h1 className="text-2xl font-semibold mb-8">Please enter a search term.</h1>
      </main>
    );
  }

  const results = await searchMovies(query);

  return (
    <main className="pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white">
      <h1 className="text-2xl font-semibold mb-8">Search Results for &quot;{query}&quot;</h1>
      
      {results.length === 0 ? (
        <p className="text-gray-400">No results found for your query.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-24">
          {results.map((movie) => {
            const imagePath = movie.backdrop_path || movie.poster_path;
            const imageUrl = imagePath 
              ? `${IMAGE_BASE_URL}${imagePath}`
              : `https://picsum.photos/seed/${movie.id}/500/281?blur=2`;

            return (
              <Link 
                key={movie.id} 
                href={`/title/${movie.media_type || 'movie'}/${movie.id}`}
                aria-label={`View details for ${movie.title || movie.name || movie.original_name}`}
                className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded block"
              >
                <div className="relative group cursor-pointer transition duration-200 ease-out hover:scale-105">
                  <div className="aspect-video relative rounded overflow-hidden">
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
