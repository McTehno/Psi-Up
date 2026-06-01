import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import fogVideo from '../../../assets/parallax/fog-background.mp4'
import mountainImage from '../../../assets/parallax/mountain-journey-bg.webp'

/**
 * HomeParallaxEnvironment
 *
 * A cinematic parallax background that reveals a mountain landscape
 * from behind a looping cloud video as the user scrolls.
 *
 * On page load the clouds fully cover the viewport, hiding the
 * mountains. As the user scrolls through the hero section the clouds
 * drift upward with increasing speed, gradually unveiling the mountain
 * image beneath. By the time the "Učne poti" section enters the
 * viewport (~50 % scroll progress), the clouds have completely exited.
 *
 * Scroll math
 * ───────────
 * Container height = 300 vh  →  scrollYProgress 0 … 1
 * Hero ≈ 100 vh, spacer ≈ 56–70 vh  →  Učne poti starts at ≈ 160 vh
 * 160 / 300 ≈ 0.53  →  clouds should be fully gone by progress ≈ 0.50
 *
 * Z-stack inside the sticky viewport (back → front)
 * ──────────────────────────────────────────────────
 *   1. Warm radial-gradient base + ambient blur orbs
 *   2. Mountain photograph  (slow parallax, gentle rise)
 *   3. Cloud video          (fast parallax upward, CSS bottom-mask, fades out)
 */
function HomeParallaxEnvironment() {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start start', 'end start'],
	})

	/* ── Cloud layer transforms ──────────────────────────────────── */
	// Continuous smooth ease across the entire scroll range so the clouds
	// never hit an "invisible barrier". They clear the screen fully but
	// keep drifting as long as the user scrolls.
	const cloudY = useTransform(
		scrollYProgress,
		[0, 0.20, 0.60, 1],
		['0%', '-15%', '-110%', '-150%'],
	)
	const cloudOpacity = useTransform(
		scrollYProgress,
		[0, 0.35, 0.60],
		[1, 0.9, 0],
	)
	const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

	/* ── Mountain layer transforms ───────────────────────────────── */
	// Mountain begins anchored at the top so the peaks aren't cut off,
	// and rises gently into view as the clouds clear.
	const mountainY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
	const mountainScale = useTransform(scrollYProgress, [0, 1], [1.05, 1])

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-x-0 top-0 -z-30"
			style={{ height: '300vh' }}
			aria-hidden="true"
		>
			<div className="sticky top-0 h-screen w-full overflow-hidden">
				{/* ── Layer 1 · Warm gradient base + ambient orbs ──────── */}
				<div
					className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
				/>
				<div className="absolute left-0 top-36 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl" />
				<div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl" />

				{/* ── Layer 2 · Mountain image (behind clouds) ────────── */}
				<motion.div
					className="absolute inset-x-0 top-0 h-[120%] w-full pt-[12vh]"
					style={{
						y: mountainY,
						scale: mountainScale,
					}}
				>
					<img
						src={mountainImage}
						alt=""
						className="h-full w-full object-cover object-center"
						loading="eager"
						draggable={false}
					/>

					{/* Soft vignette blending the mountain top into the base */}
					<div
						className="absolute inset-x-0 top-0 h-[30%]"
						style={{
							background:
								'linear-gradient(to bottom, #fffdf8 0%, rgba(255,253,248,0.5) 40%, transparent 100%)',
						}}
					/>
				</motion.div>

				{/* ── Layer 3 · Cloud video (covers mountains, drifts upward) ── */}
				<motion.div
					className="absolute inset-x-0 top-0 h-[130%] w-full"
					style={{
						y: cloudY,
						scale: cloudScale,
						opacity: cloudOpacity,
						/*
						 * Bottom-edge mask: the top 70 % of the cloud layer
						 * is fully opaque (70 % of 130 vh ≈ 91 vh – nearly
						 * the entire viewport). The remaining 30 % fades to
						 * transparent so the mountain peeks through softly
						 * at the very bottom before the clouds drift away.
						 */
						WebkitMaskImage:
							'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
						maskImage:
							'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
					}}
				>
					<video
						autoPlay
						muted
						loop
						playsInline
						className="h-full w-full object-cover"
						style={{ pointerEvents: 'none' }}
					>
						<source src={fogVideo} type="video/mp4" />
					</video>
				</motion.div>
			</div>
		</div>
	)
}

export default HomeParallaxEnvironment
