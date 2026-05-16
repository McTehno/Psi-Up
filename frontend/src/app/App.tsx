import { Fragment, useState, useEffect } from 'react'

import { landingAnchors } from './router'

type IconProps = {
	className?: string
}

function BookOpenIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M12 5.5c-1.7-1.1-3.8-1.7-6-1.7a1.5 1.5 0 0 0-1.5 1.5V18a1 1 0 0 0 1.3.95c1.9-.6 4-.8 6.2-.4V5.5Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 5.5c1.7-1.1 3.8-1.7 6-1.7a1.5 1.5 0 0 1 1.5 1.5V18a1 1 0 0 1-1.3.95c-1.9-.6-4-.8-6.2-.4V5.5Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function CompassIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
			<path d="m14.6 9.4-1.1 3.1-3.1 1.1 1.1-3.1 3.1-1.1Z" fill="currentColor" />
		</svg>
	)
}

function TargetIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
			<circle cx="12" cy="12" r="3" fill="currentColor" />
		</svg>
	)
}

function UserIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M12 12.2a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z"
				stroke="currentColor"
				strokeWidth="1.7"
			/>
			<path
				d="M5.8 19.2a6.2 6.2 0 0 1 12.4 0"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
			/>
		</svg>
	)
}

function LeafIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M18.5 5.5c-6.2-.4-11.5 3.9-11.9 10.1 0 .6.2 1.2.6 1.6.4.4 1 .6 1.6.6 6.2-.4 10.5-5.7 10.1-11.9Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M7.5 16.5c2.3-2.1 4.8-3.8 7.5-5.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

function ArrowRightIcon({ className = 'h-4 w-4' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
			<path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
			<path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

function UsersIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

function EditIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M12 20h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	)
}

function ShieldIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	)
}

function LightbulbIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M9 18h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M10 22h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

const focusTags = ['Personalizirano', 'Mirno', 'Jasno'] as const

const processSteps = [
	{
		icon: BookOpenIcon,
		title: 'Vprašalnik',
		text: 'Pokaže izhodišče.',
	},
	{
		icon: CompassIcon,
		title: 'Priporočilo',
		text: 'Uredi naslednji korak.',
	},
	{
		icon: TargetIcon,
		title: 'Napredek',
		text: 'Drži smer do cilja.',
	},
] as const

const outcomeCards = [
	{ icon: LeafIcon, title: 'Predznanje' },
	{ icon: TargetIcon, title: 'Cilj' },
	{ icon: UserIcon, title: 'Vloga' },
	{ icon: CompassIcon, title: 'DigComp' },
] as const

const digcompAreas = [
	{
		title: 'Iskanje, vrednotenje in upravljanje',
		icon: SearchIcon,
		description: 'Iskanje, vrednotenje in upravljanje podatkov ter informacij.',
		themeBg: 'bg-[#FACA3A]',
		themeText: 'text-white',
		svgFill: '#FACA3A',
	},
	{
		title: 'Komunikacija in sodelovanje',
		icon: UsersIcon,
		description: 'Interakcija, deljenje in sodelovanje v digitalnem okolju.',
		themeBg: 'bg-[#4888C9]',
		themeText: 'text-white',
		svgFill: '#4888C9',
	},
	{
		title: 'Ustvarjanje digitalnih vsebin',
		icon: EditIcon,
		description: 'Razvoj, integracija in obdelava digitalnih virov.',
		themeBg: 'bg-[#F29111]',
		themeText: 'text-white',
		svgFill: '#F29111',
	},
	{
		title: 'Varnost in odgovorna raba',
		icon: ShieldIcon,
		description: 'Zaščita naprav, podatkov, zasebnosti in zdravja.',
		themeBg: 'bg-[#4AAA4B]',
		themeText: 'text-white',
		svgFill: '#4AAA4B',
	},
	{
		title: 'Prepoznavanje in reševanje težav',
		icon: LightbulbIcon,
		description: 'Prepoznavanje logičnih potreb in reševanje tehničnih izzivov.',
		themeBg: 'bg-[#F05A4E]',
		themeText: 'text-white',
		svgFill: '#F05A4E',
	},
] as const

function App() {
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % digcompAreas.length)
		}, 4000)
		return () => clearInterval(interval)
	}, [])

	return (
		<main className="relative isolate min-h-screen overflow-hidden bg-sand-50 text-forest-900">
			<div
				className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(111,146,127,0.34),_transparent_28%),radial-gradient(circle_at_82%_12%,_rgba(143,99,75,0.13),_transparent_20%),radial-gradient(circle_at_85%_10%,_rgba(111,146,127,0.16),_transparent_24%),linear-gradient(180deg,_rgba(250,253,249,0.98),_rgba(229,239,231,0.98))]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute left-0 top-36 -z-10 h-72 w-72 rounded-full bg-forest-300/25 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute right-0 top-24 -z-10 h-96 w-96 rounded-full bg-forest-200/20 blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
				<header className="flex items-center justify-between gap-4 border-b border-forest-900/10 pb-5">
					<a href="#top" className="inline-flex items-center gap-3">
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-900 text-sm font-semibold tracking-[0.25em] text-sand-50 shadow-lg shadow-forest-900/20">
							PS
						</span>
						<span>
							<span className="block font-display text-xl tracking-tight text-forest-900">
								Psi-Up
							</span>
							<span className="block text-sm text-forest-700">Priporočilne učne poti</span>
						</span>
					</a>

					<nav className="hidden flex-wrap gap-2 md:flex">
						{landingAnchors.map((item) => (
							<a
								key={item.href}
								href={item.href}
								className="rounded-full border border-forest-200 bg-forest-50 px-4 py-2 text-sm font-medium text-forest-800 transition hover:border-forest-300 hover:bg-white hover:text-forest-900"
							>
								{item.label}
							</a>
						))}
					</nav>
				</header>

				<section
					id="top"
					className="grid gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20"
				>
					<div className="max-w-xl">
						

						<h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-forest-900 sm:text-6xl xl:text-7xl">
							Pot do cilja je lažja, ko je najprej mirna.
						</h1>

						<p className="mt-5 max-w-lg text-lg leading-8 text-forest-700">
							Psi-Up poveže vprašalnik, DigComp in učno pot v eno jasno priporočilo.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<a
								href="#how-it-works"
								className="inline-flex items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-sand-50 shadow-[0_14px_40px_rgba(23,49,40,0.18)] transition hover:bg-forest-800"
							>
								Kako deluje
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</a>
							<a
								href="#digcomp"
								className="inline-flex items-center justify-center rounded-full border border-forest-200 bg-forest-50 px-6 py-3 text-sm font-semibold text-forest-900 shadow-sm transition hover:border-forest-300 hover:bg-white"
							>
								Kaj upošteva
							</a>
						</div>

						<div className="mt-10 flex flex-wrap gap-2">
							{focusTags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-forest-200 bg-forest-50 px-3 py-2 text-sm font-medium text-forest-800"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className="relative min-h-[30rem] sm:min-h-[40rem] w-full flex flex-col">
						{/* Foreground Info Layer */}
						<div className="absolute inset-x-0 top-16 sm:top-20 z-10 flex flex-col items-center text-center px-4 sm:px-6">
							{digcompAreas.map((area, idx) => {
								const isActive = activeIndex === idx
								return (
									<div
										key={area.title}
										className={`absolute inset-x-0 top-0 flex flex-col items-center transition-all duration-700 ease-in-out ${
											isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
										}`}
										aria-hidden={!isActive}
									>
										<span className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg border border-white/20 ${area.themeBg} ${area.themeText}`}>
											<area.icon className="h-8 w-8" />
										</span>
										<h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-tight text-forest-900 max-w-[28rem]">
											{area.title}
										</h2>
										<p className="mt-4 text-sm sm:text-base leading-relaxed text-forest-700 max-w-[24rem]">
											{area.description}
										</p>
									</div>
								)
							})}
						</div>

						{/* The Rotating Wheel (Massive background element bleeding off screen) */}
						<svg
							viewBox="-120 -120 240 240"
							className="absolute top-64 lg:top-48 -right-[240%] sm:-right-[160%] md:-right-[130%] lg:-right-[90%] w-[300%] sm:w-[220%] md:w-[180%] lg:w-[150%] max-w-[1200px] aspect-square transition-transform duration-1000 ease-in-out -z-10"
							style={{ transform: `rotate(${-81 - activeIndex * 72}deg)` }}
						>
							{digcompAreas.map((area, idx) => {
								const startAngle = (idx * 72 - 90) * (Math.PI / 180)
								const endAngle = ((idx + 1) * 72 - 90) * (Math.PI / 180)
								
								// Use a slightly larger radius for the pentagon placement
								const v1x = Math.cos(startAngle) * 95
								const v1y = Math.sin(startAngle) * 95
								const v2x = Math.cos(endAngle) * 95
								const v2y = Math.sin(endAngle) * 95

								// Increased spacing (gap) between the lines (0.2 to 0.8)
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
				</section>

				<section
					id="how-it-works"
					className="grid gap-4 pb-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch"
				>
					{processSteps.map((step, index) => (
						<Fragment key={step.title}>
							<article
								className="rounded-[2rem] border border-forest-900/10 bg-white/85 p-6 shadow-sm"
							>
								<div className="flex items-center justify-between gap-4">
									<span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-100 text-forest-700">
										<step.icon className="h-5 w-5" />
									</span>
									<span className="text-xs font-semibold uppercase tracking-[0.24em] text-forest-700">
										Korak
									</span>
								</div>
								<h2 className="mt-5 font-display text-3xl leading-tight text-forest-900">
									{step.title}
								</h2>
								<p className="mt-2 text-sm leading-7 text-forest-700">{step.text}</p>
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
					<article className="rounded-[2rem] border border-forest-900/10 bg-white/85 p-7 shadow-sm sm:p-8">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-brown-700">
							DigComp + curriculum
						</p>
						<h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-forest-900">
							Priporočilo je prilagojeno.
						</h2>
						<p className="mt-4 max-w-xl text-base leading-8 text-forest-700">
							Sistem upošteva predznanje, cilj in vlogo.
						</p>
						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							{outcomeCards.map(({ icon: Icon, title }) => (
								<div key={title} className="flex items-center gap-3 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-4">
									<span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-900 text-sand-50">
										<Icon className="h-5 w-5" />
									</span>
									<p className="text-sm font-semibold text-forest-900">{title}</p>
								</div>
							))}
						</div>
					</article>

					<article className="overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-sm">
						<img
							src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80"
							alt="Pen on lined paper"
							className="h-72 w-full object-cover object-center"
						/>
						<div className="p-6">
							<p className="text-sm font-semibold uppercase tracking-[0.24em] text-forest-700">
								Za koga je
							</p>
							<p className="mt-3 text-sm leading-7 text-forest-700">
								Za študente, zaposlene, profesorje in ekipe.
							</p>
						</div>
					</article>
				</section>
			</div>
		</main>
	)
}

export default App
