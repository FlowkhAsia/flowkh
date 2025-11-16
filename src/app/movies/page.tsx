import { fetchMoviesData } from '../../services/geminiService';
import BrowsePageContent from '../../components/BrowsePageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movies',
  description: 'Explore a wide variety of movies, from new releases to timeless classics. Find your next favorite film on flowkh.',
};

export const revalidate = 3600;

export default async function MoviesPage() {
  const initialGenres = await fetchMoviesData('movies');
  return <BrowsePageContent pageType="movies" initialGenres={initialGenres} />;
}