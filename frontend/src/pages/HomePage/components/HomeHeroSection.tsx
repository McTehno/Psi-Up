import { ArrowRight, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useGlobalSearch } from '../../../hooks/useGlobalSearch'
import HeroSearch from './HeroSearch'
import HeroSearchResults from './HeroSearchResults'
import MobileHeroSearchResults from './MobileHeroSearchResults'

function HomeHeroSection() {
	const navigate = useNavigate()
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

	return (
		<section
			id="top"
			className="relative grid min-h-screen gap-8 pb-16 pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:pb-10 lg:pt-10"
		>
			<div className="relative max-w-xl lg:pt-15">
				<HeroSearch
					isSearchActive={isSearchActive}
					setIsSearchActive={setIsSearchActive}
					activeFilters={activeFilters}
					toggleFilter={toggleFilter}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					setSearchResults={setSearchResults}
				/>

				<MobileHeroSearchResults
					isSearchActive={isSearchActive}
					searchQuery={searchQuery}
					searchResults={searchResults}
					isSearching={isSearching}
					navigate={navigate}
				/>

				<div
					className={`max-w-xl rounded-[30px] bg-[#fffdf8]/30 p-6 shadow-[0_16px_42px_rgba(57,47,35,0.08)] backdrop-blur-sm transition-all duration-500 sm:p-8 
						${isSearchActive
							? 'pointer-events-none translate-y-3 opacity-45'
							: 'translate-y-0 opacity-100'
						}`}
				>
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
						NIDiKo
					</p>

					<h1 className="mt-5 font-serif text-[clamp(34px,4.6vw,58px)] leading-[1.04] tracking-tight text-[#2f4a31]">
						Najdi svojo smer razvoja digitalnih kompetenc.
					</h1>

					<p className="mt-7 max-w-xl text-[19px] leading-8 text-[#6f6a60]">
						NIDiKo povezuje učne poti, module in učne enote v pregleden sistem,
						ki ti pomaga razumeti, kje začeti in kako napredovati.
					</p>

					<div className="mt-9 flex flex-wrap gap-3">
						<button
							onClick={() => navigate('/register')}
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#31583b] bg-[#31583b] px-7 py-3.5 text-sm font-bold text-[#fffdf8] shadow-[0_14px_34px_rgba(49,88,59,0.22)] transition hover:bg-[#2a4d33]"
						>
							Registriraj se
							<ArrowRight className="h-4 w-4" />
						</button>

						<button
							onClick={() => setIsSearchActive(true)}
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#ded5c6]/70 bg-[#fffdf8]/36 px-7 py-3.5 text-sm font-bold text-[#706b60] shadow-sm backdrop-blur-sm transition hover:bg-[#fffdf8]/52"
						>
							<Search className="h-4 w-4" />
							Išči vsebine
						</button>
					</div>
				</div>
			</div>

			<div className="relative hidden h-[40rem] w-full flex-col justify-center lg:flex">
				<HeroSearchResults
					isSearchActive={isSearchActive}
					searchQuery={searchQuery}
					searchResults={searchResults}
					isSearching={isSearching}
					navigate={navigate}
				/>

				<div
					className={`rounded-[30px] bg-[#fffdf8]/30 p-6 shadow-[0_16px_42px_rgba(57,47,35,0.08)] backdrop-blur-sm transition-all duration-500 sm:p-8 
						${isSearchActive
							? 'pointer-events-none translate-y-3 opacity-35'
							: 'translate-y-0 opacity-100'
						}`}
				>
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
						Struktura učenja
					</p>

					<div className="mt-8 space-y-5">
						<div className="rounded-[24px] border border-[#ded5c6]/70 bg-[#fffdf8]/42 p-5 shadow-[0_16px_42px_rgba(57,47,35,0.07)] backdrop-blur-2xl">
							<p className="font-serif text-2xl text-[#2f4a31]">Učna pot</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Širši načrt učenja, ki povezuje več sorodnih področij v eno jasno
								smer.
							</p>
						</div>

						<div className="ml-8 rounded-[22px] border border-[#ded5c6]/65 bg-[#fffdf8]/34 p-5 shadow-[0_14px_34px_rgba(57,47,35,0.06)] backdrop-blur-xl">
							<p className="font-serif text-xl text-[#33442f]">Modul</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Zaokrožen korak znotraj poti, ki ti pomaga razumeti posamezen del
								področja.
							</p>
						</div>

						<div className="ml-16 rounded-[20px] border border-[#ded5c6]/60 bg-[#fffdf8]/28 p-5 shadow-[0_12px_28px_rgba(57,47,35,0.05)] backdrop-blur-xl">
							<p className="font-serif text-lg text-[#33442f]">Učna enota</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Kratek in konkreten del znanja, ki ga lahko pregledaš samostojno.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default HomeHeroSection