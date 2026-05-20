import { Fragment, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { landingAnchors } from '../app/navigation'

import { useGlobalSearch } from '../contexts/SearchContext'

import {
    ArrowRight as ArrowRightIcon,
    Search as SearchIcon,
    Route as PathIcon,
    Circle as CircleIcon,
    CircleDot as DotIcon,
    X as XIcon,
} from 'lucide-react'

import {
    searchFilters,
    focusTags,
    processSteps,
    outcomeCards,
    digcompAreas
} from './LandingPage/constants'

function LandingPage() {
	const navigate = useNavigate()
	const [activeIndex, setActiveIndex] = useState(0)
	const [rotationCount, setRotationCount] = useState(0)
	
	const {
		isSearchActive,
		setIsSearchActive,
		activeFilters,
		toggleFilter,
		searchQuery,
		setSearchQuery,
		searchResults,
		setSearchResults,
		isSearching,
	} = useGlobalSearch()

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % digcompAreas.length)
			setRotationCount((prev) => prev + 1)
		}, 4000)
		return () => clearInterval(interval)
	}, [])

	// No scrolling while the search is active
	useEffect(() => {
		if (isSearchActive) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}
		
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isSearchActive])

	return (
		<main className="relative isolate min-h-screen overflow-hidden bg-sand-50 text-brown-900">
			{/* Backdrop Overlay for Search */}
			<div
				className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
					isSearchActive ? 'bg-sand-50/60 backdrop-blur-md' : 'pointer-events-none bg-transparent backdrop-blur-none'
				}`}
				onClick={() => setIsSearchActive(false)}
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(139,115,85,0.16),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(139,115,85,0.12),_transparent_22%),radial-gradient(circle_at_90%_80%,_rgba(114,93,67,0.08),_transparent_30%),linear-gradient(180deg,_rgba(245,240,232,0.98),_rgba(224,213,195,0.98))]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute left-0 top-36 -z-10 h-72 w-72 rounded-full bg-sand-300/30 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute right-0 top-24 -z-10 h-96 w-96 rounded-full bg-brown-100/25 blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
				<header className="flex items-center justify-between gap-4 border-b border-brown-200/60 pb-5">
					<a href="#top" className="inline-flex items-center gap-3">
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown-700 text-sm font-semibold tracking-[0.25em] text-sand-50 shadow-lg shadow-brown-700/20">
							PS
						</span>
						<span>
							<span className="block font-display text-xl tracking-tight text-brown-900">
								Psi-Up
							</span>
							<span className="block text-sm text-brown-600">Priporočilne učne poti</span>
						</span>
					</a>

					<nav className="hidden flex-wrap gap-2 md:flex">
						{landingAnchors.map((item) => (
							<a
								key={item.href}
								href={item.href}
								className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-sm font-medium text-brown-700 transition hover:border-brown-400 hover:bg-white hover:text-brown-900"
							>
								{item.label}
							</a>
						))}
					</nav>
				</header>

				<section
					id="top"
					className="grid gap-12 pt-8 pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-10 lg:pb-20"
				>
					<div className="max-w-xl relative">
						<div className={`relative mb-8 max-w-sm transition-all duration-500 ease-in-out z-50 ${isSearchActive ? 'scale-105 origin-left' : ''}`}>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
									<SearchIcon className="h-5 w-5 text-brown-400" />
								</div>
								<input
									type="text"
									placeholder="Kaj se hočete naučiti?"
									className="w-full rounded-2xl border border-sand-300 bg-sand-50 py-3 pl-12 pr-12 text-sm text-brown-900 shadow-sm placeholder:text-brown-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 transition-all duration-300"
									onFocus={() => {
										setIsSearchActive(true)
										window.scrollTo({ top: 0, behavior: 'smooth' })
									}}
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value)
										if (!e.target.value) setSearchResults([])
									}}
								/>
								{isSearchActive && (
									<button
										onClick={() => {
											setIsSearchActive(false);
											setSearchQuery('');
											setSearchResults([]);
										}}
										className="absolute inset-y-0 right-0 flex items-center pr-4 text-brown-400 hover:text-brown-700 transition"
										aria-label="Zapri iskanje"
									>
										<XIcon className="h-5 w-5" />
									</button>
								)}
							</div>

							{/* Filters Dropdown */}
							<div
								className={`absolute left-0 right-0 top-full mt-4 flex flex-wrap gap-2 transition-all duration-500 ease-in-out origin-top ${
									isSearchActive
										? 'opacity-100 translate-y-0 visible'
										: 'opacity-0 -translate-y-4 invisible'
								}`}
							>
								{searchFilters.map((filter) => (
									<button
										key={filter.label}
										onClick={() => toggleFilter(filter.label)}
										className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
											activeFilters.includes(filter.label)
												? 'bg-forest-700 text-white border-forest-700 hover:bg-forest-800'
												: 'bg-white text-brown-600 hover:bg-sand-100 border-sand-300'
										} shadow-sm border`}
									>
										{filter.label}
									</button>
								))}
							</div>
						</div>

						<h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-brown-900 sm:text-6xl xl:text-7xl">
							Pot do cilja je lažja, ko je najprej mirna.
						</h1>

						<p className="mt-5 max-w-lg text-lg leading-8 text-brown-600">
							Psi-Up poveže vprašalnik, DigComp in učno pot v eno jasno priporočilo.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<a
								href="#how-it-works"
								className="inline-flex items-center justify-center rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-sand-50 shadow-[0_14px_40px_rgba(61,90,62,0.22)] transition hover:bg-forest-800"
							>
								Kako deluje
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</a>
							<a
								href="#digcomp"
								className="inline-flex items-center justify-center rounded-full border border-sand-300 bg-sand-100 px-6 py-3 text-sm font-semibold text-brown-800 shadow-sm transition hover:border-brown-300 hover:bg-white"
							>
								Kaj upošteva
							</a>
						</div>

						<div className="mt-10 flex flex-wrap gap-2">
							{focusTags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-sand-300 bg-sand-100 px-3 py-2 text-sm font-medium text-brown-700"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="relative min-h-[30rem] sm:min-h-[40rem] w-full flex flex-col">
						{/* Search Results Display */}
						<div
							className={`absolute inset-0 z-50 flex flex-col gap-4 pr-2 pb-10 transition-all duration-500 ease-in-out ${
								isSearchActive
									? 'opacity-100 translate-y-0 visible'
									: 'opacity-0 translate-y-8 invisible'
							}`}
						>
							{isSearchActive && searchQuery && (
								<div className="flex flex-col gap-3">
									{isSearching ? (
										<div className="flex h-32 items-center justify-center text-brown-500 animate-pulse bg-white/50 backdrop-blur-sm rounded-3xl border border-sand-300">
											Iščem...
										</div>
									) : (
										<>
											{searchResults.length > 0 ? (
												searchResults.slice(0, 3).map((result, idx) => (
													<div
														key={result.id}
														className="group flex flex-col sm:flex-row cursor-pointer items-start gap-4 rounded-2xl border border-sand-300 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-md animate-fade-in-up"
														style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}
													>
														<div className="flex-shrink-0">
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
														<div className="flex-1 w-full">
															<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
																<h3 className="font-display text-lg font-semibold tracking-tight text-brown-900 group-hover:text-forest-700 transition-colors">
																	{result.title}
																</h3>
																<span className="inline-flex shrink-0 items-center rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-brown-600">
																	{result.type === 'learning_path' ? 'Učna pot' : result.type === 'module' ? 'Modul' : 'Učna enota'}
																</span>
															</div>
															{result.shortDescription && (
																<p className="mt-2 text-sm leading-relaxed text-brown-600 line-clamp-2">
																	{result.shortDescription}
																</p>
															)}
															{result.keywords && result.keywords.length > 0 && (
																<div className="mt-3 flex flex-wrap gap-2">
																	{result.keywords.slice(0, 3).map((kw) => (
																		<span key={kw} className="rounded-md bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700">
																			#{kw}
																		</span>
																	))}
																	{result.keywords.length > 3 && (
																		<span className="rounded-md bg-sand-100 px-2 py-1 text-xs font-medium text-brown-500">
																			+{result.keywords.length - 3}
																		</span>
																	)}
																</div>
															)}
														</div>
													</div>
												))
											) : (
												<div className="flex h-32 items-center justify-center text-brown-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-sand-300">
													Ni bilo najdenih zadetkov za "{searchQuery}".
												</div>
											)}
											
											{/* Always show this button now when finished searching */}
											<div 
												className="mt-2 flex justify-center animate-fade-in-up relative z-10" 
												style={{ animationDelay: '300ms', animationFillMode: 'both' }}
											>
												<button 
													onClick={() => navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
													className="flex items-center gap-2 rounded-full border border-sand-300 bg-forest-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-forest-800 hover:shadow-lg"
												>
													{searchResults.length > 0 ? 'Prikaži vse zadetke' : 'Napredno iskanje'}
													<ArrowRightIcon className="h-4 w-4" />
												</button>
											</div>
										</>
									)}
								</div>
							)}
						</div>

						{/* Original Content fades out on search */}
						<div
							className={`absolute inset-0 transition-opacity duration-500 ${
								isSearchActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
							}`}
						>
							{/* Foreground Info Layer */}
							<div className="absolute inset-x-0 top-16 sm:top-20 z-10 flex flex-col items-center text-center px-4 sm:px-6">
							{digcompAreas.map((area, idx) => {
								const isActive = activeIndex === idx;
								const isPast = idx === (activeIndex - 1 + digcompAreas.length) % digcompAreas.length;
								
								let positionClass = 'translate-x-16 -translate-y-16 rotate-12 opacity-0 pointer-events-none scale-95'; // coming from top-right arc
								if (isActive) {
									positionClass = 'translate-x-0 translate-y-0 rotate-0 opacity-100 z-10 scale-100'; // active in center
								} else if (isPast) {
									positionClass = '-translate-x-12 translate-y-24 -rotate-12 opacity-0 pointer-events-none scale-95'; // exiting down and left, around the edge
								}

								return (
									<div
										key={area.title}
										className={`absolute inset-x-0 top-0 flex flex-col items-center transition-all duration-1000 ease-in-out origin-center ${positionClass}`}
										aria-hidden={!isActive}
									>
										<span className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg border border-white/20 ${area.themeBg} ${area.themeText}`}>
											<area.icon className="h-8 w-8" />
										</span>
										<h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-tight text-brown-900 max-w-[28rem]">
											{area.title}
										</h2>
										<p className="mt-4 text-sm sm:text-base leading-relaxed text-brown-600 max-w-[24rem]">
											{area.description}
										</p>
									</div>
								)
							})}
						</div>

						{/* The Rotating Wheel (Massive background element bleeding off screen) */}
						<svg
							viewBox="-120 -120 240 240"
							className="absolute top-24 lg:top-24 -right-[270%] sm:-right-[170%] md:-right-[140%] lg:-right-[120%] w-[350%] sm:w-[250%] md:w-[200%] lg:w-[180%] max-w-[1400px] aspect-square transition-transform duration-1000 ease-in-out -z-10"
							style={{ transform: `rotate(${-81 - rotationCount * 72}deg)` }}
						>
							{digcompAreas.map((area, idx) => {
								const startAngle = (idx * 72 - 90) * (Math.PI / 180)
								const endAngle = ((idx + 1) * 72 - 90) * (Math.PI / 180)

								// Use a slightly larger radius for the pentagon placement
								const v1x = Math.cos(startAngle) * 95
								const v1y = Math.sin(startAngle) * 95
								const v2x = Math.cos(endAngle) * 95
								const v2y = Math.sin(endAngle) * 95

								// Increased spacing (gap) between the lines
								const x1 = v1x + (v2x - v1x) * 0.2
								const y1 = v1y + (v2y - v1y) * 0.2
								const x2 = v1x + (v2x - v1x) * 0.8
								const y2 = v1y + (v2y - v1y) * 0.8

								return (
									<line
										key={area.title}
										x1={x1}
										y1={y1}
										x2={x2}
										y2={y2}
										stroke={area.svgFill}
										strokeWidth="18"
										strokeLinecap="round"
									/>
								)
							})}
						</svg>
						</div>
					</div>
				</section>

				<section
					id="how-it-works"
					className="grid gap-4 pb-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch"
				>
					{processSteps.map((step, index) => (
						<Fragment key={step.title}>
							<article
								className="rounded-[2rem] border border-sand-300/60 bg-white/85 p-6 shadow-sm"
							>
								<div className="flex items-center justify-between gap-4">
									<span className="flex h-11 w-11 items-center justify-center rounded-full bg-brown-100 text-brown-700">
										<step.icon className="h-5 w-5" />
									</span>
									<span className="text-xs font-semibold uppercase tracking-[0.24em] text-brown-500">
										Korak
									</span>
								</div>
								<h2 className="mt-5 font-display text-3xl leading-tight text-brown-900">
									{step.title}
								</h2>
								<p className="mt-2 text-sm leading-7 text-brown-500">{step.text}</p>
							</article>
							{index < processSteps.length - 1 ? (
								<div className="flex items-center justify-center py-1 lg:px-1 lg:py-0">
									<span className="flex h-10 w-10 items-center justify-center rounded-full border border-brown-200 bg-brown-50 text-brown-700 shadow-sm">
										<ArrowRightIcon className="h-4 w-4 rotate-90 lg:rotate-0" />
									</span>
								</div>
							) : null}
						</Fragment>
					))}
				</section>

				<section id="digcomp" className="grid gap-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
					<article className="rounded-[2rem] border border-sand-300/60 bg-white/85 p-7 shadow-sm sm:p-8">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-brown-500">
							DigComp + curriculum
						</p>
						<h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-brown-900">
							Priporočilo je prilagojeno.
						</h2>
						<p className="mt-4 max-w-xl text-base leading-8 text-brown-600">
							Sistem upošteva predznanje, cilj in vlogo.
						</p>
						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							{outcomeCards.map(({ icon: Icon, title }) => (
								<div key={title} className="flex items-center gap-3 rounded-2xl border border-brown-200 bg-brown-50 px-4 py-4">
									<span className="flex h-10 w-10 items-center justify-center rounded-full bg-brown-700 text-sand-50">
										<Icon className="h-5 w-5" />
									</span>
									<p className="text-sm font-semibold text-brown-800">{title}</p>
								</div>
							))}
						</div>
					</article>

					<article className="overflow-hidden rounded-[2rem] border border-sand-300/60 bg-white shadow-sm">
						<img
							src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80"
							alt="Pen on lined paper"
							className="h-72 w-full object-cover object-center"
						/>
						<div className="p-6">
							<p className="text-sm font-semibold uppercase tracking-[0.24em] text-brown-500">
								Za koga je
							</p>
							<p className="mt-3 text-sm leading-7 text-brown-600">
								Za študente, zaposlene, profesorje in ekipe.
							</p>
						</div>
					</article>
				</section>
			</div>
		</main>
	)
}

export default LandingPage
