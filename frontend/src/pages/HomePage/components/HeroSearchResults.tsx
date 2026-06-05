import {
	ArrowRight as ArrowRightIcon,
	Circle as CircleIcon,
	CircleDot as DotIcon,
	Route as PathIcon,
} from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
		<div className="absolute inset-x-0 bottom-0 top-[96px] z-50 flex flex-col gap-4 pb-10 pr-2 pointer-events-none">
			<AnimatePresence>
				{isSearchActive && (
					<motion.div
						initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						className="flex flex-col gap-3 pointer-events-auto"
					>
						<AnimatePresence mode="wait">
							{isSearching ? (
								<motion.div
									key="searching"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="flex h-32 items-center justify-center rounded-3xl border border-[#eadfce] bg-white/60 text-[#706b60] backdrop-blur-sm shadow-sm"
								>
									<div className="flex items-center gap-3 font-medium">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
										>
											<CircleIcon className="h-5 w-5 text-[#31583b]" />
										</motion.div>
										Iščem...
									</div>
								</motion.div>
							) : (
								<motion.div
									key="results"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="flex flex-col gap-3"
								>
									<AnimatePresence mode="popLayout">
										{searchResults.length > 0 ? (
											searchResults.slice(0, 3).map((result, index) => (
												<motion.div
													key={result.id}
													initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
													animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
													exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
													transition={{
														type: 'spring',
														stiffness: 400,
														damping: 30,
														delay: index * 0.08,
													}}
													onClick={() => {
														if (result.type === 'learning_path') {
															navigate(`/learning-paths/${result.id}`)
														} else if (result.type === 'module') {
															navigate(`/modules/${result.id}`)
														} else if (result.type === 'learning_unit') {
															navigate(`/learning-units/${result.id}`)
														}
													}}
													whileHover={{ y: -4, scale: 1.01 }}
													whileTap={{ scale: 0.98 }}
													className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#eadfce] bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-[#31583b]/35 hover:shadow-md sm:flex-row"
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
												</motion.div>
											))
										) : (
											<motion.div
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												className="flex h-32 items-center justify-center rounded-3xl border border-[#eadfce] bg-white/60 text-[#706b60] backdrop-blur-sm"
											>
												Ni bilo najdenih zadetkov za "{searchQuery}".
											</motion.div>
										)}

										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3 }}
											className="relative z-10 mt-2 flex justify-center"
										>
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												type="button"
												onClick={() =>
													navigate(
														`/search${searchQuery
															? `?q=${encodeURIComponent(searchQuery)}`
															: ''
														}`,
													)
												}
												className="flex items-center gap-2 rounded-full border border-[#31583b] bg-[#31583b] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#274a31] hover:shadow-lg"
											>
												{searchResults.length > 0
													? 'Prikaži vse zadetke'
													: 'Napredno iskanje'}
												<ArrowRightIcon className="h-4 w-4" />
											</motion.button>
										</motion.div>
									</AnimatePresence>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default HeroSearchResults


