import { Genre, Movie, GenreItem, CountryItem, Actor, MovieDetail, Season, Episode, ActorDetail } from '../types';

// In-memory cache to prevent redundant fetches
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCached = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

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
    aggregate_credits?: { cast: any[] };
    similar?: { results: TmdbMovieResult[] };
    external_ids?: { imdb_id: string | null };
};


const TMDB_BASE_URL = '/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const endpoints: { key: string; title: string; url: string; type?: 'movie' | 'tv' }[] = [
  { key: 'trending_today', title: 'Trending Today', url: `${TMDB_BASE_URL}/trending/all/day?language=en-US` },
  { key: 'trending_tv', title: 'Trending TV Shows', url: `${TMDB_BASE_URL}/trending/tv/week?language=en-US`, type: 'tv' },
  { key: 'k_drama', title: 'Popular K-Dramas', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=KR&with_genres=18&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'c_drama', title: 'Popular C-Dramas', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=CN&with_genres=18&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'j_drama', title: 'Popular J-Dramas', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=18&without_genres=16&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'anime', title: 'Anime', url: `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=16&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&air_date.gte=__DATE_30_DAYS_AGO__&air_date.lte=__TODAY__`, type: 'tv' },
  { key: 'on_the_air_tv', title: 'On The Air TV Shows', url: `${TMDB_BASE_URL}/tv/on_the_air?language=en-US`, type: 'tv' },
  { key: 'top_rated_tv', title: 'Top Rated TV Shows', url: `${TMDB_BASE_URL}/tv/top_rated?language=en-US`, type: 'tv' },
  { key: 'trending_movies', title: 'Trending Movies', url: `${TMDB_BASE_URL}/trending/movie/week?language=en-US`, type: 'movie' },
  { key: 'popular_movies', title: 'Popular Movies', url: `${TMDB_BASE_URL}/movie/popular?language=en-US`, type: 'movie' },
  { key: 'now_playing_movies', title: 'Now Playing Movies', url: `${TMDB_BASE_URL}/movie/now_playing?language=en-US`, type: 'movie' },
  { key: 'upcoming_movies', title: 'Upcoming Movies', url: `${TMDB_BASE_URL}/movie/upcoming?language=en-US`, type: 'movie' },
  { key: 'top_rated_movies', title: 'Top Rated Movies', url: `${TMDB_BASE_URL}/movie/top_rated?language=en-US`, type: 'movie' },
  { key: 'anime_trending', title: 'Trending', url: `${TMDB_BASE_URL}/discover/tv?with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc`, type: 'tv' },
  { key: 'anime_latest', title: 'Latest Episode', url: `${TMDB_BASE_URL}/discover/tv?with_genres=16&with_keywords=210024&language=en-US&air_date.lte=__TODAY__&air_date.gte=__DATE_7_DAYS_AGO__&sort_by=popularity.desc`, type: 'tv' },
  { key: 'anime_top_airing', title: 'Top Airing', url: `${TMDB_BASE_URL}/discover/tv?with_genres=16&with_keywords=210024&language=en-US&air_date.lte=__TODAY__&air_date.gte=__DATE_90_DAYS_AGO__&sort_by=vote_average.desc&vote_count.gte=50`, type: 'tv' },
  { key: 'anime_movies', title: 'Movie Anime', url: `${TMDB_BASE_URL}/discover/movie?with_genres=16&with_keywords=210024&language=en-US&sort_by=popularity.desc`, type: 'movie' },
  { key: 'anime_animation', title: 'Animation', url: `${TMDB_BASE_URL}/discover/tv?with_genres=16&without_keywords=210024&language=en-US&sort_by=popularity.desc`, type: 'tv' },
];

let movieGenresMap: Map<number, string> = new Map();
let tvGenresMap: Map<number, string> = new Map();

const fetchAndCacheGenres = async (signal?: AbortSignal) => {
  if (movieGenresMap.size > 0 && tvGenresMap.size > 0) return;

  const movieGenresUrl = `${TMDB_BASE_URL}/genre/movie/list?language=en-US`;
  const tvGenresUrl = `${TMDB_BASE_URL}/genre/tv/list?language=en-US`;

  try {
    const [movieGenresRes, tvGenresRes] = await Promise.all([
      fetch(movieGenresUrl, { signal }),
      fetch(tvGenresUrl, { signal }),
    ]);

    if (!movieGenresRes.ok || !tvGenresRes.ok) throw new Error('Failed to fetch genres');

    const { genres: movieGenres } = await movieGenresRes.json() as TmdbGenreListResponse;
    const { genres: tvGenres } = await tvGenresRes.json() as TmdbGenreListResponse;

    movieGenres.forEach(genre => movieGenresMap.set(genre.id, genre.name));
    tvGenres.forEach(genre => tvGenresMap.set(genre.id, genre.name));
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    throw err;
  }
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

export const fetchMoviesData = async (view: 'home' | 'movies' | 'tv' | 'anime', signal?: AbortSignal): Promise<Genre[]> => {
  const cached = getCached(`view_${view}`);
  if (cached) return cached;

  const movieKeys = ['trending_movies', 'popular_movies', 'now_playing_movies', 'upcoming_movies', 'top_rated_movies'];
  const tvKeys = ['trending_tv', 'k_drama', 'c_drama', 'j_drama', 'anime', 'on_the_air_tv', 'top_rated_tv'];
  const animeKeys = ['anime_trending', 'anime_latest', 'anime_top_airing', 'anime_movies', 'anime_animation'];
  const homeKeys = ['trending_today', 'k_drama', 'c_drama', 'j_drama', 'anime', 'popular_movies', 'top_rated_movies', 'top_rated_tv'];

  let keysToFetch: string[] = [];
  if (view === 'home') keysToFetch = homeKeys;
  else if (view === 'movies') keysToFetch = movieKeys;
  else if (view === 'tv') keysToFetch = tvKeys;
  else if (view === 'anime') keysToFetch = animeKeys;
  
  const endpointsToFetch = endpoints.filter(ep => keysToFetch.includes(ep.key));

  try {
    await fetchAndCacheGenres(signal);

    const getDateNDaysAgo = (days: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    };
    const thirtyDaysAgo = getDateNDaysAgo(30);
    const sevenDaysAgo = getDateNDaysAgo(7);
    const ninetyDaysAgo = getDateNDaysAgo(90);
    const today = new Date().toISOString().split('T')[0];

    const results = await Promise.allSettled(endpointsToFetch.map(ep => {
      const url = ep.url
        .replace(/__DATE_30_DAYS_AGO__/g, thirtyDaysAgo)
        .replace(/__DATE_7_DAYS_AGO__/g, sevenDaysAgo)
        .replace(/__DATE_90_DAYS_AGO__/g, ninetyDaysAgo)
        .replace(/__TODAY__/g, today);
      return fetch(url, { signal }).then(async res => {
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return res.json() as Promise<{ results: TmdbMovieResult[] }>;
      });
    }));

    const genres: Genre[] = [];
    results.forEach((result, index) => {
        const endpoint = endpointsToFetch[index];
        if (result.status === 'fulfilled') {
            const movies = mapResultsToMovies(result.value.results, endpoint.type);
            if (movies.length > 0) {
                genres.push({ key: endpoint.key, title: endpoint.title, movies: movies });
            }
        }
    });

    if (genres.length > 0) setCached(`view_${view}`, genres);
    return genres;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return [];
    console.error("Critical error in fetchMoviesData:", error);
    throw new Error("Failed to fetch movie data.");
  }
};

export const fetchCategoryPageData = async (categoryKey: string, page: number, signal?: AbortSignal): Promise<{ results: Movie[], totalPages: number }> => {
  const cachedKey = `cat_${categoryKey}_p${page}`;
  const cached = getCached(cachedKey);
  if (cached) return cached;

  try {
    const endpoint = endpoints.find(ep => ep.key === categoryKey);
    if (!endpoint) throw new Error(`Endpoint with key ${categoryKey} not found.`);
    
    let url: string;
    const mediaType = endpoint.type;

    if (categoryKey === 'k_drama') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=KR&with_genres=18&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else if (categoryKey === 'c_drama') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=CN&with_genres=18&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else if (categoryKey === 'j_drama') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=18&without_genres=16&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else if (categoryKey === 'anime') {
      url = `${TMDB_BASE_URL}/discover/tv?with_origin_country=JP&with_genres=16&language=en-US&sort_by=first_air_date.desc&page=${page}`;
    } else {
      const getDateNDaysAgo = (days: number): string => {
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date.toISOString().split('T')[0];
      };
      const today = new Date().toISOString().split('T')[0];
      
      url = `${endpoint.url}&page=${page}`
        .replace(/__DATE_30_DAYS_AGO__/g, getDateNDaysAgo(30))
        .replace(/__DATE_7_DAYS_AGO__/g, getDateNDaysAgo(7))
        .replace(/__DATE_90_DAYS_AGO__/g, getDateNDaysAgo(90))
        .replace(/__TODAY__/g, today);
    }

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Failed to fetch page ${page} for ${categoryKey}`);
    const data = await response.json() as TmdbPagedResponse;
    
    const totalPages = Math.min(data.total_pages, 500);
    const results = {
      results: mapResultsToMovies(data.results, mediaType),
      totalPages: totalPages > 0 ? totalPages : 1,
    };
    
    setCached(cachedKey, results);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return { results: [], totalPages: 1 };
    console.error(`Error fetching category page for ${categoryKey}:`, error);
    return { results: [], totalPages: 1 };
  }
}

export const fetchLogoUrl = async (id: number, media_type: 'movie' | 'tv', signal?: AbortSignal): Promise<string | null> => {
  const cachedKey = `logo_${media_type}_${id}`;
  const cached = getCached(cachedKey);
  if (cached) return cached;

  const url = `${TMDB_BASE_URL}/${media_type}/${id}/images`;
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const data = await response.json() as TmdbImageResponse;
    const englishLogo = data.logos?.find(logo => logo.iso_639_1 === 'en');
    const result = englishLogo 
      ? `${IMAGE_BASE_URL}/w500${englishLogo.file_path}` 
      : (data.logos && data.logos.length > 0 ? `${IMAGE_BASE_URL}/w500${data.logos[0].file_path}` : null);
    
    setCached(cachedKey, result);
    return result;
  } catch (error) {
    return null;
  }
};

export const searchContent = async (query: string, type: 'multi' | 'movie' | 'tv', page: number, signal?: AbortSignal): Promise<{ results: Movie[], totalPages: number, totalResults: number }> => {
  if (!query) return { results: [], totalPages: 1, totalResults: 0 };
  try {
    await fetchAndCacheGenres(signal);
    const url = `${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Search request failed');
    const data = await response.json() as TmdbPagedResponse;
    
    const totalPages = Math.min(data.total_pages, 500);
    const validResults = type === 'multi' ? data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') : data.results;
    
    return {
      results: mapResultsToMovies(validResults, type === 'multi' ? undefined : type as 'movie' | 'tv'),
      totalPages: totalPages > 0 ? totalPages : 1,
      totalResults: data.total_results
    };
  } catch (error) {
    return { results: [], totalPages: 1, totalResults: 0 };
  }
};

export const fetchDetailPageData = async (id: number, media_type: 'movie' | 'tv', signal?: AbortSignal): Promise<{ details: MovieDetail, cast: Actor[], similar: Movie[] }> => {
  const cachedKey = `detail_${media_type}_${id}`;
  const cached = getCached(cachedKey);
  if (cached) return cached;

  await fetchAndCacheGenres(signal);
  
  const detailsUrl = `${TMDB_BASE_URL}/${media_type}/${id}?language=en-US&append_to_response=similar,videos,images,external_ids`;
  const creditsEndpoint = media_type === 'tv' ? 'aggregate_credits' : 'credits';
  const creditsUrl = `${TMDB_BASE_URL}/${media_type}/${id}/${creditsEndpoint}?language=en-US`;

  const [detailsRes, creditsRes] = await Promise.all([
    fetch(detailsUrl, { signal }),
    fetch(creditsUrl, { signal })
  ]);

  if (!detailsRes.ok) throw new Error(`Failed to fetch details`);
  
  const data = await detailsRes.json() as TmdbDetailResponse;
  const englishLogo = data.images?.logos?.find((logo: any) => logo.iso_639_1 === 'en');
  const logoUrl = englishLogo 
    ? `${IMAGE_BASE_URL}/w500${englishLogo.file_path}` 
    : (data.images?.logos?.[0] ? `${IMAGE_BASE_URL}/w500${data.images.logos[0].file_path}` : undefined);

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
      .map((s: any): Season => ({ id: s.id, season_number: s.season_number, name: s.name, episode_count: s.episode_count }));
  }

  const creditsData = creditsRes.ok ? await creditsRes.json() : { cast: [] };
  const cast: Actor[] = (creditsData.cast || []).slice(0, 15).map((actor: any): Actor => ({
    id: actor.id,
    name: actor.name,
    character: actor.character || (actor.roles ? actor.roles[0]?.character : ''),
    profilePath: actor.profile_path ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` : null,
  }));

  const similar: Movie[] = mapResultsToMovies(data.similar?.results || [], media_type);
  const result = { details, cast, similar };
  setCached(cachedKey, result);
  return result;
};

export const fetchSeasonEpisodes = async (tvId: number, seasonNumber: number, signal?: AbortSignal): Promise<Episode[]> => {
    const cachedKey = `episodes_${tvId}_s${seasonNumber}`;
    const cached = getCached(cachedKey);
    if (cached) return cached;

    const url = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`;
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Could not fetch episodes`);
        const data = await response.json();
        const results = (data.episodes || []).map((ep: any): Episode => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            still_path: ep.still_path ? `${IMAGE_BASE_URL}/w500${ep.still_path}` : null,
            air_date: ep.air_date,
            runtime: ep.runtime,
        }));
        setCached(cachedKey, results);
        return results;
    } catch (error) {
        return [];
    }
};

export const fetchTVSeasons = async (tvId: number, signal?: AbortSignal): Promise<Season[]> => {
    const url = `${TMDB_BASE_URL}/tv/${tvId}?language=en-US`;
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Could not fetch seasons`);
        const data = await response.json() as { seasons?: any[] };
        return (data.seasons || [])
            .filter(s => s && s.season_number > 0 && s.episode_count > 0)
            .map((s: any): Season => ({ id: s.id, season_number: s.season_number, name: s.name, episode_count: s.episode_count }));
    } catch (error) {
        return [];
    }
};

export const fetchGenreList = async (type: 'movie' | 'tv', signal?: AbortSignal): Promise<GenreItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/genre/${type}/list?language=en-US`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Failed to fetch genre list');
    const data = await response.json() as TmdbGenreListResponse;
    return data.genres;
  } catch (error) {
    return [];
  }
};

export const fetchCountriesList = async (signal?: AbortSignal): Promise<CountryItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/configuration/countries?language=en-US`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Failed to fetch countries list');
    const data = await response.json() as CountryItem[];
    return data.sort((a, b) => a.english_name.localeCompare(b.english_name));
  } catch (error) {
    return [];
  }
};

export const fetchActorCredits = async (actorId: number, signal?: AbortSignal): Promise<{ actor: ActorDetail, credits: Movie[], backdropUrl?: string }> => {
  const cachedKey = `actor_${actorId}`;
  const cached = getCached(cachedKey);
  if (cached) return cached;

  await fetchAndCacheGenres(signal);
  
  const detailsUrl = `${TMDB_BASE_URL}/person/${actorId}?language=en-US`;
  const creditsUrl = `${TMDB_BASE_URL}/person/${actorId}/combined_credits?language=en-US`;

  const [detailsRes, creditsRes] = await Promise.all([
    fetch(detailsUrl, { signal }),
    fetch(creditsUrl, { signal }),
  ]);

  if (!detailsRes.ok) throw new Error(`Failed to fetch actor details`);
  const detailsData = await detailsRes.json() as TmdbActorDetailResponse;
  const creditsData = await creditsRes.json() as TmdbActorCreditsResponse;

  const actor: ActorDetail = {
    id: detailsData.id,
    name: detailsData.name,
    character: '',
    profilePath: detailsData.profile_path ? `${IMAGE_BASE_URL}/h632${detailsData.profile_path}` : null,
    biography: detailsData.biography,
    birthday: detailsData.birthday,
    place_of_birth: detailsData.place_of_birth,
    known_for_department: detailsData.known_for_department,
  };

  const credits: Movie[] = mapResultsToMovies(creditsData.cast)
    .filter(movie => movie.posterUrl)
    .sort((a, b) => b.rating - a.rating);

  const backdropUrl = credits.find(c => c.backdropUrl)?.backdropUrl.replace('/w780/', '/w1280/');

  const result = { actor, credits, backdropUrl };
  setCached(cachedKey, result);
  return result;
};

export const fetchDiscoverResults = async (
    type: 'movie' | 'tv',
    sortBy: string,
    genres: number[],
    country: string,
    year: string,
    page: number,
    providerIds: number | number[] | null,
    networkIds: number | number[] | null,
    signal?: AbortSignal
  ): Promise<{ results: Movie[], totalPages: number }> => {
    try {
      await fetchAndCacheGenres(signal);
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
      
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error('Discover request failed');
      const data = await response.json() as TmdbPagedResponse;
      
      return {
        results: mapResultsToMovies(data.results, type),
        totalPages: Math.min(data.total_pages, 500)
      };
    } catch (error) {
      return { results: [], totalPages: 1 };
    }
};
