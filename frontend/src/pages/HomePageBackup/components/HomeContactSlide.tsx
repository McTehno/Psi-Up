import { useState } from 'react'
import { Mail, MessageCircle, Quote } from 'lucide-react'

function HomeContactSlide() {
	const [isFlipped, setIsFlipped] = useState(false)

	return (
		<section
			id="contact"
			className="flex py-16 lg:h-screen lg:snap-start lg:items-center lg:overflow-hidden lg:py-12"
		>
			<div className="w-full">
				<div className="mx-auto max-w-5xl text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d07a12]">
						Kontakt
					</p>

					<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
						Imaš vprašanje ali predlog?
					</h2>

					<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#706b60]">
						NIDiKo nastaja kot projekt za bolj jasen izbor učnih poti na
						podlagi digitalnih kompetenc.
					</p>

					<button
						type="button"
						onClick={() => setIsFlipped((value) => !value)}
						className="group mx-auto mt-12 block h-[340px] w-full max-w-xl text-left [perspective:1200px]"
						aria-label={isFlipped ? 'PrikaĹľi citat' : 'PrikaĹľi kontakt'}
					>
						<div
							className={[
								'relative h-full w-full rounded-[2.5rem] transition-transform duration-700 [transform-style:preserve-3d] lg:group-hover:[transform:rotateY(180deg)]',
								isFlipped ? '[transform:rotateY(180deg)]' : '',
							].join(' ')}
						>
							<div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] border border-[#cdbb9f] bg-[linear-gradient(135deg,rgba(255,255,255,0.38),rgba(255,255,255,0.16)_45%,rgba(208,122,18,0.08))] px-8 py-10 text-center shadow-[0_18px_55px_rgba(57,47,35,0.12)] backdrop-blur-2xl [backface-visibility:hidden]">
								<span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/45 bg-white/25 text-[#d07a12] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_22px_rgba(57,47,35,0.08)] backdrop-blur-xl">
									<Quote className="h-7 w-7" />
								</span>

								<p className="mt-8 font-display text-2xl font-semibold leading-snug text-[#111111] sm:text-3xl">
									â€śPrava učna pot se začne tam, kjer se trenutno nahajaš.â€ť
								</p>

								<p className="mt-5 text-sm font-medium text-[#706b60]">
									<span className="lg:hidden">Tapni kartico za kontakt.</span>
									<span className="hidden lg:inline">Premakni se čez kartico za kontakt.</span>
								</p>
							</div>

							<div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] border border-[#31583b]/20 bg-[#31583b] px-8 py-10 text-center text-[#fffdf8] shadow-[0_18px_55px_rgba(49,88,59,0.22)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
								<span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-[#fffdf8] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_22px_rgba(0,0,0,0.10)] backdrop-blur-xl">
									<MessageCircle className="h-7 w-7" />
								</span>

								<h3 className="mt-8 font-display text-3xl font-semibold tracking-tight">
									Kontaktiraj nas
								</h3>

								<p className="mt-4 max-w-md text-base leading-7 text-[#fffdf8]/80">
									Za vprašanja, povratne informacije ali predloge glede projekta
									NIDiKo nam lahko pišeš.
								</p>

								<a
									href="mailto:info.nidiko@gmail.com"
									onClick={(event) => event.stopPropagation()}
									className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#fffdf8] px-6 py-3 text-sm font-semibold text-[#31583b] shadow-[0_14px_40px_rgba(0,0,0,0.16)] transition hover:bg-[#fff6eb]"
								>
									<Mail className="h-4 w-4" />
									info.nidiko@gmail.com
								</a>
							</div>
						</div>
					</button>

					<p className="mt-8 text-xs font-medium text-[#8a8175]">
						Â© 2026 NIDiKo. Vse pravice pridrĹľane.
					</p>
				</div>
			</div>
		</section>
	)
}

export default HomeContactSlide

