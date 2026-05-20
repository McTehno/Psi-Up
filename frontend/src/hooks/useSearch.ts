import { useState, useEffect, useCallback } from 'react'
import type {SearchResult}  from "../types/domain";
import { searchFilters } from '../pages/LandingPage/constants';

export function useSearch() {
	const [isSearchActive, setIsSearchActive] = useState(false)
	const [activeFilters, setActiveFilters] = useState<string[]>([searchFilters[0].label])
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)

	const toggleFilter = useCallback((label: string) => {
		if (label === 'Vse') {
			setActiveFilters(['Vse']);
			return;
		}

		setActiveFilters(prev => {
			// Remove 'Vse' if a specific filter is clicked
			let next = prev.filter(f => f !== 'Vse');
			
			if (next.includes(label)) {
				// Deselect the filter
				next = next.filter(f => f !== label);
				// If nothing is selected anymore, revert to 'Vse'
				return next.length === 0 ? ['Vse'] : next;
			} else {
				// Select the new filter (enforcing a max layout of 2 specific filters)
				if (next.length >= 2) {
					next = next.slice(1); // Drop the oldest selected filter to make room
				}
				return [...next, label];
			}
		});
	}, []);

	useEffect(() => {
		if (!searchQuery) {
			return
		}
		const timeoutId = setTimeout(async () => {
			setIsSearching(true)
			try {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
				let url = `${baseUrl}/api/search?query=${encodeURIComponent(searchQuery)}`
				
				if (!activeFilters.includes('Vse')) {
					const activeDefs = searchFilters.filter(f => activeFilters.includes(f.label) && f.value);
					activeDefs.forEach(def => {
						url += `&types=${def.value}`
					});
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
	}, [searchQuery, activeFilters])

	return {
		isSearchActive,
		setIsSearchActive,
		activeFilters,
		toggleFilter,
		searchQuery,
		setSearchQuery,
		searchResults,
		setSearchResults,
		isSearching,
	}
}