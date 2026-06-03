import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from 'lenis'
import { useScroll } from 'framer-motion'

import { useGlobalSearch } from '../../contexts/SearchContext'
import HomeParallaxEnvironment from './components/HomeParallaxEnvironment'
import HomeScrollJourney from './components/HomeScrollJourney'
import HomeHeroSection from './components/HomeHeroSection'
import HomeStorySection from './components/HomeStorySection'
import HomeFinalCtaSection from './components/HomeFinalCtaSection'

function HomePage() {
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

	const parallaxContainerRef = useRef<HTMLDivElement | null>(null)
	const { scrollYProgress } = useScroll({
		target: parallaxContainerRef,
		offset: ['start start', 'end start'],
	})

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
			<div
				ref={parallaxContainerRef}
				className="absolute inset-x-0 top-0 pointer-events-none"
				style={{ height: '1050vh' }}
				aria-hidden="true"
			>
				<HomeParallaxEnvironment scrollYProgress={scrollYProgress} />
			</div>

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

				{/* ── Spacer: Hero → Učne poti ── */}
				<div className="h-[56vh] lg:h-[70vh]" aria-hidden="true" />

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

				{/* ── Spacer: Učne poti → Moduli ── */}
				<div className="h-[56vh] lg:h-[70vh]" aria-hidden="true" />

				<HomeStorySection
					id="modules"
					eyebrow="Moduli"
					title="Večjo pot razdeli na razumljive korake."
					description="Modul predstavlja zaokrožen del učne poti. Vsak modul ima svoj namen, zato lažje slediš napredku in razumeš, kaj posamezen korak prinese."
					align="left"
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

				{/* ── Spacer: Moduli → Učne enote ── */}
				<div className="h-[56vh] lg:h-[70vh]" aria-hidden="true" />

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

				{/* ── Spacer: Učne enote → Vprašalnik ── */}
				<div className="h-[56vh] lg:h-[70vh]" aria-hidden="true" />

				<HomeStorySection
					id="questionnaire"
					eyebrow="Vprašalnik"
					title="Preveri, kje si trenutno."
					description="Vprašalnik ti pomaga oceniti trenutno znanje in prepoznati področja, kjer imaš največ prostora za napredek."
					align="left"
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

				{/* ── Spacer: Vprašalnik → CTA ── */}
				<div className="h-[40vh] lg:h-[56vh]" aria-hidden="true" />

				<HomeFinalCtaSection />
			</div>
		</main>
	)
}

export default HomePage