type HomeGlassNoteProps = {
	eyebrow: string
	title: string
	text: string
	tone?: 'green' | 'sand' | 'orange'
}

function HomeGlassNote({
	eyebrow,
	title,
	text,
	tone = 'green',
}: HomeGlassNoteProps) {
	const toneClasses = {
		green: 'bg-[#f2f8f1]/70 text-[#31583b]',
		sand: 'bg-[#fff6eb]/70 text-[#706b60]',
		orange: 'bg-[#fff4e6]/70 text-[#c98a43]',
	}

	return (
		<div className="rounded-[26px] border border-[#ded5c6]/70 bg-[#fffdf8]/85 p-5 shadow-[0_16px_42px_rgba(57,47,35,0.09)]">
			<span
				className={[
					'inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]',
					toneClasses[tone],
				].join(' ')}
			>
				{eyebrow}
			</span>

			<h3 className="mt-4 font-serif text-2xl leading-tight text-[#2f4a31]">
				{title}
			</h3>

			<p className="mt-3 text-sm leading-6 text-[#706b60]">{text}</p>
		</div>
	)
}

export default HomeGlassNote