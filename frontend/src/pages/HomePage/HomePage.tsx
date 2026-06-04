import { useEffect, useRef, Fragment } from 'react'
import Lenis from 'lenis'
import { useScroll } from 'framer-motion'

import { useGlobalSearch } from '../../contexts/SearchContext'
import SectionSpacer from '../../components/layout/SectionSpacer'
import HomeParallaxEnvironment from './components/HomeParallaxEnvironment'
import HomeScrollJourney from './components/HomeScrollJourney'
import HomeHeroSection from './components/HomeHeroSection'
import HomeStorySection from './components/HomeStorySection'
import HomeFinalCtaSection from './components/HomeFinalCtaSection'
import { STORY_SECTIONS_DATA } from './constants.ts'

function HomePage() {

	const { isSearchActive, setIsSearchActive } = useGlobalSearch()

	const parallaxContainerRef = useRef<HTMLDivElement | null>(null)
	const lenisRef = useRef<Lenis | null>(null)
	
	const { scrollYProgress } = useScroll({
		target: parallaxContainerRef,
		offset: ['start start', 'end start'],
	})

	useEffect(() => {
		if (isSearchActive) {
			// Standard lock
			document.body.style.overflow = 'hidden'
			
			// iOS Safari robust lock
			document.documentElement.style.overflow = 'hidden'
			
			if (lenisRef.current) {
				lenisRef.current.scrollTo(0, { immediate: true })
				lenisRef.current.stop()
			} else {
				// Instant scroll to top for Safari
				window.scrollTo(0, 0)
			}
		} else {
			document.body.style.overflow = 'unset'
			document.documentElement.style.overflow = 'unset'
			
			if (lenisRef.current) {
				lenisRef.current.start()
			}
		}

		return () => {
			document.body.style.overflow = 'unset'
			document.documentElement.style.overflow = 'unset'
			
			if (lenisRef.current) {
				lenisRef.current.start()
			}
		}
	}, [isSearchActive])

	useEffect(() => {
		// Safari/iOS has native momentum scrolling that conflicts badly with Lenis
		// causing rubber-banding, scroll-freezing, and double-scroll artifacts.
		// Detect Safari and skip Lenis entirely on those platforms.
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

		if (isSafari || isIOS) {
			// Let Safari use its native smooth scrolling
			return
		}

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			gestureOrientation: 'vertical',
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 1.5,
		})
		
		lenisRef.current = lenis

		let animationFrameId: number

		function raf(time: number) {
			lenis.raf(time)
			animationFrameId = requestAnimationFrame(raf)
		}

		animationFrameId = requestAnimationFrame(raf)

		return () => {
			cancelAnimationFrame(animationFrameId)
			lenis.destroy()
			lenisRef.current = null
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
				className={`fixed inset-0 z-40 transition-[opacity,backdrop-filter] duration-500 ease-in-out ${isSearchActive
					? 'bg-[#fffdf8]/60 backdrop-blur-md opacity-100'
					: 'pointer-events-none bg-transparent backdrop-blur-none opacity-0'
					}`}
				style={{
					transform: 'translateZ(0)',
					WebkitTransform: 'translateZ(0)',
				}}
				onClick={() => setIsSearchActive(false)}
				aria-hidden="true"
			/>

			<HomeScrollJourney />

			<div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
				<HomeHeroSection />

				{STORY_SECTIONS_DATA.map((section) => (
					<Fragment key={section.id}>
						<SectionSpacer size="large" />
						<HomeStorySection
							id={section.id}
							eyebrow={section.eyebrow}
							title={section.title}
							description={section.description}
							align="left"
							cards={section.cards}
						/>
					</Fragment>
				))}

				{/* ── Spacer: Vprašalnik → CTA ── */}
				<SectionSpacer size="normal" />

				<HomeFinalCtaSection />
			</div>
		</main>
	)
}

export default HomePage