import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, User } from 'lucide-react'

import Logo from '../Logo'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import { supabase } from '../../../services/supabase-client'

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
	{ label: 'O nas', to: '/about' },
]

function Navbar({ links = defaultLinks }: NavbarProps) {
	const location = useLocation()
	const { user } = useAuth()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isNavbarVisible, setIsNavbarVisible] = useState(true)

	const handleLogout = async () => {
		await supabase.auth.signOut()
		setIsMenuOpen(false)
	}

	useEffect(() => {
		let lastScrollTop = 0

		function handleScroll(event: Event) {
			const isMobileOrTablet = window.matchMedia('(max-width: 1023px)').matches

			if (!isMobileOrTablet || isMenuOpen) {
				setIsNavbarVisible(true)
				return
			}

			const target = event.target as HTMLElement | Document
			const scrollElement =
				target instanceof Document ? document.documentElement : target

			const currentScrollTop = scrollElement.scrollTop

			if (currentScrollTop <= 40) {
				setIsNavbarVisible(true)
				lastScrollTop = currentScrollTop
				return
			}

			if (currentScrollTop > lastScrollTop + 8) {
				setIsNavbarVisible(false)
			}

			if (currentScrollTop < lastScrollTop - 8) {
				setIsNavbarVisible(true)
			}

			lastScrollTop = currentScrollTop
		}

		window.addEventListener('scroll', handleScroll, true)

		return () => {
			window.removeEventListener('scroll', handleScroll, true)
		}
	}, [isMenuOpen])

	return (
		<header
			className={[
				'fixed inset-x-0 top-0 z-50 border-b border-white/35 bg-white/18 shadow-[0_12px_40px_rgba(57,47,35,0.10)] backdrop-blur-2xl transition-transform duration-300',
				isNavbarVisible ? 'translate-y-0' : '-translate-y-full',
				'lg:translate-y-0',
			].join(' ')}
		>
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.12)_45%,rgba(208,122,18,0.08))]" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />

			<nav className="relative mx-auto grid h-[76px] w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8 lg:px-10">
				<Link
					to="/"
					aria-label="NIDiKo domov"
					onClick={() => setIsMenuOpen(false)}
					className="group inline-flex min-w-0 shrink-0 items-center gap-3 justify-self-start"
				>
					<Logo
						hideLabel
						iconContainerClassName="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/45 bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_22px_rgba(57,47,35,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:bg-white/38"
						iconClassName="h-6 w-6 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
					/>

					<span className="hidden sm:block">
						<span className="block font-display text-lg font-semibold tracking-tight text-[#111111]">
							NIDiKo
						</span>
						<span className="block text-[10px] font-medium leading-[1.3] text-[#5f5a52]">
							Razvoj prilagodljivega kurikuluma neformalnih izobraĹľevanj
							<br />
							za pridobitev in razvoj digitalnih kompetenc
						</span>
					</span>
				</Link>

				<div className="hidden items-center gap-10 justify-self-center lg:flex">
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
							</Link>
						)
					})}
				</div>

				<div className="hidden justify-self-end lg:flex items-center gap-3">
					{user ? (
						<Link
							to="/dashboard"
							className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-gradient-to-br from-[#ede5d8] to-[#d4c4ad] shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-[#d07a12]/40 active:scale-95"
							aria-label="UporabniĹˇki profil"
						>
							<User className="h-4.5 w-4.5 text-[#6e614f] transition-colors duration-300 group-hover:text-[#d07a12]" />
						</Link>
					) : (
						<Link
							to="/register"
							className="inline-flex h-9 items-center justify-center rounded-full bg-[#d07a12] px-6 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#b0650c] hover:scale-105 active:scale-95"
						>
							Registracija
						</Link>
					)}
				</div>

				<button
					type="button"
					onClick={() => setIsMenuOpen((current) => !current)}
					className="col-start-3 inline-flex h-11 w-11 items-center justify-center justify-self-end rounded-[10px] border border-white/45 bg-white/24 text-[#31583b] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_22px_rgba(57,47,35,0.08)] backdrop-blur-xl transition hover:bg-white/38 lg:hidden" aria-label={isMenuOpen ? 'Zapri meni' : 'Odpri meni'}
					aria-expanded={isMenuOpen}
				>
					{isMenuOpen ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</button>
			</nav>

			<div
				className={[
					'relative z-50 border-t border-[#eadfce] bg-[#fffdf8] shadow-[0_14px_34px_rgba(57,47,35,0.10)] transition-all duration-300 lg:hidden',
					isMenuOpen
						? 'max-h-[500px] opacity-100'
						: 'pointer-events-none max-h-0 overflow-hidden opacity-0',
				].join(' ')}
			>
				<nav className="space-y-1 px-4 pb-4 pt-3">
					{links.map((link) => {
						const isActive = location.pathname === link.to

						return (
							<Link
								key={link.to}
								to={link.to}
								onClick={() => setIsMenuOpen(false)}
								aria-current={isActive ? 'page' : undefined}
								className={[
									'block rounded-[10px] px-4 py-3 text-base font-semibold tracking-wide transition',
									isActive
										? 'bg-[#fff4e6] text-[#111111]'
										: 'text-[#5f5a52] hover:bg-[#fff6eb] hover:text-[#111111]',
								].join(' ')}
							>
								{link.label}
							</Link>
						)
					})}
					{user ? (
						<>
							<Link
								to="/dashboard"
								onClick={() => setIsMenuOpen(false)}
								className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#f2f8f1] px-4 py-3 text-base font-semibold tracking-wide text-[#31583b] transition hover:bg-[#e0eedd]"
							>
								<User className="h-5 w-5" />
								Moj profil
							</Link>
							<button
								onClick={handleLogout}
								className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-red-600/10 px-4 py-3 text-base font-semibold tracking-wide text-red-600 transition hover:bg-red-600/20"
							>
								<LogOut className="h-5 w-5" />
								Odjava
							</button>
						</>
					) : (
						<Link
							to="/register"
							onClick={() => setIsMenuOpen(false)}
							className="mt-2 block rounded-[10px] bg-[#d07a12] px-4 py-3 text-center text-base font-semibold tracking-wide text-white transition hover:bg-[#b0650c]"
						>
							Registracija
						</Link>
					)}
				</nav>
			</div>
		</header>
	)
}

export default Navbar

