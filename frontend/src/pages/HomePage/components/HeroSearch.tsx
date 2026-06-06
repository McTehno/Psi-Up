import { Search as SearchIcon, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import type { SearchResult, SearchContentType } from '../../../types/search'
import { searchFilters } from '../constants'

type HeroSearchProps = {
	isSearchActive: boolean
	setIsSearchActive: (isActive: boolean) => void
	activeFilters: SearchContentType[]
	toggleFilter: (filter: SearchContentType) => void
	searchQuery: string
	setSearchQuery: (query: string) => void
}

function HeroSearch({
	isSearchActive,
	setIsSearchActive,
	activeFilters,
	toggleFilter,
	searchQuery,
	setSearchQuery,
}: HeroSearchProps) {
	return (
		<motion.div
			className="relative z-50 mb-8 max-w-sm"
			animate={{ scale: isSearchActive ? 1.05 : 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			style={{ transformOrigin: 'left center' }}
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
					}}
					value={searchQuery}
					onChange={(event) => {
						setSearchQuery(event.target.value)
					}}
				/>

				<AnimatePresence>
					{isSearchActive && (
						<motion.button
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							type="button"
							onClick={() => {
								setIsSearchActive(false)
								setSearchQuery('')
							}}
							className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#706b60] transition hover:text-[#111111]"
							aria-label="Zapri iskanje"
						>
							<XIcon className="h-5 w-5" />
						</motion.button>
					)}
				</AnimatePresence>
			</div>

			<AnimatePresence>
				{isSearchActive && (
					<motion.div
						initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
						transition={{ type: 'spring', stiffness: 400, damping: 25 }}
						className="absolute left-0 right-0 top-full mt-4 flex origin-top gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:whitespace-normal"
					>
						{searchFilters.map((filter) => (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="button"
								key={filter.label}
								onClick={() => toggleFilter(filter.value)}
								className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
									activeFilters.includes(filter.value)
										? 'border-[#31583b] bg-[#31583b] text-white hover:bg-[#274a31]'
										: 'border-[#eadfce] bg-white text-[#706b60] hover:bg-[#fff6eb]'
								}`}
							>
								{filter.label}
							</motion.button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

export default HeroSearch


