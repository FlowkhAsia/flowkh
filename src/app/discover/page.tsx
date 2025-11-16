"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DiscoverPageContent from '../../components/DiscoverPage';
import { Movie } from '../../types';

export default function DiscoverPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [myList, setMyList] = useState<Movie[]>([]);
    const [location, setLocation] = useState({ pathname: '/', search: '' });

    useEffect(() => {
        const storedList = localStorage.getItem('myList');
        if (storedList) {
          try {
            setMyList(JSON.parse(storedList));
          } catch (e) {
            console.error("Failed to parse myList from localStorage", e);
          }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocation({
                pathname: pathname || '/',
                search: window.location.search,
            });
        }
    }, [pathname]);

    const onToggleMyList = useCallback((movie: Movie) => {
        setMyList((prevList) => {
            const isAdded = prevList.some((item) => item.id === movie.id);
            const newList = isAdded ? prevList.filter((item) => item.id !== movie.id) : [...prevList, movie];
            localStorage.setItem('myList', JSON.stringify(newList));
            return newList;
        });
    }, []);

    const onSelectMovie = useCallback((movie: Movie) => {
        router.push(`/${movie.media_type}/${movie.id}`);
    }, [router]);

    const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
        if (options?.replace) {
            router.replace(path);
        } else {
            router.push(path);
        }
    }, [router]);

    return (
      <DiscoverPageContent
          onSelectMovie={onSelectMovie}
          myList={myList}
          onToggleMyList={onToggleMyList}
          location={location}
          navigate={navigate}
      />
    );
}