import { useState, useEffect } from 'react'
import type {SearchResult}  from "../types/domain";
import { searchFilters } from '../pages/LandingPage/constants';

export function useSearch() {
	const [isSearchActive, setIsSearchActive] = useState(false)
	const [activeFilter, setActiveFilter] = useState(searchFilters[0].label)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)

	useEffect(() => {
		if (!searchQuery) {
			return
		}
		const timeoutId = setTimeout(async () => {
			setIsSearching(true)
			try {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
				let url = `${baseUrl}/api/search?query=${encodeURIComponent(searchQuery)}`
				
				const filterDef = searchFilters.find(f => f.label === activeFilter);
				if (filterDef && filterDef.value) {
					url += `&types=${filterDef.value}`
				}

				const response = await fetch(url)
				const data = await response.json()
				if (data.results) {
					// Map snake_case from backend to camelCase for frontend, makes sense for constant naming (db uses snake_case, frontend uses camelCase)
					const mappedResults = data.results.map((r: any) => ({
						...r,
						shortDescription: r.short_description
					}));
					setSearchResults(mappedResults)
				}
			} catch (error) {
				console.error('Failed to fetch search results', error)
			} finally {
				setIsSearching(false)
			}
		}, 300)
		return () => clearTimeout(timeoutId)
	}, [searchQuery, activeFilter])

	return {
		isSearchActive,
		setIsSearchActive,
		activeFilter,
		setActiveFilter,
		searchQuery,
		setSearchQuery,
		searchResults,
		setSearchResults,
		isSearching,
	}
}