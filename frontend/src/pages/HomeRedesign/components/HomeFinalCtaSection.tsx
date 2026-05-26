import { ArrowRight, Mail } from 'lucide-react'

function HomeFinalCtaSection() {
	return (
		<section
			id="contact"
			className="relative flex min-h-[78vh] items-center py-24 lg:py-32"
		>
			<div className="w-full overflow-hidden rounded-[36px] border border-[#ded5c6]/80 bg-[#fffdf8]/66 p-8 text-center shadow-[0_26px_76px_rgba(57,47,35,0.12)] backdrop-blur-2xl sm:p-12 lg:p-16">
				<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
					Nadaljevanje
				</p>

				<h2 className="mx-auto mt-5 max-w-4xl font-serif text-[clamp(40px,5.6vw,76px)] leading-[0.98] text-[#2f4a31]">
					Nadaljuj po svojem ritmu.
				</h2>

				<p className="mx-auto mt-7 max-w-2xl text-[18px] leading-8 text-[#6f6a60]">
					Raziskuj učne poti, module in učne enote ter se vrni na tisti
					korak, ki je zate v tem trenutku najbolj smiseln.
				</p>

				<div className="mt-10 flex flex-wrap justify-center gap-3">
					<a
						href="#top"
						className="inline-flex items-center justify-center gap-3 rounded-full border border-[#31583b] bg-[#31583b] px-7 py-3.5 text-sm font-bold text-[#fffdf8] shadow-[0_14px_34px_rgba(49,88,59,0.22)] transition hover:bg-[#2a4d33]"
					>
						Nazaj na začetek
						<ArrowRight className="h-4 w-4" />
					</a>

					<a
						href="mailto:info.nidiko@gmail.com"
						className="inline-flex items-center justify-center gap-3 rounded-full border border-[#ded5c6] bg-[#fffdf8]/70 px-7 py-3.5 text-sm font-bold text-[#706b60] shadow-sm backdrop-blur-xl transition hover:bg-[#f4eee4]"
					>
						<Mail className="h-4 w-4" />
						Kontakt
					</a>
				</div>

				<p className="mt-12 text-xs font-medium text-[#8a8175]">
					© 2026 NIDiKo. Vse pravice pridržane.
				</p>
			</div>
		</section>
	)
}

export default HomeFinalCtaSection