import type { ReactNode } from 'react'

export type DetailMetaItem = {
	label: string
	value: string | number
	icon?: ReactNode
}

type DetailMetaProps = {
	items: DetailMetaItem[]
	variant?: 'cards' | 'compact'
}

function DetailMeta({ items, variant = 'cards' }: DetailMetaProps) {
	if (items.length === 0) {
		return null
	}

	if (variant === 'compact') {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-4">
				{items.map((item) => (
					<div
						key={`${item.label}-${item.value}`}
						className="flex min-h-[86px] w-full items-center gap-3 rounded-[20px] border border-[#d08a34]/35 bg-[#f7f1e7]/88 px-4 py-4 shadow-[0_12px_30px_rgba(84,59,33,0.07)] backdrop-blur-lg lg:w-auto lg:min-w-[178px] lg:px-5"
					>
						{item.icon && (
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8]/90 text-[#31583b] shadow-[0_7px_16px_rgba(57,47,35,0.07)] backdrop-blur-md [&_svg]:h-5 [&_svg]:w-5">
								{item.icon}
							</div>
						)}

						<div className="min-w-0">
							<span className="block text-[12px] font-bold uppercase tracking-[0.16em] text-[#6f7b63]">
								{item.label}
							</span>

							<strong className="mt-1.5 block break-words text-[18px] font-bold leading-tight text-[#2f3328]">
								{item.value}
							</strong>
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{items.map((item) => (
				<div
					key={`${item.label}-${item.value}`}
					className="rounded-[24px] border border-[#d08a34]/35 bg-[#f7f1e7]/88 p-5 shadow-[0_14px_34px_rgba(84,59,33,0.07)] backdrop-blur-lg"
				>
					{item.icon && (
						<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8]/90 text-[#31583b] shadow-[0_7px_16px_rgba(57,47,35,0.07)] backdrop-blur-md">
							{item.icon}
						</div>
					)}

					<span className="block text-[12px] font-bold uppercase tracking-[0.16em] text-[#6f7b63]">
						{item.label}
					</span>

					<strong className="mt-2 block text-xl font-bold leading-tight text-[#2f3328]">
						{item.value}
					</strong>
				</div>
			))}
		</div>
	)
}

export default DetailMeta

