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