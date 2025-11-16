"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Movie, MovieDetail, Actor } from '../types';
import DetailPage from './DetailPage';

interface DetailPageWrapperProps {
  initialDetails: MovieDetail;
  initialCast: Actor[];
  initialSimilar: Movie[];
  mediaType: 'movie' | 'tv';
  autoPlay?: boolean;
  initialSeasonNumber?: number;
  initialEpisodeNumber?: number;
}

const DetailPageWrapper: React.FC<DetailPageWrapperProps> = (props) => {
  const [myList, setMyList] = useState<Movie[]>([]);
  const router = useRouter();

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

  // FIX: Add handlers for selecting movies and actors.
  const onSelectMovie = useCallback((movie: Movie) => {
    router.push(`/${movie.media_type}/${movie.id}`);
  }, [router]);
  
  const onSelectActor = useCallback((actor: Actor) => {
    router.push(`/person/${actor.id}`);
  }, [router]);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
        router.replace(path);
    } else {
        router.push(path);
    }
  }, [router]);


  return (
    // FIX: Pass all required props to DetailPage.
    <DetailPage
      {...props}
      movieId={props.initialDetails.id}
      myList={myList}
      onToggleMyList={handleToggleMyList}
      onSelectMovie={onSelectMovie}
      onSelectActor={onSelectActor}
      navigate={navigate}
    />
  );
};

export default DetailPageWrapper;