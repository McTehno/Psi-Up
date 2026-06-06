import type { ReactNode } from 'react'

type DetailSectionProps = {
	title: string
	eyebrow?: string
	description?: string
	children: ReactNode
}

function DetailSection({
	title,
	eyebrow,
	description,
	children,
}: DetailSectionProps) {
	return (
		<section className="overflow-hidden rounded-[28px] border border-[#eadfce]/80 bg-[#fffdf8]/68 p-6 shadow-[0_16px_42px_rgba(84,59,33,0.08)] backdrop-blur-xl sm:p-7 lg:p-8 mb-8">
			<div className="mb-7">
				{eyebrow && (
					<p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#6f7b63]">
						{eyebrow}
					</p>
				)}

				<h2 className="font-serif text-[clamp(1.65rem,2.2vw,2.35rem)] leading-tight tracking-[-0.025em] text-[#2f3328]">
					{title}
				</h2>

				{description && (
					<p className="mt-3 max-w-[780px] text-[15px] leading-7 text-[#706b60]">
						{description}
					</p>
				)}
			</div>

			{children}
		</section>
	)
}

export default DetailSection

