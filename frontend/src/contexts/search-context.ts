import { createContext } from 'react'

import type { useSearch } from '../hooks/useSearch'

export type SearchContextValue = ReturnType<typeof useSearch>

export const SearchContext = createContext<SearchContextValue | null>(null)

