import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import fogVideo from '../../../assets/parallax/fog-background.mp4'
import mountainImage from '../../../assets/parallax/mountain-journey-bg.webp'

/**
 * HomeParallaxEnvironment
 *
 * A multi-layer parallax background that stitches a looping cloud video
 * seamlessly into a mountain photograph using:
 *   - A tall scrollable container (300vh) for extended scroll runway
 *   - A sticky 100vh "viewport window"
 *   - CSS mask-image gradient on the video (bottom fade-to-transparent)
 *   - Framer Motion useScroll/useTransform for differential parallax speeds
 *
 * Layer stack (back → front):
 *   1. Static sky/fog colour fill (matches cloud palette)
 *   2. Mountain image  (slow parallax, rises into view)
 *   3. Cloud video     (fast parallax + bottom-edge mask, retreats upward)
 *   4. Ambient fog overlays for atmospheric depth
 *   5. Bottom page-blend gradient for seamless content transition
 */
function HomeParallaxEnvironment() {
	const containerRef = useRef<HTMLDivElement | null>(null)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start start', 'end start'],
	})

	/* ── Cloud layer transforms ──────────────────────────────────── */
	// Clouds move UP fast
	const cloudY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])
	const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

	/* ── Mountain layer transforms ───────────────────────────────── */
	// Mountain starts lower down, and moves UP slightly slower than clouds
	const mountainY = useTransform(scrollYProgress, [0, 1], ['25%', '-10%'])
	const mountainScale = useTransform(scrollYProgress, [0, 1], [1.1, 1])

	/* ── Ambient fog transforms ──────────────────────────────────── */
	const fogWispY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-x-0 top-0 -z-30"
			style={{ height: '300vh' }}
			aria-hidden="true"
		>
			<div className="sticky top-0 h-screen w-full overflow-hidden">
				{/* ── Layer 1 · Original HomeBackground Gradients & Orbs ──────────────────── */}
				<div
					className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(208,122,18,0.10),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(49,88,59,0.10),_transparent_24%),radial-gradient(circle_at_90%_80%,_rgba(234,223,206,0.45),_transparent_32%),linear-gradient(180deg,_#fffdf8,_#fff6eb)]"
				/>
				<div className="absolute left-0 top-36 h-72 w-72 rounded-full bg-[#fff4e6] blur-3xl" />
				<div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#f2f8f1] blur-3xl" />

				{/* ── Layer 2 · Mountain image ─────────── */}
				<motion.div
					className="absolute inset-x-0 bottom-0 w-full h-[120%]"
					style={{
						y: mountainY,
						scale: mountainScale,
					}}
				>
					<img
						src={mountainImage}
						alt=""
						className="h-full w-full object-cover object-bottom"
						loading="eager"
						draggable={false}
					/>
					
					{/* Soft vignette to blend the mountain's hard top edge into the sky */}
					<div
						className="absolute inset-x-0 top-0 h-[30%]"
						style={{
							background:
								'linear-gradient(to bottom, #e8e3da 0%, rgba(232,227,218,0.7) 40%, transparent 100%)',
						}}
					/>
				</motion.div>
			</div>

			{/* ── Layer 3 · Cloud Video (stays at top, scrolls away normally) ─────── */}
			<div className="absolute inset-x-0 top-0 w-full h-[120vh] overflow-hidden">
				<motion.div
					className="absolute inset-0 w-full h-full"
					style={{
						scale: cloudScale,
						/* CSS mask: fade out the bottom 50% of the video */
						WebkitMaskImage:
							'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
						maskImage:
							'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
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
