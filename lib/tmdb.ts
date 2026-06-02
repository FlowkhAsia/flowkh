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
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.png'; // Will need a placeholder image or handled by UI
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
