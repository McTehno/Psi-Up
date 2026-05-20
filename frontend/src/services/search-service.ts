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