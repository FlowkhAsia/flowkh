import { Suspense } from 'react';
import { fetchTMDB } from '@/lib/tmdb';
import { TMDBResponse, Movie, TVShow, TMDBImages, TMDBImage } from '@/types/tmdb';
import { HeroBanner } from '@/components/features/hero-banner';
import { MediaCarousel } from '@/components/features/media-carousel';

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  let trendingMovies: Movie[] = [];
  let topRatedMovies: Movie[] = [];
  let popularTvShows: TVShow[] = [];
  let upcomingMovies: Movie[] = [];
  let heroLogos: Record<number, TMDBImage> = {};
  let errorMsg = '';

  try {
    const [trendingRes, topRatedRes, popularTvRes, upcomingRes] = await Promise.all([
      fetchTMDB<TMDBResponse<Movie>>('/trending/movie/day'),
      fetchTMDB<TMDBResponse<Movie>>('/movie/top_rated'),
      fetchTMDB<TMDBResponse<TVShow>>('/tv/popular'),
      fetchTMDB<TMDBResponse<Movie>>('/movie/upcoming')
    ]);

    trendingMovies = trendingRes.results;
    topRatedMovies = topRatedRes.results;
    popularTvShows = popularTvRes.results;
    upcomingMovies = upcomingRes.results;

    if (trendingMovies?.length > 0) {
      const top5 = trendingMovies.slice(0, 5);
      const imagesPromises = top5.map(m => fetchTMDB<TMDBImages>(`/movie/${m.id}/images`, { include_image_language: 'en,null' }).catch(() => null));
      const imagesResults = await Promise.all(imagesPromises);
      
      imagesResults.forEach((images, index) => {
        if (images && images.logos?.length > 0) {
          heroLogos[top5[index].id] = images.logos[0];
        }
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMsg = error.message;
    } else {
      errorMsg = 'An error occurred while fetching data.';
    }
  }

  // Fallback if TMDB API is not set or failing
  if (errorMsg || trendingMovies.length === 0) {
    return (
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Cinemate</h1>
        <p className="text-neutral-400 max-w-lg mx-auto mb-8">
          {errorMsg || "We couldn't connect to TMDB to load content."}
        </p>
        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-left max-w-2xl w-full">
           <h3 className="font-semibold text-lg mb-2 text-white">How to fix this:</h3>
           <ol className="list-decimal pl-5 space-y-2 text-neutral-300 text-sm">
             <li>Create an account at <strong>themoviedb.org</strong></li>
             <li>Generate an API Key (v3 auth) in your settings</li>
             <li>Open the AI Studio Settings menu and add <code>TMDB_API_KEY</code> to your secrets</li>
             <li>Reload this application</li>
           </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <HeroBanner movies={trendingMovies.slice(0, 5)} logos={heroLogos} />
      <div className="-mt-2 md:-mt-4 relative z-10 space-y-8">
        <MediaCarousel title="Trending Movies" items={trendingMovies.slice(5, 15)} />
        <MediaCarousel title="Popular TV Shows" items={popularTvShows.map(t => ({...t, media_type: 'tv'}))} />
        <MediaCarousel title="Top Rated Movies" items={topRatedMovies} />
        <MediaCarousel title="Upcoming Movies" items={upcomingMovies} />
      </div>
    </div>
  );
}
