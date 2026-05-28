import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import aboutMountains from '../../assets/AboutUsPage/about-mountains.png'

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
	const timelineRef = useRef<HTMLElement | null>(null)

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
		const timelineElement = timelineRef.current

		if (!timelineElement) {
			return
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsTimelineVisible(true)
				}
			},
			{
				threshold: 0.35,
			},
		)

		observer.observe(timelineElement)

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
			}, 900 + index * 950),
		)

		return () => {
			timers.forEach((timer) => window.clearTimeout(timer))
		}
	}, [isTimelineVisible])

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

			<section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-4 pb-24 pt-32 sm:px-6 lg:px-8">
				<div className="pointer-events-none absolute left-10 top-28 h-80 w-80 rounded-full bg-[#31583b]/10 blur-3xl" />
				<div className="pointer-events-none absolute bottom-28 right-8 h-80 w-80 rounded-full bg-[#d07a12]/10 blur-3xl" />

				<section className="flex min-h-[78vh] w-full items-center justify-center">
					<div className="mx-auto max-w-4xl rounded-[38px] border border-white/40 bg-white/14 px-6 py-10 text-center shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:px-10 lg:px-14">
						<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
							O projektu NIDiKo
						</p>

						<h1 className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(40px,5.4vw,72px)] leading-[1.02] text-[#33442f]">
							Prilagodljiv razvoj digitalnih kompetenc.
						</h1>

						<p className="mx-auto mt-7 max-w-2xl text-[18px] leading-8 text-[#5f5a52]">
							NIDiKo razvija modularno zasnovan in prilagodljiv kurikulum za
							neformalna izobraževanja na področju digitalnih kompetenc.
						</p>

						<div className="mt-10 grid gap-4 sm:grid-cols-3">
							<div className="rounded-[24px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl">
								<p className="text-3xl font-semibold text-[#31583b]">24</p>
								<p className="mt-2 text-sm font-medium text-[#706b60]">
									mesecev trajanja
								</p>
							</div>

							<div className="rounded-[24px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl">
								<p className="text-3xl font-semibold text-[#d07a12]">5</p>
								<p className="mt-2 text-sm font-medium text-[#706b60]">
									delovnih paketov
								</p>
							</div>

							<div className="rounded-[24px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl">
								<p className="text-3xl font-semibold text-[#31583b]">1</p>
								<p className="mt-2 text-sm font-medium text-[#706b60]">
									sistematičen pristop
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-16">
					<div className="mx-auto max-w-5xl rounded-[40px] border border-white/40 bg-white/14 p-6 shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:p-10">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
								Zakaj projekt obstaja
							</p>

							<h2 className="mt-5 font-serif text-[clamp(34px,4vw,58px)] leading-[1.04] text-[#33442f]">
								Digitalne kompetence so ključne za sodelovanje v sodobni
								družbi.
							</h2>

							<p className="mt-6 text-[17px] leading-8 text-[#5f5a52]">
								Čeprav se digitalne kompetence razvijajo tudi v formalnem
								izobraževanju, med različnimi ciljnimi skupinami še vedno
								nastajajo razlike med pričakovanimi in dejansko doseženimi
								znanji.
							</p>
						</div>

						<div className="mt-10 grid gap-5 md:grid-cols-3">
							<article className="rounded-[28px] border border-white/40 bg-white/16 p-6 backdrop-blur-2xl">
								<p className="inline-flex rounded-full bg-[#f2f8f1]/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#31583b]">
									Izziv
								</p>

								<h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#33442f]">
									Neenak razvoj znanja
								</h3>

								<p className="mt-4 text-sm leading-6 text-[#5f5a52]">
									Mlajši, starejši, zaposleni posamezniki in ljudje z različnimi
									oviranostmi imajo različne potrebe pri razvoju digitalnih
									kompetenc.
								</p>
							</article>

							<article className="rounded-[28px] border border-white/40 bg-white/16 p-6 backdrop-blur-2xl md:translate-y-8">
								<p className="inline-flex rounded-full bg-[#fff6eb]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d07a12]">
									Pristop
								</p>

								<h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#33442f]">
									Neformalno izobraževanje
								</h3>

								<p className="mt-4 text-sm leading-6 text-[#5f5a52]">
									Projekt naslavlja področje neformalnih izobraževanj, kjer je
									potrebno več sistematičnosti, preglednosti in povezljivosti.
								</p>
							</article>

							<article className="rounded-[28px] border border-white/40 bg-white/16 p-6 backdrop-blur-2xl">
								<p className="inline-flex rounded-full bg-[#f2f8f1]/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#31583b]">
									Cilj
								</p>

								<h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#33442f]">
									Prilagodljiv kurikulum
								</h3>

								<p className="mt-4 text-sm leading-6 text-[#5f5a52]">
									Namen je razviti modularen kurikulum, ki se lahko prilagaja
									potrebam uporabnikov, izvajalcev in različnim ravnem znanja.
								</p>
							</article>
						</div>
					</div>
				</section>

				<section ref={timelineRef} className="w-full py-20">
					<div className="mx-auto max-w-5xl rounded-[40px] border border-white/40 bg-white/14 p-6 shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:p-10">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
								Struktura projekta
							</p>

							<h2 className="mt-5 font-serif text-[clamp(34px,4vw,58px)] leading-[1.04] text-[#33442f]">
								Pet korakov od analize do širše uporabe.
							</h2>

							<p className="mt-6 text-[17px] leading-8 text-[#5f5a52]">
								Projekt je razdeljen na delovne pakete, ki pokrivajo analizo
								potreb, razvoj kurikuluma, certificiranje, kakovost ter
								vključevanje zunanjih partnerjev.
							</p>
						</div>

						<div className="relative mt-12 hidden md:block">
							<div className="absolute left-[10%] right-[10%] top-5 h-[2px] rounded-full bg-white/35">
								<div
									className="h-full origin-left rounded-full bg-[#31583b] transition-all duration-[850ms] ease-out"
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

				<section className="w-full py-16">
					<div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
						<div className="rounded-[36px] border border-white/40 bg-white/14 p-7 shadow-[0_18px_55px_rgba(57,47,35,0.08)] backdrop-blur-2xl sm:p-8">
							<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
								Kaj projekt razvija
							</p>

							<h2 className="mt-5 font-serif text-[clamp(32px,4vw,52px)] leading-[1.05] text-[#33442f]">
								Več kot samo seznam učnih vsebin.
							</h2>

							<p className="mt-5 text-[16px] leading-7 text-[#5f5a52]">
								NIDiKo povezuje vsebinsko zasnovo izobraževanj z učnimi izidi,
								načini preverjanja znanja, certificiranjem dosežkov in
								mehanizmi za izboljševanje kakovosti.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-[26px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl">
								<h3 className="text-lg font-semibold text-[#33442f]">
									Mikrodokazila
								</h3>

								<p className="mt-3 text-sm leading-6 text-[#5f5a52]">
									Projekt vključuje strategijo za izdajo, beleženje in
									upravljanje dokazil o doseženih digitalnih kompetencah.
								</p>
							</div>

							<div className="rounded-[26px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl">
								<h3 className="text-lg font-semibold text-[#33442f]">
									Certificiranje
								</h3>

								<p className="mt-3 text-sm leading-6 text-[#5f5a52]">
									Pomemben del projekta je vzpostavitev sistema za priznavanje
									in potrjevanje pridobljenih znanj.
								</p>
							</div>

							<div className="rounded-[26px] border border-white/40 bg-white/16 p-5 backdrop-blur-2xl sm:col-span-2">
								<h3 className="text-lg font-semibold text-[#33442f]">
									Spremljanje kakovosti
								</h3>

								<p className="mt-3 text-sm leading-6 text-[#5f5a52]">
									Metodologija spremljanja kakovosti omogoča zbiranje povratnih
									informacij ter postopno izboljševanje izvedenih izobraževanj.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full pb-10 pt-8">
					<div className="mx-auto max-w-3xl rounded-[36px] border border-white/40 bg-white/14 p-7 text-center shadow-[0_24px_70px_rgba(57,47,35,0.10)] backdrop-blur-2xl sm:p-10">
						<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#706b60]">
							Nadaljuj raziskovanje
						</p>

						<h2 className="mt-5 font-serif text-[clamp(32px,4vw,52px)] leading-[1.05] text-[#33442f]">
							Razišči vsebine, povezane z digitalnimi kompetencami.
						</h2>

						<p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#5f5a52]">
							Na strani za iskanje lahko pregledaš učne poti, module in učne
							enote ter izbereš vsebino, ki te zanima.
						</p>

						<Link
							to="/search"
							className="mt-8 inline-flex items-center justify-center rounded-full bg-[#31583b] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(49,88,59,0.22)] transition hover:bg-[#26472f]"
						>
							Pojdi na iskanje
						</Link>
					</div>
				</section>
			</section>
		</main>
	)
}

export default AboutPage