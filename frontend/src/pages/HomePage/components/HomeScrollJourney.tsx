import { useEffect, useMemo, useRef, useCallback } from 'react'

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
	const glowPathRef = useRef<SVGPathElement | null>(null)
	const animationFrameRef = useRef<number | null>(null)

	const targetProgressRef = useRef(0)
	const currentProgressRef = useRef(0)
	const pathLengthRef = useRef(0)

	// Use refs to store layout values to avoid re-renders
	const modeRef = useRef<JourneyMode>(getJourneyMode())
	const svgHeightRef = useRef(5600)

	// We need a single initial render, then update via DOM directly
	const svgRef = useRef<SVGSVGElement | null>(null)
	const trailPathRef = useRef<SVGPathElement | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)

	// Compute initial values for first render
	const initialMode = useMemo(() => getJourneyMode(), [])
	const initialHeight = useMemo(() => {
		const measured = getDocumentHeight()
		return Math.max(measured, initialMode === 'mobile' ? 7200 : 5600)
	}, [initialMode])
	const viewBoxWidth = initialMode === 'mobile' ? 420 : 1200
	const pathD = useMemo(() => getPathD(initialMode, initialHeight), [initialMode, initialHeight])

	// Update layout measurements
	const updateLayout = useCallback(() => {
		const nextMode = getJourneyMode()
		const measuredHeight = getDocumentHeight()
		const newHeight = Math.max(measuredHeight, nextMode === 'mobile' ? 7200 : 5600)

		modeRef.current = nextMode
		svgHeightRef.current = newHeight

		// Update SVG dimensions and path via DOM (no React re-render)
		const newPathD = getPathD(nextMode, newHeight)
		const newViewBoxWidth = nextMode === 'mobile' ? 420 : 1200

		if (svgRef.current) {
			svgRef.current.style.height = `${newHeight}px`
			svgRef.current.setAttribute('viewBox', `0 0 ${newViewBoxWidth} ${newHeight}`)
		}

		if (trailPathRef.current) {
			trailPathRef.current.setAttribute('d', newPathD)
			trailPathRef.current.setAttribute('stroke-width', nextMode === 'mobile' ? '8' : '10')
		}

		if (glowPathRef.current) {
			glowPathRef.current.setAttribute('d', newPathD)
			glowPathRef.current.setAttribute('stroke-width', nextMode === 'mobile' ? '14' : '20')
		}

		if (pathRef.current) {
			pathRef.current.setAttribute('d', newPathD)
			pathRef.current.setAttribute('stroke-width', nextMode === 'mobile' ? '5' : '7')

			const totalLength = pathRef.current.getTotalLength()
			pathLengthRef.current = totalLength
			currentProgressRef.current = 0
			targetProgressRef.current = 0

			// Update strokeDasharray
			pathRef.current.setAttribute('stroke-dasharray', String(totalLength))
			pathRef.current.setAttribute('stroke-dashoffset', String(totalLength))

			if (glowPathRef.current) {
				glowPathRef.current.setAttribute('stroke-dasharray', String(totalLength))
				glowPathRef.current.setAttribute('stroke-dashoffset', String(totalLength))
			}
		}

		// Update the gradient y2 attribute
		const gradientEl = svgRef.current?.querySelector('#home-journey-gradient')
		if (gradientEl) {
			gradientEl.setAttribute('y2', String(newHeight))
		}
	}, [])

	// Initial layout + resize listener
	useEffect(() => {
		updateLayout()
		const timeoutId = window.setTimeout(updateLayout, 150)
		window.addEventListener('resize', updateLayout)
		return () => {
			window.clearTimeout(timeoutId)
			window.removeEventListener('resize', updateLayout)
		}
	}, [updateLayout])

	// Measure path length on mount
	useEffect(() => {
		if (!pathRef.current) return
		const totalLength = pathRef.current.getTotalLength()
		pathLengthRef.current = totalLength
		pathRef.current.setAttribute('stroke-dasharray', String(totalLength))
		pathRef.current.setAttribute('stroke-dashoffset', String(totalLength))

		if (glowPathRef.current) {
			glowPathRef.current.setAttribute('stroke-dasharray', String(totalLength))
			glowPathRef.current.setAttribute('stroke-dashoffset', String(totalLength))
		}
	}, [pathD])

	// Main scroll-driven animation loop
	// Key optimization: No React state updates — all DOM manipulation via refs
	useEffect(() => {
		function getProgressForViewportBottom() {
			const pl = pathLengthRef.current
			if (!pathRef.current || pl === 0) return 0

			const viewportBottom = window.scrollY + window.innerHeight
			const targetY = Math.min(Math.max(viewportBottom, 0), svgHeightRef.current)

			let start = 0
			let end = pl

			for (let i = 0; i < 24; i += 1) {
				const middle = (start + end) / 2
				const point = pathRef.current.getPointAtLength(middle)

				if (point.y < targetY) {
					start = middle
				} else {
					end = middle
				}
			}

			return Math.min(Math.max(end / pl, 0), 1)
		}

		function updateTargetProgress() {
			targetProgressRef.current = getProgressForViewportBottom()
		}

		function animate() {
			const current = currentProgressRef.current
			const target = targetProgressRef.current
			const mode = modeRef.current

			const followSpeed = mode === 'mobile' ? 0.03 : 0.055
			const next = current + (target - current) * followSpeed

			currentProgressRef.current = next

			// Direct DOM update — bypasses React render entirely
			const pl = pathLengthRef.current
			if (pathRef.current && pl > 0) {
				pathRef.current.setAttribute('stroke-dashoffset', String(pl * (1 - next)))
			}
			if (glowPathRef.current && pl > 0) {
				glowPathRef.current.setAttribute('stroke-dashoffset', String(pl * (1 - next)))
			}

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
	}, [pathD])

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
			aria-hidden="true"
		>
			<svg
				ref={svgRef}
				className="absolute left-1/2 top-0 w-full -translate-x-1/2 opacity-80"
				style={{ height: `${initialHeight}px` }}
				viewBox={`0 0 ${viewBoxWidth} ${initialHeight}`}
				fill="none"
				preserveAspectRatio="none"
			>
				<defs>
					<linearGradient
						id="home-journey-gradient"
						x1="0"
						y1="0"
						x2="0"
						y2={initialHeight}
					>
						<stop offset="0%" stopColor="#31583b" stopOpacity="0.18" />
						<stop offset="35%" stopColor="#31583b" stopOpacity="0.42" />
						<stop offset="70%" stopColor="#8fa38f" stopOpacity="0.38" />
						<stop offset="100%" stopColor="#c98a43" stopOpacity="0.22" />
					</linearGradient>


				</defs>

				<path
					ref={trailPathRef}
					d={pathD}
					stroke="#ded5c6"
					strokeWidth={initialMode === 'mobile' ? '8' : '10'}
					strokeLinecap="round"
					opacity="0.34"
				/>

				{/* Glow path: thicker semi-transparent duplicate replaces expensive feGaussianBlur */}
				<path
					ref={glowPathRef}
					d={pathD}
					stroke="url(#home-journey-gradient)"
					strokeWidth={initialMode === 'mobile' ? '14' : '20'}
					strokeLinecap="round"
					opacity="0.3"
				/>

				<path
					ref={pathRef}
					d={pathD}
					stroke="url(#home-journey-gradient)"
					strokeWidth={initialMode === 'mobile' ? '5' : '7'}
					strokeLinecap="round"
				/>
			</svg>
		</div>
	)
}

export default HomeScrollJourney