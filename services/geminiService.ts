import { Genre, Movie, GenreItem, CountryItem, Actor, MovieDetail, Season, Episode, ActorDetail } from '../types';

// --- TMDB API SERVICE ---

type TmdbMovieResult = {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
};

type TmdbPagedResponse = {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
};

type TmdbGenreListResponse = {
  genres: GenreItem[];
};

type TmdbKeywordSearchResponse = {
  results: { id: number; name: string }[];
};

type TmdbImageResponse = {
  logos?: { iso_639_1: string; file_path: string }[];
};

type TmdbExternalIdsResponse = {
  imdb_id: string | null;
};

type TmdbSeasonDetailResponse = {
  episodes: any[]; // Keeping this simple
};

type TmdbActorDetailResponse = {
    id: number;
    name: string;
    profile_path: string | null;
    biography: string;
    birthday: string | null;
    place_of_birth: string | null;
    known_for_department: string;
};

type TmdbActorCreditsResponse = {
    cast: TmdbMovieResult[];
};

type TmdbDetailResponse = TmdbMovieResult & {
    genres: { name: string }[];
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    seasons?: any[];
    images?: { logos?: { iso_639_1: string; file_path: string }[] };
    videos?: { results: { site: string; type: string; key: string }[] };
    credits?: { cast: any[] };
    similar?: { results: TmdbMovieResult[] };
    external_ids?: { imdb_id: string | null };
};


const TMDB_BASE_URL = 'https://flowkh-asian.pages.dev/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const endpoints: { key: string; title: string; url: string; type?: 'movie' | 'tv' }[] = [
  // Home Page
  { key: 'trending_today', title: 'Trending Today', url: `${TMDB_BASE_URL}/trending/all/day?language=en-US` },
  // TV Shows
  { key: 'trending_tv', title: 'Trending TV Shows', url: `${TMDB_BASE_URL}/trending/tv/week?language=en-US`, type: 'tv' },
  { key: 'k_drama', title: 'Popular K-Dramas', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=KR&with_genres=18&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'c_drama', title: 'Popular C-Dramas', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=CN&with_genres=18&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'anime', title: 'Anime', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=16&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'on_the_air_tv', title: 'On The Air TV Shows', url: `${TMDB_BASE_URL}/tv/on_the_air?language=en-US`, type: 'tv' },
  { key: 'top_rated_tv', title: 'Top Rated TV Shows', url: `${TMDB_BASE_URL}/tv/top_rated?language=en-US`, type: 'tv' },
  // Movies
  { key: 'trending_movies', title: 'Trending Movies', url: `${TMDB_BASE_URL}/trending/movie/week?language=en-US`, type: 'movie' },
  { key: 'popular_movies', title: 'Popular Movies', url: `${TMDB_BASE_URL}/movie/popular?language=en-US`, type: 'movie' },
  { key: 'now_playing_movies', title: 'Now Playing Movies', url: `${TMDB_BASE_URL}/movie/now_playing?language=en-US`, type: 'movie' },
  { key: 'upcoming_movies', title: 'Upcoming Movies', url: `${TMDB_BASE_URL}/movie/upcoming?language=en-US`, type: 'movie' },
  { key: 'top_rated_movies', title: 'Top Rated Movies', url: `${TMDB_BASE_URL}/movie/top_rated?language=en-US`, type: 'movie' },
];

let movieGenresMap: Map<number, string> = new Map();
let tvGenresMap: Map<number, string> = new Map();

const fetchAndCacheGenres = async () => {
  if (movieGenresMap.size > 0 && tvGenresMap.size > 0) return;

  const movieGenresUrl = `${TMDB_BASE_URL}/genre/movie/list?language=en-US`;
  const tvGenresUrl = `${TMDB_BASE_URL}/genre/tv/list?language=en-US`;

  const [movieGenresRes, tvGenresRes] = await Promise.all([
    fetch(movieGenresUrl),
    fetch(tvGenresUrl),
  ]);

  if (!movieGenresRes.ok || !tvGenresRes.ok) {
    throw new Error('Failed to fetch genres');
  }

  const { genres: movieGenres } = await movieGenresRes.json() as TmdbGenreListResponse;
  const { genres: tvGenres } = await tvGenresRes.json() as TmdbGenreListResponse;

  movieGenres.forEach((genre: { id: number; name: string }) => {
    movieGenresMap.set(genre.id, genre.name);
  });
  tvGenres.forEach((genre: { id: number; name: string }) => {
    tvGenresMap.set(genre.id, genre.name);
  });
};

const mapResultsToMovies = (results: any[], forcedMediaType?: 'movie' | 'tv'): Movie[] => {
  return results
    .filter(item => item && item.backdrop_path && item.poster_path && item.overview)
    .map((item): Movie => {
      const mediaType: 'movie' | 'tv' = forcedMediaType || item.media_type || 'movie';
      const genresMap = mediaType === 'movie' ? movieGenresMap : tvGenresMap;
      
      const genreNames = (item.genre_ids || [])
        .map((id: number) => genresMap.get(id))
        .filter(Boolean)
        .slice(0, 2);

      const releaseDate = item.release_date || item.first_air_date || '';
      const date = new Date(releaseDate);
      const year = date.getFullYear();

      return {
        id: item.id,
        media_type: mediaType,
        title: item.title || item.name,
        description: item.overview,
        posterUrl: `${IMAGE_BASE_URL}/w500${item.poster_path}`,
        backdropUrl: `${IMAGE_BASE_URL}/w780${item.backdrop_path}`,
        rating: item.vote_average || 0,
        releaseYear: releaseDate && !isNaN(year) ? year.toString() : 'N/A',
        genres: genreNames as string[],
      };
    });
};

export const fetchMoviesData = async (view: 'home' | 'movies' | 'tv'): Promise<Genre[]> => {
  const movieKeys = ['trending_movies', 'popular_movies', 'now_playing_movies', 'upcoming_movies', 'top_rated_movies'];
  const tvKeys = ['trending_tv', 'k_drama', 'c_drama', 'anime', 'on_the_air_tv', 'top_rated_tv'];
  // For home, it also needs top_rated_tv for the merged 'Top Rated' category later.
  const homeKeys = ['trending_today', 'k_drama', 'c_drama', 'anime', 'popular_movies', 'top_rated_movies', 'top_rated_tv'];

  let keysToFetch: string[] = [];
  if (view === 'home') keysToFetch = homeKeys;
  else if (view === 'movies') keysToFetch = movieKeys;
  else if (view === 'tv') keysToFetch = tvKeys;
  
  const endpointsToFetch = endpoints.filter(ep => keysToFetch.includes(ep.key));

  try {
    await fetchAndCacheGenres();

    const getDateNDaysAgo = (days: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    };
    const thirtyDaysAgo = getDateNDaysAgo(30);
    const today = new Date().toISOString().split('T')[0];

    const responses = await Promise.all(endpointsToFetch.map(ep => {
      const url = ep.url
        .replace(/__DATE_30_DAYS_AGO__/g, thirtyDaysAgo)
        .replace(/__TODAY__/g, today);
      return fetch(url);
    }));

    responses.forEach((res, index) => {
      if (!res.ok) throw new Error(`TMDB request for ${endpointsToFetch[index].key} failed: ${res.status} ${res.statusText}`);
    });
    
    const jsonData = await Promise.all(responses.map(res => res.json())) as { results: TmdbMovieResult[] }[];
    
    const genres = endpointsToFetch.map((endpoint, index) => {
      return {
        key: endpoint.key,
        title: endpoint.title,
        movies: mapResultsToMovies(jsonData[index].results, endpoint.type),
      };
    });

    return genres.filter(genre => genre.movies.length > 0);
  } catch (error) {
    console.error("Error fetching movie data from TMDB API:", error);
    throw new Error("Failed to fetch movie data.");
  }
};

export const fetchCategoryPageData = async (categoryKey: string, page: number): Promise<{ results: Movie[], totalPages: number }> => {
  try {
    const endpoint = endpoints.find(ep => ep.key === categoryKey);
    if (!endpoint) {
      throw new Error(`Endpoint with key ${categoryKey} not found.`);
    }
    
    let url: string;
    const mediaType = endpoint.type;

    // Special handling for K-Drama, C-Drama and Anime "See All" pages to show all dramas sorted by new.
    if (categoryKey === 'k_drama') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=KR&with_genres=18&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else if (categoryKey === 'c_drama') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=CN&with_genres=18&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else if (categoryKey === 'anime') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=16&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else {
      // Default behavior for all other categories
      const getDateNDaysAgo = (days: number): string => {
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date.toISOString().split('T')[0];
      };
      const thirtyDaysAgo = getDateNDaysAgo(30);
      const today = new Date().toISOString().split('T')[0];
      
      url = `${endpoint.url}&page=${page}`
        .replace(/__DATE_30_DAYS_AGO__/g, thirtyDaysAgo)
        .replace(/__TODAY__/g, today);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch page ${page} for ${categoryKey}`);
    const data = await response.json() as TmdbPagedResponse;
    
    const totalPages = Math.min(data.total_pages, 500);

    return {
      results: mapResultsToMovies(data.results, mediaType),
      totalPages: totalPages > 0 ? totalPages : 1,
    };
  } catch (error) {
    console.error(`Error fetching category page for ${categoryKey}:`, error);
    return { results: [], totalPages: 1 };
  }
}

export const fetchLogoUrl = async (id: number, media_type: 'movie' | 'tv'): Promise<string | null> => {
  const url = `${TMDB_BASE_URL}/${media_type}/${id}/images`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Could not fetch images for ${media_type} ID ${id}`);
      return null;
    }
    const data = await response.json() as TmdbImageResponse;
    const englishLogo = data.logos?.find((logo: any) => logo.iso_639_1 === 'en');
    
    if (englishLogo) {
      return `${IMAGE_BASE_URL}/w500${englishLogo.file_path}`;
    }
    if (data.logos && data.logos.length > 0) {
      return `${IMAGE_BASE_URL}/w500${data.logos[0].file_path}`;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching logo for ${media_type} ID ${id}:`, error);
    return null;
  }
};

export const searchContent = async (query: string, type: 'multi' | 'movie' | 'tv', page: number): Promise<{ results: Movie[], totalPages: number, totalResults: number }> => {
  if (!query) return { results: [], totalPages: 1, totalResults: 0 };
  try {
    await fetchAndCacheGenres();
    const url = `${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Search request failed');
    const data = await response.json() as TmdbPagedResponse;
    
    const totalPages = Math.min(data.total_pages, 500);
    const totalResults = data.total_results;
    
    const validResults = type === 'multi' ? data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') : data.results;
    
    return {
      results: mapResultsToMovies(validResults, type === 'multi' ? undefined : type as 'movie' | 'tv'),
      totalPages: totalPages > 0 ? totalPages : 1,
      totalResults
    };
  } catch (error) {
    console.error(`Error searching ${type} from TMDB API:`, error);
    return { results: [], totalPages: 1, totalResults: 0 };
  }
};

export const fetchDiscoverResults = async (
    type: 'movie' | 'tv',
    sortBy: string,
    genres: number[],
    country: string,
    year: string,
    page: number,
    providerIds: number | number[] | null,
    networkIds: number | number[] | null
  ): Promise<{ results: Movie[], totalPages: number }> => {
    try {
      await fetchAndCacheGenres();
      let url = `${TMDB_BASE_URL}/discover/${type}?language=en-US&page=${page}&sort_by=${sortBy}`;
      
      if (genres.length > 0) url += `&with_genres=${genres.join(',')}`;
      if (country) url += `&with_origin_country=${country}`;
      if (year) {
        if (type === 'movie') url += `&primary_release_year=${year}`;
        if (type === 'tv') url += `&first_air_date_year=${year}`;
      }
      if (providerIds) {
        const providerQuery = Array.isArray(providerIds) ? providerIds.join('|') : providerIds;
        url += `&with_watch_providers=${providerQuery}&watch_region=US`;
      }
      if (networkIds && type === 'tv') {
        const networkQuery = Array.isArray(networkIds) ? networkIds.join('|') : networkIds;
        url += `&with_networks=${networkQuery}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Discover request failed');
      const data = await response.json() as TmdbPagedResponse;
      
      // TMDB API caps total pages at 500
      const totalPages = Math.min(data.total_pages, 500);

      return {
        results: mapResultsToMovies(data.results, type),
        totalPages: totalPages > 0 ? totalPages : 1
      };
    } catch (error) {
      console.error(`Error fetching discover results for ${type}:`, error);
      return { results: [], totalPages: 1 };
    }
};

export const fetchDetailPageData = async (id: number, media_type: 'movie' | 'tv'): Promise<{ details: MovieDetail, cast: Actor[], similar: Movie[] }> => {
  await fetchAndCacheGenres();
  
  const url = `${TMDB_BASE_URL}/${media_type}/${id}?language=en-US&append_to_response=credits,similar,videos,images,external_ids`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch details for ${media_type} ID ${id}`);
  
  const data = await response.json() as TmdbDetailResponse;

  // Process Logo
  const englishLogo = data.images?.logos?.find((logo: any) => logo.iso_639_1 === 'en');
  const logoUrl = englishLogo 
    ? `${IMAGE_BASE_URL}/w500${englishLogo.file_path}` 
    : (data.images?.logos?.[0] ? `${IMAGE_BASE_URL}/w500${data.images.logos[0].file_path}` : undefined);

  // Process Trailer
  const officialTrailer = data.videos?.results.find(
    (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
  );
  const trailerUrl = officialTrailer ? `https://www.youtube.com/embed/${officialTrailer.key}` : undefined;
  
  const releaseDate = data.release_date || data.first_air_date || '';
  const date = new Date(releaseDate);
  const year = date.getFullYear();

  const details: MovieDetail = {
      id: data.id,
      media_type: media_type,
      title: data.title || data.name || '',
      description: data.overview,
      posterUrl: `${IMAGE_BASE_URL}/w500${data.poster_path}`,
      backdropUrl: `${IMAGE_BASE_URL}/w780${data.backdrop_path}`,
      rating: data.vote_average || 0,
      releaseYear: releaseDate && !isNaN(year) ? year.toString() : 'N/A',
      genres: (data.genres || []).map((g: { name: string }) => g.name),
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 0),
      logoUrl: logoUrl,
      trailerUrl: trailerUrl,
      imdb_id: data.external_ids?.imdb_id,
  };

  if (media_type === 'tv') {
    details.numberOfSeasons = data.number_of_seasons;
    details.seasons = (data.seasons || [])
      .filter(s => s && s.season_number > 0)
      .map((s: any): Season => ({
      id: s.id,
      season_number: s.season_number,
      name: s.name,
      episode_count: s.episode_count,
    }));
  }

  const cast: Actor[] = (data.credits?.cast || [])
      .filter(Boolean)
      .slice(0, 12)
      .map((actor: any): Actor => ({
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profilePath: actor.profile_path ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` : null,
      }));

  const similar: Movie[] = mapResultsToMovies(data.similar?.results || [], media_type);

  return { details, cast, similar };
};


export const fetchGenreList = async (type: 'movie' | 'tv'): Promise<GenreItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/genre/${type}/list?language=en-US`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch genre list');
    const data = await response.json() as TmdbGenreListResponse;
    return data.genres;
  } catch (error) {
    console.error("Error fetching genre list:", error);
    return [];
  }
};

export const fetchCountriesList = async (): Promise<CountryItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/configuration/countries?language=en-US`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch countries list');
    const data = await response.json() as CountryItem[];
    return data.sort((a: CountryItem, b: CountryItem) => a.english_name.localeCompare(b.english_name));
  } catch (error) {
    console.error("Error fetching countries list:", error);
    return [];
  }
};

export const fetchActorCredits = async (actorId: number): Promise<{ actor: ActorDetail, credits: Movie[], backdropUrl?: string }> => {
  await fetchAndCacheGenres();
  
  const detailsUrl = `${TMDB_BASE_URL}/person/${actorId}?language=en-US`;
  const creditsUrl = `${TMDB_BASE_URL}/person/${actorId}/combined_credits?language=en-US`;

  const [detailsRes, creditsRes] = await Promise.all([
    fetch(detailsUrl),
    fetch(creditsUrl),
  ]);

  if (!detailsRes.ok) throw new Error(`Failed to fetch details for actor ID ${actorId}`);
  if (!creditsRes.ok) throw new Error(`Failed to fetch credits for actor ID ${actorId}`);

  const detailsData = await detailsRes.json() as TmdbActorDetailResponse;
  const creditsData = await creditsRes.json() as TmdbActorCreditsResponse;

  const actor: ActorDetail = {
    id: detailsData.id,
    name: detailsData.name,
    character: '', // Character is context-specific, so it's empty here
    profilePath: detailsData.profile_path ? `${IMAGE_BASE_URL}/h632${detailsData.profile_path}` : null,
    biography: detailsData.biography,
    birthday: detailsData.birthday,
    place_of_birth: detailsData.place_of_birth,
    known_for_department: detailsData.known_for_department,
  };

  const credits: Movie[] = mapResultsToMovies(creditsData.cast)
    .filter(movie => movie.posterUrl) // Ensure there's a poster to display
    .sort((a, b) => (b.rating * 10) - (a.rating * 10)); // A simple popularity sort

  const popularCreditWithBackdrop = credits.find(c => c.backdropUrl);
  const backdropUrl = popularCreditWithBackdrop ? popularCreditWithBackdrop.backdropUrl.replace('/w780/', '/w1280/') : undefined;

  return { actor, credits, backdropUrl };
};

export const fetchExternalIds = async (id: number, media_type: 'movie' | 'tv'): Promise<{ imdb_id: string | null }> => {
    const url = `${TMDB_BASE_URL}/${media_type}/${id}/external_ids`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Could not fetch external IDs for ${media_type} ID ${id}`);
            return { imdb_id: null };
        }
        const data = await response.json() as TmdbExternalIdsResponse;
        return { imdb_id: data.imdb_id || null };
    } catch (error) {
        console.error(`Error fetching external IDs for ${media_type} ID ${id}:`, error);
        return { imdb_id: null };
    }
};

export const fetchKeywordIds = async (query: string): Promise<number[]> => {
    if (!query) return [];
    try {
        const url = `${TMDB_BASE_URL}/search/keyword?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Keyword search failed');
        const data = await response.json() as TmdbKeywordSearchResponse;
        // Return only the first few relevant keyword IDs to keep the query focused
        return data.results.slice(0, 5).map(kw => kw.id);
    } catch (error) {
        console.error("Error fetching keyword IDs:", error);
        return [];
    }
};

export const fetchSeasonEpisodes = async (tvId: number, seasonNumber: number): Promise<Episode[]> => {
    const url = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not fetch episodes for TV ID ${tvId}, Season ${seasonNumber}`);
        }
        const data = await response.json();
        return (data.episodes || []).filter(Boolean).map((ep: any): Episode => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            still_path: ep.still_path ? `${IMAGE_BASE_URL}/w500${ep.still_path}` : null,
            air_date: ep.air_date,
            runtime: ep.runtime,
        }));
    } catch (error) {
        console.error(`Error fetching episodes for season:`, error);
        return [];
    }
};

export const fetchTVSeasons = async (tvId: number): Promise<Season[]> => {
    const url = `${TMDB_BASE_URL}/tv/${tvId}?language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not fetch seasons for TV ID ${tvId}`);
        }
        const data = await response.json() as { seasons?: any[] };
        return (data.seasons || [])
            .filter(s => s && s.season_number > 0 && s.episode_count > 0) // Filter out "Specials" (season 0) or seasons with no episodes
            .map((s: any): Season => ({
                id: s.id,
                season_number: s.season_number,
                name: s.name,
                episode_count: s.episode_count,
            }));
    } catch (error) {
        console.error(`Error fetching seasons for TV ID ${tvId}:`, error);
        return [];
    }
};