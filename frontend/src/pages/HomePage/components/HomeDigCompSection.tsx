import MobileDigCompVisual from './MobileDigCompVisual'
import RevealOnScroll from './RevealOnScroll'

type HomeDigCompSectionProps = {
	activeIndex: number
	rotationCount: number
}

function HomeDigCompSection({
	activeIndex,
	rotationCount,
}: HomeDigCompSectionProps) {
	return (
		<section
			id="digcomp"
			className="relative min-h-screen py-24 lg:flex lg:items-center lg:py-32"
		>
			<div className="relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
				<RevealOnScroll className="relative z-20 max-w-2xl">
					<div className="max-w-xl rounded-[30px] bg-[#fffdf8]/30 p-6 backdrop-blur-sm sm:p-8">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
							DigComp okvir
						</p>

						<h2 className="mt-5 font-serif text-[clamp(36px,4.6vw,60px)] leading-[1.02] text-[#33442f]">
							Pet podroÄŤij, ki stojijo za digitalnimi kompetencami.
						</h2>

						<p className="mt-6 max-w-xl text-[18px] leading-8 text-[#6f6a60]">
							DigComp pomaga razumeti, katera znanja razvijaĹˇ skozi uÄŤne
							poti, module in uÄŤne enote.
						</p>
					</div>
				</RevealOnScroll>

				<RevealOnScroll
					delay={160}
					className="relative z-20 flex min-h-[560px] items-center justify-center"
				>
					<div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(49,88,59,0.13),_transparent_58%)] blur-2xl" />

					<div className="relative scale-110 lg:scale-125">
						<MobileDigCompVisual
							activeIndex={activeIndex}
							rotationCount={rotationCount}
						/>
					</div>
				</RevealOnScroll>
			</div>
		</section>
	)
}

export default HomeDigCompSection

