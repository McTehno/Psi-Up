import { digcompAreas } from '../constants.ts'

type MobileDigCompVisualProps = {
	activeIndex: number
	rotationCount: number
}

function MobileDigCompVisual({
	activeIndex,
	rotationCount,
}: MobileDigCompVisualProps) {
	const activeArea = digcompAreas[activeIndex]

	return (
		<div className="relative mx-auto flex w-full flex-col items-center">
			<div className="relative h-[360px] w-[360px] max-w-full overflow-hidden sm:h-[440px] sm:w-[440px] sm:overflow-visible lg:h-[470px] lg:w-[470px]">
				<svg
					viewBox="-120 -120 240 240"
					className="absolute inset-0 aspect-square h-full w-full transition-transform duration-1000 ease-in-out"
					style={{
						transform: `rotate(${-81 - rotationCount * 72}deg)`,
						transformOrigin: 'center center',
						backfaceVisibility: 'hidden',
						WebkitBackfaceVisibility: 'hidden',
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

				<div className="absolute inset-0 flex items-center justify-center px-12 text-center">
					<div className="flex max-w-[215px] flex-col items-center">
						<span
							className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 shadow-lg ${activeArea.themeBg} ${activeArea.themeText}`}
						>
							<activeArea.icon className="h-7 w-7" />
						</span>

						<h2 className="mt-3 font-display text-[18px] font-semibold leading-tight text-[#111111]">
							{activeArea.title}
						</h2>

						<p className="mt-2 text-xs leading-5 text-[#706b60]">
							{activeArea.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MobileDigCompVisual