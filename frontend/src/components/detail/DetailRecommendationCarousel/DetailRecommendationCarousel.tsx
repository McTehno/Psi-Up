import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
	ArrowLeft,
	ArrowRight,
	Circle,
	CircleDot,
	Clock3,
	Route,
} from 'lucide-react'

import DetailSection from '../DetailSection'
import {
	getArrayOrEmpty,
	getNumberOrUndefined,
	getTextOrFallback,
} from '../../../utils/display'

export type DetailRecommendationCarouselItem = {
	id: string
	title?: string | null
	description?: string | null
	durationHours?: number | null
	keywords?: string[] | null
	href?: string | null
	typeLabel?: string
}

type DetailRecommendationCarouselProps = {
	eyebrow?: string
	title: string
	description?: string
	items?: DetailRecommendationCarouselItem[]
}

/**
 * Oblikuje trajanje za prikaz na povezani kartici.
 */
function formatDuration(durationHours: number) {
	const formattedDuration = String(durationHours).replace('.', ',')

	if (!Number.isInteger(durationHours)) {
		return `${formattedDuration} h`
	}

	if (durationHours === 1) {
		return '1 ura'
	}

	if (durationHours === 2) {
		return '2 uri'
	}

	if (durationHours === 3 || durationHours === 4) {
		return `${durationHours} ure`
	}

	return `${durationHours} ur`
}

/**
 * Vrne število kartic, ki jih želimo prikazati hkrati.
 *
 * - mobile: 1
 * - tablet: 2
 * - desktop: 3
 */
function getVisibleItemCount() {
	if (typeof window === 'undefined') {
		return 3
	}

	if (window.innerWidth < 768) {
		return 1
	}

	if (window.innerWidth < 1024) {
		return 2
	}

	return 3
}

/**
 * Grid se prilagodi dejanskemu številu prikazanih kartic.
 *
 * Če imamo na desktopu samo 1 ali 2 povezani vsebini, kartice zavzamejo
 * celotno širino, namesto da ostanejo v gridu za 3 kartice.
 */
function getCarouselGridClass(
	visibleItemCount: number,
	visibleItemsCount: number,
) {
	const columnCount = Math.min(visibleItemCount, visibleItemsCount)

	if (columnCount <= 1) {
		return 'grid grid-cols-1 gap-4'
	}

	if (columnCount === 2) {
		return 'grid grid-cols-2 gap-4'
	}

	return 'grid grid-cols-3 gap-4'
}

/**
 * Vrne ikono in barve glede na tip povezane vsebine.
 *
 * Usklajeno s SearchResultCard:
 * - učna pot: forest
 * - modul: blue
 * - učna enota: amber
 */
function getTypeIcon(typeLabel?: string) {
	if (typeLabel === 'Učna pot') {
		return {
			label: 'Učna pot',
			className: 'bg-forest-100 text-forest-700',
			icon: <Route className="h-6 w-6" />,
		}
	}

	if (typeLabel === 'Modul') {
		return {
			label: 'Modul',
			className: 'bg-blue-100 text-blue-700',
			icon: <Circle className="h-6 w-6" />,
		}
	}

	return {
		label: typeLabel || 'Učna enota',
		className: 'bg-amber-100 text-amber-700',
		icon: <CircleDot className="h-6 w-6" />,
	}
}

/**
 * Carousel za povezane detail vsebine.
 *
 * Namenjen je ponovni uporabi:
 * - na detail strani učne enote za povezane module
 * - na detail strani modula za povezane učne poti
 *
 * Če ni povezanih vsebin, komponenta ne prikaže ničesar.
 */
function DetailRecommendationCarousel({
	eyebrow = 'Povezana vsebina',
	title,
	description,
	items = [],
}: DetailRecommendationCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [visibleItemCount, setVisibleItemCount] = useState(getVisibleItemCount)

	const safeItems = useMemo(
		() =>
			getArrayOrEmpty(items)
				.filter((item) => Boolean(item.id))
				.map((item) => ({
					...item,
					title: getTextOrFallback(item.title, 'Neimenovana vsebina'),
					description: getTextOrFallback(
						item.description,
						'Opis trenutno ni na voljo.',
					),
					durationHours: getNumberOrUndefined(item.durationHours),
					keywords: getArrayOrEmpty(item.keywords)
						.filter((keyword) => keyword.trim())
						.slice(0, 3),
				})),
		[items],
	)

	const maxIndex = Math.max(0, safeItems.length - visibleItemCount)

	useEffect(() => {
		function handleResize() {
			const nextVisibleItemCount = getVisibleItemCount()

			setVisibleItemCount(nextVisibleItemCount)
			setCurrentIndex((previousIndex) =>
				Math.min(
					previousIndex,
					Math.max(0, safeItems.length - nextVisibleItemCount),
				),
			)
		}

		handleResize()

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [safeItems.length])

	if (safeItems.length === 0) {
		return null
	}

	const canGoPrevious = currentIndex > 0
	const canGoNext = currentIndex < maxIndex

	const visibleItems = safeItems.slice(
		currentIndex,
		currentIndex + visibleItemCount,
	)

	function handlePrevious() {
		setCurrentIndex((previousIndex) => Math.max(0, previousIndex - 1))
	}

	function handleNext() {
		setCurrentIndex((previousIndex) => Math.min(maxIndex, previousIndex + 1))
	}

	return (
		<DetailSection eyebrow={eyebrow} title={title} description={description}>
			<div className="space-y-5">
				{safeItems.length > visibleItemCount && (
					<div className="flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={handlePrevious}
							disabled={!canGoPrevious}
							aria-label="Prikaži prejšnje povezane vsebine"
							className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8] text-[#31583b] shadow-[0_10px_22px_rgba(84,59,33,0.08)] transition hover:bg-[#f8f2e8] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ArrowLeft className="h-4 w-4" />
						</button>

						<button
							type="button"
							onClick={handleNext}
							disabled={!canGoNext}
							aria-label="Prikaži naslednje povezane vsebine"
							className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffdf8] text-[#31583b] shadow-[0_10px_22px_rgba(84,59,33,0.08)] transition hover:bg-[#f8f2e8] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ArrowRight className="h-4 w-4" />
						</button>
					</div>
				)}

				<div
					className={getCarouselGridClass(
						visibleItemCount,
						visibleItems.length,
					)}
				>
					{visibleItems.map((item) => {
						const typeIcon = getTypeIcon(item.typeLabel)

						const cardContent = (
							<article className="group flex h-full flex-col rounded-[20px] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-[0_14px_30px_rgba(84,59,33,0.07)] transition hover:-translate-y-0.5 hover:border-[#d6c8b7] hover:shadow-[0_18px_36px_rgba(84,59,33,0.1)]">
								<div className="mb-5 flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-center gap-3">
										<span
											className={[
												'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
												typeIcon.className,
											].join(' ')}
										>
											{typeIcon.icon}
										</span>

										<span className="rounded-full bg-[#f8f2e8] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#706b60]">
											{typeIcon.label}
										</span>
									</div>

									{item.durationHours !== undefined && (
										<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff4e6] px-3 py-1 text-xs font-semibold text-[#c98a43]">
											<Clock3 className="h-3.5 w-3.5" />
											{formatDuration(item.durationHours)}
										</span>
									)}
								</div>

								<h3 className="text-lg font-bold leading-snug text-[#2f3328] transition group-hover:text-[#31583b]">
									{item.title}
								</h3>

								<p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#706b60]">
									{item.description}
								</p>

								{item.keywords.length > 0 && (
									<div className="mt-5 flex flex-wrap gap-2">
										{item.keywords.map((keyword) => (
											<span
												key={`${item.id}-${keyword}`}
												className="rounded-md bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700 transition group-hover:bg-forest-100"
											>
												#{keyword}
											</span>
										))}
									</div>
								)}

								<div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#31583b]">
									Odpri
									<ArrowRight className="h-4 w-4" />
								</div>
							</article>
						)

						if (!item.href) {
							return (
								<div key={item.id} className="h-full">
									{cardContent}
								</div>
							)
						}

						return (
							<Link key={item.id} to={item.href} className="h-full">
								{cardContent}
							</Link>
						)
					})}
				</div>
			</div>
		</DetailSection>
	)
}

export default DetailRecommendationCarousel

