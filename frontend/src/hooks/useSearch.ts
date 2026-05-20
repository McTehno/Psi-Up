import { useState, useEffect } from 'react'
import { SearchResult } from '../../types/domain'

export function useSearch() {
	const [isSearchActive, setIsSearchActive] = useState(false)
	const [activeFilter, setActiveFilter] = useState('Vse')
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
				let url = `http://localhost:8000/api/search?query=${encodeURIComponent(searchQuery)}`
				if (activeFilter === 'Moduli') {
					url += `&types=module`
				} else if (activeFilter === 'Učne poti') {
					url += `&types=learning_path`
				} else if (activeFilter === 'Učne enote') {
					url += `&types=learning_unit`
				}

				const response = await fetch(url)
				const data = await response.json()
				if (data.results) {
					setSearchResults(data.results)
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