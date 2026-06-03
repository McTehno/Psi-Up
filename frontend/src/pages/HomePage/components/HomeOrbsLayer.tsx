import { motion, MotionValue, useTransform, useMotionTemplate } from 'framer-motion'
import GlowingOrbs from './GlowingOrbs'

type HomeOrbsLayerProps = {
	scrollYProgress: MotionValue<number>
}

function HomeOrbsLayer({ scrollYProgress }: HomeOrbsLayerProps) {
	// Mountain transforms to stay perfectly in sync
	const mountainY = useTransform(scrollYProgress, [0, 0.762], ['0%', '-20%'])

	const mountainX = useTransform(
		scrollYProgress,
		[0, 0.472, 0.625],
		['0%', '0%', '-12%']
	)

	const mountainScale = useTransform(
		scrollYProgress,
		[0, 0.305, 0.381, 0.472, 0.549, 0.762],
		[1.05, 1.05, 1.15, 1.15, 1.30, 1.30]
	)

	// The highlighted unit mountain reveals from bottom to top
	const unitGlowReveal = useTransform(scrollYProgress, [0.472, 0.549], [-20, 120])
	const unitGlowMask = useMotionTemplate`linear-gradient(to top, rgba(0,0,0,1) ${unitGlowReveal}%, rgba(0,0,0,0) calc(${unitGlowReveal}% + 20%))`

	return (
		<div className="sticky top-0 h-screen w-full overflow-hidden -z-20 pointer-events-none">
			<motion.div
				className="absolute inset-x-0 top-0 h-[120%] w-full pt-[12vh]"
				style={{
					x: mountainX,
					y: mountainY,
					scale: mountainScale,
				}}
			>
				<div className="relative h-full w-full">
					{/* Glowing Orbs: uses the same mask as unit-mountain so they wipe-reveal together from bottom to top */}
					<motion.div
						className="absolute inset-0 h-full w-full pointer-events-none"
						style={{
							WebkitMaskImage: unitGlowMask,
							maskImage: unitGlowMask,
						}}
					>
						<GlowingOrbs scrollYProgress={scrollYProgress} />
					</motion.div>
				</div>
			</motion.div>
		</div>
	)
}

export default HomeOrbsLayer
