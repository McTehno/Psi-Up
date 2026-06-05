import {
	ArrowRight as ArrowRightIcon,
	Circle as CircleIcon,
	CircleDot as DotIcon,
	Route as PathIcon,
} from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'

import type { SearchResult } from '../../../types/search'

type HeroSearchResultsProps = {
	isSearchActive: boolean
	searchQuery: string
	searchResults: SearchResult[]
	isSearching: boolean
	navigate: NavigateFunction
}

function HeroSearchResults({
	isSearchActive,
	searchQuery,
	searchResults,
	isSearching,
	navigate,
}: HeroSearchResultsProps) {
	return (
		<div
			className={`absolute inset-x-0 bottom-0 top-[96px] z-50 flex flex-col gap-4 pb-10 pr-2 transition-all duration-500 ease-in-out ${isSearchActive
				? 'visible translate-y-0 opacity-100'
				: 'invisible translate-y-8 opacity-0'
				}`}
		>
			{isSearchActive && (
				<div className="flex flex-col gap-3">
					{isSearching ? (
						<div className="flex h-32 animate-pulse items-center justify-center rounded-3xl border border-[#eadfce] bg-white/60 text-[#706b60] backdrop-blur-sm">
							Iščem...
						</div>
					) : (
						<>
							{searchResults.length > 0 ? (
								searchResults.slice(0, 3).map((result, index) => (
									<div
										key={result.id}
										onClick={() => {
											if (result.type === 'learning_path') {
												navigate(`/learning-paths/${result.id}`)
											} else if (result.type === 'module') {
												navigate(`/modules/${result.id}`)
											} else if (result.type === 'learning_unit') {
												navigate(`/learning-units/${result.id}`)
											}
										}}
										className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#31583b]/35 hover:shadow-md sm:flex-row"
										style={{
											animationDelay: `${index * 75}ms`,
											animationFillMode: 'both',
										}}
									>
										<div className="shrink-0">
											{result.type === 'learning_path' ? (
												<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
													<PathIcon className="h-6 w-6" />
												</span>
											) : result.type === 'module' ? (
												<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
													<CircleIcon className="h-6 w-6" />
												</span>
											) : (
												<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
													<DotIcon className="h-6 w-6" />
												</span>
											)}
										</div>

										<div className="w-full flex-1">
											<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
												<h3 className="font-display text-lg font-semibold tracking-tight text-[#111111] transition-colors group-hover:text-[#31583b]">
													{result.title}
												</h3>

												<span className="inline-flex shrink-0 items-center rounded-full bg-[#fff6eb] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#706b60]">
													{result.type === 'learning_path'
														? 'Učna pot'
														: result.type === 'module'
															? 'Modul'
															: 'Učna enota'}
												</span>
											</div>

											{result.description && (
												<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#706b60]">
													{result.description}
												</p>
											)}

											{result.keywords && result.keywords.length > 0 && (
												<div className="mt-3 flex flex-wrap gap-2">
													{result.keywords.slice(0, 3).map((keyword) => (
														<span
															key={keyword}
															className="rounded-md bg-[#f2f8f1] px-2 py-1 text-xs font-medium text-[#31583b]"
														>
															#{keyword}
														</span>
													))}

													{result.keywords.length > 3 && (
														<span className="rounded-md bg-[#fff6eb] px-2 py-1 text-xs font-medium text-[#706b60]">
															+{result.keywords.length - 3}
														</span>
													)}
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div className="flex h-32 items-center justify-center rounded-3xl border border-[#eadfce] bg-white/60 text-[#706b60] backdrop-blur-sm">
									Ni bilo najdenih zadetkov za "{searchQuery}".
								</div>
							)}

							<div
								className="relative z-10 mt-2 flex justify-center"
								style={{
									animationDelay: '300ms',
									animationFillMode: 'both',
								}}
							>
								<button
									type="button"
									onClick={() =>
										navigate(
											`/search${searchQuery
												? `?q=${encodeURIComponent(searchQuery)}`
												: ''
											}`,
										)
									}
									className="flex items-center gap-2 rounded-full border border-[#31583b] bg-[#31583b] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#274a31] hover:shadow-lg"
								>
									{searchResults.length > 0
										? 'PrikaĹľi vse zadetke'
										: 'Napredno iskanje'}
									<ArrowRightIcon className="h-4 w-4" />
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default HeroSearchResults

