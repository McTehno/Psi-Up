import { useState } from 'react'
import { Bookmark, CheckCircle2, Heart } from 'lucide-react'

type DetailAction = 'favorite' | 'save' | 'completed' | null

type DetailActionsProps = {
	completedLabel?: string
	uncompletedLabel?: string
	onFavoriteClick?: () => void
	onSaveClick?: () => void
	onCompletedChange?: (isCompleted: boolean) => void
}

function DetailActions({
	completedLabel = 'Dokončano',
	uncompletedLabel = 'Označi kot dokončano',
	onFavoriteClick,
	onSaveClick,
	onCompletedChange,
}: DetailActionsProps) {
	const [activeAction, setActiveAction] = useState<DetailAction>(null)
	const [isCompleted, setIsCompleted] = useState(false)

	function handleAction(action: Exclude<DetailAction, null>) {
		setActiveAction(action)

		if (action === 'favorite') {
			onFavoriteClick?.()
		}

		if (action === 'save') {
			onSaveClick?.()
		}

		if (action === 'completed') {
			setIsCompleted((currentValue) => {
				const nextValue = !currentValue
				onCompletedChange?.(nextValue)
				return nextValue
			})
		}

		window.setTimeout(() => {
			setActiveAction(null)
		}, 450)
	}

	return (
		<div className="mt-5 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:mt-0 lg:overflow-visible lg:pb-0">
			<button
				type="button"
				onClick={() => handleAction('favorite')}
				className={[
					'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
					activeAction === 'favorite'
						? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
						: 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:text-[#31583b]',
				].join(' ')}
				aria-label="Dodaj med priljubljene"
				title="Priljubljeno"
			>
				<Heart className="h-5 w-5" />
			</button>

			<button
				type="button"
				onClick={() => handleAction('save')}
				className={[
					'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
					activeAction === 'save'
						? 'border-[#d07a12] bg-[#d07a12] text-[#fffdf8]'
						: 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#d07a12]/45 hover:bg-[#fff6eb] hover:text-[#d07a12]',
				].join(' ')}
				aria-label="Shrani za pozneje"
				title="Shrani"
			>
				<Bookmark className="h-5 w-5" />
			</button>

			<button
				type="button"
				onClick={() => handleAction('completed')}
				className={[
					'group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full border px-5 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(49,88,59,0.14)]',
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
	)
}

export default DetailActions