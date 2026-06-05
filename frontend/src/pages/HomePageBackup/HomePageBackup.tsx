import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ArrowRight as ArrowRightIcon } from 'lucide-react'

import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import ScrollDownHint from './components/ScrollDownHint'
import {
	digcompAreas,
	flowSteps,
	learningPathCards,
	positionCards,
} from './constants'

import DigCompHeroVisual from './components/DigCompHeroVisual'
import HeroSearch from './components/HeroSearch'
import HeroSearchResults from './components/HeroSearchResults'
import HomeBackground from './components/HomeBackground'
import HomeFlowSlide from './components/HomeFlowSlide'
import HomeInfoSlide from './components/HomeInfoSlide'
import HomeContactSlide from './components/HomeContactSlide'
import MobileDigCompVisual from './components/MobileDigCompVisual'

function HomePageBackup() {
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
		<main className="relative isolate min-h-screen overflow-x-hidden bg-[#fffdf8] text-[#111111] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:h-screen lg:snap-y lg:snap-mandatory lg:overflow-y-auto lg:scroll-smooth">
			<HomeBackground />

			<div
				className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isSearchActive
					? 'bg-[#fffdf8]/60 backdrop-blur-md'
					: 'pointer-events-none bg-transparent backdrop-blur-none'
					}`}
				onClick={() => setIsSearchActive(false)}
				aria-hidden="true"
			/>

			<div className="mx-auto flex max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
				<section
					id="top"
					className="relative grid gap-8 pb-16 pt-24 lg:h-screen lg:snap-start lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:pb-10 lg:pt-10"
				>
					<div className="relative max-w-xl">
						<HeroSearch
							isSearchActive={isSearchActive}
							setIsSearchActive={setIsSearchActive}
							activeFilters={activeFilters}
							toggleFilter={toggleFilter}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							setSearchResults={setSearchResults}
						/>

						<h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-[#111111] sm:text-6xl xl:text-7xl">
							Pot do cilja je lažja, ko je najprej mirna.
						</h1>

						<p className="mt-5 max-w-lg text-lg leading-8 text-[#706b60]">
							NIDiKo poveže vprašalnik, DigComp in učno pot v eno jasno
							priporočilo.
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
								href="#contact"
								className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-[#fff6eb] px-6 py-3 text-sm font-semibold text-[#111111] shadow-sm transition hover:border-[#d07a12]/45 hover:bg-[#fffdf8]"
							>
								Kontakt
							</a>
							
						</div>
						

					</div>
					<MobileDigCompVisual
						activeIndex={activeIndex}
						rotationCount={rotationCount}
					/>

					<div className="relative hidden h-[40rem] w-full flex-col lg:flex">
						<HeroSearchResults
							isSearchActive={isSearchActive}
							searchQuery={searchQuery}
							searchResults={searchResults}
							isSearching={isSearching}
							navigate={navigate}
						/>

						<DigCompHeroVisual
							isSearchActive={isSearchActive}
							activeIndex={activeIndex}
							rotationCount={rotationCount}
						/>
					</div>
					<div className="hidden lg:block">
		<ScrollDownHint href="#how-it-works"  />
	</div>
				</section>

				<div className="relative">
					<HomeInfoSlide
						id="how-it-works"
						label="Začni z zanimanjem"
						title="Izberi učno pot, ki te pritegne."
						description="Ni pomembno, ali začneš z veliko znanja ali samo z radovednostjo. Pomembno je, da vidiš, kje si zdaj in kateri korak te lahko najbolj približa cilju."
						labelColor="text-[#d07a12]"
						cards={learningPathCards}
						cardBackground="bg-[#fffdf8]"
						iconBackground="bg-[#f2f8f1]"
						iconColor="text-[#31583b]"
					/>
					<div className="hidden lg:block">
						<ScrollDownHint href="#position" />
					</div>
				</div>
				<div className="relative">
					<HomeInfoSlide
						id="position"
						label="Tvoja trenutna pozicija"
						title="Ugotovi, kje si na izbrani poti."
						description="Vprašalnik ti pomaga povezati trenutno znanje z vsebino poti. Tako lažje razumeš, kaj že obvladaš in kje je prostor za napredek."
						labelColor="text-[#31583b]"
						cards={positionCards}
						cardBackground="bg-[#fff6eb]"
						iconBackground="bg-[#fffdf8]"
						iconColor="text-[#d07a12]"
					/>
					<div className="hidden lg:block">
						<ScrollDownHint href="#digcomp" />
					</div>
				</div>
				<div className="relative">
					<HomeFlowSlide flowSteps={flowSteps} />
					<div className="hidden lg:block">
						<ScrollDownHint href="#contact" />
					</div>
				</div>
				<HomeContactSlide />
			</div>
		</main >
	)
}

export default HomePageBackup

