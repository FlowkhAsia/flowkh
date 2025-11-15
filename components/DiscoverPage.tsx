import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Movie, GenreItem, CountryItem } from '../types';
import { fetchDiscoverResults, fetchGenreList, fetchCountriesList } from '../services/geminiService';
import MovieCard from './MovieCard';
import { ChevronDownIcon, CheckIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, CloseIcon } from './icons/Icons';

interface DiscoverPageProps {
    onSelectMovie: (movie: Movie) => void;
    myList: Movie[];
    onToggleMyList: (movie: Movie) => void;
    location: { pathname: string; search: string };
    navigate: (path: string, options?: { replace?: boolean }) => void;
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

interface NetworkConfig {
  name: string;
  logo_path: string;
  providerIds?: number[];
  networkIds?: number[];
}

const networksConfig: NetworkConfig[] = [
    { name: 'Netflix', logo_path: 'https://media.themoviedb.org/t/p/w154/wwemzKWzjKYJFfCeiB57q3r4Bcm.png', providerIds: [8], networkIds: [213] },
    { name: 'AmazonPrimeVideo', logo_path: 'https://media.themoviedb.org/t/p/w154/w7HfLNm9CWwRmAMU58udl2L7We7.png', providerIds: [9], networkIds: [1024] },
    { name: 'DisneyPlus', logo_path: 'https://media.themoviedb.org/t/p/w154/1edZOYAfoyZyZ3rklNSiUpXX30Q.png', providerIds: [337], networkIds: [2739] },
    { name: 'Hulu', logo_path: 'https://media.themoviedb.org/t/p/w154/pqUTCleNUiTLAVlelGxUgWn1ELh.png', providerIds: [15], networkIds: [453, 1772] },
    { name: 'HBOMax', logo_path: 'https://media.themoviedb.org/t/p/w154/tuomPhY2UtuPTqqFnKMVHvSb724.png', providerIds: [1899], networkIds: [49] },
    { name: 'ParamountPlus', logo_path: 'https://media.themoviedb.org/t/p/w154/fi83B1oztoS47xxcemFdPMhIzK.png', providerIds: [531], networkIds: [4330] },
    { name: 'Peacock', logo_path: 'https://media.themoviedb.org/t/p/w154/gIAcGTjKKr0KOHL5s4O36roJ8p7.png', providerIds: [387], networkIds: [3353] },
    { name: 'AppleTVPlus', logo_path: 'https://media.themoviedb.org/t/p/w154/bngHRFi794mnMq34gfVcm9nDxN1.png', providerIds: [350], networkIds: [2552] },
    { name: 'Showtime', logo_path: 'https://media.themoviedb.org/t/p/w154/Allse9kbjiP6ExaQrnSpIhkurEi.png', providerIds: [67], networkIds: [67] },
    { name: 'Starz', logo_path: 'https://media.themoviedb.org/t/p/w154/GMDGZk9iDG4WDijY3VgUgJeyus.png', providerIds: [43], networkIds: [318] },
    { name: 'Crunchyroll', logo_path: 'https://media.themoviedb.org/t/p/w154/qqyXcZlJQKlRmAD1TCKV7mGLQlt.png', providerIds: [283] },
    { name: 'Viu', logo_path: 'https://media.themoviedb.org/t/p/w154/q2nugloW9BDdW9YzmRbemdb9cNn.png', providerIds: [1045], networkIds: [5972, 3547, 4597, 2980, 3174, 7001, 7648, 7237, 2146] },
    { name: 'Youku', logo_path: 'https://media.themoviedb.org/t/p/w154/w2TeR3fvPZ9a617tNIF1oOfyPtk.png', providerIds: [353], networkIds: [1419] },
    { name: 'Bilibili', logo_path: 'https://media.themoviedb.org/t/p/w154/mtmMg3PD4YGfrlmqpEiO6NL2ch9.png', providerIds: [456], networkIds: [1605, 8576] },
    { name: 'iQIYI', logo_path: 'https://media.themoviedb.org/t/p/w154/ewwmht0dJZVia8gvmmf3rKSZynF.png', providerIds: [119], networkIds: [1330, 6316, 7737] },
    { name: 'TencentVideo', logo_path: 'https://media.themoviedb.org/t/p/w154/6Lfll43wYG2eyereOBjpYFRSGs4.png', providerIds: [188], networkIds: [2007] },
    // Networks Only
    { name: 'CBS', logo_path: 'https://media.themoviedb.org/t/p/w154/wju8KhOUsR5y4bH9p3Jc50hhaLO.png', networkIds: [16] },
    { name: 'NBC', logo_path: 'https://media.themoviedb.org/t/p/w154/cm111bsDVlYaC1foL0itvEI4yLG.png', networkIds: [6] },
    { name: 'ABC', logo_path: 'https://media.themoviedb.org/t/p/w154/2uy2ZWcplrSObIyt4x0Y9rkG6qO.png', networkIds: [2] },
    { name: 'Fox', logo_path: 'https://media.themoviedb.org/t/p/w154/1DSpHrWyOORkL9N2QHX7Adt31mQ.png', networkIds: [19] },
    { name: 'AMC', logo_path: 'https://media.themoviedb.org/t/p/w154/pmvRmATOCaDykE6JrVoeYxlFHw3.png', networkIds: [174] },
    { name: 'BBC', logo_path: 'https://media.themoviedb.org/t/p/w154/imf3gQOupRLdbwRC6FalEovuAPS.png', networkIds: [4] },
    { name: 'TheCW', logo_path: 'https://media.themoviedb.org/t/p/w154/hEpcdJ4O6eitG9ADSnDXNUrlovS.png', networkIds: [71] },
    { name: 'MGMPlus', logo_path: 'https://media.themoviedb.org/t/p/w154/89TXvQzvoKvyqD9EEogohzMJ8D6.png', networkIds: [6219] },
    { name: 'tvN', logo_path: 'https://media.themoviedb.org/t/p/w154/aRDq8zBrX3YLpHSfueNQBkNnn7b.png', networkIds: [866] },
    { name: 'JTBC', logo_path: 'https://media.themoviedb.org/t/p/w154/44I4aVlasm8Blb8WPGXTkMYuZJF.png', networkIds: [885] },
    { name: 'SBS', logo_path: 'https://media.themoviedb.org/t/p/w154/uHQFPvRTlpgaIFQVN8eKWEnFOll.png', networkIds: [156] },
    { name: 'MBC', logo_path: 'https://media.themoviedb.org/t/p/w154/pOSCKaZhndUFYtxHXjQOV6xJi1s.png', networkIds: [97, 2440, 2513, 1234, 3264] },
    { name: 'KBS2', logo_path: 'https://media.themoviedb.org/t/p/w154/nFmWwUAf2D3iAtizUcmkxufaM0q.png', networkIds: [18, 1923, 342, 2459, 2772, 4866, 1137, 829, 1796] },
];

const DiscoverPage: React.FC<DiscoverPageProps> = ({ onSelectMovie, myList, onToggleMyList, location, navigate }) => {
  const [movieGenresList, setMovieGenresList] = useState<GenreItem[]>([]);
  const [tvGenresList, setTvGenresList] = useState<GenreItem[]>([]);
  const [countriesList, setCountriesList] = useState<CountryItem[]>([]);
  const [discoverResults, setDiscoverResults] = useState<Movie[]>([]);
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const networksRowRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const type = (params.get('type') as 'movie' | 'tv' | 'all') || 'all';
    const sortBy = params.get('sortBy') || 'popularity.desc';
    const genres = params.get('genres');
    const selectedGenres = genres ? genres.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const country = params.get('country') || '';
    const year = params.get('year') || '';
    const networkName = params.get('network');
    const selectedNetwork = networksConfig.find(n => n.name === networkName) || null;
    return { type, sortBy, selectedGenres, country, year, selectedNetwork };
  }, [location.search]);

  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    const getFilterData = async () => {
      try {
        const [movies, tv, countries] = await Promise.all([
          fetchGenreList('movie'),
          fetchGenreList('tv'),
          fetchCountriesList(),
        ]);
        setMovieGenresList(movies);
        setTvGenresList(tv);
        setCountriesList(countries);
      } catch (e) {
        console.error("Error fetching filter data:", e);
      }
    };
    getFilterData();
  }, []);

  useEffect(() => {
    if (isFilterModalOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isFilterModalOpen]);

  const performFetch = useCallback(async (pageToFetch: number) => {
    try {
        const { type: discoverType, sortBy, selectedGenres, country, year, selectedNetwork } = debouncedFilters;

        const typesToFetch: ('movie' | 'tv')[] = discoverType === 'all' ? ['movie', 'tv'] : [discoverType];

        const fetchPromises = typesToFetch.map(type => {
            if (selectedNetwork) {
                const { providerIds, networkIds } = selectedNetwork;

                const providerPromise = (providerIds?.length ?? 0) > 0
                    ? fetchDiscoverResults(type, sortBy, selectedGenres, country, year, pageToFetch, providerIds, null)
                    : Promise.resolve({ results: [], totalPages: 0 });

                const networkPromise = (networkIds?.length ?? 0) > 0 && type === 'tv'
                    ? fetchDiscoverResults(type, sortBy, selectedGenres, country, year, pageToFetch, null, networkIds)
                    : Promise.resolve({ results: [], totalPages: 0 });
                
                return Promise.all([providerPromise, networkPromise]).then(([providerData, networkData]) => ({
                    type,
                    results: [...providerData.results, ...networkData.results],
                    totalPages: Math.max(providerData.totalPages, networkData.totalPages)
                }));
            } else {
                return fetchDiscoverResults(type, sortBy, selectedGenres, country, year, pageToFetch, null, null)
                    .then(data => ({ type, ...data }));
            }
        });

        const resultsPerType = await Promise.all(fetchPromises);
        let combinedResults: Movie[] = [];
        let maxTotalPages = 1;

        if (discoverType === 'all') {
            const movieData = resultsPerType.find(r => r.type === 'movie');
            const tvData = resultsPerType.find(r => r.type === 'tv');
            
            const movieResults = movieData?.results || [];
            const tvResults = tvData?.results || [];

            const interleaved = [];
            const len = Math.max(movieResults.length, tvResults.length);
            for (let i = 0; i < len; i++) {
                if (movieResults[i]) interleaved.push(movieResults[i]);
                if (tvResults[i]) interleaved.push(tvResults[i]);
            }
            combinedResults = interleaved;
            maxTotalPages = Math.max(movieData?.totalPages || 1, tvData?.totalPages || 1);
        } else {
            combinedResults = resultsPerType[0]?.results || [];
            maxTotalPages = resultsPerType[0]?.totalPages || 1;
        }

        const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());
        
        return { results: uniqueResults, totalPages: maxTotalPages };
    } catch (e) {
      console.error("Error fetching discover results:", e);
      return { results: [], totalPages: 1 };
    }
  }, [debouncedFilters]);
  
  useEffect(() => {
    const runSearch = async () => {
        setIsDiscoverLoading(true);
        const { results, totalPages } = await performFetch(1);
        setDiscoverResults(results);
        setDiscoverTotalPages(totalPages);
        setCurrentPage(1);
        setIsDiscoverLoading(false);
    };
    runSearch();
  }, [performFetch]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || currentPage >= discoverTotalPages) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const { results } = await performFetch(nextPage);

    setDiscoverResults(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const uniqueNewResults = results.filter(r => !existingIds.has(r.id));
      return [...prev, ...uniqueNewResults];
    });
    
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, currentPage, discoverTotalPages, performFetch]);

  useEffect(() => {
    if (isDiscoverLoading || !loaderRef.current) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !isLoadingMore && currentPage < discoverTotalPages) {
                handleLoadMore();
            }
        },
        { rootMargin: '400px' }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [isDiscoverLoading, isLoadingMore, currentPage, discoverTotalPages, handleLoadMore]);

  const updateUrlParams = useCallback((newParams: URLSearchParams) => {
    navigate(`/discover?${newParams.toString()}`, { replace: true });
  }, [navigate]);
  
  const handleFilterChange = (key: string, value: any) => {
    const params = new URLSearchParams(location.search);
    if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
    } else {
        params.set(key, String(value));
    }
    params.delete('page');
    updateUrlParams(params);
  };
  
  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.selectedGenres.includes(genreId)
      ? filters.selectedGenres.filter(id => id !== genreId)
      : [...filters.selectedGenres, genreId];
    handleFilterChange('genres', newGenres.join(','));
  };
  
  const handleTypeChange = (newType: 'movie' | 'tv' | 'all') => {
    const params = new URLSearchParams(location.search);
    if (newType === 'all') params.delete('type'); else params.set('type', newType);
    params.delete('genres');
    params.delete('page');
    updateUrlParams(params);
  };
  
  const handleResetFilters = () => {
    navigate('/discover', { replace: true });
  };

  const scrollProviders = (direction: 'left' | 'right') => {
    if (networksRowRef.current) {
        const { scrollLeft, clientWidth } = networksRowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
        networksRowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const typeOptions = [
      { label: 'Movies & TV Shows', value: 'all' },
      { label: 'Movies', value: 'movie' },
      { label: 'TV Shows', value: 'tv' },
  ];

  const sortOptions = [
      { label: "Popularity Descending", value: "popularity.desc" },
      { label: "Popularity Ascending", value: "popularity.asc" },
      { label: "Rating Descending", value: "vote_average.desc" },
      { label: "Rating Ascending", value: "vote_average.asc" },
      { label: "Release Date Descending", value: "primary_release_date.desc" },
      { label: "Release Date Ascending", value: "primary_release_date.asc" },
      { label: "Title (A-Z)", value: "original_title.asc" },
      { label: "Title (Z-A)", value: "original_title.desc" },
  ];
  
  const yearOptions = [{ label: 'All Years', value: '' }];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
      yearOptions.push({ label: year.toString(), value: year.toString() });
  }
  
  const countryOptions = [
      { label: 'All Countries', value: '' },
      ...countriesList.map(c => ({ label: `${c.english_name} (${c.iso_3166_1})`, value: c.iso_3166_1 }))
  ];

  const currentGenreList = useMemo(() => {
    if (filters.type === 'movie') return movieGenresList;
    if (filters.type === 'tv') return tvGenresList;
    const allGenres = [...movieGenresList, ...tvGenresList];
    return Array.from(new Map(allGenres.map(genre => [genre.name, genre])).values())
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [filters.type, movieGenresList, tvGenresList]);

  const genreOptions = currentGenreList.map(genre => ({ label: genre.name, value: genre.id }));
  
  interface FilterDropdownProps {
      label: string;
      value: string | number[];
      options: { label: string; value: string | number }[];
      onChange: (value: any) => void;
      multiSelect?: boolean;
      onToggle?: (value: number) => void;
      searchable?: boolean;
  }

  const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, multiSelect = false, onToggle, searchable = false }) => {
      const [isOpen, setIsOpen] = useState(false);
      const dropdownRef = useRef<HTMLDivElement>(null);
      const [searchTerm, setSearchTerm] = useState('');
      
      useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
              if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                  setIsOpen(false);
              }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);
      
      useEffect(() => {
          if (!isOpen) {
              setSearchTerm('');
          }
      }, [isOpen]);

      const filteredOptions = useMemo(() => {
          if (!searchable || !searchTerm) {
              return options;
          }
          return options.filter(option =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }, [options, searchTerm, searchable]);

      const selectedLabel = useMemo(() => {
          if (multiSelect) {
              if (Array.isArray(value) && value.length > 0) {
                  const selectedOptions = options
                    .filter(opt => value.includes(Number(opt.value)))
                    .map(opt => opt.label);
                  if (selectedOptions.length > 2) {
                      return `${selectedOptions.slice(0, 2).join(', ')}...`;
                  }
                  return selectedOptions.join(', ') || 'All Genres';
              }
              return `All Genres`;
          }
          return options.find(opt => opt.value === value)?.label || '';
      }, [value, options, multiSelect]);

      return (
          <div className="relative" ref={dropdownRef}>
              <div
                  onClick={() => setIsOpen(!isOpen)}
                  className={`flex items-center justify-between w-full p-3 bg-[#2d2d2d] rounded-lg cursor-pointer h-[60px] transition-all duration-200 hover:bg-[#3f3f3f] ${isOpen ? 'ring-2 ring-white/50' : 'ring-0 ring-transparent'}`}
              >
                  <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <span className="font-semibold">{selectedLabel}</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              {isOpen && (
                   <div className="absolute top-full mt-2 w-full bg-[#1f1f1f] rounded-lg shadow-lg z-20 animate-fade-scale-in flex flex-col">
                      {searchable && (
                          <div className="p-2 border-b border-white/10">
                              <div className="relative">
                                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                      type="text"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      placeholder={`Search ${label}...`}
                                      className="w-full bg-[#2d2d2d] border-0 rounded-md focus:ring-1 focus:ring-white/50 text-white py-2 pl-9 pr-3 text-sm"
                                      onClick={(e) => e.stopPropagation()}
                                  />
                              </div>
                          </div>
                      )}
                      <ul className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredOptions.length > 0 ? filteredOptions.map(option => {
                              const isSelected = (multiSelect && Array.isArray(value) && value.includes(Number(option.value))) || (!multiSelect && value === option.value);
                              return (
                                  <li
                                      key={option.value}
                                      onClick={() => {
                                          if(multiSelect && onToggle) {
                                              onToggle(option.value as number);
                                          } else {
                                              onChange(option.value);
                                              setIsOpen(false);
                                          }
                                      }}
                                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${
                                          isSelected 
                                              ? 'bg-white/10 text-white font-semibold' 
                                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                      }`}
                                  >
                                      <span>{option.label}</span>
                                      {isSelected && <CheckIcon className="w-5 h-5 text-white" />}
                                  </li>
                              );
                          }) : (
                               <li className="px-4 py-3 text-gray-400 text-sm">No results found.</li>
                          )}
                      </ul>
                   </div>
              )}
          </div>
      );
  };

  const renderFilterControls = () => (
    <>
      <FilterDropdown 
          label="Type"
          value={filters.type}
          options={typeOptions}
          onChange={handleTypeChange}
      />
      <FilterDropdown 
          label="Sort By"
          value={filters.sortBy}
          options={sortOptions}
          onChange={(v: string) => handleFilterChange('sortBy', v)}
      />
       <FilterDropdown 
          label="Genres"
          value={filters.selectedGenres}
          options={genreOptions}
          onChange={() => {}}
          multiSelect
          onToggle={handleGenreToggle}
      />
       <FilterDropdown 
          label="Country"
          value={filters.country}
          options={countryOptions}
          onChange={(v: string) => handleFilterChange('country', v)}
          searchable
      />
       <FilterDropdown 
          label="Year"
          value={filters.year}
          options={yearOptions}
          onChange={(v: string) => handleFilterChange('year', v)}
          searchable
      />
       <button
          onClick={handleResetFilters}
          className="w-full h-[60px] bg-[#2d2d2d] text-white rounded-lg hover:bg-[#3f3f3f] transition-colors font-semibold flex items-center justify-center"
      >
          Reset Filters
      </button>
    </>
  );

  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
            <h1 className="text-lg md:text-2xl font-bold">Discover</h1>
        </div>
        
        {/* Streaming Platforms Bar */}
        <div className="mb-12">
            <div className="group/row relative">
                 <button
                    aria-label="Scroll providers left"
                    onClick={() => scrollProviders('left')}
                    className="hidden md:block absolute top-0 bottom-0 -left-4 z-40 my-auto h-9 w-9 cursor-pointer text-white opacity-0 transition hover:scale-125 group-hover/row:opacity-100"
                >
                    <ChevronLeftIcon className="w-full h-full" />
                </button>
                <div ref={networksRowRef} className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
                    {networksConfig.map((network) => {
                        const isSelected = filters.selectedNetwork?.name === network.name;
                        const isTvOnlyNetwork = !network.providerIds || network.providerIds.length === 0;
                        const isDisabled = isTvOnlyNetwork && filters.type === 'movie';

                        return (
                            <div
                                key={network.name}
                                title={isDisabled ? `${network.name} (TV only - Select TV or "Movies & TV Shows" to enable)` : network.name}
                                onClick={() => !isDisabled && handleFilterChange('network', isSelected ? null : network.name)}
                                className={`group flex-shrink-0 w-44 h-28 bg-white rounded-lg flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
                                    isDisabled
                                        ? 'opacity-50 grayscale cursor-not-allowed'
                                        : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                                } ${
                                    isSelected 
                                        ? 'scale-105 shadow-2xl'
                                        : (filters.selectedNetwork ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : '')
                                }`}
                            >
                                <img 
                                    src={network.logo_path} 
                                    alt={network.name} 
                                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ${!isDisabled ? 'group-hover:scale-110' : ''}`}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        );
                    })}
                </div>
                 <button
                    aria-label="Scroll providers right"
                    onClick={() => scrollProviders('right')}
                    className="hidden md:block absolute top-0 bottom-0 -right-4 z-40 my-auto h-9 w-9 cursor-pointer text-white opacity-0 transition hover:scale-125 group-hover/row:opacity-100"
                >
                    <ChevronRightIcon className="w-full h-full" />
                </button>
            </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {renderFilterControls()}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-8">
            <button
                onClick={() => setIsFilterModalOpen(true)}
                className="w-full h-[50px] bg-[#2d2d2d] text-white rounded-lg hover:bg-[#3f3f3f] transition-colors font-semibold flex items-center justify-center gap-2"
            >
                <FilterIcon className="w-5 h-5" />
                <span>Filters</span>
            </button>
        </div>

        {/* Mobile Filter Modal */}
        {isFilterModalOpen && (
            <div 
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-scale-in"
                onClick={() => setIsFilterModalOpen(false)}
            >
                <div 
                    className="bg-[#1f1f1f] rounded-xl shadow-2xl w-full max-w-md m-4 border border-zinc-700 flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-zinc-700 flex-shrink-0">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button onClick={() => setIsFilterModalOpen(false)} className="text-zinc-400 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderFilterControls()}
                        </div>
                    </div>
                    <div className="p-4 border-t border-zinc-700 flex-shrink-0">
                        <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="w-full h-[50px] bg-[var(--brand-color)] text-white rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors font-bold"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isDiscoverLoading ? (
           <div className="flex justify-center items-center p-4 min-h-[40vh]">
                <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : (
            <>
                {discoverResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {discoverResults.map((movie) => (
                          <MovieCard 
                              key={`${movie.id}-${filters.type}`} 
                              movie={movie} 
                              onSelectMovie={onSelectMovie}
                              onToggleMyList={onToggleMyList}
                              isAdded={myList.some(item => item.id === movie.id)}
                              display="poster" 
                          />
                      ))}
                  </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-400">No results found for your filters.</p>
                        <p className="text-gray-500">Try adjusting your selection.</p>
                    </div>
                )}
                
                {discoverResults.length > 0 && currentPage < discoverTotalPages && (
                  <div ref={loaderRef} className="mt-12 text-center h-20 flex items-center justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}
            </>
        )}
    </div>
  );
}

export default DiscoverPage;