import { Search as SearchIcon, X as XIcon } from 'lucide-react'

import { searchFilters } from '../constants'

type HeroSearchProps = {
	isSearchActive: boolean
	setIsSearchActive: (isActive: boolean) => void
	activeFilters: string[]
	toggleFilter: (filter: string) => void
	searchQuery: string
	setSearchQuery: (query: string) => void
	setSearchResults: (results: never[]) => void
}

function HeroSearch({
	isSearchActive,
	setIsSearchActive,
	activeFilters,
	toggleFilter,
	searchQuery,
	setSearchQuery,
	setSearchResults,
}: HeroSearchProps) {
	return (
		<div
			className={`relative z-50 mb-8 max-w-sm transition-all duration-500 ease-in-out ${
				isSearchActive ? 'scale-105 origin-left' : ''
			}`}
		>
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<SearchIcon className="h-5 w-5 text-[#706b60]" />
				</div>

				<input
					type="text"
					placeholder="Kaj se hočete naučiti?"
					className="w-full rounded-2xl border border-[#eadfce] bg-[#fffdf8] py-3 pl-12 pr-12 text-sm text-[#111111] shadow-sm transition-all duration-300 placeholder:text-[#706b60] focus:border-[#31583b] focus:outline-none focus:ring-1 focus:ring-[#31583b]"
					onFocus={() => {
						setIsSearchActive(true)
						window.scrollTo({ top: 0, behavior: 'smooth' })
					}}
					value={searchQuery}
					onChange={(event) => {
						setSearchQuery(event.target.value)
					}}
				/>

				{isSearchActive && (
					<button
						type="button"
						onClick={() => {
							setIsSearchActive(false)
							setSearchQuery('')
							setSearchResults([])
						}}
						className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#706b60] transition hover:text-[#111111]"
						aria-label="Zapri iskanje"
					>
						<XIcon className="h-5 w-5" />
					</button>
				)}
			</div>

			<div
				className={`absolute left-0 right-0 top-full mt-4 flex origin-top flex-wrap gap-2 transition-all duration-500 ease-in-out ${
					isSearchActive
						? 'visible translate-y-0 opacity-100'
						: 'invisible -translate-y-4 opacity-0'
				}`}
			>
				{searchFilters.map((filter) => (
					<button
						type="button"
						key={filter.label}
						onClick={() => toggleFilter(filter.label)}
						className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
							activeFilters.includes(filter.label)
								? 'border-[#31583b] bg-[#31583b] text-white hover:bg-[#274a31]'
								: 'border-[#eadfce] bg-white text-[#706b60] hover:bg-[#fff6eb]'
						}`}
					>
						{filter.label}
					</button>
				))}
			</div>
		</div>
	)
}

export default HeroSearch