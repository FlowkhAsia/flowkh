import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Actor, Genre, Movie } from './types';
import { 
  fetchMoviesData, 
  fetchLogoUrl,
} from './services/geminiService';
import Navbar from './components/Navbar';
import { ArrowLeftIcon } from './components/icons/Icons';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import BackToTopButton from './components/BackToTopButton';
import Footer from './components/Footer';

const DetailPage = lazy(() => import('./components/DetailPage'));
const SeeAllPage = lazy(() => import('./components/SeeAllPage'));
const ActorCreditsPage = lazy(() => import('./components/ActorCreditsPage'));
const MyListPage = lazy(() => import('./components/MyListPage'));
const DiscoverPage = lazy(() => import('./components/DiscoverPage'));
const SearchOverlay = lazy(() => import('./components/SearchOverlay'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/TermsOfServicePage'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

// Add Window interface augmentation for Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const useLocation = () => {
  const [location, setLocation] = useState({
    pathname: (window.location.pathname.replace(/\/$/, '') || '/'),
    search: window.location.search,
  });

  useEffect(() => {
    const handlePopState = () => {
      setLocation({
        pathname: (window.location.pathname.replace(/\/$/, '') || '/'),
        search: window.location.search,
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }

    const newPath = path.split('?')[0];
    const newSearch = path.includes('?') ? `?${path.split('?')[1]}` : '';
    
    setLocation({
      pathname: (newPath.replace(/\/$/, '') || '/'),
      search: newSearch,
    });
    window.scrollTo(0, 0);
  }, []);

  return { location, navigate };
};


// --- SKELETON LOADING COMPONENTS ---

const MovieCardSkeleton: React.FC = () => (
    <div className="w-32 sm:w-36 md:w-40 lg:w-44 flex-shrink-0 aspect-[2/3] bg-zinc-800 rounded-md animate-pulse" />
);

const MovieRowSkeleton: React.FC = () => (
    <div className="space-y-2 md:space-y-3">
        {/* Title skeleton */}
        <div className="flex items-center space-x-3">
            <div className="w-1.s h-7 bg-zinc-700 rounded-full animate-pulse" />
            <div className="h-7 w-48 bg-zinc-800 rounded-md animate-pulse" />
        </div>
        {/* Cards skeleton */}
        <div className="flex items-center space-x-2 md:space-x-4 overflow-hidden md:p-2">
            {[...Array(10)].map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
    </div>
);

const HeroSkeleton: React.FC = () => (
    <div className="relative h-[70vh] md:h-screen w-full bg-zinc-800 animate-pulse">
        <div className="absolute bottom-0 left-0 px-4 md:px-16 pb-20 md:pb-0 z-10 w-full flex flex-col justify-end md:justify-center h-full">
            <div className="max-w-xl space-y-5">
                <div className="w-2/3 md:w-1/2 max-w-lg h-20 md:h-28 bg-zinc-700 rounded-lg" />
                <div className="space-y-2">
                    <div className="h-4 w-full max-w-md bg-zinc-700 rounded-md" />
                    <div className="h-4 w-3/4 max-w-sm bg-zinc-700 rounded-md" />
                </div>
                <div className="flex items-center space-x-3 pt-4">
                    <div className="h-12 w-32 bg-zinc-700 rounded-lg" />
                    <div className="h-12 w-32 bg-zinc-700 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

const NavbarSkeleton: React.FC = () => (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between p-4 px-4 md:px-16 bg-[#141414]">
         <div className="flex items-center space-x-4 md:space-x-8">
            <div className="h-7 w-24 bg-zinc-800 rounded-md animate-pulse" />
            <div className="hidden lg:flex items-center space-x-4">
                <div className="h-10 w-20 bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-10 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-10 w-20 bg-zinc-800 rounded-lg animate-pulse" />
            </div>
        </div>
        <div className="flex items-center justify-end flex-1 space-x-4 md:space-x-6">
            <div className="hidden md:block h-10 w-full max-w-sm bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
        </div>
    </header>
);

const SkeletonScreen: React.FC = () => (
    <>
        <NavbarSkeleton />
        <main>
            <HeroSkeleton />
            <section className="relative px-4 md:px-16 pb-24 space-y-8 -mt-16 md:-mt-24">
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
            </section>
        </main>
    </>
);

const SuspenseLoader: React.FC = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <div className="w-16 h-16 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
);


const App: React.FC = () => {
  const { location, navigate } = useLocation();

  // Core state
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myList, setMyList] = useState<Movie[]>([]);

  // Hero state
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);

  // Search Overlay state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- DATA LOADING & INITIALIZATION ---
  useEffect(() => {
    const storedList = localStorage.getItem('myList');
    if (storedList) setMyList(JSON.parse(storedList));
  }, []);

  const loadMovies = useCallback(async (view: 'home' | 'movies' | 'tv' | 'anime') => {
    try {
      setLoading(true);
      setError(null);
      const movieData = await fetchMoviesData(view);
      setGenres(movieData);
    } catch (err) {
      setError('Failed to fetch movie data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    const path = location.pathname;
    const mainBrowsePaths = ['/', '/movies', '/tv-shows', '/anime'];
    
    if (mainBrowsePaths.includes(path)) {
      const view = path === '/movies' ? 'movies' : path === '/tv-shows' ? 'tv' : path === '/anime' ? 'anime' : 'home';
      loadMovies(view);
    } else {
      setLoading(false);
    }
  }, [location.pathname, loadMovies]);
  
  // --- STATE CHANGE HANDLERS & EFFECTS ---
  
  const handleOpenSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);

  // Global keyboard shortcut for search
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

  // SEO & ANALYTICS
  useEffect(() => {
    // Google Analytics Initialization
    const gaId = (import.meta as any).env?.VITE_PUBLIC_GOOGLE_ANALYTICS_ID;
    
    // Inject GA script if not present
    if (gaId && typeof window.gtag === 'undefined') {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        // @ts-ignore
        gtag('js', new Date());
        // @ts-ignore
        gtag('config', gaId);
        window.gtag = gtag;
    }

    // Dynamic Page Titles
    const baseTitle = 'flowkh - Movies and TV Series — All in One Flow';
    let pageTitle: string;
    
    const pathParts = location.pathname.split('/').filter(Boolean);
    const isDynamicPath = (pathParts.length >= 2 && ['tv', 'movie', 'person', 'category'].includes(pathParts[0]));

    if (!isDynamicPath) {
        switch (location.pathname) {
          case '/': pageTitle = baseTitle; break;
          case '/movies': pageTitle = `Movies | ${baseTitle}`; break;
          case '/tv-shows': pageTitle = `TV Shows | ${baseTitle}`; break;
          case '/anime': pageTitle = `Anime | ${baseTitle}`; break;
          case '/discover': pageTitle = `Discover | ${baseTitle}`; break;
          case '/my-list': pageTitle = `My List | ${baseTitle}`; break;
          case '/privacy-policy': pageTitle = `Privacy Policy | ${baseTitle}`; break;
          case '/terms-of-service': pageTitle = `Terms of Service | ${baseTitle}`; break;
          case '/faq': pageTitle = `FAQ | ${baseTitle}`; break;
          default: pageTitle = `404 - Page Not Found | ${baseTitle}`;
        }
        document.title = pageTitle;
    }

    // Dynamic Canonical URL
    const canonicalUrl = `https://flowkh.com${location.pathname === '/' ? '' : location.pathname}`;
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Google Analytics Page View Tracking
    if (typeof window.gtag === 'function' && gaId) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search
      });
    }

  }, [location.pathname, location.search]);

  const getActiveFilter = () => {
    switch (location.pathname) {
      case '/movies': return 'movie';
      case '/tv-shows': return 'tv';
      case '/anime': return 'anime';
      default: return 'all';
    }
  };

  // Fetch hero movies
  useEffect(() => {
    const fetchHeroLogos = async (movies: Movie[]) => {
      const moviesWithLogos = await Promise.all(
        movies.map(async (movie) => ({ ...movie, logoUrl: await fetchLogoUrl(movie.id, movie.media_type) }))
      );
      setHeroMovies(moviesWithLogos);
    };
    
    // Cleanup previous preload link
    const previousPreloadLink = document.querySelector('link[data-hero-preload]');
    if (previousPreloadLink) {
        previousPreloadLink.remove();
    }

    const shouldShowHero = ['/', '/movies', '/tv-shows', '/anime'].includes(location.pathname);

    if (genres.length > 0 && shouldShowHero) {
      const activeFilter = getActiveFilter();
      let heroKey = 'trending_today';
      if (activeFilter === 'tv') heroKey = 'trending_tv';
      else if (activeFilter === 'movie') heroKey = 'trending_movies';
      else if (activeFilter === 'anime') heroKey = 'anime_trending';
      
      const heroGenre = genres.find(g => g.key === heroKey);
      const topTen = (heroGenre?.movies || []).slice(0, 10);
      
      if (topTen.length > 0) {
        // Preload the first hero image for better LCP
        const firstHeroImage = topTen[0].backdropUrl?.replace('/w780/', '/original/');
        if (firstHeroImage) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = firstHeroImage;
            link.setAttribute('data-hero-preload', 'true'); // Mark our link for cleanup
            document.head.appendChild(link);
        }
        
        setHeroMovies(topTen); // Set initial movies without logos
        fetchHeroLogos(topTen); // Fetch logos and update
      } else {
        setHeroMovies([]);
      }
    } else {
        setHeroMovies([]);
    }
  }, [genres, location.pathname]);

  // --- EVENT HANDLERS ---
  const handleToggleMyList = (movie: Movie) => {
    setMyList((prevList) => {
      const isAdded = prevList.some((item) => item.id === movie.id);
      let newList = isAdded ? prevList.filter((item) => item.id !== movie.id) : [...prevList, movie];
      localStorage.setItem('myList', JSON.stringify(newList));
      return newList;
    });
  };

  const handleSelectMovie = useCallback((movie: Movie) => {
    handleCloseSearch();
    navigate(`/${movie.media_type}/${movie.id}`);
  }, [navigate, handleCloseSearch]);

  const handleSeeAllClick = useCallback((genre: Genre) => {
    navigate(`/category/${genre.key}`);
  }, [navigate]);

  const handleSelectActor = useCallback((actor: Actor) => {
    navigate(`/person/${actor.id}`);
  }, [navigate]);
  
  const handlePlayFromHero = useCallback((movie: Movie) => {
    navigate(`/${movie.media_type}/${movie.id}?autoplay=true`);
  }, [navigate]);

  const handleBack = () => {
    if (window.history.length <= 2) {
      navigate('/');
    } else {
      window.history.back();
    }
  };

  // --- RENDER LOGIC ---

  const filteredGenres = useMemo(() => {
    const activeFilter = getActiveFilter();
    const movieKeys = ['trending_movies', 'popular_movies', 'now_playing_movies', 'upcoming_movies', 'top_rated_movies'];
    const tvKeys = ['trending_tv', 'k_drama', 'c_drama', 'j_drama', 'anime', 'on_the_air_tv', 'top_rated_tv'];
    const animeKeys = ['anime_trending', 'anime_latest', 'anime_top_airing', 'anime_movies', 'anime_animation'];
    const homeKeys = ['trending_today', 'k_drama', 'c_drama', 'j_drama', 'anime', 'popular_movies', 'top_rated_movies'];

    if (activeFilter === 'movie') return genres.filter(g => movieKeys.includes(g.key));
    if (activeFilter === 'tv') return genres.filter(g => tvKeys.includes(g.key));
    if (activeFilter === 'anime') return genres.filter(g => animeKeys.includes(g.key));
    if (activeFilter === 'all') {
        let homeGenres = genres
            .filter(g => homeKeys.includes(g.key))
            .sort((a, b) => homeKeys.indexOf(a.key) - homeKeys.indexOf(b.key));

        // Handle Top Rated merge
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
}, [genres, location.pathname]);
  
  const isDetailPageActive = /^\/(movie|tv|person)\/\d+/.test(location.pathname);
  
  const renderContent = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.search);
    
    // DETAIL PAGES
    if (pathParts[0] === 'tv' && pathParts[1]) {
      const id = parseInt(pathParts[1], 10);
      if (!isNaN(id)) {
        const initialSeasonNumber = pathParts[2] ? parseInt(pathParts[2], 10) : undefined;
        const initialEpisodeNumber = pathParts[3] ? parseInt(pathParts[3], 10) : undefined;
        const isPlayingViaUrl = !!(initialSeasonNumber && !isNaN(initialSeasonNumber) && initialEpisodeNumber && !isNaN(initialEpisodeNumber));

        return <DetailPage 
          movieId={id} 
          mediaType={'tv'}
          onSelectMovie={handleSelectMovie}
          myList={myList}
          onToggleMyList={handleToggleMyList}
          onSelectActor={handleSelectActor}
          autoPlay={searchParams.get('autoplay') === 'true' || isPlayingViaUrl}
          navigate={navigate}
          initialSeasonNumber={initialSeasonNumber}
          initialEpisodeNumber={initialEpisodeNumber}
        />;
      }
    }
    
    if (pathParts[0] === 'movie' && pathParts[1]) {
      const id = parseInt(pathParts[1], 10);
      if (!isNaN(id)) {
        return <DetailPage 
          movieId={id} 
          mediaType={'movie'}
          onSelectMovie={handleSelectMovie}
          myList={myList}
          onToggleMyList={handleToggleMyList}
          onSelectActor={handleSelectActor}
          autoPlay={searchParams.get('autoplay') === 'true'}
          navigate={navigate}
        />;
      }
    }

    if (pathParts[0] === 'person' && pathParts[1]) {
      const id = parseInt(pathParts[1], 10);
      if (!isNaN(id)) {
        return <ActorCreditsPage 
          actorId={id}
          onSelectMovie={handleSelectMovie}
          myList={myList}
          onToggleMyList={handleToggleMyList}
        />;
      }
    }
    
    // CATEGORY PAGE
    if (pathParts[0] === 'category' && pathParts[1]) {
      const category = genres.find(g => g.key === pathParts[1]);
      if (category) {
        return <SeeAllPage
          categoryKey={pathParts[1]}
          categoryTitle={category.title}
          onSelectMovie={handleSelectMovie}
          myList={myList}
          onToggleMyList={handleToggleMyList}
        />;
      }
    }
    
    // MAIN BROWSE PAGES
    if (location.pathname === '/discover') {
      return <DiscoverPage 
        onSelectMovie={handleSelectMovie}
        myList={myList}
        onToggleMyList={handleToggleMyList}
        location={location}
        navigate={navigate}
      />;
    }
    if (location.pathname === '/my-list') {
      return <MyListPage
        myList={myList}
        onSelectMovie={handleSelectMovie}
        onToggleMyList={handleToggleMyList}
      />;
    }

    // LEGAL & INFO PAGES
    if (location.pathname === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (location.pathname === '/terms-of-service') {
      return <TermsOfServicePage />;
    }
    if (location.pathname === '/faq') {
      return <FAQPage />;
    }

    if (['/', '/movies', '/tv-shows', '/anime'].includes(location.pathname)) {
        const activeFilter = getActiveFilter();
        const pageH1 = location.pathname === '/' 
            ? 'Movies and TV Series — All in One Flow' 
            : location.pathname === '/movies' 
            ? 'Explore All Movies' 
            : location.pathname === '/tv-shows'
            ? 'Explore All TV Shows'
            : 'Explore Anime';
            
        return (
          <main>
            <h1 className="sr-only">{pageH1}</h1>
            {heroMovies.length > 0 && <Hero movies={heroMovies} onSelectMovie={handleSelectMovie} onPlayMovie={handlePlayFromHero} />}
            <section key={activeFilter} className="animate-fast-fade-in relative -mt-16 md:-mt-24 px-4 md:px-16 pb-8 space-y-6 md:space-y-8">
              {myList.length > 0 && activeFilter === 'all' && (
                <MovieRow 
                  title="My List" 
                  movies={myList} 
                  onSelectMovie={handleSelectMovie} 
                  myList={myList} 
                  onToggleMyList={handleToggleMyList} 
                />
              )}
              {filteredGenres.map((genre, index) => (
                <React.Fragment key={`${genre.key}-${activeFilter}`}>
                  <MovieRow 
                    title={genre.title} 
                    movies={genre.movies} 
                    onSeeAll={() => handleSeeAllClick(genre)} 
                    onSelectMovie={handleSelectMovie} 
                    myList={myList} 
                    onToggleMyList={handleToggleMyList} 
                  />
                </React.Fragment>
              ))}
            </section>
          </main>
        );
    }
    
    // Fallback for unknown routes
    return <NotFoundPage navigate={navigate} />;
  };
  
  return (
    <div className="relative bg-[#141414] min-h-screen text-white overflow-x-hidden">
        {loading ? (
            <SkeletonScreen />
        ) : error ? (
            <div className="flex justify-center items-center h-screen text-center px-4">
                <div>
                    <p className="text-xl text-red-500 mb-4">{error}</p>
                    <button onClick={() => loadMovies('home')} className="bg-[var(--brand-color)] hover:bg-[var(--brand-color-dark)] text-white font-bold py-2 px-4 rounded transition-colors duration-300">Retry</button>
                </div>
            </div>
        ) : (
            <>
                {/* Conditionally render SearchOverlay to prevent layout shift during lazy load */}
                {isSearchOpen && (
                  <Suspense fallback={null}>
                     <SearchOverlay 
                      isOpen={isSearchOpen} 
                      onClose={handleCloseSearch}
                      onSelectMovie={handleSelectMovie} 
                      myList={myList}
                      onToggleMyList={handleToggleMyList}
                     />
                  </Suspense>
                )}
                
                {isDetailPageActive ? (
                  <button 
                      onClick={handleBackdropClick => handleBack()}
                      className="fixed top-6 left-6 z-[60] p-2 text-white bg-black/20 rounded-full transition-transform hover:scale-110"
                      aria-label="Go back"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                  >
                      <ArrowLeftIcon className="h-8 w-8 text-white" />
                  </button>
                ) : (
                  <Navbar 
                      location={location}
                      navigate={navigate} 
                      onOpenSearch={handleOpenSearch}
                  />
                )}
                <Suspense fallback={<SuspenseLoader />}>
                  {renderContent()}
                </Suspense>
                <Footer navigate={navigate} />
            </>
        )}
        <BackToTopButton />
    </div>
  );
};

export default App;