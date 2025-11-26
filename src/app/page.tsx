import { fetchMoviesData } from '../services/geminiService';
import BrowsePageContent from '../components/BrowsePageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover trending movies and TV shows, popular K-dramas, C-dramas, and anime. Your journey into the world of cinema starts here on flowkh.',
};

// Revalidate the page every hour
export const revalidate = 3600;

export default async function HomePage() {
  const initialGenres = await fetchMoviesData('home');
  return <BrowsePageContent pageType="home" initialGenres={initialGenres} />;
}