import type { ReactNode } from 'react'

type DetailHeroProps = {
	eyebrow?: string
	title: string
	description?: string | null
	visual?: ReactNode
	children?: ReactNode
}

function DetailHero({
	eyebrow,
	title,
	description,
	visual,
	children,
}: DetailHeroProps) {
	return (
		<section className="mb-10 sm:mb-12">
			<div
				className={
					visual
						? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start'
						: 'max-w-[1120px]'
				}
			>
				<div>
					{eyebrow && (
						<p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#6f7b63]">
							{eyebrow}
						</p>
					)}

					<h1 className="max-w-[980px] font-serif text-[clamp(2.8rem,5.4vw,5.6rem)] leading-[0.95] tracking-[-0.04em] text-[#2f3328]">
						{title}
					</h1>

					{description && (
						<p className="mt-6 max-w-[820px] text-[18px] leading-8 text-[#706b60] sm:text-[20px]">
							{description}
						</p>
					)}

					{children && <div className="mt-8">{children}</div>}
				</div>

				{visual && <div className="hidden lg:block">{visual}</div>}
			</div>
		</section>
	)
}

export default DetailHero

