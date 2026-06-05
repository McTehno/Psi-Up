import { useEffect, useRef, useState } from 'react'
import aboutMountains from '../../assets/AboutUsPage/about-mountains.png'
import { usePageTitle } from '../../hooks/usePageTitle'
const workPackages = [
	'Analiza potreb',
	'Razvoj prilagodljivega kurikuluma',
	'Certificiranje in mikrodokazila',
	'Spremljanje kakovosti',
	'Vključevanje partnerjev',
]

const AboutPage = () => {
	const [scrollY, setScrollY] = useState(0)
	const [isTimelineVisible, setIsTimelineVisible] = useState(false)
	const [activeTimelineStep, setActiveTimelineStep] = useState(0)

	const heroRef = useRef<HTMLElement | null>(null)
	const goalRef = useRef<HTMLElement | null>(null)
	const reasonRef = useRef<HTMLElement | null>(null)
	const timelineRef = useRef<HTMLElement | null>(null)

	const [visibleSections, setVisibleSections] = useState({
		hero: false,
		goal: false,
		reason: false,
		timeline: false,
	})
	usePageTitle('NIDiKo')

	useEffect(() => {
		let animationFrameId = 0

		const handleScroll = () => {
			animationFrameId = window.requestAnimationFrame(() => {
				setScrollY(window.scrollY)
			})
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.cancelAnimationFrame(animationFrameId)
		}
	}, [])

	useEffect(() => {
		const observedSections = [
			{ key: 'hero', element: heroRef.current },
			{ key: 'goal', element: goalRef.current },
			{ key: 'reason', element: reasonRef.current },
			{ key: 'timeline', element: timelineRef.current },
		] as const

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						return
					}

					const sectionKey = entry.target.getAttribute('data-section')

					if (
						sectionKey === 'hero' ||
						sectionKey === 'goal' ||
						sectionKey === 'reason' ||
						sectionKey === 'timeline'
					) {
						setVisibleSections((currentSections) => ({
							...currentSections,
							[sectionKey]: true,
						}))
					}

					if (sectionKey === 'timeline') {
						setIsTimelineVisible(true)
					}
				})
			},
			{
				threshold: 0.2,
				rootMargin: '0px 0px -80px 0px',
			},
		)

		observedSections.forEach(({ key, element }) => {
			if (!element) {
				return
			}

			element.setAttribute('data-section', key)
			observer.observe(element)
		})

		return () => {
			observer.disconnect()
		}
	}, [])

	useEffect(() => {
		if (!isTimelineVisible) {
			return
		}

		setActiveTimelineStep(0)

		const timers = workPackages.slice(1).map((_, index) =>
			window.setTimeout(() => {
				setActiveTimelineStep(index + 1)
			}, (index + 1) * 320),
		)

		return () => {
			timers.forEach((timer) => window.clearTimeout(timer))
		}
	}, [isTimelineVisible])

	const getRevealClassName = (isVisible: boolean, delay = '') =>
		[
			'transition-all duration-1000 ease-out',
			delay,
			isVisible
				? 'translate-y-0 scale-100 opacity-100 blur-0'
				: 'translate-y-10 scale-[0.98] opacity-0 blur-[3px]',
		].join(' ')

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#fffdf8] text-[#111111]">
			<div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden">
				<img
					src={aboutMountains}
					alt=""
					aria-hidden="true"
					className="absolute left-0 top-0 h-[145vh] w-screen object-cover opacity-45"
					style={{
						transform: `translateY(calc(-20vh + ${scrollY * 0.045}px)) scale(1.08)`,
						transformOrigin: 'center top',
					}}
				/>

				<div className="absolute inset-0 bg-gradient-to-b from-[#fffdf8]/10 via-[#fffdf8]/38 to-[#fffdf8]/92" />
				<div className="absolute inset-0 bg-[#fffdf8]/10" />
			</div>

			<section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-4 pb-32 pt-36 sm:px-6 lg:px-8">
				<div className="pointer-events-none absolute left-10 top-28 h-80 w-80 rounded-full bg-[#31583b]/10 blur-3xl" />
				<div className="pointer-events-none absolute bottom-28 right-8 h-80 w-80 rounded-full bg-[#d07a12]/10 blur-3xl" />

				<section ref={heroRef} className="flex min-h-[70vh] w-full items-center">
					<div
						className={[
							'mx-auto w-full max-w-5xl text-center',
							getRevealClassName(visibleSections.hero),
						].join(' ')}
					>
						<p className="text-xs font-bold uppercase tracking-[0.34em] text-[#706b60]">
							O projektu NIDiKo
						</p>

						<h1 className="mx-auto mt-7 max-w-4xl font-serif text-[clamp(44px,6.4vw,82px)] leading-[1.01] text-[#33442f]">
							Prilagodljiv razvoj digitalnih kompetenc.
						</h1>

						<p className="mx-auto mt-8 max-w-2xl text-[18px] leading-8 text-[#5f5a52]">
							NIDiKo razvija modularno zasnovan in prilagodljiv kurikulum za
							neformalna izobraževanja na področju digitalnih kompetenc.
						</p>
					</div>
				</section>

				<section ref={goalRef} className="w-full py-24">
					<div
						className={[
							'mx-auto max-w-5xl',
							getRevealClassName(visibleSections.goal),
						].join(' ')}
					>
						<div className="rounded-[38px] border border-white/40 bg-white/14 px-6 py-10 text-center shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:px-10 lg:px-14">
							<p className="inline-flex rounded-full bg-[#f2f8f1]/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#31583b]">
								Cilj projekta
							</p>

							<p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#706b60]">
								Usmeritev projekta je razvoj učne strukture, ki se lahko
								prilagaja različnim uporabnikom in njihovemu začetnemu znanju.
							</p>

							<div className="mx-auto my-8 h-px max-w-xl bg-[#ded5c6]/70" />

							<h2 className="mx-auto max-w-3xl font-serif text-[clamp(30px,4vw,52px)] leading-[1.05] text-[#33442f]">
								Prilagodljiv kurikulum glede na izhodišče uporabnika.
							</h2>

							<p className="mx-auto mt-5 max-w-3xl text-[16px] leading-7 text-[#5f5a52]">
								Namen je razviti kurikulum, ki se prilagaja uporabnikom,
								izvajalcem in različnim ravnem znanja. Sistem lahko podpira
								različne cilje uporabnikov ter jim pomaga razumeti, kje začeti
								in kako napredovati.
							</p>
						</div>
					</div>
				</section>

				<section ref={reasonRef} className="w-full py-24">
					<div className="mx-auto max-w-5xl">
						<div
							className={[
								'mx-auto max-w-3xl text-center',
								getRevealClassName(visibleSections.reason),
							].join(' ')}
						>
							<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
								Zakaj projekt obstaja
							</p>

							<h2 className="mt-5 font-serif text-[clamp(32px,4vw,54px)] leading-[1.04] text-[#33442f]">
								Digitalne kompetence so ključne za sodelovanje v sodobni
								družbi.
							</h2>

							<p className="mt-5 text-[16px] leading-7 text-[#5f5a52]">
								Med različnimi ciljnimi skupinami še vedno nastajajo razlike med
								pričakovanimi in dejansko doseženimi digitalnimi znanji.
							</p>
						</div>

						<div className="mt-12 grid gap-5 lg:grid-cols-2">
							<article
								className={[
									'rounded-[28px] border border-white/40 bg-white/16 p-6 shadow-[0_16px_42px_rgba(57,47,35,0.07)] backdrop-blur-2xl sm:p-7',
									getRevealClassName(visibleSections.reason, 'delay-150'),
								].join(' ')}
							>
								<p className="inline-flex rounded-full bg-[#f2f8f1]/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#31583b]">
									Izziv
								</p>

								<h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#33442f]">
									Neenak razvoj znanja in različne potrebe uporabnikov.
								</h3>

								<p className="mt-4 text-sm leading-6 text-[#5f5a52]">
									Uporabniki imajo različne ravni predznanja. Mlajši, starejši,
									zaposleni in ljudje z različnimi oviranostmi potrebujejo
									različne načine učenja ter jasnejšo učno strukturo.
								</p>
							</article>

							<article
								className={[
									'rounded-[28px] border border-white/40 bg-white/16 p-6 shadow-[0_16px_42px_rgba(57,47,35,0.07)] backdrop-blur-2xl sm:p-7',
									getRevealClassName(visibleSections.reason, 'delay-300'),
								].join(' ')}
							>
								<p className="inline-flex rounded-full bg-[#fff6eb]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d07a12]">
									Pristop
								</p>

								<h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#33442f]">
									Neformalno izobraževanje z jasno strukturo vsebin.
								</h3>

								<p className="mt-4 text-sm leading-6 text-[#5f5a52]">
									Projekt naslavlja področje, kjer so pomembni preglednost,
									povezljivost in prilagodljivost. Učne poti, moduli in učne
									enote pomagajo uporabniku razumeti večjo sliko učenja.
								</p>
							</article>
						</div>
					</div>
				</section>

				<section ref={timelineRef} className="w-full py-24">
					<div
						className={[
							'mx-auto max-w-5xl rounded-[40px] border border-white/40 bg-white/14 p-6 shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:p-10',
							getRevealClassName(visibleSections.timeline),
						].join(' ')}
					>
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
								Struktura projekta
							</p>

							<h2 className="mt-5 font-serif text-[clamp(34px,4vw,58px)] leading-[1.04] text-[#33442f]">
								Pet korakov od analize do širše uporabe.
							</h2>

							<p className="mt-6 text-[17px] leading-8 text-[#5f5a52]">
								Projekt je razdeljen na delovne pakete, ki vodijo od analize
								potreb do razvoja kurikuluma, certificiranja, spremljanja
								kakovosti in vključevanja partnerjev.
							</p>
						</div>

						<div className="relative mt-12 hidden md:block">
							<div className="absolute left-0 right-0 top-[22px] h-[2px] rounded-full bg-white/35">
								<div
									className="h-full rounded-full bg-[#31583b] transition-all duration-[850ms] ease-out"
									style={{
										width: `${
											(activeTimelineStep / (workPackages.length - 1)) * 100
										}%`,
									}}
								/>
							</div>

							<div className="grid grid-cols-5 gap-4">
								{workPackages.map((item, index) => {
									const isActive = index <= activeTimelineStep

									return (
										<div key={item} className="relative text-center">
											<div
												className={[
													'mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/55 text-sm font-semibold shadow-[0_12px_30px_rgba(57,47,35,0.10)] backdrop-blur-2xl transition-all duration-500',
													isActive
														? 'scale-100 bg-[#31583b] text-white'
														: 'scale-95 bg-[#fffdf8]/45 text-[#31583b]',
												].join(' ')}
											>
												{index + 1}
											</div>

											<p
												className={[
													'mt-5 text-sm font-semibold leading-5 text-[#33442f] transition-all duration-500',
													isActive
														? 'translate-y-0 opacity-100'
														: 'translate-y-3 opacity-0',
												].join(' ')}
											>
												{item}
											</p>
										</div>
									)
								})}
							</div>
						</div>

						<div className="relative mt-12 md:hidden">
							<div className="absolute bottom-8 left-5 top-5 w-[2px] rounded-full bg-white/35">
								<div
									className="w-full origin-top rounded-full bg-[#31583b] transition-all duration-[850ms] ease-out"
									style={{
										height: `${
											(activeTimelineStep / (workPackages.length - 1)) * 100
										}%`,
									}}
								/>
							</div>

							<div className="space-y-8">
								{workPackages.map((item, index) => {
									const isActive = index <= activeTimelineStep

									return (
										<div key={item} className="relative flex gap-5">
											<div
												className={[
													'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 text-sm font-semibold shadow-[0_12px_30px_rgba(57,47,35,0.10)] backdrop-blur-2xl transition-all duration-500',
													isActive
														? 'scale-100 bg-[#31583b] text-white'
														: 'scale-95 bg-[#fffdf8]/55 text-[#31583b]',
												].join(' ')}
											>
												{index + 1}
											</div>

											<p
												className={[
													'pt-2 text-left text-sm font-semibold leading-5 text-[#33442f] transition-all duration-500',
													isActive
														? 'translate-x-0 opacity-100'
														: 'translate-x-3 opacity-0',
												].join(' ')}
											>
												{item}
											</p>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</section>
			</section>
		</main>
	)
}

export default AboutPage

