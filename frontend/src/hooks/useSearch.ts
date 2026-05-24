import { useCallback, useEffect, useState } from 'react'
import type { SearchResult } from '../types/domain'
import { searchFilters } from '../pages/HomePage/constants'

type SearchFilterOption = (typeof searchFilters)[number]

type AdvancedFiltersState = {
  query: string
  types: string[]
}

export function useSearch() {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>(['Vse'])

  // Naprednejši filtri - placeholder za prihodnost
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    query: '',
    types: [],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const toggleFilter = useCallback((label: string) => {
    if (label === 'Vse') {
      setActiveFilters(['Vse'])
      return
    }

    setActiveFilters((previousFilters) => {
      let nextFilters = previousFilters.filter((filter) => filter !== 'Vse')

      if (nextFilters.includes(label)) {
        nextFilters = nextFilters.filter((filter) => filter !== label)
        return nextFilters.length === 0 ? ['Vse'] : nextFilters
      }

      if (nextFilters.length >= 2) {
        nextFilters = nextFilters.slice(1)
      }

      return [...nextFilters, label]
    })
  }, [])

  useEffect(() => {


    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        let types: string[] = []

        if (!activeFilters.includes('Vse')) {
          types = searchFilters
            .filter(
              (filter: SearchFilterOption) =>
                activeFilters.includes(filter.label) && filter.value !== null
            )
            .map((filter: SearchFilterOption) => filter.value as string)
        }

        const urlParams = new URLSearchParams()
        urlParams.append('query', searchQuery)

        types.forEach((type) => {
          urlParams.append('types', type)
        })

        const apiBaseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:8000'

        const response = await fetch(
          `${apiBaseUrl}/api/search?${urlParams.toString()}`
        )

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()

        const mappedData: SearchResult[] = (data.results || []).map(
          (item: SearchResult & { short_description?: string }) => ({
            ...item,
            shortDescription: item.short_description,
          })
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