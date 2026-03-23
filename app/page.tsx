import { Metadata } from 'next';
import Banner from '@/components/Banner';
import Row from '@/components/Row';
import {
  getTrending,
  getKDrama,
  getCDrama,
  getAnime,
  getPopularMovies,
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Flowkh - Watch TV Shows Online, Watch Movies Online',
  description: 'Flowkh is a streaming platform to watch your favorite movies and TV shows online for free. Discover new releases, popular series, and classic films.',
};

export default async function Home() {
  const [
    trendingNow,
    kDrama,
    cDrama,
    anime,
    popularMovies,
  ] = await Promise.all([
    getTrending(),
    getKDrama(),
    getCDrama(),
    getAnime(),
    getPopularMovies(),
  ]);

  return (
    <main className="relative h-screen bg-gradient-to-b from-transparent to-netflix-black lg:h-[140vh]">
      <Banner movies={trendingNow} />
      
      <section className="md:space-y-12 pb-24">
        <Row title="Trending" movies={trendingNow} />
        <Row title="K-Drama" movies={kDrama} />
        <Row title="C-Drama" movies={cDrama} />
        <Row title="Anime" movies={anime} />
        <Row title="Popular Movies" movies={popularMovies} />
      </section>
    </main>
  );
}
