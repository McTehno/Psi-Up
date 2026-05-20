import { apiGet } from './api-client'
import type {
  SearchContentType,
  SearchResponse,
} from '../types/search'

export async function searchContent(
  query: string,
  types: SearchContentType[] = []
): Promise<SearchResponse> {
  const params = new URLSearchParams()
  params.set('query', query)

  types.forEach((type) => {
    params.append('types', type)
  })

  return apiGet<SearchResponse>(`/search?${params.toString()}`)
}

// New helper to support the frontend AdvancedSearchPage and existing quick search.
import type { AdvancedSearchFilters, PaginatedSearchResults, SearchResult } from '../types/search'

export async function performSearch(filters: AdvancedSearchFilters): Promise<PaginatedSearchResults> {
  const resp = await searchContent(filters.query, filters.types as SearchContentType[])

  const mapped = (resp.results || []).map((r) => {
    const mappedItem: SearchResult = {
      id: r.id,
      type: r.type,
      title: r.title,
      shortDescription: r.short_description ?? undefined,
      keywords: r.keywords || [],
    }
    return mappedItem
  })

  return {
    results: mapped,
    total: mapped.length,
    page: 1,
    totalPages: 1,
  }
}