import { ArrowRight, Mail } from 'lucide-react'

function HomeFinalCtaSection() {
	return (
		<section
			id="contact"
			className="relative flex min-h-[78vh] items-center py-24 lg:py-32"
		>
			<div className="relative w-full overflow-hidden rounded-[40px] border border-[#ded5c6]/80 bg-[#fffdf8]/72 p-8 text-center shadow-[0_28px_80px_rgba(57,47,35,0.13)] backdrop-blur-2xl sm:p-12 lg:p-16">
				<div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#f2f8f1]/80 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#fff4e6]/90 blur-3xl" />
				<div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d08a34]/40 to-transparent" />

				<div className="relative z-10">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
						Nadaljevanje
					</p>

					<h2 className="mx-auto mt-5 max-w-4xl font-serif text-[clamp(40px,5.4vw,72px)] leading-[1] text-[#2f4a31]">
						Nadaljuj po svojem ritmu.
					</h2>

					<p className="mx-auto mt-7 max-w-2xl text-[18px] leading-8 text-[#6f6a60]">
						Raziskuj uÄŤne poti, module in uÄŤne enote ter se vrni na tisti
						korak, ki je zate v tem trenutku najbolj smiseln.
					</p>

					<div className="mt-10 flex flex-wrap justify-center gap-3">
						<a
							href="#top"
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#31583b] bg-[#31583b] px-7 py-3.5 text-sm font-bold text-[#fffdf8] shadow-[0_14px_34px_rgba(49,88,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2a4d33]"
						>
							Nazaj na zaÄŤetek
							<ArrowRight className="h-4 w-4" />
						</a>

						<a
							href="mailto:info.nidiko@gmail.com"
							className="inline-flex items-center justify-center gap-3 rounded-full border border-[#ded5c6]/90 bg-[#fffdf8]/72 px-7 py-3.5 text-sm font-bold text-[#706b60] shadow-[0_10px_24px_rgba(57,47,35,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#fff6eb]"
						>
							<Mail className="h-4 w-4" />
							Kontakt
						</a>
					</div>

					<p className="mt-12 text-xs font-medium text-[#8a8175]">
						Â© 2026 NIDiKo. Vse pravice pridrĹľane.
					</p>
				</div>
			</div>
		</section>
	)
}

export default HomeFinalCtaSection

