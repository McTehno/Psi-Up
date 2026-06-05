import { useContext } from 'react'

import { SearchContext } from '../contexts/search-context'

export function useGlobalSearch() {
  const context = useContext(SearchContext)

  if (!context) {
    throw new Error('useGlobalSearch must be used within a SearchProvider')
  }

  return context
}

