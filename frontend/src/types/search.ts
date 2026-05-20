export type SearchContentType = 'learning_path' | 'module' | 'learning_unit'

export type SearchRequest = {
  query: string
  types: SearchContentType[]
}

export type SearchResultResponse = {
  id: string
  type: SearchContentType
  title: string
  short_description?: string | null
  keywords: string[]
}

export type SearchResponse = {
  query: string
  types: SearchContentType[]
  results: SearchResultResponse[]
}

// Mapped result type used in the UI (camelCase + optional metadata)
export type SearchResult = {
  id: string
  type: SearchContentType
  title: string
  shortDescription?: string | null
  keywords: string[]
}

export type AdvancedSearchFilters = {
  query: string
  types: SearchContentType[]
}

export type PaginatedSearchResults = {
  results: SearchResult[]
  total: number
  page: number
  totalPages: number
}
