import { useState } from 'react'
import AuthRequiredDialog from '../../common/AuthRequiredDialog'
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
			? 'mt-5 flex flex-nowrap items-center justify-start gap-2 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:mt-0 lg:justify-end'
			: 'flex flex-nowrap items-center justify-start gap-2'

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
							'group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 text-xs font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm',
							isCompleted || activeAction === 'completed'
								? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
								: 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:text-[#31583b]',
						].join(' ')}
						aria-pressed={isCompleted}
					>
						<CheckCircle2
							className={[
								'h-5 w-5 shrink-0 transition duration-300 group-hover:scale-110',
								isCompleted || activeAction === 'completed'
									? 'text-[#fffdf8]'
									: 'text-[#31583b]',
							].join(' ')}
						/>

						<span className="hidden sm:inline">
							{isCompleted ? completedLabel : uncompletedLabel}
						</span>
						<span className="sm:hidden">
							{isCompleted ? 'Končano' : 'Dokončaj'}
						</span>
					</button>
				</div>
			</div>

			<AuthRequiredDialog
			isOpen={errorMessage === 'AUTH_REQUIRED'}
			onClose={clearError}
			/>

			{errorMessage && errorMessage !== 'AUTH_REQUIRED' && (
				<p className="rounded-full bg-[#fff6eb] px-3 py-2 text-xs font-semibold text-[#706b60]">
					{errorMessage}
				</p>
			)}
		</>
	)
}

export default DetailActions