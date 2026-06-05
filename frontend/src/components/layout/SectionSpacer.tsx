type SectionSpacerProps = {
	size?: 'normal' | 'large'
}

export default function SectionSpacer({ size = 'normal' }: SectionSpacerProps) {
	return (
		<div
			className={size === 'large' ? 'h-[56vh] lg:h-[70vh]' : 'h-[40vh] lg:h-[56vh]'}
			aria-hidden="true"
		/>
	)
}


