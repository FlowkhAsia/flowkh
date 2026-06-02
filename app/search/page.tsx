'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Media, TMDBResponse } from '@/types/tmdb';
import { MovieCard } from '@/components/ui/movie-card';
import { useDebounce } from '@/hooks/use-debounce';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      router.replace('/search');
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(debouncedQuery)}&include_adult=false`);
        if (response.ok) {
          const data: TMDBResponse<Media> = await response.json();
          // Filter out people from multi search
          setResults(data.results.filter(r => (r as any).media_type !== 'person' && r.poster_path));
          
          // Update URL without refresh
          const params = new URLSearchParams(searchParams);
          params.set('q', debouncedQuery);
          router.replace(`/search?${params.toString()}`);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
            placeholder="Search for movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {query.trim() === '' ? (
        <div className="text-center text-neutral-500 mt-20">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Type something to search...</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Results for &quot;{debouncedQuery}&quot;
            <span className="text-sm font-normal text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full">{results.length}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((media) => (
              <MovieCard key={media.id} media={media} />
            ))}
          </div>
        </div>
      ) : !isLoading && debouncedQuery !== '' ? (
        <div className="text-center text-neutral-500 mt-20">
          <p className="text-lg">No results found for &quot;{debouncedQuery}&quot;</p>
          <p className="text-sm mt-2">Try different or more general keywords</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-neutral-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
