import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef } from 'react';
import { Actor, Genre, Movie } from './types';
import { 
  fetchMoviesData, 
  fetchLogoUrl,
} from './services/geminiService';
import Navbar from './components/Navbar';
import { CloseIcon } from './components/icons/Icons';
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

const SkeletonScreen: React.FC = () => (
    <div className="min-h-screen bg-[#141414] animate-pulse">
        <div className="h-[70vh] bg-zinc-800" />
        <div className="p-8 space-y-12">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                    <div className="h-8 w-48 bg-zinc-800 rounded" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(j => <div key={j} className="w-44 aspect-[2/3] bg-zinc-800 rounded" />)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const App: React.FC = () => {
  const { location, navigate } = useLocation();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myList, setMyList] = useState<Movie[]>([]);
  const loadedViewsRef = useRef<Set<string>>(new Set());
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const storedList = localStorage.getItem('myList');
    if (storedList) setMyList(JSON.parse(storedList));
  }, []);

  const loadMovies = useCallback(async (view: 'home' | 'movies' | 'tv' | 'anime') => {
    if (loadedViewsRef.current.has(view) && genres.length > 0) {
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      setError(null);
      const movieData = await fetchMoviesData(view);
      setGenres(movieData);
      loadedViewsRef.current.add(view);
    } catch (err) {
      setError('Failed to fetch movie data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [genres.length]);

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
  
  const handleOpenSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);

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

  useEffect(() => {
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
          default: pageTitle = baseTitle;
        }
        document.title = pageTitle;
    }
  }, [location.pathname]);

  const getActiveFilter = () => {
    switch (location.pathname) {
      case '/movies': return 'movie';
      case '/tv-shows': return 'tv';
      case '/anime': return 'anime';
      default: return 'all';
    }
  };

  useEffect(() => {
    const fetchHeroLogos = async (movies: Movie[]) => {
      const moviesWithLogos = await Promise.all(
        movies.map(async (movie) => ({ ...movie, logoUrl: await fetchLogoUrl(movie.id, movie.media_type) }))
      );
      setHeroMovies(moviesWithLogos);
    };
    
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
        setHeroMovies(topTen);
        fetchHeroLogos(topTen);
      }
    }
  }, [genres, location.pathname]);

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

  const filteredGenres = useMemo(() => {
    const activeFilter = getActiveFilter();
    const movieKeys = ['trending_movies', 'popular_movies', 'now_playing_movies', 'upcoming_movies', 'top_rated_movies'];
    const tvKeys = ['trending_tv', 'k_drama', 'c_drama', 'j_drama', 'anime', 'on_the_air_tv', 'top_rated_tv'];
    const animeKeys = ['anime_trending', 'anime_latest', 'anime_top_airing', 'anime_movies', 'anime_animation'];
    const homeKeys = ['trending_today', 'k_drama', 'c_drama', 'j_drama', 'anime', 'popular_movies', 'top_rated_movies'];

    if (activeFilter === 'movie') return genres.filter(g => movieKeys.includes(g.key));
    if (activeFilter === 'tv') return genres.filter(g => tvKeys.includes(g.key));
    if (activeFilter === 'anime') return genres.filter(g => animeKeys.includes(g.key));
    
    return genres.filter(g => homeKeys.includes(g.key)).sort((a, b) => homeKeys.indexOf(a.key) - homeKeys.indexOf(b.key));
  }, [genres, location.pathname]);
  
  // Cinematic detail pages hide the navbar to maximize screen space
  const isCinematicDetailView = /^\/(movie|tv)\/\d+/.test(location.pathname);
  const isCurrentlyPlaying = new URLSearchParams(location.search).get('autoplay') === 'true';
  
  const renderContent = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.search);
    
    if (pathParts[0] === 'tv' && pathParts[1]) {
      const id = parseInt(pathParts[1], 10);
      if (!isNaN(id)) {
        const s = parseInt(pathParts[2], 10);
        const e = parseInt(pathParts[3], 10);
        return <DetailPage 
          movieId={id} 
          mediaType='tv'
          onSelectMovie={handleSelectMovie}
          myList={myList}
          onToggleMyList={handleToggleMyList}
          onSelectActor={handleSelectActor}
          autoPlay={searchParams.get('autoplay') === 'true' || (!isNaN(s) && !isNaN(e))}
          navigate={navigate}
          initialSeasonNumber={!isNaN(s) ? s : undefined}
          initialEpisodeNumber={!isNaN(e) ? e : undefined}
        />;
      }
    }
    
    if (pathParts[0] === 'movie' && pathParts[1]) {
      const id = parseInt(pathParts[1], 10);
      if (!isNaN(id)) {
        return <DetailPage 
          movieId={id} 
          mediaType='movie'
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
      if (!isNaN(id)) return <ActorCreditsPage actorId={id} onSelectMovie={handleSelectMovie} myList={myList} onToggleMyList={handleToggleMyList} />;
    }
    
    if (pathParts[0] === 'category' && pathParts[1]) {
      return <SeeAllPage categoryKey={pathParts[1]} categoryTitle={pathParts[1].replace(/_/g, ' ')} onSelectMovie={handleSelectMovie} myList={myList} onToggleMyList={handleToggleMyList} />;
    }
    
    if (location.pathname === '/discover') return <DiscoverPage onSelectMovie={handleSelectMovie} myList={myList} onToggleMyList={handleToggleMyList} location={location} navigate={navigate} />;
    if (location.pathname === '/my-list') return <MyListPage myList={myList} onSelectMovie={handleSelectMovie} onToggleMyList={handleToggleMyList} />;

    if (['/', '/movies', '/tv-shows', '/anime'].includes(location.pathname)) {
        return (
          <main>
            {heroMovies.length > 0 && <Hero movies={heroMovies} onSelectMovie={handleSelectMovie} onPlayMovie={handlePlayFromHero} />}
            <section className="relative -mt-16 md:-mt-24 px-4 md:px-16 pb-8 space-y-6 md:space-y-8">
              {filteredGenres.map((genre) => (
                <MovieRow key={genre.key} title={genre.title} movies={genre.movies} onSeeAll={() => handleSeeAllClick(genre)} onSelectMovie={handleSelectMovie} myList={myList} onToggleMyList={handleToggleMyList} />
              ))}
            </section>
          </main>
        );
    }
    return <NotFoundPage navigate={navigate} />;
  };
  
  return (
    <div className="relative bg-[#141414] min-h-screen text-white overflow-x-hidden">
        {loading ? <SkeletonScreen /> : error ? (
            <div className="flex justify-center items-center h-screen text-center"><p className="text-xl text-red-500">{error}</p></div>
        ) : (
            <>
                {isSearchOpen && (
                  <Suspense fallback={null}>
                     <SearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} onSelectMovie={handleSelectMovie} myList={myList} onToggleMyList={handleToggleMyList} />
                  </Suspense>
                )}
                
                {isCinematicDetailView && (
                  <button 
                      onClick={() => isCurrentlyPlaying ? navigate(location.pathname, { replace: true }) : handleBack()}
                      className="fixed top-6 right-6 z-[60] p-2 text-white bg-black/40 rounded-full transition-all hover:scale-110 hover:bg-black/60 shadow-xl"
                      aria-label="Back"
                  >
                      <CloseIcon className="h-8 w-8 text-white" />
                  </button>
                )}
                
                {!isCinematicDetailView && (
                  <Navbar location={location} navigate={navigate} onOpenSearch={handleOpenSearch} />
                )}
                
                <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-[var(--brand-color)] border-t-transparent rounded-full animate-spin" /></div>}>
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