import { Fragment } from 'react'

import { landingAnchors } from './router'

const greenPathImage = new URL('../assets/greenpath.jpeg', import.meta.url).href

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

const galleryImages = [
	{
		src: greenPathImage,
		alt: 'Zelena pot skozi gozd',
		caption: 'Zelena pot',
	},
	{
		src: 'https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVuJTIwd3JpdGluZyUyMHBhcGVyfGVufDB8fDB8fHww',
		alt: 'Pen writing on paper',
		caption: 'Jasen zapis',
	},
] as const

function App() {
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
						<span className="inline-flex items-center gap-2 rounded-full border border-brown-200 bg-brown-50 px-4 py-2 text-sm font-semibold text-brown-700 shadow-sm shadow-brown-100/20">
							<span className="h-2 w-2 rounded-full bg-brown-500" />
							Začni tam, kjer si danes
						</span>

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

					<div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
						<figure className="group relative overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-[0_24px_80px_rgba(17,40,30,0.1)] sm:row-span-2">
							<img
								src={galleryImages[0].src}
								alt={galleryImages[0].alt}
								className="h-full min-h-[34rem] w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
							/>
							<figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-900/70 to-transparent p-5 text-sand-50">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-sand-100/75">
									{galleryImages[0].caption}
								</p>
								<p className="mt-1 max-w-xs text-sm leading-6 text-sand-100/85">
									Miren začetek poti.
								</p>
							</figcaption>
						</figure>

						<div className="flex min-h-[18rem] flex-col justify-between rounded-[2rem] border border-forest-900/10 bg-forest-900 p-6 text-sand-50 shadow-[0_18px_60px_rgba(17,40,30,0.16)]">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-brown-100/80">
									Začni zdaj
								</p>
								<h2 className="mt-3 max-w-[14rem] font-display text-3xl leading-tight text-sand-50">
									Odpri vprašalnik in dobi prvo smer.
								</h2>
							</div>
							<a
								href="#how-it-works"
								className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brown-50 px-5 py-4 text-sm font-semibold text-brown-900 transition hover:bg-white"
							>
								Začni vprašalnik
								<ArrowRightIcon className="h-4 w-4" />
							</a>
							<p className="mt-4 text-sm leading-6 text-forest-100/80">
								En klik do začetka poti.
							</p>
						</div>

						<figure className="group overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-[0_18px_60px_rgba(17,40,30,0.08)]">
							<img
								src={galleryImages[1].src}
								alt={galleryImages[1].alt}
								className="h-60 w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
							/>
							<figcaption className="p-4">
								<p className="text-sm font-semibold text-forest-900">{galleryImages[1].caption}</p>
								<p className="mt-1 text-sm leading-6 text-forest-700">Najprej zapis, potem smer.</p>
							</figcaption>
						</figure>
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
