import Banner from '@/components/Banner';
import Row from '@/components/Row';
import {
  getTrending,
  getKDrama,
  getCDrama,
  getAnime,
  getPopularMovies,
} from '@/lib/tmdb';

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
