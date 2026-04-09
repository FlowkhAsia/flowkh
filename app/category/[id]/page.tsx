import { Metadata } from 'next';
import { getKDrama, getCDrama, getAnime, getPopularMovies, getTrending, IMAGE_BASE_URL, getGenres, getMoviesByGenre, getTvShowsByGenre } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let title = 'Category';
  if (id === 'tv') title = 'TV Shows';
  if (id === 'movie') title = 'Movies';
  if (id === 'popular') title = 'New & Popular';

  return {
    title: `${title} - Flowkh`,
    description: `Browse the best ${title.toLowerCase()} on Flowkh.`,
  };
}

export default async function CategoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ genre?: string }>
}) {
  const { id } = await params;
  const { genre } = await searchParams;
  
  let title = '';
  let movies: any[] = [];
  const allGenres = await getGenres();

  if (id === 'tv') {
    title = 'TV Shows';
    if (genre) {
      movies = await getTvShowsByGenre(genre);
    } else {
      // For simplicity, combining a few TV-heavy categories
      const [kdrama, cdrama, anime] = await Promise.all([getKDrama(), getCDrama(), getAnime()]);
      movies = [...kdrama, ...cdrama, ...anime].filter((m, i, self) => self.findIndex(t => t.id === m.id) === i);
    }
  } else if (id === 'movie') {
    title = 'Movies';
    if (genre) {
      movies = await getMoviesByGenre(genre);
    } else {
      movies = await getPopularMovies();
    }
  } else if (id === 'popular') {
    title = 'New & Popular';
    movies = await getTrending();
  } else {
    notFound();
  }

  const selectedGenreName = genre ? allGenres.find(g => g.id.toString() === genre)?.name : null;

  return (
    <main className="pt-24 md:pt-32 px-4 md:px-10 min-h-screen bg-netflix-black text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-semibold">
          {title} {selectedGenreName && <span className="text-gray-400 text-lg ml-2">› {selectedGenreName}</span>}
        </h1>
        
        {(id === 'tv' || id === 'movie') && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Link 
              href={`/category/${id}`}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${!genre ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/30 hover:border-white'}`}
            >
              All
            </Link>
            {allGenres.map((g) => (
              <Link
                key={g.id}
                href={`/category/${id}?genre=${g.id}`}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${genre === g.id.toString() ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/30 hover:border-white'}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {movies.length === 0 ? (
        <p className="text-gray-400">No titles found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-24">
          {movies.map((movie) => {
            const imagePath = movie.poster_path || movie.backdrop_path;
            const imageUrl = imagePath 
              ? `${IMAGE_BASE_URL}${imagePath}`
              : `https://picsum.photos/seed/${movie.id}/400/600?blur=2`;

            return (
              <Link 
                key={movie.id} 
                href={`/title/${movie.media_type || (movie.first_air_date ? 'tv' : 'movie')}/${movie.id}`}
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
