"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Genre, Movie } from '../types';
import Hero from './Hero';
import MovieRow from './MovieRow';
import AdsterraBanner from './AdsterraBanner';
import { fetchLogoUrl } from '../services/geminiService';

interface BrowsePageContentProps {
  pageType: 'home' | 'movies' | 'tv';
  initialGenres: Genre[];
}

export default function BrowsePageContent({ pageType, initialGenres }: BrowsePageContentProps) {
  const router = useRouter();
  const [genres] = useState<Genre[]>(initialGenres);
  const [myList, setMyList] = useState<Movie[]>([]);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const storedList = localStorage.getItem('myList');
    if (storedList) {
      setMyList(JSON.parse(storedList));
    }
  }, []);

  const handleToggleMyList = (movie: Movie) => {
    setMyList((prevList) => {
      const isAdded = prevList.some((item) => item.id === movie.id);
      const newList = isAdded ? prevList.filter((item) => item.id !== movie.id) : [...prevList, movie];
      localStorage.setItem('myList', JSON.stringify(newList));
      return newList;
    });
  };

  const handleSelectMovie = (movie: Movie) => {
    router.push(`/${movie.media_type}/${movie.id}`);
  };
  
  // FIX: Add handler for playing a movie from the hero section.
  const handlePlayMovie = (movie: Movie) => {
    router.push(`/${movie.media_type}/${movie.id}?autoplay=true`);
  };

  const handleSeeAllClick = (genre: Genre) => {
    router.push(`/category/${genre.key}`);
  };

  useEffect(() => {
    const fetchHeroLogos = async (movies: Movie[]) => {
      const moviesWithLogos = await Promise.all(
        movies.map(async (movie) => ({ ...movie, logoUrl: await fetchLogoUrl(movie.id, movie.media_type) }))
      );
      setHeroMovies(moviesWithLogos);
    };

    if (genres.length > 0) {
      let heroKey = 'trending_today';
      if (pageType === 'tv') heroKey = 'trending_tv';
      else if (pageType === 'movies') heroKey = 'trending_movies';
      
      const heroGenre = genres.find(g => g.key === heroKey);
      const topTen = (heroGenre?.movies || []).slice(0, 10);
      
      if (topTen.length > 0) {
        setHeroMovies(topTen); // Set initial movies without logos
        fetchHeroLogos(topTen); // Fetch logos and update
      } else {
        setHeroMovies([]);
      }
    } else {
        setHeroMovies([]);
    }
  }, [genres, pageType]);

  const filteredGenres = useMemo(() => {
    const movieKeys = ['trending_movies', 'popular_movies', 'now_playing_movies', 'upcoming_movies', 'top_rated_movies'];
    const tvKeys = ['trending_tv', 'k_drama', 'c_drama', 'anime', 'on_the_air_tv', 'top_rated_tv'];
    const homeKeys = ['trending_today', 'k_drama', 'c_drama', 'anime', 'popular_movies', 'top_rated_movies'];

    if (pageType === 'movies') return genres.filter(g => movieKeys.includes(g.key));
    if (pageType === 'tv') return genres.filter(g => tvKeys.includes(g.key));
    if (pageType === 'home') {
        let homeGenres = genres
            .filter(g => homeKeys.includes(g.key))
            .sort((a, b) => homeKeys.indexOf(a.key) - homeKeys.indexOf(b.key));

        const topRatedMovies = genres.find(g => g.key === 'top_rated_movies');
        const topRatedTv = genres.find(g => g.key === 'top_rated_tv');
        if (topRatedMovies && topRatedTv) {
            const topRatedMoviesIndex = homeGenres.findIndex(g => g.key === 'top_rated_movies');
            if (topRatedMoviesIndex !== -1) {
                const combinedMovies = [...topRatedMovies.movies, ...topRatedTv.movies].sort((a, b) => b.rating - a.rating);
                const topRatedAll: Genre = { ...topRatedMovies, title: 'Top Rated', movies: combinedMovies };
                homeGenres[topRatedMoviesIndex] = topRatedAll;
            }
        }
        return homeGenres;
    }
    return [];
  }, [genres, pageType]);
  
  return (
    <>
      {/* FIX: Pass onSelectMovie and onPlayMovie props to Hero. */}
      {heroMovies.length > 0 && <Hero movies={heroMovies} onSelectMovie={handleSelectMovie} onPlayMovie={handlePlayMovie} />}
      <section key={pageType} className="animate-fast-fade-in relative -mt-16 md:-mt-24 px-4 md:px-16 pb-8 space-y-6 md:space-y-8">
        {myList.length > 0 && pageType === 'home' && (
          <MovieRow 
            title="My List" 
            movies={myList} 
            onSelectMovie={handleSelectMovie} 
            myList={myList} 
            onToggleMyList={handleToggleMyList} 
          />
        )}
        {filteredGenres.map((genre, index) => {
          const isTrendingRow = index === 0;
          return (
            <React.Fragment key={`${genre.key}-${pageType}`}>
              <MovieRow 
                title={genre.title} 
                movies={genre.movies} 
                onSeeAll={() => handleSeeAllClick(genre)} 
                onSelectMovie={handleSelectMovie} 
                myList={myList} 
                onToggleMyList={handleToggleMyList} 
              />
              {isTrendingRow && <AdsterraBanner />}
            </React.Fragment>
          );
        })}
      </section>
    </>
  );
}