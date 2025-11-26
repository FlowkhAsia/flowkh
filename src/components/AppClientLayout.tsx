"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { ArrowLeftIcon } from './icons/Icons';
import { Movie } from '../types';
import GoogleAnalytics from './GoogleAnalytics';

const SearchOverlay = React.lazy(() => import('./SearchOverlay'));

const SuspenseLoader: React.FC = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <div className="w-16 h-16 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// FIX: Made children optional to resolve TS error in layout file.
export default function AppClientLayout({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // FIX: Add state and handlers required by child components (SearchOverlay, Navbar, Footer)
    const [myList, setMyList] = useState<Movie[]>([]);

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

    const handleToggleMyList = useCallback((movie: Movie) => {
        setMyList((prevList) => {
            const isAdded = prevList.some((item) => item.id === movie.id);
            const newList = isAdded
                ? prevList.filter((item) => item.id !== movie.id)
                : [...prevList, movie];
            localStorage.setItem('myList', JSON.stringify(newList));
            return newList;
        });
    }, []);

    const handleOpenSearch = useCallback(() => setIsSearchOpen(true), []);
    const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);

    const handleSelectMovie = useCallback((movie: Movie) => {
        handleCloseSearch();
        router.push(`/${movie.media_type}/${movie.id}`);
    }, [router, handleCloseSearch]);

    // FIX: Add location state and navigate function for Navbar and Footer
    const [location, setLocation] = useState({ pathname: '/', search: '' });

    useEffect(() => {
        // Ensure window is defined before accessing it
        if (typeof window !== 'undefined') {
            setLocation({
                pathname: pathname || '/',
                search: window.location.search,
            });
        }
    }, [pathname]);

    const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
        if (options?.replace) {
            router.replace(path);
        } else {
            router.push(path);
        }
    }, [router]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                handleOpenSearch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleOpenSearch]);

    const isDetailPageActive = !!pathname && /^\/(movie|tv|person)\/\d+/.test(pathname);
    
    const handleBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className="relative bg-[#141414] min-h-screen text-white overflow-x-hidden">
            <Suspense fallback={<SuspenseLoader />}>
                {/* FIX: Pass all required props to SearchOverlay */}
                <SearchOverlay 
                    isOpen={isSearchOpen} 
                    onClose={handleCloseSearch}
                    onSelectMovie={handleSelectMovie}
                    myList={myList}
                    onToggleMyList={handleToggleMyList}
                />
            </Suspense>
            
            {isDetailPageActive ? (
                <button 
                    onClick={handleBack}
                    className="fixed top-6 left-6 z-[60] p-2 text-white transition-transform hover:scale-110"
                    aria-label="Go back"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                >
                    <ArrowLeftIcon className="h-8 w-8 text-white" />
                </button>
            ) : (
                // FIX: Pass all required props to Navbar
                <Navbar onOpenSearch={handleOpenSearch} location={location} navigate={navigate} />
            )}
            
            <main>{children}</main>
            
            {/* FIX: Pass all required props to Footer */}
            <Footer navigate={navigate} />
            <BackToTopButton />
            <Suspense fallback={null}>
                <GoogleAnalytics />
            </Suspense>
        </div>
    );
}
