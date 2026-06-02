export type SearchContentType = 'learning_path' | 'module' | 'learning_unit'

/**
 * Request za search.
 *
 * Pri trenutnem backend endpointu se query in types pošiljata kot query parametra,
 * ampak tip ostane uporaben za frontend state in filtre.
 */
export type SearchRequest = {
	query: string
	types: SearchContentType[]
}

/**
 * Search rezultat iz starejše/natančnejše backend sheme.
 *
 * Uporablja short_description.
 */
export type SearchResultResponse = {
	id: string
	type: SearchContentType
	title: string
	short_description?: string | null
	keywords: string[]
}

/**
 * Search rezultat iz novejše normalizirane backend sheme.
 *
 * Uporablja description namesto short_description.
 */
export type SearchResult = {
	id: string
	type: SearchContentType
	title: string
	description?: string | null
	keywords: string[]
}

/**
 * Response za search endpoint.
 *
 * Backend naj bi idealno vračal query, types in results.
 * Ker pa trenutna backend shema spodaj povozi prvo SearchResponse definicijo,
 * sta query in types tukaj označena kot optional.
 */
export type SearchResponse = {
	query?: string
	types?: SearchContentType[]
	results: SearchResult[]
}

/**
 * Tip, ki ga lahko uporablja UI po mapiranju backend rezultata.
 *
 * Uporablja camelCase, da je bolj primeren za React komponente.
 */
export type SearchUiResult = {
	id: string
	type: SearchContentType
	title: string
	shortDescription: string
	keywords: string[]
}

export type AdvancedSearchFilters = {
	query: string
	types: SearchContentType[]
}

export type PaginatedSearchResults = {
	results: SearchUiResult[]
	total: number
	page: number
	totalPages: number
}