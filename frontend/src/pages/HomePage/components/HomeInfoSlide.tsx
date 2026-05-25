import type { LucideIcon } from 'lucide-react'

type HomeInfoCard = {
	icon: LucideIcon
	title: string
	text: string
}

type HomeInfoSlideProps = {
	id: string
	label: string
	title: string
	description: string
	labelColor: string
	cards: readonly HomeInfoCard[]
	cardBackground: string
	iconBackground: string
	iconColor: string
}

function HomeInfoSlide({
	id,
	label,
	title,
	description,
	labelColor,
	cards,
	cardBackground,
	iconBackground,
	iconColor,
}: HomeInfoSlideProps) {
	return (
		<section
	id={id}
	className="flex py-12 lg:h-screen lg:snap-start lg:items-center lg:overflow-hidden lg:py-12"
>
			<div className="w-full">
				<div className="mx-auto max-w-3xl text-center">
					<p
						className={`text-xs font-semibold uppercase tracking-[0.28em] ${labelColor}`}
					>
						{label}
					</p>

					<h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-[#111111] sm:text-5xl">
						{title}
					</h2>

					<p className="mt-5 text-lg leading-8 text-[#706b60]">
						{description}
					</p>
				</div>

				<div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
					{cards.map(({ icon: Icon, title: cardTitle, text }) => (
						<article
							key={cardTitle}
							className="rounded-[2rem] border border-[#d8cbb8]/80 bg-white/25 p-7 text-center shadow-[0_18px_55px_rgba(57,47,35,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-[#cdbb9f] hover:bg-white/35 hover:shadow-[0_22px_60px_rgba(57,47,35,0.11)]"
						>
							<span
								className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconBackground} ${iconColor}`}
							>
								<Icon className="h-7 w-7" />
							</span>

							<h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-[#111111]">
								{cardTitle}
							</h3>

							<p className="mx-auto mt-4 max-w-md text-base leading-8 text-[#706b60]">
								{text}
							</p>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

export default HomeInfoSlide