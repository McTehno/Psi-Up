import { useCallback, useEffect, useState } from 'react'
import type { SearchResult } from '../types/domain'
import { performSearch } from '../services/search-service'
import type { SearchContentType } from '../types/search'

type AdvancedFiltersState = {
  query: string
  types: SearchContentType[]
}

const defaultActiveFilters: SearchContentType[] = ['learning_path']

export function useSearch() {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [activeFilters, setActiveFilters] = useState<SearchContentType[]>(defaultActiveFilters)

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    query: '',
    types: [],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const toggleFilter = useCallback((value: SearchContentType) => {
    setActiveFilters((previousFilters) => {
      if (previousFilters.includes(value)) {
        return previousFilters.filter((filter) => filter !== value)
      }
      return [...previousFilters, value]
    })
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        const data = await performSearch({
          query: searchQuery,
          types: activeFilters
        })

        // Cast SearchUiResult to SearchResult for compatibility with the homepage components
        setSearchResults(data.results as unknown as SearchResult[])
      } catch (error) {
        console.error('Failed to fetch search results', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery, activeFilters])

  return {
    isSearchActive,
    setIsSearchActive,
    activeFilters,
    toggleFilter,
    advancedFilters,
    setAdvancedFilters,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
  }
}

