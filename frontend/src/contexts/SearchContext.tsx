import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSearch } from '../hooks/useSearch';
// SearchContext provides global state for search functionality, allowing any component to access search state and actions without prop drilling.
const SearchContext = createContext<ReturnType<typeof useSearch> | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
    const search = useSearch();
    return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
}

export function useGlobalSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useGlobalSearch must be used within a SearchProvider');
    }
    return context;
}
