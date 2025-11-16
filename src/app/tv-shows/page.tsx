import { fetchMoviesData } from '../../services/geminiService';
import BrowsePageContent from '../../components/BrowsePageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TV Shows',
  description: 'Discover popular and trending TV shows, from binge-worthy series to the latest episodes. Start watching on flowkh.',
};

export const revalidate = 3600;

export default async function TvShowsPage() {
  const initialGenres = await fetchMoviesData('tv');
  return <BrowsePageContent pageType="tv" initialGenres={initialGenres} />;
}