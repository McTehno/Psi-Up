import { Link, useLocation } from 'react-router-dom'
import Logo from '../Logo'

type NavbarLink = {
	label: string
	to: string
}

type NavbarProps = {
	links?: NavbarLink[]
}

const defaultLinks: NavbarLink[] = [
	{ label: 'Domov', to: '/' },
	{ label: 'Iskanje', to: '/search' },
	{ label: 'Vprašalnik', to: '/assessment' },
]

function Navbar({ links = defaultLinks }: NavbarProps) {
	const location = useLocation()

	return (
		<header className="sticky top-0 z-50 border-b border-white/35 bg-white/18 shadow-[0_12px_40px_rgba(57,47,35,0.10)] backdrop-blur-2xl">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.12)_45%,rgba(208,122,18,0.08))]" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />

			<nav className="relative mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
				<Link
					to="/"
					aria-label="Psi-Up domov"
					className="group inline-flex shrink-0 items-center gap-3"
				>
					<Logo
						hideLabel
						iconContainerClassName="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/45 bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_22px_rgba(57,47,35,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:bg-white/38"
						iconClassName="h-6 w-6 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
					/>

					<span className="hidden sm:block">
						<span className="block font-display text-lg font-semibold tracking-tight text-[#111111]">
							Psi-Up
						</span>
						<span className="block text-xs font-medium text-[#706b60]">
							Priporočilne učne poti
						</span>
					</span>
				</Link>

				<div className="hidden items-center gap-10 md:flex">
					{links.map((link) => {
						const isActive = location.pathname === link.to

						return (
							<Link
								key={link.to}
								to={link.to}
								className={[
									'group relative py-2 text-[15px] font-semibold tracking-wide transition-all duration-300',
									isActive
										? 'text-[#111111]'
										: 'text-[#5f5a52] hover:text-[#111111]',
								].join(' ')}
							>
								{link.label}

								<span
									className={[
										'absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all duration-300',
										isActive
											? 'w-8 bg-[#d07a12]'
											: 'w-0 bg-[#d07a12]/70 group-hover:w-5',
									].join(' ')}
								/>

								{isActive && (
									<span className="absolute -bottom-[7px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#d07a12]" />
								)}
							</Link>
						)
					})}
				</div>

				<div className="hidden h-10 w-[156px] md:block" aria-hidden="true" />
			</nav>
		</header>
	)
}

export default Navbar