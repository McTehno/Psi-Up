import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Bookmark, CheckCircle2, Heart } from 'lucide-react'

import { useUserProgressActions } from '../../../hooks/useUserProgressActions'
import type { UserProgressContentType } from '../../../services/user-progress-service'

type DetailAction = 'favorite' | 'save' | 'completed' | null
type DetailActionsPlacement = 'overlay' | 'inline'

type DetailActionsProps = {
	contentId?: string
	contentType?: UserProgressContentType
	completedLabel?: string
	uncompletedLabel?: string
	initialIsFavorite?: boolean
	initialIsSaved?: boolean
	initialIsCompleted?: boolean
	onFavoriteClick?: () => void
	onSaveClick?: () => void
	onCompletedChange?: (isCompleted: boolean) => void
	placement?: DetailActionsPlacement
	className?: string
}

function DetailActions({
	contentId,
	contentType,
	completedLabel = 'Dokončano',
	uncompletedLabel = 'Označi kot dokončano',
	initialIsFavorite = false,
	initialIsSaved = false,
	initialIsCompleted = false,
	onFavoriteClick,
	onSaveClick,
	onCompletedChange,
	placement = 'overlay',
	className = '',
}: DetailActionsProps) {
	const navigate = useNavigate()
	const [activeAction, setActiveAction] = useState<DetailAction>(null)

	const {
		isFavorite,
		isSaved,
		isCompleted,
		isLoading,
		errorMessage,
		clearError,
		toggleAction,
	} = useUserProgressActions({
		contentId,
		contentType,
		initialIsFavorite,
		initialIsSaved,
		initialIsCompleted,
	})

	async function handleAction(action: Exclude<DetailAction, null>) {
		setActiveAction(action)

		const nextState = await toggleAction(action)

		if (action === 'favorite') {
			onFavoriteClick?.()
		}

		if (action === 'save') {
			onSaveClick?.()
		}

		if (action === 'completed' && nextState) {
			onCompletedChange?.(nextState.isCompleted)
		}

		window.setTimeout(() => {
			setActiveAction(null)
		}, 450)
	}

	const containerClassName =
		placement === 'overlay'
			? 'mt-5 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:mt-0 lg:overflow-visible lg:pb-0'
			: 'flex flex-nowrap items-center gap-2 overflow-x-auto pb-1'

	return (
		<>
			<div className="space-y-2">
				<div className={[containerClassName, className].join(' ')}>
					<button
						type="button"
						onClick={() => handleAction('favorite')}
						disabled={isLoading}
						className={[
							'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60',
							isFavorite || activeAction === 'favorite'
								? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
								: 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:text-[#31583b]',
						].join(' ')}
						aria-pressed={isFavorite}
						aria-label={
							isFavorite
								? 'Odstrani iz priljubljenih'
								: 'Dodaj med priljubljene'
						}
						title="Priljubljeno"
					>
						<Heart
							className={[
								'h-5 w-5',
								isFavorite ? 'fill-current' : '',
							].join(' ')}
						/>
					</button>

					<button
						type="button"
						onClick={() => handleAction('save')}
						disabled={isLoading}
						className={[
							'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60',
							isSaved || activeAction === 'save'
								? 'border-[#d07a12] bg-[#d07a12] text-[#fffdf8]'
								: 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#d07a12]/45 hover:bg-[#fff6eb] hover:text-[#d07a12]',
						].join(' ')}
						aria-pressed={isSaved}
						aria-label={isSaved ? 'Odstrani shranjeno' : 'Shrani za pozneje'}
						title="Shrani"
					>
						<Bookmark
							className={['h-5 w-5', isSaved ? 'fill-current' : ''].join(
								' ',
							)}
						/>
					</button>

					<button
						type="button"
						onClick={() => handleAction('completed')}
						disabled={isLoading}
						className={[
							'group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full border px-5 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(49,88,59,0.14)] disabled:cursor-not-allowed disabled:opacity-60',
							isCompleted
								? 'border-[#b7d7bd] bg-[#f2f8f1] text-[#31583b] shadow-[0_10px_24px_rgba(49,88,59,0.08)]'
								: activeAction === 'completed'
									? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
									: 'border-[#31583b]/75 bg-[#3f6b49] text-[#fffdf8] hover:border-[#31583b] hover:bg-[#31583b]',
						].join(' ')}
						aria-pressed={isCompleted}
					>
						<CheckCircle2
							className={[
								'h-5 w-5 shrink-0 transition duration-300',
								isCompleted
									? 'text-[#31583b]'
									: 'text-[#fffdf8] group-hover:scale-110',
							].join(' ')}
						/>

						<span>{isCompleted ? completedLabel : uncompletedLabel}</span>
					</button>
				</div>
			</div>

			{errorMessage === 'AUTH_REQUIRED' && (
				<div className="fixed inset-0 z-[90] flex items-center justify-center px-5">
					<button
						type="button"
						className="absolute inset-0 cursor-default bg-[#fffdf8]/25 backdrop-blur-[10px] backdrop-saturate-150"
						onClick={clearError}
						aria-label="Zapri prijavno okno"
					/>

					<div className="relative z-10 w-full max-w-sm rounded-[28px] border border-[#eadfce]/80 bg-[#fffdf8]/75 p-6 text-center shadow-[0_24px_70px_rgba(57,47,35,0.16)] backdrop-blur-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#706b60]">
							Prijava je potrebna
						</p>

						<h3 className="mt-4 font-serif text-2xl leading-tight text-[#2f4a31]">
							Za to dejanje se moraš prijaviti.
						</h3>

						<p className="mt-3 text-sm leading-6 text-[#706b60]">
							Po prijavi lahko shranjuješ, všečkaš in označuješ vsebine kot
							dokončane.
						</p>

						<div className="mt-6 flex justify-center gap-3">
							<button
								type="button"
								onClick={() => navigate('/login')}
								className="inline-flex items-center justify-center rounded-full border border-[#31583b] bg-[#31583b] px-5 py-2.5 text-sm font-bold text-[#fffdf8] shadow-[0_12px_28px_rgba(49,88,59,0.22)] transition hover:bg-[#2a4d33]"
							>
								Prijavi se
							</button>

							<button
								type="button"
								onClick={clearError}
								className="inline-flex items-center justify-center rounded-full border border-[#ded5c6] bg-[#fffdf8]/70 px-5 py-2.5 text-sm font-bold text-[#706b60] transition hover:bg-[#f4eee4]"
							>
								Zapri
							</button>
						</div>
					</div>
				</div>
			)}

			{errorMessage && errorMessage !== 'AUTH_REQUIRED' && (
				<p className="rounded-full bg-[#fff6eb] px-3 py-2 text-xs font-semibold text-[#706b60]">
					{errorMessage}
				</p>
			)}
		</>
	)
}

export default DetailActions