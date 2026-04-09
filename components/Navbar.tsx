'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Bell, User, X, Film, ChevronDown, Menu } from 'lucide-react';
import { Movie, IMAGE_BASE_URL } from '@/lib/tmdb';
import { searchMoviesAction } from '@/app/actions';
import Image from 'next/image';

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') || '';
  const isPlaying = searchParams.has('episode') || searchParams.get('play') === 'true';

  if (isPlaying) {
    return null;
  }
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(!!initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timeoutId = setTimeout(async () => {
        const results = await searchMoviesAction(searchQuery.trim());
        setSuggestions(results.slice(0, 5));
        if (document.activeElement === searchInputRef.current) {
          setShowSuggestions(true);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
       
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery(q);
       
      setIsSearchOpen(true);
    } else {
       
      setSearchQuery('');
       
      setIsSearchOpen(false);
    }
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim().length > 0) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSuggestions(false);
      } else {
        router.push('/');
      }
    }
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      if (!searchQuery) {
        setIsSearchOpen(false);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSuggestions(false);
      }
    } else {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setShowSuggestions(false);
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all duration-300 md:px-10 ${
        isScrolled ? 'bg-[#141414]' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center space-x-3 md:space-x-10">
        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 mt-4 w-48 bg-black/95 border border-white/20 rounded-md shadow-2xl flex flex-col py-2 z-50">
              <Link href="/" className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/category/tv" className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left" onClick={() => setIsMobileMenuOpen(false)}>TV Shows</Link>
              <Link href="/category/movie" className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left" onClick={() => setIsMobileMenuOpen(false)}>Movies</Link>
              <Link href="/category/popular" className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left" onClick={() => setIsMobileMenuOpen(false)}>New &amp; Popular</Link>
              <Link href="/my-list" className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left" onClick={() => setIsMobileMenuOpen(false)}>My List</Link>
            </div>
          )}
        </div>

        <Link href="/">
          <h1 className="text-2xl font-bold text-netflix-red md:text-4xl cursor-pointer tracking-wider">FLOWKH</h1>
        </Link>

        <ul className="hidden space-x-4 md:flex">
          <li className="text-sm font-semibold text-white hover:text-gray-300">
            <Link href="/">Home</Link>
          </li>
          <li className="text-sm font-semibold text-gray-300 hover:text-white transition">
            <Link href="/category/tv">TV Shows</Link>
          </li>
          <li className="text-sm font-semibold text-gray-300 hover:text-white transition">
            <Link href="/category/movie">Movies</Link>
          </li>
          <li className="text-sm font-semibold text-gray-300 hover:text-white transition">
            <Link href="/category/popular">New &amp; Popular</Link>
          </li>
          <li className="text-sm font-semibold text-gray-300 hover:text-white transition">
            <Link href="/my-list">My List</Link>
          </li>
        </ul>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 text-sm font-light">
        <div className="relative" ref={searchContainerRef}>
          <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-black/80 border border-white/80 px-2 py-1' : ''}`}>
            <button aria-label="Toggle search" onClick={toggleSearch} className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
              <Search className="h-6 w-6 cursor-pointer" aria-hidden="true" />
            </button>
            {isSearchOpen && (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="Titles, people, genres"
                  aria-label="Search titles, people, genres"
                  className="bg-transparent outline-none text-white ml-2 w-32 sm:w-40 md:w-56 transition-all duration-300 text-sm md:text-base"
                />
                <button aria-label="Clear search" onClick={clearSearch} className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
                  <X className="h-4 w-4 cursor-pointer text-gray-400 hover:text-white" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full right-0 md:left-0 md:right-auto mt-2 w-64 md:w-80 bg-[#141414] border border-white/20 rounded-md shadow-2xl overflow-hidden z-50">
              {suggestions.map((movie) => {
                const title = movie.title || movie.name || movie.original_name;
                const releaseDate = movie.release_date || movie.first_air_date;
                const year = releaseDate ? releaseDate.substring(0, 4) : '';
                const imagePath = movie.poster_path || movie.backdrop_path;
                const imageUrl = imagePath 
                  ? `${IMAGE_BASE_URL}${imagePath}`
                  : `https://picsum.photos/seed/${movie.id}/100/150?blur=2`;

                return (
                  <Link
                    key={movie.id}
                    href={`/${movie.media_type || (movie.first_air_date ? 'tv' : 'movie')}/${movie.id}`}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10 last:border-0 text-left focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={() => {
                      if (title) {
                        setSearchQuery(title);
                        setShowSuggestions(false);
                      }
                    }}
                    aria-label={`Search for ${title}`}
                  >
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-[#2a2a2a]">
                      {imagePath ? (
                        <Image
                          src={imageUrl}
                          alt={title || 'Movie poster'}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Film className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-white truncate">{title}</span>
                      {year && <span className="text-xs text-gray-400">{year}</span>}
                    </div>
                  </Link>
                );
              })}
              <Link 
                href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                className="block w-full px-4 py-3 text-center text-sm text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={() => setShowSuggestions(false)}
              >
                See all results for &quot;{searchQuery}&quot;
              </Link>
            </div>
          )}
        </div>
        <p className="hidden lg:inline cursor-pointer">Kids</p>
        <button aria-label="Notifications" className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
          <Bell className="h-6 w-6 cursor-pointer" aria-hidden="true" />
        </button>
        <button aria-label="User profile" className="cursor-pointer rounded bg-gray-800 p-1 focus:outline-none focus:ring-2 focus:ring-white/50">
          <User className="h-5 w-5 text-gray-300" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="fixed top-0 z-50 flex w-full h-16 bg-transparent" />}>
      <NavbarContent />
    </Suspense>
  );
}
