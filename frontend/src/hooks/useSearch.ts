import { useState, useEffect, useCallback } from 'react'
import type {SearchResult}  from "../types/domain";
import { searchFilters } from '../pages/LandingPage/constants';

export function useSearch() {
	const [isSearchActive, setIsSearchActive] = useState(false)
	const [activeFilters, setActiveFilters] = useState<string[]>(['Vse'])
	// Naprednejši filtri - Placeholder za prihodnost
	const [advancedFilters, setAdvancedFilters] = useState<any>({
		query: '',
		types: []
	})

	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)

	const toggleFilter = useCallback((label: string) => {
		if (label === 'Vse') {
			setActiveFilters(['Vse']);
			return;
		}

		setActiveFilters(prev => {
			let next = prev.filter(f => f !== 'Vse');
			if (next.includes(label)) {
				next = next.filter(f => f !== label);
				return next.length === 0 ? ['Vse'] : next;
			} else {
				if (next.length >= 2) {
					next = next.slice(1);
				}
				return [...next, label];
			}
		});
	}, []);

	// Poslušanja za enostavno iskanje
	useEffect(() => {
		if (!searchQuery) {
			return
		}
		const timeoutId = setTimeout(async () => {
			setIsSearching(true)
			try {
				let types: string[] = [];
				if (!activeFilters.includes('Vse')) {
					types = searchFilters
                        .filter(f => activeFilters.includes(f.label) && f.value)
                        .map(f => f.value as string);
				}

				const urlParams = new URLSearchParams();
				if (searchQuery) urlParams.append('query', searchQuery);
				types.forEach(t => urlParams.append('types', t));
				
				const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/search?${urlParams.toString()}`);
				if (!response.ok) throw new Error('Network response was not ok');
				const data = await response.json();
				
				// Map snake case to camel case
				const mappedData = (data.results || []).map((item: any) => ({
					...item,
					shortDescription: item.short_description
				}));

				setSearchResults(mappedData);
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