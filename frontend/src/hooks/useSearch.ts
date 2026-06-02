import { useCallback, useEffect, useState } from 'react'

import type { SearchResult } from '../types/domain'
import { searchFilters } from '../pages/HomePage/constants'

type SearchFilterOption = (typeof searchFilters)[number]

type AdvancedFiltersState = {
  query: string
  types: string[]
}

const defaultActiveFilters = ['Učne poti']

export function useSearch() {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [activeFilters, setActiveFilters] =
    useState<string[]>(defaultActiveFilters)

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    query: '',
    types: [],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const toggleFilter = useCallback((label: string) => {
    setActiveFilters((previousFilters) => {
      if (previousFilters.includes(label)) {
        return previousFilters.filter((filter) => filter !== label)
      }

      return [...previousFilters, label]
    })
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        const types = searchFilters
          .filter((filter: SearchFilterOption) =>
            activeFilters.includes(filter.label),
          )
          .map((filter: SearchFilterOption) => filter.value)

        const urlParams = new URLSearchParams()
        urlParams.append("query", searchQuery);

        types.forEach((type) => {
          urlParams.append('types', type)
        })

        const apiBaseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:8000'

        const response = await fetch(
          `${apiBaseUrl}/api/search?${urlParams.toString()}`,
        )

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()

        const mappedData: SearchResult[] = (data.results || []).map(
          (item: SearchResult & { short_description?: string | null }) => ({
            ...item,
            shortDescription: item.short_description,
          }),
        )

        setSearchResults(mappedData)
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