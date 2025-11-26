import { fetchCategoryPageData } from '../../../services/geminiService';
import SeeAllPageContent from '../../../components/SeeAllPageContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { key: string };
};

const categoryTitles: { [key: string]: string } = {
  trending_today: 'Trending Today',
  trending_tv: 'Trending TV Shows',
  k_drama: 'Popular K-Dramas',
  c_drama: 'Popular C-Dramas',
  anime: 'Popular Anime',
  on_the_air_tv: 'On The Air TV Shows',
  top_rated_tv: 'Top Rated TV Shows',
  trending_movies: 'Trending Movies',
  popular_movies: 'Popular Movies',
  now_playing_movies: 'Now Playing Movies',
  upcoming_movies: 'Upcoming Movies',
  top_rated_movies: 'Top Rated Movies',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryTitle = categoryTitles[params.key] || 'Category';
  return {
    title: categoryTitle,
    description: `Browse all content from the ${categoryTitle} category on flowkh.`,
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: Props) {
  const { key } = params;
  const categoryTitle = categoryTitles[key];
  if (!categoryTitle) {
    return notFound();
  }

  const { results: initialMovies, totalPages } = await fetchCategoryPageData(key, 1);
  
  return (
    <SeeAllPageContent
      categoryKey={key}
      categoryTitle={categoryTitle}
      initialMovies={initialMovies}
      initialTotalPages={totalPages}
    />
  );
}