import { digcompAreas } from '../constants'

type DigCompHeroVisualProps = {
	isSearchActive: boolean
	activeIndex: number
	rotationCount: number
}

function DigCompHeroVisual({
	isSearchActive,
	activeIndex,
	rotationCount,
}: DigCompHeroVisualProps) {
	return (
		<div
	className={`absolute inset-0 hidden transition-opacity duration-500 md:block ${
		isSearchActive ? 'pointer-events-none opacity-0' : 'opacity-100'
	}`}
>
			<div className="absolute inset-x-0 top-16 z-10 flex flex-col items-center px-4 text-center sm:top-20 sm:px-6">
				{digcompAreas.map((area, index) => {
					const isActive = activeIndex === index
					const isPast =
						index ===
						(activeIndex - 1 + digcompAreas.length) % digcompAreas.length

					let positionClass =
						'translate-x-16 -translate-y-16 rotate-12 opacity-0 pointer-events-none scale-95'

					if (isActive) {
						positionClass =
							'translate-x-0 translate-y-0 rotate-0 opacity-100 z-10 scale-100'
					} else if (isPast) {
						positionClass =
							'-translate-x-12 translate-y-24 -rotate-12 opacity-0 pointer-events-none scale-95'
					}

					return (
						<div
							key={area.title}
							className={`absolute inset-x-0 top-0 flex origin-center flex-col items-center transition-all duration-1000 ease-in-out ${positionClass}`}
							aria-hidden={!isActive}
						>
							<span
								className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 shadow-lg ${area.themeBg} ${area.themeText}`}
							>
								<area.icon className="h-8 w-8" />
							</span>

							<h2 className="mt-6 max-w-[28rem] font-display text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">
								{area.title}
							</h2>

							<p className="mt-4 max-w-[24rem] text-sm leading-relaxed text-[#706b60] sm:text-base">
								{area.description}
							</p>
						</div>
					)
				})}
			</div>

			<svg
				viewBox="-120 -120 240 240"
				className="absolute top-24 -right-[270%] -z-10 aspect-square w-[350%] max-w-[1400px] transition-transform duration-1000 ease-in-out sm:-right-[170%] sm:w-[250%] md:-right-[140%] md:w-[200%] lg:-right-[120%] lg:top-42 lg:w-[180%]"
				style={{
					transform: `rotate(${-81 - rotationCount * 72}deg)`,
				}}
			>
				{digcompAreas.map((area, index) => {
					const startAngle = (index * 72 - 90) * (Math.PI / 180)
					const endAngle = ((index + 1) * 72 - 90) * (Math.PI / 180)

					const v1x = Math.cos(startAngle) * 95
					const v1y = Math.sin(startAngle) * 95
					const v2x = Math.cos(endAngle) * 95
					const v2y = Math.sin(endAngle) * 95

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
	)
}

export default DigCompHeroVisual

