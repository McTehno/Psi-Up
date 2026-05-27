import { ArrowRight, Search } from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'

import type { SearchResult } from '../../../types/search'
import HeroSearch from '../../HomePage/components/HeroSearch'
import HeroSearchResults from '../../HomePage/components/HeroSearchResults'
import MobileHeroSearchResults from './MobileHeroSearchResults'

type HomeHeroSectionProps = {
	isSearchActive: boolean
	setIsSearchActive: (isActive: boolean) => void
	activeFilters: string[]
	toggleFilter: (filter: string) => void
	searchQuery: string
	setSearchQuery: (query: string) => void
	setSearchResults: (results: SearchResult[]) => void
	searchResults: SearchResult[]
	isSearching: boolean
	navigate: NavigateFunction
}

function HomeHeroSection({
	isSearchActive,
	setIsSearchActive,
	activeFilters,
	toggleFilter,
	searchQuery,
	setSearchQuery,
	setSearchResults,
	searchResults,
	isSearching,
	navigate,
}: HomeHeroSectionProps) {
	return (
		<section
			id="top"
			className="relative grid min-h-screen gap-8 pb-16 pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:pb-10 lg:pt-10"
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
				<MobileHeroSearchResults
					isSearchActive={isSearchActive}
					searchQuery={searchQuery}
					searchResults={searchResults}
					isSearching={isSearching}
					navigate={navigate}
				/>
				<div
					className={`rounded-[34px] border border-[#ded5c6]/80 bg-[#fffdf8]/72 p-8 shadow-[0_24px_70px_rgba(57,47,35,0.12)] backdrop-blur-2xl transition-all duration-500 sm:p-10 
						${isSearchActive
							? 'pointer-events-none translate-y-3 opacity-70 blur-[8px]'
							: 'translate-y-0 opacity-100 blur-0'
						}`}
				>
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
						NIDiKo
					</p>

					<h1 className="mt-5 font-serif text-[clamp(42px,6vw,76px)] leading-[0.98] tracking-tight text-[#2f4a31]">
						Začni z izbiro učne poti.
					</h1>

					<p className="mt-7 max-w-xl text-[19px] leading-8 text-[#6f6a60]">
						Raziskuj učne poti, module in učne enote ter lažje razumi svojo
						pozicijo znotraj izbrane poti.
					</p>

					<div className="mt-9 flex flex-wrap gap-3">
						<a
							href="#learning-paths"
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#31583b] bg-[#31583b] px-7 py-3.5 text-sm font-bold text-[#fffdf8] shadow-[0_14px_34px_rgba(49,88,59,0.22)] transition hover:bg-[#2a4d33]"
						>
							Razišči učne poti
							<ArrowRight className="h-4 w-4" />
						</a>

						<a
							href="#modules"
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#ded5c6] bg-[#fffdf8]/78 px-7 py-3.5 text-sm font-bold text-[#706b60] shadow-sm backdrop-blur-xl transition hover:bg-[#f4eee4]"
						>
							<Search className="h-4 w-4" />
							Kako je zgrajeno
						</a>
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
					className={`rounded-[36px] border border-[#ded5c6]/70 bg-[#fffdf8]/50 p-8 shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl transition-all duration-500 
						${isSearchActive
							? 'pointer-events-none translate-y-4 opacity-35 blur-[6px]'
							: 'translate-y-0 opacity-100 blur-0'
						}`}
				>
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
						Struktura učenja
					</p>

					<div className="mt-8 space-y-5">
						<div className="rounded-[24px] border border-[#ded5c6] bg-[#fffaf2]/80 p-5">
							<p className="font-serif text-2xl text-[#2f4a31]">Učna pot</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Povezuje več modulov v smiselno celoto.
							</p>
						</div>

						<div className="ml-8 rounded-[22px] border border-[#ded5c6] bg-white/70 p-5">
							<p className="font-serif text-xl text-[#33442f]">Modul</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Razdeli pot na pregledne korake.
							</p>
						</div>

						<div className="ml-16 rounded-[20px] border border-[#ded5c6] bg-white/60 p-5">
							<p className="font-serif text-lg text-[#33442f]">Učna enota</p>
							<p className="mt-2 text-sm leading-6 text-[#706b60]">
								Manjši del znanja, ki ga lahko pregledaš samostojno.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default HomeHeroSection