import { useEffect, useRef, useState, type ReactNode } from 'react'

type RevealOnScrollProps = {
	children: ReactNode
	className?: string
	delay?: number
}

function RevealOnScroll({
	children,
	className = '',
	delay = 0,
}: RevealOnScrollProps) {
	const elementRef = useRef<HTMLDivElement | null>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const element = elementRef.current

		if (!element) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
					observer.unobserve(element)
				}
			},
			{
				threshold: 0.18,
				rootMargin: '0px 0px -80px 0px',
			},
		)

		observer.observe(element)

		return () => observer.disconnect()
	}, [])

	return (
		<div
			ref={elementRef}
			className={[
				'transition-[transform,opacity] duration-700 ease-out',
				isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0',
				className,
			].join(' ')}
			style={{
				transitionDelay: `${delay}ms`,
			}}
		>
			{children}
		</div>
	)
}

export default RevealOnScroll

