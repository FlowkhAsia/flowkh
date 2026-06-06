const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDB<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured.');
  }

  const queryParams = new URLSearchParams({
    ...params,
    api_key: apiKey,
  });

  const url = `${TMDB_BASE_URL}${path}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    // We can use Next.js cache/revalidate here if needed
    next: { revalidate: 3600 }, // Fallback cache
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.status_message || `TMDB API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Fallback image utility
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const getGenreNames = (genreIds: number[]): string[] => {
  if (!genreIds) return [];
  return genreIds.map((id) => TMDB_GENRES[id]).filter(Boolean);
};

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.png'; // Will need a placeholder image or handled by UI
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
