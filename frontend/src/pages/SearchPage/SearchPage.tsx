import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchFilters } from '../../features/search/components/SearchFilters';
import { SearchResultCard } from '../../features/search/components/SearchResultCard';
import type { AdvancedSearchFilters, PaginatedSearchResults, SearchContentType, SearchUiResult } from '../../types/search';
import { performSearch } from '../../services/search-service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePageTitle } from '../../hooks/usePageTitle';
export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    usePageTitle('Iskanje | NIDiKo');

    // Uporabimo debounce na query stringu, da ne requestamo ob vsakem pritisku na tipko
    const initialQuery = searchParams.get('q') || '';
    const initialTypes = searchParams.getAll('type') as SearchContentType[];
    
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 500);
    
    const [filters, setFilters] = useState<AdvancedSearchFilters>({
        query: initialQuery,
        types: initialTypes.length > 0 ? initialTypes : []
    });

    const [results, setResults] = useState<PaginatedSearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(10);

    // Sinhronizacija debounced inputa v filter state
    useEffect(() => {
        setFilters((prev: AdvancedSearchFilters) => ({ ...prev, query: debouncedQuery }));
    }, [debouncedQuery]);

    // Glavni iskalni učinek
    useEffect(() => {
        const fetchResults = async () => {


            try {
                setIsLoading(true);
                setError(null);
                const data = await performSearch(filters);
                setResults(data);
                setVisibleCount(10);
                
                // Posodobimo URL parametre (push state)
                const newParams = new URLSearchParams();
                if (filters.query) newParams.set('q', filters.query);
                filters.types.forEach((t: string) => newParams.append('type', t));
                setSearchParams(newParams, { replace: true });
                
            } catch (err: unknown) {
                console.error("Iskanje neuspešno:", err);
                setError("Prišlo je do napake pri iskanju. Prosimo, poskusite znova.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [filters, setSearchParams]);

    const handleFilterChange = (newFilters: AdvancedSearchFilters) => {
        setFilters(newFilters);
    };

    const handleResultClick = (result: SearchUiResult) => {
        if (result.type === 'learning_path') {
            navigate(`/learning-paths/${result.id}`);
        } else if (result.type === 'module') {
            navigate(`/modules/${result.id}`);
        } else if (result.type === 'learning_unit') {
            navigate(`/learning-units/${result.id}`);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24">
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-bold text-brown-900 mb-4">
                        Napredno iskanje
                    </h1>
                    <p className="text-lg text-brown-600 max-w-2xl">
                        Uporabite napredne filtre za natančnejše iskanje po učnih poteh, modulih in enotah.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Linija filtrov (leva stran) */}
                    <div className="w-full lg:w-1/4 flex-shrink-0">
                        <SearchFilters filters={filters} onChange={handleFilterChange} />
                    </div>

                    {/* Rezultati (desna stran) */}
                    <div className="w-full lg:w-3/4 flex flex-col gap-6">
                        
                        {/* Iskalno okno */}
                        <div className="relative flex items-center w-full max-w-2xl">
                            <SearchIcon className="absolute left-4 h-5 w-5 text-brown-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Iščite po ključnih besedah, naslovih, opisih..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-sand-200 bg-white text-brown-900 placeholder:text-brown-400 focus:ring-2 focus:ring-forest-500 shadow-sm transition-shadow text-lg"
                                autoFocus
                            />
                            {isLoading && (
                                <button className="absolute right-4 p-2">
                                    <Loader2 className="h-5 w-5 text-forest-500 animate-spin" />
                                </button>
                            )}
                        </div>

                        {/* Status / Napake / Prazno stanje */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
                                {error}
                            </div>
                        )}
                        
                        {!isLoading && !error && results && results.results.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-sand-200 border-dashed">
                                <SearchIcon className="h-12 w-12 text-sand-400 mb-4" />
                                <h3 className="text-xl font-display font-semibold text-brown-900 mb-2">
                                    Ni zadetkov
                                </h3>
                                <p className="text-brown-500 max-w-md">
                                    Poskusite spremeniti iskalne pogoje ali uporabiti drugačne filtre za boljše rezultate.
                                </p>
                            </div>
                        )}

                        {/* Seznam rezultatov */}
                        {!error && results && results.results.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <div className="text-sm font-medium text-brown-500 mb-2">
                                    Prikazujem {Math.min(visibleCount, results.results.length)} od {results.total} rezultatov
                                </div>
                                <AnimatePresence mode="popLayout">
                                    {results.results.slice(0, visibleCount).map((result: SearchUiResult, index: number) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: index >= visibleCount - 10 ? (index % 10) * 0.05 : 0 }}
                                            layout
                                        >
                                            <SearchResultCard 
                                                result={result as SearchUiResult} // temporary fix zaradi "dummy" properties
                                                onClick={handleResultClick}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                {visibleCount < results.results.length && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-sand-200 text-brown-600 font-medium hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <SearchIcon className="w-4 h-4" />
                                        Naloži več rezultatov
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}






