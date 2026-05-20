export type IconProps = {
	className?: string
}

export function BookOpenIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M12 5.5c-1.7-1.1-3.8-1.7-6-1.7a1.5 1.5 0 0 0-1.5 1.5V18a1 1 0 0 0 1.3.95c1.9-.6 4-.8 6.2-.4V5.5Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 5.5c1.7-1.1 3.8-1.7 6-1.7a1.5 1.5 0 0 1 1.5 1.5V18a1 1 0 0 1-1.3.95c-1.9-.6-4-.8-6.2-.4V5.5Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function CompassIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
			<path d="m14.6 9.4-1.1 3.1-3.1 1.1 1.1-3.1 3.1-1.1Z" fill="currentColor" />
		</svg>
	)
}

export function TargetIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
			<circle cx="12" cy="12" r="3" fill="currentColor" />
		</svg>
	)
}

export function UserIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M12 12.2a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z"
				stroke="currentColor"
				strokeWidth="1.7"
			/>
			<path
				d="M5.8 19.2a6.2 6.2 0 0 1 12.4 0"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export function LeafIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M18.5 5.5c-6.2-.4-11.5 3.9-11.9 10.1 0 .6.2 1.2.6 1.6.4.4 1 .6 1.6.6 6.2-.4 10.5-5.7 10.1-11.9Z"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M7.5 16.5c2.3-2.1 4.8-3.8 7.5-5.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

export function ArrowRightIcon({ className = 'h-4 w-4' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
			<path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
			<path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

export function UsersIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}

export function PathIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M4 19V9a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="4" cy="20" r="1.5" fill="currentColor" />
			<circle cx="12" cy="3" r="1.5" fill="currentColor" />
			<path d="M16 19v-4a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="16" cy="20" r="1.5" fill="currentColor" />
		</svg>
	)
}

export function CircleIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
		</svg>
	)
}

export function DotIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<circle cx="12" cy="12" r="4" fill="currentColor" />
		</svg>
	)
}

export function EditIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M12 20h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function ShieldIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function LightbulbIcon({ className = 'h-5 w-5' }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path d="M9 18h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M10 22h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
			<path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
		</svg>
	)
}