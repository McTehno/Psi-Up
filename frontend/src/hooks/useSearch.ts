import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [hasSearched, setHasSearched] = useState(false)
  const searchRequestIdRef = useRef(0)

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
    const query = searchQuery.trim()

    searchRequestIdRef.current += 1
    const requestId = searchRequestIdRef.current

    setIsSearching(true)
    setHasSearched(false)

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await performSearch({
          query,
          types: activeFilters,
        })

        if (requestId !== searchRequestIdRef.current) {
          return
        }

        setSearchResults(data.results as unknown as SearchResult[])
        setHasSearched(true)
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) {
          return
        }

        console.error('Failed to fetch search results', error)
        setSearchResults([])
        setHasSearched(true)
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false)
        }
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
    hasSearched,
  }
}

