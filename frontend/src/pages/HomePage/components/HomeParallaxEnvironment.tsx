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
 * A cinematic parallax background that reveals a mountain landscape
 * from behind a looping cloud video as the user scrolls.
 *
 * The container spans 800vh, covering the Hero down to Učne enote,
 * unpinning gracefully before Vprašalnik.
 */
type HomeParallaxEnvironmentProps = {
	scrollYProgress: MotionValue<number>
}

function HomeParallaxEnvironment({ scrollYProgress }: HomeParallaxEnvironmentProps) {
	// Safari-safe: Use refs for blur to avoid per-frame re-rasterization
	const mountainContainerRef = useRef<HTMLDivElement | null>(null)

	/* â”€â”€ Cloud layer transforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	// Clouds clear the screen fully by the time Učne poti starts (~0.14)
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

	// Performance optimization: Completely remove video from render tree when invisible
	const cloudDisplay = useTransform(scrollYProgress, (v) => v > 0.15 ? 'none' : 'block')

	/* â”€â”€ Mountain layer transforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	const mountainY = useTransform(scrollYProgress, [0, 0.762, 1], ['0%', '-20%', '-28%'])

	// Pan left for Učne enote
	const mountainX = useTransform(
		scrollYProgress,
		[0, 0.472, 0.625],
		['0%', '0%', '-12%']
	)

	// Zooms in as we scroll from Učne poti to Moduli (0.30 - 0.38), 
	// and again from Moduli to Učne enote (0.47 - 0.55), and continues to end of page.
	const mountainScale = useTransform(
		scrollYProgress,
		[0, 0.305, 0.381, 0.472, 0.549, 0.762, 1],
		[1.05, 1.05, 1.15, 1.15, 1.30, 1.30, 1.40]
	)

	// Safari-safe blur: Apply via direct DOM manipulation instead of useMotionTemplate
	// This avoids WebKit's per-frame re-rasterization bug with motion template blur values
	useMotionValueEvent(scrollYProgress, 'change', (v) => {
		const mountainContainer = mountainContainerRef.current

    if (!mountainContainer) return
		let blur = 0
		if (v > 0.92 && v <= 0.97) {
			blur = ((v - 0.92) / 0.05) * 8
		} else if (v > 0.97) {
			blur = 8
		}
		const filterVal = `blur(${blur}px)`
		mountainContainer.style.filter = filterVal
		mountainContainer.style.setProperty('-webkit-filter', filterVal)
	})

	// The highlighted module mountain reveals from bottom to top
	const moduleGlowReveal = useTransform(scrollYProgress, [0.305, 0.381], [-20, 120])
	const moduleGlowMask = useMotionTemplate`linear-gradient(to top, rgba(0,0,0,1) ${moduleGlowReveal}%, rgba(0,0,0,0) calc(${moduleGlowReveal}% + 20%))`

	// The highlighted unit mountain reveals from bottom to top
	const unitGlowReveal = useTransform(scrollYProgress, [0.472, 0.549], [-20, 120])
	const unitGlowMask = useMotionTemplate`linear-gradient(to top, rgba(0,0,0,1) ${unitGlowReveal}%, rgba(0,0,0,0) calc(${unitGlowReveal}% + 20%))`

	return (
		<div className="fixed inset-0 h-screen w-full overflow-hidden -z-30 pointer-events-none" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
			{/* â”€â”€ Layer 1 Â· Warm gradient base + ambient orbs â”€â”€â”€â”€â”€â”€â”€â”€ */}
			<div
				className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
			/>
			{/* Static ambient blurs â€” hidden on tablets for performance */}
			<div className="absolute left-0 top-36 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl hidden lg:block" />
			<div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl hidden lg:block" />

			{/* â”€â”€ Layer 2 Â· Mountain image (behind clouds) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
				}}
			>
				<div className="relative h-full w-full">
					{/* Base Mountain (Učne poti) */}
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

					{/* Highlighted Mountain (Moduli) - Reveals from bottom to top */}
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

					{/* Highlighted Mountain (Učne enote) - Reveals from bottom to top */}
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
						{/* Glowing Orbs: internal components handle mobile hiding (e.g. orbs are hidden, pin stays visible) */}
						<div className="absolute inset-0 z-[100]">
							<GlowingOrbs scrollYProgress={scrollYProgress} />
						</div>
					</motion.div>

				</div>

				{/* Soft vignette blending the mountain top into the base */}
				<div
					className="absolute inset-x-0 top-0 h-[30%] z-[110]"
					style={{
						background:
							'linear-gradient(to bottom, #fffdf8 0%, rgba(255,253,248,0.5) 40%, transparent 100%)',
					}}
				/>
			</motion.div>

			{/* â”€â”€ Layer 3 Â· Cloud video (covers mountains, drifts upward) â”€â”€ */}
			{/* Hidden on mobile/small tablets for battery + performance (Safari autoplay video is expensive) */}
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
					<source src={fogVideo} type="video/mp4" />
				</video>
			</motion.div>

		</div>
	)
}

export default HomeParallaxEnvironment




