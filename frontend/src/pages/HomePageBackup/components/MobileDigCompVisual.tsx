import { digcompAreas } from '../constants'

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
		<div className="relative mx-auto mt-8 flex w-full flex-col items-center lg:hidden">
			<div className="mb-4 max-w-sm text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d07a12]">
					DigComp okvir
				</p>

				<p className="mt-2 text-sm leading-6 text-[#706b60]">
					Pet podroÄŤij digitalnih kompetenc, ki pomagajo doloÄŤiti tvojo uÄŤno
					pot.
				</p>
			</div>

			<div className="relative h-[330px] w-[330px] max-w-full overflow-hidden sm:h-[400px] sm:w-[400px] sm:overflow-visible">
				<svg
					viewBox="-120 -120 240 240"
					className="absolute inset-0 aspect-square h-full w-full transition-transform duration-1000 ease-in-out"
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

				<div className="absolute inset-0 flex items-center justify-center px-12 text-center">
					<div className="flex max-w-[190px] flex-col items-center">
						<span
							className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 shadow-lg ${activeArea.themeBg} ${activeArea.themeText}`}
						>
							<activeArea.icon className="h-6 w-6" />
						</span>

						<h2 className="mt-3 font-display text-[17px] font-semibold leading-tight text-[#111111]">
							{activeArea.title}
						</h2>

						<p className="mt-2 text-xs leading-5 text-[#706b60]">
							{activeArea.description}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-4 flex max-w-sm flex-wrap justify-center gap-2">
				{digcompAreas.map((area) => (
					<span
						key={area.title}
						className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfce] bg-[#fffdf8]/80 px-2.5 py-1 text-[11px] font-medium text-[#706b60] shadow-sm"
					>
						<span
							className="h-2.5 w-2.5 rounded-full"
							style={{ backgroundColor: area.svgFill }}
						/>
						{area.title.split(' ')[0]}
					</span>
				))}
			</div>
		</div>
	)
}

export default MobileDigCompVisual

