import { apiGet } from './api-client'
import type {
	AdvancedSearchFilters,
	PaginatedSearchResults,
	SearchContentType,
	SearchResponse,
	SearchUiResult,
} from '../types/search'

export async function searchContent(
	query: string,
	types: SearchContentType[] = [],
): Promise<SearchResponse> {
	const params = new URLSearchParams()

	params.set('query', query)

	types.forEach((type) => {
		params.append('types', type)
	})

	return apiGet<SearchResponse>(`/search?${params.toString()}`)
}

export async function performSearch(
	filters: AdvancedSearchFilters,
): Promise<PaginatedSearchResults> {
	const response = await searchContent(filters.query, filters.types)

	const mappedResults: SearchUiResult[] = response.results.map((result) => {
		return {
			id: result.id,
			type: result.type,
			title: result.title,
			shortDescription: result.description ?? '',
			keywords: result.keywords,
		}
	})

	return {
		results: mappedResults,
		total: mappedResults.length,
		page: 1,
		totalPages: 1,
	}
}