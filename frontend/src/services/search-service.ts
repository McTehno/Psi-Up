import { apiGet } from './api-client'
import type { SearchResult } from '../types/domain'

export type SearchContentType = 'learning_path' | 'module' | 'learning_unit'

export type SearchResponse = {
  query: string
  results: SearchResult[]
}

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