import HomeGlassNote from './HomeGlassNote'
import RevealOnScroll from './RevealOnScroll'

type StoryCard = {
	title: string
	front: string
	back: string
}

type HomeStorySectionProps = {
	id: string
	eyebrow: string
	title: string
	description: string
	align: 'left' | 'right'
	cards: StoryCard[]
}

function HomeStorySection({
	id,
	eyebrow,
	title,
	description,
	align,
	cards,
}: HomeStorySectionProps) {
	const isRight = align === 'right'

	return (
		<section id={id} className="relative min-h-[150vh] py-52 lg:py-80">
			<div className="relative mx-auto min-h-[620px] w-full">
				<RevealOnScroll
					className={[
						'relative z-10 max-w-[600px]',
						isRight ? 'ml-auto lg:mr-8' : 'mr-auto lg:ml-8',
					].join(' ')}
				>
					<div className="max-w-xl rounded-[30px] bg-[#fffdf8]/30 p-6 backdrop-blur-sm sm:p-8">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#706b60]">
							{eyebrow}
						</p>

						<h2 className="mt-5 font-serif text-[clamp(34px,4vw,58px)] leading-[1.04] text-[#33442f]">
							{title}
						</h2>

						<p className="mt-6 max-w-xl text-[18px] leading-8 text-[#6f6a60]">
							{description}
						</p>
					</div>
				</RevealOnScroll>

				<RevealOnScroll
					delay={140}
					className={[
						'relative z-10 mt-10 grid max-w-[560px] gap-5 sm:grid-cols-2 lg:absolute lg:mt-0',
						isRight
							? 'lg:left-10 lg:top-[260px]'
							: 'lg:right-10 lg:top-[260px]',
					].join(' ')}
				>
					{cards.map((card, index) => (
						<div
							key={`${id}-${card.title}`}
							className={[
								index === 0
									? isRight
										? 'lg:translate-x-8 lg:-translate-y-4'
										: 'lg:-translate-x-8 lg:-translate-y-4'
									: isRight
										? 'lg:-translate-x-4 lg:translate-y-8'
										: 'lg:translate-x-4 lg:translate-y-8',
							].join(' ')}
						>
							<HomeGlassNote
								eyebrow={card.title}
								title={card.front}
								text={card.back}
								tone={index === 0 ? 'green' : 'sand'}
							/>
						</div>
					))}
				</RevealOnScroll>
			</div>
		</section>
	)
}

export default HomeStorySection