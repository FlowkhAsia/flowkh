export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  seasons?: Season[];
}

export interface Genre {
  id: number;
  name: string;
}

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

const fetchTMDB = async (endpoint: string): Promise<Movie[]> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    console.warn('TMDB_API_KEY is not set or invalid. Using mock data.');
    return getMockData(endpoint);
  }

  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.warn(`TMDB API returned ${response.status} ${response.statusText}. Falling back to mock data.`);
      return getMockData(endpoint);
    }

    const data = await response.json();
    
    let defaultMediaType = 'movie';
    if (endpoint.includes('/tv') || endpoint.includes('with_networks=213')) {
      defaultMediaType = 'tv';
    }

    return data.results.map((item: any) => ({
      ...item,
      media_type: item.media_type || defaultMediaType,
    }));
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    return getMockData(endpoint); // Fallback to mock data on error
  }
};

export const requests = {
  fetchTrending: '/trending/all/week',
  fetchNetflixOriginals: '/discover/tv?with_networks=213',
  fetchTopRated: '/movie/top_rated',
  fetchActionMovies: '/discover/movie?with_genres=28',
  fetchComedyMovies: '/discover/movie?with_genres=35',
  fetchHorrorMovies: '/discover/movie?with_genres=27',
  fetchRomanceMovies: '/discover/movie?with_genres=10749',
  fetchDocumentaries: '/discover/movie?with_genres=99',
  fetchKDrama: '/discover/tv?with_original_language=ko',
  fetchCDrama: '/discover/tv?with_original_language=zh',
  fetchAnime: '/discover/tv?with_genres=16&with_original_language=ja',
  fetchPopularMovies: '/movie/popular',
};

const getAiringDateRange = () => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return `&air_date.gte=${formatDate(lastWeek)}&air_date.lte=${formatDate(nextWeek)}&sort_by=popularity.desc`;
};

export const getTrending = () => fetchTMDB(requests.fetchTrending);
export const getNetflixOriginals = () => fetchTMDB(requests.fetchNetflixOriginals);
export const getTopRated = () => fetchTMDB(requests.fetchTopRated);
export const getActionMovies = () => fetchTMDB(requests.fetchActionMovies);
export const getComedyMovies = () => fetchTMDB(requests.fetchComedyMovies);
export const getHorrorMovies = () => fetchTMDB(requests.fetchHorrorMovies);
export const getRomanceMovies = () => fetchTMDB(requests.fetchRomanceMovies);
export const getDocumentaries = () => fetchTMDB(requests.fetchDocumentaries);
export const getKDrama = () => fetchTMDB(`/discover/tv?with_original_language=ko${getAiringDateRange()}`);
export const getCDrama = () => fetchTMDB(`/discover/tv?with_original_language=zh${getAiringDateRange()}`);
export const getAnime = () => fetchTMDB(`/discover/tv?with_genres=16&with_original_language=ja${getAiringDateRange()}`);
export const getPopularMovies = () => fetchTMDB(requests.fetchPopularMovies);
export const searchMovies = (query: string) => fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);

export const getGenres = async (): Promise<Genre[]> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 10770, name: 'TV Movie' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' },
      { id: 10759, name: 'Action & Adventure' },
      { id: 10762, name: 'Kids' },
      { id: 10763, name: 'News' },
      { id: 10764, name: 'Reality' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10766, name: 'Soap' },
      { id: 10767, name: 'Talk' },
      { id: 10768, name: 'War & Politics' },
    ];
  }

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`, { next: { revalidate: 86400 } }),
      fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`, { next: { revalidate: 86400 } })
    ]);

    const movieData = await movieRes.json();
    const tvData = await tvRes.json();

    const allGenres = [...(movieData.genres || []), ...(tvData.genres || [])];
    const uniqueGenres = Array.from(new Map(allGenres.map((g: Genre) => [g.id, g])).values());
    return uniqueGenres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export const getTrailer = async (id: number, type: string = 'movie'): Promise<string | null> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return 'dQw4w9WgXcQ'; // Rick roll for mock data
  }
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const trailer = data.results?.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Error fetching trailer:', error);
    return null;
  }
};

export const getCast = async (id: number, type: string = 'movie'): Promise<Cast[]> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return [
      { id: 1, name: 'Mock Actor 1', character: 'Lead Role', profile_path: null },
      { id: 2, name: 'Mock Actor 2', character: 'Supporting Role', profile_path: null },
      { id: 3, name: 'Mock Actor 3', character: 'Cameo', profile_path: null },
    ];
  }
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error('Error fetching cast:', error);
    return [];
  }
};

export const getLogo = async (id: number, type: string = 'movie'): Promise<string | null> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') return null;
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}/images?api_key=${API_KEY}`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const logos = data.logos;
    if (!logos || logos.length === 0) return null;
    const enLogo = logos.find((logo: any) => logo.iso_639_1 === 'en');
    return enLogo ? enLogo.file_path : logos[0].file_path;
  } catch (error) {
    console.error('Error fetching logo:', error);
    return null;
  }
};

export const getSimilar = async (id: number, type: string = 'movie'): Promise<Movie[]> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return getMockData(`/${type}/${id}/similar`);
  }
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      media_type: type,
    }));
  } catch (error) {
    console.error('Error fetching similar:', error);
    return [];
  }
};

export const getTvSeason = async (id: number, seasonNumber: number): Promise<Episode[]> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return [
      { id: 1, name: 'Mock Episode 1', overview: 'This is a mock episode overview.', episode_number: 1, season_number: seasonNumber, runtime: 45, still_path: '', air_date: '2023-01-01', production_code: '', show_id: id },
      { id: 2, name: 'Mock Episode 2', overview: 'This is another mock episode overview.', episode_number: 2, season_number: seasonNumber, runtime: 42, still_path: '', air_date: '2023-01-08', production_code: '', show_id: id },
    ];
  }
  try {
    const response = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.episodes || [];
  } catch (error) {
    console.error('Error fetching tv season:', error);
    return [];
  }
};

export const getMovieDetails = async (id: number, type: string = 'movie'): Promise<Movie | null> => {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    return {
      id,
      title: `Mock Movie ${id}`,
      overview: 'This is a mock overview for a movie or TV show. It provides a brief description of the plot and characters. Enjoy watching this placeholder content!',
      poster_path: '',
      backdrop_path: '',
      genre_ids: [28, 12, 16],
      popularity: 100,
      release_date: '2023-01-01',
      vote_average: 8.5,
      vote_count: 1000,
    };
  }
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    // TMDB returns genres as an array of objects, map it to genre_ids to match the Movie interface
    if (data.genres) {
      data.genre_ids = data.genres.map((g: any) => g.id);
    }
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Mock Data Fallback
function getMockData(endpoint: string): Movie[] {
  // Generate some deterministic mock data based on the endpoint
  const seed = endpoint.length;
  return Array.from({ length: 20 }).map((_, i) => ({
    id: seed * 1000 + i,
    title: `Mock Movie ${i + 1}`,
    name: `Mock Show ${i + 1}`,
    overview: 'This is a mock overview for a movie or TV show. It provides a brief description of the plot and characters. Enjoy watching this placeholder content!',
    poster_path: '', // We will handle empty paths in the UI
    backdrop_path: '',
    media_type: endpoint.includes('/tv') || endpoint.includes('with_networks=213') ? 'tv' : 'movie',
    genre_ids: [28, 12, 16],
    popularity: 100 - i,
    vote_average: 8.5 - (i * 0.1),
    vote_count: 1000 - (i * 10),
  }));
}
