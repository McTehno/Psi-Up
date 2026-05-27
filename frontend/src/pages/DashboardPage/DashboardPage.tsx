import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
	Heart,
	Bookmark,
	CheckCircle2,
	LogOut,
	Route,
	Circle,
	CircleDot,
	ChevronRight,
	Inbox,
} from 'lucide-react'

import { getLearningPathById } from '../../services/learning-path-service'
import { getModuleById } from '../../services/module-service'
import { getLearningUnitById } from '../../services/learning-unit-service'

import { useAuth } from '../../features/auth/contexts/AuthContext'
import { useDashboardProgress } from '../../hooks/useDashboardProgress'
import { supabase } from '../../services/supabase-client'

import './DashboardPage.css'

type DashboardTab = 'favorites' | 'saved' | 'completed'

const tabs: { key: DashboardTab; label: string; icon: typeof Heart }[] = [
	{ key: 'favorites', label: 'Priljubljeno', icon: Heart },
	{ key: 'saved', label: 'Shranjeno', icon: Bookmark },
	{ key: 'completed', label: 'Dokončano', icon: CheckCircle2 },
]

type ContentItemProps = {
	id: string
	type: 'learning_path' | 'module' | 'learning_unit'
	index: number
}

const typeLabels: Record<string, string> = {
	learning_path: 'Učna pot',
	module: 'Modul',
	learning_unit: 'Učna enota',
}

const typeRoutes: Record<string, string> = {
	learning_path: '/learning-paths',
	module: '/modules',
	learning_unit: '/learning-units',
}

const typeIcons: Record<string, typeof Route> = {
	learning_path: Route,
	module: Circle,
	learning_unit: CircleDot,
}

const typeColors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
	learning_path: {
		bg: 'bg-[#f2f8f1]',
		border: 'border-[#c3d4c0]',
		text: 'text-[#3d5a3e]',
		iconBg: 'bg-[#31583b]',
	},
	module: {
		bg: 'bg-[#fff6eb]',
		border: 'border-[#e8c3af]',
		text: 'text-[#8d5033]',
		iconBg: 'bg-[#d07a12]',
	},
	learning_unit: {
		bg: 'bg-[#faf7f2]',
		border: 'border-[#ede5d8]',
		text: 'text-[#6e614f]',
		iconBg: 'bg-[#8b7355]',
	},
}

function ContentItem({ id, type, index }: ContentItemProps) {
	const colors = typeColors[type]
	const Icon = typeIcons[type]
	const route = `${typeRoutes[type]}/${id}`

	const [title, setTitle] = useState<string>(id)

	useEffect(() => {
		async function fetchTitle() {
			try {
				if (type === 'learning_path') {
					const data = await getLearningPathById(id)
					setTitle(data.title)
				} else if (type === 'module') {
					const data = await getModuleById(id)
					setTitle(data.title)
				} else if (type === 'learning_unit') {
					const data = await getLearningUnitById(id)
					setTitle(data.title)
				}
			} catch (e) {
				console.error('Error fetching title for', id, e)
			}
		}
		fetchTitle()
	}, [id, type])

	return (
		<Link
			to={route}
			className={`dashboard-content-card group flex items-center gap-4 rounded-2xl border ${colors.border} ${colors.bg} p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#d07a12]/30`}
			style={{ animationDelay: `${index * 60}ms` }}
		>
			<div
				className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
			>
				<Icon className="h-5 w-5" />
			</div>

			<div className="min-w-0 flex-1">
				<p className="text-sm font-bold text-[#2C2417] truncate">{title}</p>
				<p className={`text-xs font-semibold ${colors.text} mt-0.5`}>
					{typeLabels[type]}
				</p>
			</div>

			<ChevronRight className="h-4 w-4 shrink-0 text-[#c2b49e] transition-all duration-300 group-hover:text-[#d07a12] group-hover:translate-x-0.5" />
		</Link>
	)
}

export default function DashboardPage() {
	const navigate = useNavigate()
	const { user, localUser, isLoading: isAuthLoading } = useAuth()
	const { progress, isLoading: isProgressLoading, error } = useDashboardProgress()
	const [activeTab, setActiveTab] = useState<DashboardTab>('favorites')

	const handleLogout = async () => {
		await supabase.auth.signOut()
		navigate('/')
	}

	// Derive display name and email
	const displayName =
		localUser?.name ||
		user?.user_metadata?.full_name ||
		user?.user_metadata?.name ||
		'Uporabnik'
	const displayEmail = localUser?.email || user?.email || ''

	// Get initials for avatar
	const initials = displayName
		.split(' ')
		.map((w: string) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	// Get items for active tab
	function getTabItems(): { id: string; type: 'learning_path' | 'module' | 'learning_unit' }[] {
		if (!progress) return []

		if (activeTab === 'favorites') {
			return [
				...progress.favorite_learning_paths.map((id) => ({
					id,
					type: 'learning_path' as const,
				})),
				...progress.favorite_modules.map((id) => ({
					id,
					type: 'module' as const,
				})),
				...progress.favorite_learning_units.map((id) => ({
					id,
					type: 'learning_unit' as const,
				})),
			]
		}

		if (activeTab === 'saved') {
			return [
				...progress.saved_learning_paths.map((id) => ({
					id,
					type: 'learning_path' as const,
				})),
				...progress.saved_modules.map((id) => ({
					id,
					type: 'module' as const,
				})),
				...progress.saved_learning_units.map((id) => ({
					id,
					type: 'learning_unit' as const,
				})),
			]
		}

		return [
			...progress.completed_learning_paths.map((id) => ({
				id,
				type: 'learning_path' as const,
			})),
			...progress.completed_modules.map((id) => ({
				id,
				type: 'module' as const,
			})),
			...progress.completed_learning_units.map((id) => ({
				id,
				type: 'learning_unit' as const,
			})),
		]
	}

	const tabItems = getTabItems()

	// Tab accent colors
	const tabAccent: Record<DashboardTab, { underline: string; activeText: string }> = {
		favorites: { underline: 'bg-[#31583b]', activeText: 'text-[#31583b]' },
		saved: { underline: 'bg-[#d07a12]', activeText: 'text-[#d07a12]' },
		completed: { underline: 'bg-[#31583b]', activeText: 'text-[#31583b]' },
	}

	const isInitialLoading = (isAuthLoading || isProgressLoading) && !progress

	return (
		<div className="min-h-screen pb-20">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32">
				{/* ── Profile Card ── */}
				<div className="dashboard-profile-card relative overflow-hidden rounded-[28px] border border-[#eadfce]/60 bg-[#fffdf8]/70 p-6 sm:p-8 shadow-[0_16px_48px_rgba(57,47,35,0.08)] backdrop-blur-xl">
					{/* Decorative background gradients */}
					<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
						<div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d07a12]/[0.06] blur-3xl" />
						<div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[#31583b]/[0.05] blur-3xl" />
					</div>

					<div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
						{/* Avatar */}
						<div className="dashboard-avatar relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#eadfce] bg-gradient-to-br from-[#ede5d8] to-[#d4c4ad] sm:h-28 sm:w-28">
							<span className="select-none font-display text-3xl font-bold text-[#6e614f] sm:text-4xl">
								{initials}
							</span>
						</div>

						{/* User Info */}
						<div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
							<h1 className="font-display text-2xl font-bold tracking-tight text-[#2C2417] sm:text-3xl">
								{displayName}
							</h1>
							<p className="mt-1 text-sm font-medium text-[#8b7c65]">
								{displayEmail}
							</p>

							{/* Stats mini row */}
							{progress && (
								<div className="mt-4 flex items-center gap-5">
									<div className="flex items-center gap-1.5">
										<Heart className="h-3.5 w-3.5 text-[#31583b]" />
										<span className="text-xs font-bold text-[#504639]">
											{progress.favorite_learning_paths.length +
												progress.favorite_modules.length +
												progress.favorite_learning_units.length}
										</span>
									</div>
									<div className="flex items-center gap-1.5">
										<Bookmark className="h-3.5 w-3.5 text-[#d07a12]" />
										<span className="text-xs font-bold text-[#504639]">
											{progress.saved_learning_paths.length +
												progress.saved_modules.length +
												progress.saved_learning_units.length}
										</span>
									</div>
									<div className="flex items-center gap-1.5">
										<CheckCircle2 className="h-3.5 w-3.5 text-[#5e845c]" />
										<span className="text-xs font-bold text-[#504639]">
											{progress.completed_learning_paths.length +
												progress.completed_modules.length +
												progress.completed_learning_units.length}
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Logout button */}
						<button
							type="button"
							onClick={handleLogout}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200/80 bg-red-50/60 px-4 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:bg-red-100 hover:border-red-300 hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer sm:absolute sm:right-8 sm:top-8"
						>
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Odjava</span>
						</button>
					</div>
				</div>

				{/* ── Tabs + Content Section ── */}
				<div className="dashboard-content-section mt-8">
					{/* Tab bar */}
					<div className="flex items-center gap-1 rounded-2xl border border-[#eadfce]/60 bg-[#fffdf8]/50 p-1.5 shadow-sm backdrop-blur-lg">
						{tabs.map((tab) => {
							const isActive = activeTab === tab.key
							const Icon = tab.icon
							const accent = tabAccent[tab.key]

							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={[
										'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer',
										isActive
											? `${accent.activeText} bg-white shadow-[0_4px_16px_rgba(57,47,35,0.07)]`
											: 'text-[#a89880] hover:text-[#6e614f] hover:bg-white/40',
									].join(' ')}
								>
									<Icon
										className={[
											'h-4 w-4 shrink-0 transition-all duration-300',
											isActive && tab.key === 'favorites'
												? 'fill-current'
												: '',
											isActive && tab.key === 'saved'
												? 'fill-current'
												: '',
										].join(' ')}
									/>
									<span className="hidden sm:inline">{tab.label}</span>

									{/* Active underline */}
									{isActive && (
										<span
											className={`dashboard-tab-active absolute -bottom-1.5 left-[20%] right-[20%] h-[3px] rounded-full ${accent.underline}`}
											style={{ animation: 'tab-underline-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
										/>
									)}
								</button>
							)
						})}
					</div>

					{/* Content area */}
					<div className="mt-6 min-h-[240px]">
						{isInitialLoading && (
							<div className="flex flex-col items-center justify-center py-16">
								<div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#ede5d8] border-t-[#d07a12]" />
								<p className="mt-4 text-sm font-medium text-[#a89880]">
									Nalaganje podatkov...
								</p>
							</div>
						)}

						{error && !isInitialLoading && (
							<div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/50 bg-red-50/40 py-12 text-center">
								<p className="text-sm font-semibold text-red-500">
									{error}
								</p>
							</div>
						)}

						{!isInitialLoading && !error && tabItems.length === 0 && (
							<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ede5d8] bg-[#fffdf8]/40 py-16 text-center">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ede5d8]/60">
									<Inbox className="h-7 w-7 text-[#a89880]" />
								</div>
								<h3 className="mt-4 font-display text-lg font-bold text-[#6e614f]">
									Ni vsebin
								</h3>
								<p className="mt-1.5 max-w-xs text-sm text-[#a89880]">
									{activeTab === 'favorites' &&
										'Še nimate priljubljenih vsebin. Raziskujte učne poti in dodajajte med priljubljene.'}
									{activeTab === 'saved' &&
										'Še nimate shranjenih vsebin. Shranite vsebine za kasnejši pregled.'}
									{activeTab === 'completed' &&
										'Še niste dokončali nobene vsebine. Začnite z učno potjo!'}
								</p>
								<Link
									to="/search"
									className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d07a12] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#b3660f] hover:scale-105 hover:shadow-md"
								>
									Razišči vsebine
									<ChevronRight className="h-4 w-4" />
								</Link>
							</div>
						)}

						{!isInitialLoading && !error && tabItems.length > 0 && (
							<div className="grid gap-3" key={activeTab}>
								{tabItems.map((item, index) => (
									<ContentItem
										key={`${item.type}-${item.id}`}
										id={item.id}
										type={item.type}
										index={index}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
