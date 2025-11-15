import { Movie, MovieDetail } from '../types';

// Hardcoded Read Access Token to ensure successful authentication.
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYjQyYzVjMWE1MTY5ZjY1ODU2MDliNzg1N2M2OWFiOCIsIm5iZiI6MTczNDM0NTI0Ni4xNTgwMDAyLCJzdWIiOiI2NzYwMDIxZWE4ZDBlYjU2MGZhYTc3ZjIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.KEG8knWObfgoMlwqi6lX-_-02bXL6qAfCcMPivutrpA';
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> => {
  if (!API_TOKEN) {
    throw new Error('TMDB API Token is missing.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_TOKEN}`
    }
  };
  
  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ status_message: response.statusText }));
      console.error('TMDB API Error:', errorData);
      throw new Error(`TMDB API request failed: ${errorData.status_message || response.statusText}`);
    }
    return response.json();
  } catch (error) {
     console.error('Failed to fetch from TMDB:', error);
     throw error;
  }
};

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export const getTrending = async (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(`/trending/${mediaType}/${timeWindow}`);
  return data.results.map(item => ({ ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') }));
};

export const getDiscover = async (mediaType: 'movie' | 'tv' = 'movie', filters: Record<string, string | number> = {}): Promise<Movie[]> => {
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(`/discover/${mediaType}`, filters);
  return data.results.map(item => ({ ...item, media_type: mediaType }));
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: number): Promise<MovieDetail> => {
  const data = await fetchFromTMDB<MovieDetail>(`/${mediaType}/${id}`, { append_to_response: 'credits,videos' });
  return { ...data, media_type: mediaType };
};

export const searchContent = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(`/search/multi`, { query });
  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .map(item => ({ ...item, media_type: item.media_type }));
};

export const getImageUrl = (path: string | undefined | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) {
    return 'https://via.placeholder.com/500x750.png?text=No+Image';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
};