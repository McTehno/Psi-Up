import { useEffect, useMemo, useRef, useState } from 'react'

type JourneyMode = 'mobile' | 'desktop'

function getJourneyMode(): JourneyMode {
	if (typeof window === 'undefined') return 'desktop'

	return window.matchMedia('(max-width: 767px)').matches
		? 'mobile'
		: 'desktop'
}

function getDocumentHeight() {
	if (typeof window === 'undefined') return 5600

	return Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		window.innerHeight,
	)
}

function getPathD(mode: JourneyMode, height: number) {
	const h = height

	if (mode === 'mobile') {
		return `
      M 78 ${-h * 0.035}
      C 180 ${h * 0.055}, 310 ${h * 0.075}, 245 ${h * 0.11}
      C 165 ${h * 0.155}, 95 ${h * 0.185}, 205 ${h * 0.235}
      C 330 ${h * 0.29}, 330 ${h * 0.335}, 190 ${h * 0.39}
      C 80 ${h * 0.44}, 105 ${h * 0.49}, 260 ${h * 0.545}
      C 360 ${h * 0.585}, 315 ${h * 0.65}, 160 ${h * 0.705}
      C 55 ${h * 0.745}, 95 ${h * 0.805}, 235 ${h * 0.855}
      C 325 ${h * 0.895}, 230 ${h * 0.92}, 230 ${h * 0.955}
      C 230 ${h * 0.98}, 230 ${h * 1.0}, 230 ${h * 1.035}
    `
	}

	return `
    M 120 ${-h * 0.03}
    C 430 ${h * 0.05}, 720 ${h * 0.065}, 650 ${h * 0.12}
    C 570 ${h * 0.18}, 220 ${h * 0.19}, 280 ${h * 0.26}
    C 350 ${h * 0.33}, 960 ${h * 0.30}, 990 ${h * 0.385}
    C 1020 ${h * 0.46}, 410 ${h * 0.455}, 460 ${h * 0.54}
    C 510 ${h * 0.62}, 1080 ${h * 0.60}, 900 ${h * 0.695}
    C 770 ${h * 0.765}, 270 ${h * 0.75}, 330 ${h * 0.835}
    C 390 ${h * 0.925}, 620 ${h * 0.90}, 620 ${h * 0.955}
    C 620 ${h * 0.98}, 620 ${h * 1.0}, 620 ${h * 1.035}
  `
}

function HomeScrollJourney() {
	const pathRef = useRef<SVGPathElement | null>(null)
	const animationFrameRef = useRef<number | null>(null)

	const targetProgressRef = useRef(0)
	const currentProgressRef = useRef(0)

	const [mode, setMode] = useState<JourneyMode>(() => getJourneyMode())
	const [svgHeight, setSvgHeight] = useState(5600)
	const [pathLength, setPathLength] = useState(0)
	const [drawProgress, setDrawProgress] = useState(0)

	const viewBoxWidth = mode === 'mobile' ? 420 : 1200
	const pathD = useMemo(() => getPathD(mode, svgHeight), [mode, svgHeight])

	useEffect(() => {
		function updateLayout() {
			const nextMode = getJourneyMode()
			const measuredHeight = getDocumentHeight()

			setMode(nextMode)
			setSvgHeight(Math.max(measuredHeight, nextMode === 'mobile' ? 7200 : 5600))
		}

		updateLayout()

		const timeoutId = window.setTimeout(updateLayout, 150)

		window.addEventListener('resize', updateLayout)

		return () => {
			window.clearTimeout(timeoutId)
			window.removeEventListener('resize', updateLayout)
		}
	}, [])

	useEffect(() => {
		if (!pathRef.current) return

		const totalLength = pathRef.current.getTotalLength()

		setPathLength(totalLength)
		currentProgressRef.current = 0
		targetProgressRef.current = 0
		setDrawProgress(0)
	}, [pathD])

	useEffect(() => {
		function getProgressForViewportBottom() {
			if (!pathRef.current || pathLength === 0) return 0

			const viewportBottom = window.scrollY + window.innerHeight
			const targetY = Math.min(Math.max(viewportBottom, 0), svgHeight)

			let start = 0
			let end = pathLength

			for (let i = 0; i < 24; i += 1) {
				const middle = (start + end) / 2
				const point = pathRef.current.getPointAtLength(middle)

				if (point.y < targetY) {
					start = middle
				} else {
					end = middle
				}
			}

			return Math.min(Math.max(end / pathLength, 0), 1)
		}

		function updateTargetProgress() {
			targetProgressRef.current = getProgressForViewportBottom()
		}

		function animate() {
			const current = currentProgressRef.current
			const target = targetProgressRef.current

			const followSpeed = mode === 'mobile' ? 0.03 : 0.055
			const next = current + (target - current) * followSpeed

			currentProgressRef.current = next
			setDrawProgress(next)

			animationFrameRef.current = window.requestAnimationFrame(animate)
		}

		updateTargetProgress()
		animationFrameRef.current = window.requestAnimationFrame(animate)

		window.addEventListener('scroll', updateTargetProgress, { passive: true })
		window.addEventListener('resize', updateTargetProgress)

		return () => {
			window.removeEventListener('scroll', updateTargetProgress)
			window.removeEventListener('resize', updateTargetProgress)

			if (animationFrameRef.current) {
				window.cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [pathLength, pathD, mode, svgHeight])

	const drawOffset = pathLength * (1 - drawProgress)

	return (
		<div
			className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
			aria-hidden="true"
		>
			<svg
				className="absolute left-1/2 top-0 w-full -translate-x-1/2 opacity-80"
				style={{ height: `${svgHeight}px` }}
				viewBox={`0 0 ${viewBoxWidth} ${svgHeight}`}
				fill="none"
				preserveAspectRatio="none"
			>
				<defs>
					<linearGradient
						id="home-journey-gradient"
						x1="0"
						y1="0"
						x2="0"
						y2={svgHeight}
					>
						<stop offset="0%" stopColor="#31583b" stopOpacity="0.18" />
						<stop offset="35%" stopColor="#31583b" stopOpacity="0.42" />
						<stop offset="70%" stopColor="#8fa38f" stopOpacity="0.38" />
						<stop offset="100%" stopColor="#c98a43" stopOpacity="0.22" />
					</linearGradient>

					<filter
						id="home-journey-glow"
						x="-20%"
						y="-5%"
						width="140%"
						height="110%"
					>
						<feGaussianBlur stdDeviation="7" result="blur" />
						<feColorMatrix
							in="blur"
							type="matrix"
							values="
                0 0 0 0 0.19
                0 0 0 0 0.35
                0 0 0 0 0.23
                0 0 0 0.35 0
              "
							result="glow"
						/>
						<feMerge>
							<feMergeNode in="glow" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<path
					d={pathD}
					stroke="#ded5c6"
					strokeWidth={mode === 'mobile' ? '8' : '10'}
					strokeLinecap="round"
					opacity="0.34"
				/>

				<path
					ref={pathRef}
					d={pathD}
					stroke="url(#home-journey-gradient)"
					strokeWidth={mode === 'mobile' ? '5' : '7'}
					strokeLinecap="round"
					strokeDasharray={pathLength}
					strokeDashoffset={drawOffset}
					filter="url(#home-journey-glow)"
				/>
			</svg>
		</div>
	)
}

export default HomeScrollJourney