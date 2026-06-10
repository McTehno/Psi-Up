import { useRef } from 'react'
import { motion, MotionValue, useTransform, useMotionTemplate, useMotionValueEvent } from 'framer-motion'

import fogVideo from '../../../assets/parallax/fog-background.webm'
import pathMountainImage from '../../../assets/parallax/path-mountain.webp'
import moduleMountainImage from '../../../assets/parallax/module-mountain.webp'
import unitMountainImage from '../../../assets/parallax/unit-mountain.webp'
import GlowingOrbs from './GlowingOrbs'

/**
 * HomeParallaxEnvironment
 *
 * Kinematografsko parallax ozadje, ki razkriva gorsko pokrajino
 * izza ponavljajocega se oblaka video posnetka med drsenjem.
 *
 * Kontejner sega cez 800vh, pokriva Hero do Ucne enote,
 * in se elegantno odlepi pred Vprasalnik.
 */
type HomeParallaxEnvironmentProps = {
	scrollYProgress: MotionValue<number>
}

function HomeParallaxEnvironment({ scrollYProgress }: HomeParallaxEnvironmentProps) {
	const mountainContainerRef = useRef<HTMLDivElement | null>(null)
	// Sledi zadnjemu uporabljenemu koraku zameglitve, da se izognes nepotrebnim DOM zapisom
	const lastBlurStepRef = useRef(0)

	/* ── Transformacije oblakov ──────────────────────────────────── */
	// Oblaki popolnoma zapustijo zaslon do trenutka, ko se zacnejo Ucne poti (~0.14)
	const cloudY = useTransform(
		scrollYProgress,
		[0, 0.061, 0.152, 0.762],
		['0%', '-15%', '-110%', '-150%'],
	)
	const cloudOpacity = useTransform(
		scrollYProgress,
		[0, 0.091, 0.137],
		[1, 0.9, 0],
	)
	const cloudScale = useTransform(scrollYProgress, [0, 0.762], [1, 1.1])

	// Optimizacija zmogljivosti: Popolnoma odstrani video iz render drevesa, ko ni viden
	const cloudDisplay = useTransform(scrollYProgress, (v) => v > 0.15 ? 'none' : 'block')

	/* ── Gora layer transformacija ───────────────────────────────── */
	const mountainY = useTransform(scrollYProgress, [0, 0.762, 1], ['0%', '-20%', '-28%'])

	// Pan left for Ucne enote
	const mountainX = useTransform(
		scrollYProgress,
		[0, 0.472, 0.625],
		['0%', '0%', '-12%']
	)

	// Priblizuje (zoom in), ko drsimo od Ucne poti do Modulov (0.30 - 0.38),
	// in ponovno od Modulov do Ucne enote (0.47 - 0.55), ter se nadaljuje do konca strani.
	const mountainScale = useTransform(
		scrollYProgress,
		[0, 0.305, 0.381, 0.472, 0.549, 0.762, 1],
		[1.05, 1.05, 1.15, 1.15, 1.30, 1.30, 1.40]
	)

	/* ── Maske za razkrivanje gora (wipe efekt za lep casovni potek) ── */
	const moduleGlowReveal = useTransform(scrollYProgress, [0.305, 0.381], [-20, 120])
	const moduleGlowMask = useMotionTemplate`linear-gradient(to top, rgba(0,0,0,1) ${moduleGlowReveal}%, rgba(0,0,0,0) calc(${moduleGlowReveal}% + 20%))`

	const unitGlowReveal = useTransform(scrollYProgress, [0.472, 0.549], [-20, 120])
	const unitGlowMask = useMotionTemplate`linear-gradient(to top, rgba(0,0,0,1) ${unitGlowReveal}%, rgba(0,0,0,0) calc(${unitGlowReveal}% + 20%))`

	/* ── Zakljucna zameglitev strani: kvantizirani koraki, da se izognemo rasterizaciji na vsak frame ── */
	// Namesto da nastavljamo blur ob vsakem scroll ticku (~60/s), zapisemo v DOM le
	// ob prehodu praga (skupaj 4 zapisi). CSS transition na elementu poskrbi
	// za gladko interpolacijo na GPU.
	useMotionValueEvent(scrollYProgress, 'change', (v) => {
		const mountainContainer = mountainContainerRef.current

    if (!mountainContainer) return
		let step = 0
		if (v > 0.97) step = 8
		else if (v > 0.95) step = 6
		else if (v > 0.93) step = 4
		else if (v > 0.91) step = 2
		// Spremeni DOM samo ce se korak zares spremeni
		if (step !== lastBlurStepRef.current) {
			lastBlurStepRef.current = step
			const filterVal = step === 0 ? 'none' : `blur(${step}px)`
			mountainContainer.style.filter = filterVal
				; mountainContainer.style.setProperty('-webkit-filter', filterVal)
		}
	})

	return (
		<div className="fixed inset-0 h-screen w-full overflow-hidden -z-30 pointer-events-none" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
			{/* ── Plast 1 · Warm gradient base + ambient orbs ──────── */}
			<div
				className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
			/>
			{/* Staticni ambient blurs — skriti na tablicah za performance */}
			<div className="absolute left-0 top-36 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl hidden lg:block" />
			<div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl hidden lg:block" />

			{/* ── Plast 2 · Slika gore (za oblaki) ────────── */}
			<motion.div
				ref={mountainContainerRef}
				className="absolute inset-x-0 top-0 h-[120%] w-full pt-[12vh]"
				style={{
					x: mountainX,
					y: mountainY,
					scale: mountainScale,
					willChange: 'transform',
					backfaceVisibility: 'hidden',
					WebkitBackfaceVisibility: 'hidden',
					transition: 'filter 0.5s ease, -webkit-filter 0.5s ease',
				}}
			>
				<div className="relative h-full w-full">
					{/* Baza gora (Ucne poti) */}
					<div className="absolute inset-0 z-0">
						<img
							src={pathMountainImage}
							alt=""
							className="h-full w-full object-cover object-center"
							loading="eager"
							decoding="async"
							draggable={false}
						/>
					</div>

					{/* Highlighted gora (Moduli) - Razkrije od spodaj navzgor */}
					<motion.div
						className="absolute inset-0 h-full w-full z-10"
						style={{
							WebkitMaskImage: moduleGlowMask,
							maskImage: moduleGlowMask,
							willChange: 'mask-image, -webkit-mask-image',
						}}
					>
						<img
							src={moduleMountainImage}
							alt=""
							className="h-full w-full object-cover object-center"
							loading="lazy"
							decoding="async"
							draggable={false}
						/>
					</motion.div>

					{/* Highlighted gora (Moduli) - Razkrije od spodaj navzgor */}
					<motion.div
						className="absolute inset-0 h-full w-full z-20"
						style={{
							WebkitMaskImage: unitGlowMask,
							maskImage: unitGlowMask,
							willChange: 'mask-image, -webkit-mask-image',
						}}
					>
						<img
							src={unitMountainImage}
							alt=""
							className="h-full w-full object-cover object-center"
							loading="lazy"
							decoding="async"
							draggable={false}
						/>
						{/* Zareci Orbs: notranje komponente upravljajo skrivanje na mobilnih napravah (npr. orbi so skriti, zigon ostane viden)*/}
						<div className="absolute inset-0 z-[100]">
							<GlowingOrbs scrollYProgress={scrollYProgress} />
						</div>
					</motion.div>

				</div>

				{/* Mehak vignette prehod, ki povezuje vrh gore z osnovo */}
				<div
					className="absolute inset-x-0 top-0 h-[30%] z-[110]"
					style={{
						background:
							'linear-gradient(to bottom, #fffdf8 0%, rgba(255,253,248,0.5) 40%, transparent 100%)',
					}}
				/>

			</motion.div>

			{/* ── Plast 3 · Video oblakov (pokriva gore, se dviga navzgor) ── */}
			{/*  Skrito na mobilnih napravah/malih tablicah zaradi baterije + performanc (Safari samodejno predvajanje videa je zahtevno) */}
			<motion.div
				className="absolute inset-x-0 top-0 h-[130%] w-full hidden sm:block"
				style={{
					display: cloudDisplay,
					y: cloudY,
					scale: cloudScale,
					opacity: cloudOpacity,
					WebkitMaskImage:
						'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
					maskImage:
						'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
					willChange: 'transform, opacity',
					backfaceVisibility: 'hidden',
					WebkitBackfaceVisibility: 'hidden',
				}}
			>
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					className="h-full w-full object-cover"
					style={{ pointerEvents: 'none' }}
				>
					<source src={fogVideo} type="video/webm" />
				</video>
			</motion.div>

		</div>
	)
}

export default HomeParallaxEnvironment






