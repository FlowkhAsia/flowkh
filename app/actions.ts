'use server';

import { getLogo, getCast, getTrailer, getGenres, searchMovies } from '@/lib/tmdb';

export async function getLogoAction(id: number, type: string = 'movie') {
  return getLogo(id, type);
}

export async function getCastAction(id: number, type: string = 'movie') {
  return getCast(id, type);
}

export async function getTrailerAction(id: number, type: string = 'movie') {
  return getTrailer(id, type);
}

export async function getGenresAction() {
  return getGenres();
}

export async function searchMoviesAction(query: string) {
  return searchMovies(query);
}
