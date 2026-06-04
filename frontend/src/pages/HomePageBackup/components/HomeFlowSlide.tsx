import {
	ArrowRight as ArrowRightIcon,
	CheckCircle2 as CheckCircleIcon,
	Sparkles as SparklesIcon,
} from 'lucide-react'

type HomeFlowSlideProps = {
	flowSteps: readonly string[]
}

function HomeFlowSlide({ flowSteps }: HomeFlowSlideProps) {
	return (
		<section
			id="digcomp"
			className="flex py-16 lg:h-screen lg:snap-start lg:items-center lg:overflow-hidden lg:py-12"
		>
			<div className="w-full">
				<div className="rounded-[2.5rem] border border-[#eadfce] bg-[#fffdf8] px-6 py-10 text-center shadow-[0_18px_55px_rgba(57,47,35,0.07)] sm:px-10 sm:py-12">
					<div className="mx-auto max-w-3xl">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d07a12]">
							Jasen naslednji korak
						</p>

						<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
							Nadaljuj bolj samozavestno.
						</h2>

						<p className="mt-5 text-lg leading-8 text-[#706b60]">
							Ko vidiĹˇ svojo pozicijo, postane pot bolj pregledna. LaĹľje
							izbereĹˇ naslednjo vsebino, se osredotoÄŤiĹˇ na pomembno in
							napredujeĹˇ v svojem ritmu.
						</p>
					</div>

					<div className="mt-10 flex flex-col items-center justify-center gap-4 lg:flex-row">
						{flowSteps.map((step, index) => (
							<div
								key={step}
								className="flex w-full flex-col items-center gap-4 lg:w-auto lg:flex-row"
							>
								<div className="flex min-h-[88px] w-[240px] max-w-full items-center justify-center rounded-[1.5rem] border border-[#eadfce] bg-[#fff6eb] px-5 py-4 shadow-sm sm:w-[280px] lg:w-[165px]">
									<div>
										<span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f8f1] text-[#31583b]">
											{index === flowSteps.length - 1 ? (
												<SparklesIcon className="h-5 w-5" />
											) : (
												<CheckCircleIcon className="h-5 w-5" />
											)}
										</span>

										<p className="mt-3 text-sm font-semibold leading-5 text-[#111111]">
											{step}
										</p>
									</div>
								</div>

								{index < flowSteps.length - 1 && (
									<span className="flex h-10 w-10 rotate-90 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8] text-[#d07a12] shadow-sm lg:rotate-0">
										<ArrowRightIcon className="h-4 w-4" />
									</span>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default HomeFlowSlide

