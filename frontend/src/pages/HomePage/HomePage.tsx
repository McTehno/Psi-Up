import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'

import { useGlobalSearch } from '../../contexts/SearchContext'
import { digcompAreas } from './constants'
import HomeBackground from './components/HomeBackground'
import HomeParallaxEnvironment from './components/HomeParallaxEnvironment'
import HomeScrollJourney from './components/HomeScrollJourney'
import HomeHeroSection from './components/HomeHeroSection'
import HomeStorySection from './components/HomeStorySection'
import HomeDigCompSection from './components/HomeDigCompSection'
import HomeFinalCtaSection from './components/HomeFinalCtaSection'

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
		document.body.style.overflow = isSearchActive ? 'hidden' : 'unset'

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isSearchActive])

	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			gestureOrientation: 'vertical',
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 2,
		})

		let animationFrameId: number

		function raf(time: number) {
			lenis.raf(time)
			animationFrameId = requestAnimationFrame(raf)
		}

		animationFrameId = requestAnimationFrame(raf)

		return () => {
			cancelAnimationFrame(animationFrameId)
			lenis.destroy()
		}
	}, [])

	return (
		<main className="relative isolate min-h-screen text-[#2f3328]">
			<HomeBackground />
			<HomeParallaxEnvironment />

			<div
				className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isSearchActive
					? 'bg-[#fffdf8]/60 backdrop-blur-md'
					: 'pointer-events-none bg-transparent backdrop-blur-none'
					}`}
				onClick={() => setIsSearchActive(false)}
				aria-hidden="true"
			/>

			<HomeScrollJourney />

			<div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
				<HomeHeroSection
					isSearchActive={isSearchActive}
					setIsSearchActive={setIsSearchActive}
					activeFilters={activeFilters}
					toggleFilter={toggleFilter}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					setSearchResults={setSearchResults}
					searchResults={searchResults}
					isSearching={isSearching}
					navigate={navigate}
				/>

				<HomeStorySection
						id="learning-paths"
						eyebrow="Učne poti"
						title="Začni z večjo sliko."
						description="Učna pot ti pokaže celotno smer učenja. Namesto posameznih nepovezanih vsebin vidiš zaporedje korakov, ki te vodijo proti jasnemu cilju."
						align="left"
						cards={[
							{
								title: 'Pregled',
								front: 'Vidiš celotno pot',
								back: 'Učna pot združi module in učne enote v logično zaporedje.',
							},
							{
								title: 'Usmeritev',
								front: 'Lažje izbereš začetek',
								back: 'Pomaga ti razumeti, katero področje je zate najbolj smiselno.',
							},
						]}
					/>

					<HomeStorySection
						id="modules"
						eyebrow="Moduli"
						title="Večjo pot razdeli na razumljive korake."
						description="Modul predstavlja zaokrožen del učne poti. Vsak modul ima svoj namen, zato lažje slediš napredku in razumeš, kaj posamezen korak prinese."
						align="right"
						cards={[
							{
								title: 'Korak',
								front: 'Manjši del večje poti',
								back: 'Modul razdeli širše področje na bolj obvladljive vsebinske sklope.',
							},
							{
								title: 'Napredek',
								front: 'Slediš svojemu tempu',
								back: 'Vsak modul ti pomaga videti, kaj si že pregledal in kaj še sledi.',
							},
						]}
					/>

					<HomeStorySection
						id="learning-units"
						eyebrow="Učne enote"
						title="Uči se skozi kratke in konkretne vsebine."
						description="Učna enota je najmanjši del strukture. Namenjena je hitremu pregledu konkretnega znanja, spretnosti ali aktivnosti znotraj modula."
						align="left"
						cards={[
							{
								title: 'Fokus',
								front: 'Ena vsebina naenkrat',
								back: 'Vsaka učna enota predstavi jasen in omejen del znanja.',
							},
							{
								title: 'Samostojnost',
								front: 'Pregledaš jo lahko posebej',
								back: 'Enote lahko raziskuješ znotraj modula ali kot samostojen vir.',
							},
						]}
					/>

					<HomeStorySection
						id="questionnaire"
						eyebrow="Vprašalnik"
						title="Preveri, kje si trenutno."
						description="Vprašalnik ti pomaga oceniti trenutno znanje in prepoznati področja, kjer imaš največ prostora za napredek."
						align="right"
						cards={[
							{
								title: 'Samoocena',
								front: 'Razumeš svoje izhodišče',
								back: 'Odgovori pokažejo, katera področja že poznaš in katera potrebujejo več pozornosti.',
							},
							{
								title: 'Priporočilo',
								front: 'Dobiš bolj jasno smer',
								back: 'Rezultat ti pomaga izbrati primernejšo pot, modul ali naslednjo vsebino.',
							},
						]}
					/>

					<HomeDigCompSection
						activeIndex={activeIndex}
						rotationCount={rotationCount}
					/>

					<HomeFinalCtaSection />
				</div>
		</main>
	)
}

export default HomePage