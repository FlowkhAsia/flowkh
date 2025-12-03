import React, { useState, useEffect, useRef } from 'react';
import { FlowkhLogoIcon, SearchIcon, MenuIcon, CloseIcon, TuneIcon } from './icons/Icons';
import ThemeSwitcher from './ThemeSwitcher';

type FilterType = 'all' | 'movie' | 'tv' | 'discover' | 'my-list' | 'anime';

interface NavbarProps {
  location: { pathname: string; search: string };
  navigate: (path: string, options?: { replace?: boolean }) => void;
  onOpenSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    location,
    navigate,
    onOpenSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const themeSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle closing theme switcher on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (themeSwitcherRef.current && !themeSwitcherRef.current.contains(event.target as Node)) {
            setShowThemeSwitcher(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
    setIsMobileMenuOpen(false);
  }

  const getPathForFilter = (filter: FilterType) => {
    switch(filter) {
        case 'all': return '/';
        case 'tv': return '/tv-shows';
        case 'movie': return '/movies';
        case 'anime': return '/anime';
        case 'discover': return '/discover';
        case 'my-list': return '/my-list';
        default: return '/';
    }
  }
  
  const getActiveFilterFromPath = (pathname: string): FilterType => {
      switch (pathname) {
          case '/': return 'all';
          case '/tv-shows': return 'tv';
          case '/movies': return 'movie';
          case '/anime': return 'anime';
          case '/discover': return 'discover';
          case '/my-list': return 'my-list';
          default: return 'all'; // Default or consider a different state for non-nav paths
      }
  }

  const activeFilter = getActiveFilterFromPath(location.pathname);

  const navItems = [
    { label: 'Home', filter: 'all' as FilterType },
    { label: 'TV Shows', filter: 'tv' as FilterType },
    { label: 'Movies', filter: 'movie' as FilterType },
    { label: 'Anime', filter: 'anime' as FilterType },
    { label: 'Discover', filter: 'discover' as FilterType },
    { label: 'My List', filter: 'my-list' as FilterType },
  ];

  return (
    <>
      <header className={`fixed top-0 z-40 flex w-full items-center justify-between p-4 md:px-16 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center space-x-4 md:space-x-8">
          <a href="/" onClick={(e) => handleNavClick(e, '/')}>
            <FlowkhLogoIcon className="h-9 w-auto cursor-pointer" />
          </a>

          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const path = getPathForFilter(item.filter);
              return (
                <a
                  key={item.filter}
                  href={path}
                  onClick={(e) => handleNavClick(e, path)}
                  className={`px-3 py-2 text-base transition-colors duration-200 rounded-md ${
                    activeFilter === item.filter
                      ? 'font-bold text-white'
                      : 'font-semibold text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-end flex-1 space-x-4 md:space-x-6">
          {/* Desktop Search Bar Trigger */}
          <button 
            onClick={onOpenSearch}
            className="hidden md:flex flex-1 max-w-sm items-center justify-between bg-zinc-800/60 px-4 py-2 rounded-lg border border-transparent hover:border-white/20 focus-within:border-white/20 focus-within:bg-zinc-800 transition-all duration-300"
            aria-label="Open search"
          >
            <div className="flex items-center flex-1">
              <SearchIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm px-2">Search...</span>
            </div>
            <div className="bg-zinc-700 text-gray-300 text-xs font-mono rounded-md px-2 py-1 border border-zinc-600">
              CTRL+K
            </div>
          </button>

          {/* Mobile Search Icon */}
          <div className="flex items-center md:hidden">
            <button onClick={onOpenSearch} aria-label="Open search">
              <SearchIcon className="h-6 w-6 cursor-pointer text-white" />
            </button>
          </div>

          <div ref={themeSwitcherRef} className="relative">
            <button onClick={() => setShowThemeSwitcher(s => !s)} aria-label="Change theme">
                <TuneIcon className="h-6 w-6 cursor-pointer text-white" />
            </button>
            {showThemeSwitcher && <ThemeSwitcher />}
          </div>
      
          <div className="lg:hidden">
            <button
              onClick={() => { setIsMobileMenuOpen(true); }}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`
        fixed inset-0 z-40 bg-[#141414]/95 backdrop-blur-sm lg:hidden
        transition-opacity duration-300 ease-in-out
        ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="flex justify-end p-4 pt-[calc(1rem+env(safe-area-inset-top))] pr-[calc(1rem+env(safe-area-inset-right))]">
          <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <CloseIcon className="h-8 w-8 text-white" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full -mt-16">
          <ul className="flex flex-col items-center space-y-8">
            {navItems.map(item => {
              const path = getPathForFilter(item.filter);
              return (
                <li key={item.filter}>
                  <a
                    href={path}
                    onClick={(e) => handleNavClick(e, path)}
                    className={`text-2xl font-semibold transition-colors duration-200 ${
                      activeFilter === item.filter ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;