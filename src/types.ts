export interface Movie {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  releaseYear: string;
  genres: string[];
  logoUrl?: string | null;
  runtime?: number;
}

export interface Genre {
  key: string;
  title: string;
  movies: Movie[];
}

export interface GenreItem {
  id: number;
  name: string;
}

export interface CountryItem {
  iso_3166_1: string;
  english_name: string;
}

export interface Actor {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface ActorDetail extends Actor {
    biography: string;
    birthday?: string | null;
    place_of_birth?: string | null;
    known_for_department?: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface MovieDetail extends Movie {
  runtime: number; // in minutes
  numberOfSeasons?: number;
  seasons?: Season[];
  trailerUrl?: string;
  imdb_id?: string | null;
}