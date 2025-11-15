
import React, { useEffect, useState } from 'react';
import ContentCarousel from './ContentCarousel';
import { getTrending, getDiscover } from '../services/tmdb';
import { Movie } from '../types';

interface ContentBrowserProps {
  onSelectMovie: (movie: Movie) => void;
  // FIX: Added missing props to satisfy ContentCarouselProps
  myList: Movie[];
  onToggleMyList: (movie: Movie) => void;
}

interface ContentCategory {
  title: string;
  fetcher: () => Promise<Movie[]>;
}

const categories: ContentCategory[] = [
  { title: 'Trending Now', fetcher: () => getTrending('all', 'week') },
  { title: 'Top Rated Movies', fetcher: () => getDiscover('movie', { 'sort_by': 'vote_average.desc', 'vote_count.gte': 200 }) },
  { title: 'Popular TV Shows', fetcher: () => getDiscover('tv', { 'sort_by': 'popularity.desc' }) },
  { title: 'Action Movies', fetcher: () => getDiscover('movie', { 'with_genres': 28 }) },
  { title: 'Comedy', fetcher: () => getDiscover('movie', { 'with_genres': 35 }) },
];

const ContentBrowser: React.FC<ContentBrowserProps> = ({ onSelectMovie, myList, onToggleMyList }) => {
  const [content, setContent] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      const allContentPromises = categories.map(category => 
        category.fetcher().then(data => ({ title: category.title, data }))
      );
      
      try {
        const results = await Promise.all(allContentPromises);
        const newContent = results.reduce((acc, result) => {
          acc[result.title] = result.data;
          return acc;
        }, {} as Record<string, Movie[]>);
        setContent(newContent);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  if (loading) {
    return (
        <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-8 animate-pulse">
                    <div className="h-8 w-1/4 bg-zinc-700 rounded mb-4"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, j) => (
                            <div key={j} className="aspect-[2/3] bg-zinc-800 rounded-md"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map(category => (
        content[category.title] && content[category.title].length > 0 && (
          <ContentCarousel
            key={category.title}
            title={category.title}
            movies={content[category.title]}
            onSelectMovie={onSelectMovie}
            myList={myList}
            onToggleMyList={onToggleMyList}
          />
        )
      ))}
    </div>
  );
};

export default ContentBrowser;