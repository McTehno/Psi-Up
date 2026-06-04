import type { ReactNode } from 'react'

import { useSearch } from '../hooks/useSearch'
import { SearchContext } from './search-context'

export function SearchProvider({ children }: { children: ReactNode }) {
  const search = useSearch()

  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  )
}

