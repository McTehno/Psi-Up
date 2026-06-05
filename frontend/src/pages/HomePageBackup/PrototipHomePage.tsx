import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { landingAnchors } from '../../app/navigation'

import { useGlobalSearch } from '../../hooks/useGlobalSearch'

import {
	ArrowRight as ArrowRightIcon,
	Search as SearchIcon,
	Route as PathIcon,
	Circle as CircleIcon,
	CircleDot as DotIcon,
	X as XIcon,
	Map as MapIcon,
	Target as TargetIcon,
	ClipboardList as ClipboardListIcon,
	Compass as CompassIcon,
	CheckCircle2 as CheckCircleIcon,
	Sparkles as SparklesIcon,
} from 'lucide-react'

import { searchFilters, focusTags, digcompAreas } from './constants'

const learningPathCards = [
	{
		icon: MapIcon,
		title: 'Preglej izbrano učno pot',
		text: 'Najprej si ogledaš, kaj pot vključuje: module, učne enote, kompetence in vsebine, ki te vodijo proti cilju.',
	},
	{
		icon: TargetIcon,
		title: 'Začni iz svoje pozicije',
		text: 'Ni treba začeti od začetka. Pomembno je razumeti, kaj že znaš, kaj še potrebuješ in kje je tvoj najbolj smiseln naslednji korak.',
	},
]

const positionCards = [
	{
		icon: ClipboardListIcon,
		title: 'Izpolni vprašalnik',
		text: 'Vprašanja so povezana z vsebino izbrane učne poti. Pomagajo oceniti tvoje trenutno znanje znotraj poti, ki te zanima.',
	},
	{
		icon: CompassIcon,
		title: 'Odkrij svojo pozicijo',
		text: 'Rezultat pokaže, katere dele poti že obvladaš in katera področja je dobro še utrditi, preden nadaljuješ.',
	},
]

const flowSteps = [
	'Izbira poti',
	'Pregled vsebine',
	'Vprašalnik',
	'Tvoja pozicija',
	'Naslednji korak',
]

function HomePage() {
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
		<main className="relative isolate h-screen overflow-y-auto overflow-x-hidden scroll-smooth bg-[#fffdf8] text-[#111111] snap-y snap-mandatory">
			<div
				className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
					isSearchActive
						? 'bg-[#fffdf8]/60 backdrop-blur-md'
						: 'pointer-events-none bg-transparent backdrop-blur-none'
				}`}
				onClick={() => setIsSearchActive(false)}
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none fixed left-0 top-36 -z-10 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none fixed right-0 top-24 -z-10 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto flex max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
				<header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#eadfce] bg-[#fffdf8]/80 pb-5 pt-1 backdrop-blur-md">
					<a href="#top" className="inline-flex items-center gap-3">
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#31583b] text-sm font-semibold tracking-[0.25em] text-[#fffdf8] shadow-lg shadow-[#31583b]/20">
							PS
						</span>
						<span>
							<span className="block font-display text-xl tracking-tight text-[#111111]">
								Psi-Up
							</span>
							<span className="block text-sm text-[#706b60]">
								Priporočilne učne poti
							</span>
						</span>
					</a>

					<nav className="hidden flex-wrap gap-2 md:flex">
						{landingAnchors.map((item) => (
							<a
								key={item.href}
								href={item.href}
								className="rounded-full border border-[#eadfce] bg-[#fffdf8] px-4 py-2 text-sm font-medium text-[#5d5a55] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6] hover:text-[#111111]"
							>
								{item.label}
							</a>
						))}
					</nav>
				</header>

				<section
					id="top"
					className="grid min-h-[calc(100vh-88px)] snap-start gap-12 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-20 lg:pt-10"
				>
					<div className="relative max-w-xl">
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
									onChange={(e) => {
										setSearchQuery(e.target.value)

										if (!e.target.value) {
											setSearchResults([])
										}
									}}
								/>

								{isSearchActive && (
									<button
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
										key={filter.label}
										onClick={() => toggleFilter(filter.value)}
										className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
											activeFilters.includes(filter.value)
												? 'border-[#31583b] bg-[#31583b] text-white hover:bg-[#274a31]'
												: 'border-[#eadfce] bg-white text-[#706b60] hover:bg-[#fff6eb]'
										}`}
									>
										{filter.label}
									</button>
								))}
							</div>
						</div>

						<h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-[#111111] sm:text-6xl xl:text-7xl">
							Pot do cilja je lažja, ko je najprej mirna.
						</h1>

						<p className="mt-5 max-w-lg text-lg leading-8 text-[#706b60]">
							Psi-Up poveže vprašalnik, DigComp in učno pot v eno jasno priporočilo.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<a
								href="#how-it-works"
								className="inline-flex items-center justify-center rounded-full bg-[#31583b] px-6 py-3 text-sm font-semibold text-[#fffdf8] shadow-[0_14px_40px_rgba(49,88,59,0.22)] transition hover:bg-[#274a31]"
							>
								Kako deluje
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</a>

							<a
								href="#position"
								className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-[#fff6eb] px-6 py-3 text-sm font-semibold text-[#111111] shadow-sm transition hover:border-[#d07a12]/45 hover:bg-[#fffdf8]"
							>
								Kaj upošteva
							</a>
						</div>

						<div className="mt-10 flex flex-wrap gap-2">
							{focusTags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-[#d8e8da] bg-[#f2f8f1] px-3 py-2 text-sm font-medium text-[#31583b]"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="relative flex min-h-[30rem] w-full flex-col sm:min-h-[40rem]">
						<div
							className={`absolute inset-0 z-50 flex flex-col gap-4 pb-10 pr-2 transition-all duration-500 ease-in-out ${
								isSearchActive
									? 'visible translate-y-0 opacity-100'
									: 'invisible translate-y-8 opacity-0'
							}`}
						>
							{isSearchActive && searchQuery && (
								<div className="flex flex-col gap-3">
									{isSearching ? (
										<div className="flex h-32 animate-pulse items-center justify-center rounded-3xl border border-[#eadfce] bg-white/60 text-[#706b60] backdrop-blur-sm">
											Iščem...
										</div>
									) : (
										<>
											{searchResults.length > 0 ? (
												searchResults.slice(0, 3).map((result, idx) => (
													<div
														key={result.id}
														className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#31583b]/35 hover:shadow-md sm:flex-row"
														style={{
															animationDelay: `${idx * 75}ms`,
															animationFillMode: 'both',
														}}
													>
														<div className="shrink-0">
															{result.type === 'learning_path' ? (
																<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2f8f1] text-[#31583b]">
																	<PathIcon className="h-6 w-6" />
																</span>
															) : result.type === 'module' ? (
																<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef7fb] text-[#31576b]">
																	<CircleIcon className="h-6 w-6" />
																</span>
															) : (
																<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff4e6] text-[#d07a12]">
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

															{result.shortDescription && (
																<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#706b60]">
																	{result.shortDescription}
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
													onClick={() =>
														navigate(
															`/search${
																searchQuery
																	? `?q=${encodeURIComponent(searchQuery)}`
																	: ''
															}`,
														)
													}
													className="flex items-center gap-2 rounded-full border border-[#31583b] bg-[#31583b] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#274a31] hover:shadow-lg"
												>
													{searchResults.length > 0
														? 'Prikaži vse zadetke'
														: 'Napredno iskanje'}
													<ArrowRightIcon className="h-4 w-4" />
												</button>
											</div>
										</>
									)}
								</div>
							)}
						</div>

						<div
							className={`absolute inset-0 transition-opacity duration-500 ${
								isSearchActive ? 'pointer-events-none opacity-0' : 'opacity-100'
							}`}
						>
							<div className="absolute inset-x-0 top-16 z-10 flex flex-col items-center px-4 text-center sm:top-20 sm:px-6">
								{digcompAreas.map((area, idx) => {
									const isActive = activeIndex === idx
									const isPast =
										idx ===
										(activeIndex - 1 + digcompAreas.length) %
											digcompAreas.length

									let positionClass =
										'translate-x-16 -translate-y-16 rotate-12 opacity-0 pointer-events-none scale-95'

									if (isActive) {
										positionClass =
											'translate-x-0 translate-y-0 rotate-0 opacity-100 z-10 scale-100'
									} else if (isPast) {
										positionClass =
											'-translate-x-12 translate-y-24 -rotate-12 opacity-0 pointer-events-none scale-95'
									}

									return (
										<div
											key={area.title}
											className={`absolute inset-x-0 top-0 flex origin-center flex-col items-center transition-all duration-1000 ease-in-out ${positionClass}`}
											aria-hidden={!isActive}
										>
											<span
												className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 shadow-lg ${area.themeBg} ${area.themeText}`}
											>
												<area.icon className="h-8 w-8" />
											</span>

											<h2 className="mt-6 max-w-[28rem] font-display text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">
												{area.title}
											</h2>

											<p className="mt-4 max-w-[24rem] text-sm leading-relaxed text-[#706b60] sm:text-base">
												{area.description}
											</p>
										</div>
									)
								})}
							</div>

							<svg
								viewBox="-120 -120 240 240"
								className="absolute top-24 -right-[270%] aspect-square w-[350%] max-w-[1400px] -z-10 transition-transform duration-1000 ease-in-out sm:-right-[170%] sm:w-[250%] md:-right-[140%] md:w-[200%] lg:-right-[120%] lg:top-24 lg:w-[180%]"
								style={{
									transform: `rotate(${-81 - rotationCount * 72}deg)`,
								}}
							>
								{digcompAreas.map((area, idx) => {
									const startAngle = (idx * 72 - 90) * (Math.PI / 180)
									const endAngle =
										((idx + 1) * 72 - 90) * (Math.PI / 180)

									const v1x = Math.cos(startAngle) * 95
									const v1y = Math.sin(startAngle) * 95
									const v2x = Math.cos(endAngle) * 95
									const v2y = Math.sin(endAngle) * 95

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
					className="flex min-h-screen snap-start items-center py-16 sm:py-20"
				>
					<div className="w-full">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d07a12]">
								Začni z zanimanjem
							</p>

							<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
								Izberi učno pot, ki te pritegne.
							</h2>

							<p className="mt-5 text-lg leading-8 text-[#706b60]">
								Ni pomembno, ali začneš z veliko znanja ali samo z radovednostjo.
								Pomembno je, da vidiš, kje si zdaj in kateri korak te lahko
								najbolj približa cilju.
							</p>
						</div>

						<div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
							{learningPathCards.map(({ icon: Icon, title, text }) => (
								<article
									key={title}
									className="rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] p-7 text-center shadow-[0_14px_40px_rgba(57,47,35,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(57,47,35,0.09)]"
								>
									<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f8f1] text-[#31583b]">
										<Icon className="h-7 w-7" />
									</span>

									<h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-[#111111]">
										{title}
									</h3>

									<p className="mx-auto mt-4 max-w-md text-base leading-8 text-[#706b60]">
										{text}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="position"
					className="flex min-h-screen snap-start items-center py-16 sm:py-20"
				>
					<div className="w-full">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#31583b]">
								Tvoja trenutna pozicija
							</p>

							<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
								Ugotovi, kje si na izbrani poti.
							</h2>

							<p className="mt-5 text-lg leading-8 text-[#706b60]">
								Vprašalnik ti pomaga povezati trenutno znanje z vsebino poti.
								Tako lažje razumeš, kaj že obvladaš in kje je prostor za napredek.
							</p>
						</div>

						<div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
							{positionCards.map(({ icon: Icon, title, text }) => (
								<article
									key={title}
									className="rounded-[2rem] border border-[#eadfce] bg-[#fff6eb] p-7 text-center shadow-[0_14px_40px_rgba(57,47,35,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(57,47,35,0.09)]"
								>
									<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fffdf8] text-[#d07a12]">
										<Icon className="h-7 w-7" />
									</span>

									<h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-[#111111]">
										{title}
									</h3>

									<p className="mx-auto mt-4 max-w-md text-base leading-8 text-[#706b60]">
										{text}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="digcomp"
					className="flex min-h-screen snap-start items-center py-16 sm:py-20"
				>
					<div className="w-full">
						<div className="rounded-[2.5rem] border border-[#eadfce] bg-[#fffdf8] px-6 py-10 text-center shadow-[0_18px_55px_rgba(57,47,35,0.07)] sm:px-10 sm:py-12">
							<div className="mx-auto max-w-3xl">
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d07a12]">
									Jasen naslednji korak
								</p>

								<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
									Nadaljuj bolj samozavestno.
								</h2>

								<p className="mt-5 text-lg leading-8 text-[#706b60]">
									Ko vidiš svojo pozicijo, postane pot bolj pregledna. Lažje
									izbereš naslednjo vsebino, se osredotočiš na pomembno in
									napreduješ v svojem ritmu.
								</p>
							</div>

							<div className="mt-10 flex flex-col items-center justify-center gap-4 lg:flex-row">
								{flowSteps.map((step, index) => (
									<div
										key={step}
										className="flex w-full flex-col items-center gap-4 lg:w-auto lg:flex-row"
									>
										<div className="flex min-h-[88px] w-full items-center justify-center rounded-[1.5rem] border border-[#eadfce] bg-[#fff6eb] px-5 py-4 shadow-sm lg:w-[165px]">
											<div>
												<span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f8f1] text-[#31583b]">
													{index === flowSteps.length - 1 ? (
														<SparklesIcon className="h-5 w-5" />
													) : (
														<CheckCircleIcon className="h-5 w-5" />
													)}
												</span>

												<p className="mt-3 text-sm font-semibold leading-5 text-[#111111]">
													{step}
												</p>
											</div>
										</div>

										{index < flowSteps.length - 1 && (
											<span className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8] text-[#d07a12] lg:flex">
												<ArrowRightIcon className="h-4 w-4" />
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	)
}

export default HomePage



