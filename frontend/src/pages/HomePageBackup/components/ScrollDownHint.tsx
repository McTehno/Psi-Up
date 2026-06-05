import { ChevronDown } from 'lucide-react'

type ScrollDownHintProps = {
	href: string
	label?: string
}

function ScrollDownHint({ href, label = 'Nadaljuj' }: ScrollDownHintProps) {
	return (
		<a
			href={href}
			aria-label={label}
			className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[#706b60] transition hover:text-[#31583b]"
		>
			<span className="text-xs font-semibold uppercase tracking-[0.22em]">
				{label}
			</span>

			<span className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8]/80 shadow-sm backdrop-blur-md">
				<ChevronDown className="h-5 w-5" />
			</span>
		</a>
	)
}

export default ScrollDownHint

