import { useState } from 'react'

import { useAuth } from '../features/auth/contexts/AuthContext'
import {
	isContentCompleted,
	isContentFavorite,
	isContentSaved,
	updateUserProgress,
	type UserProgressContentType,
} from '../services/user-progress-service'

type UserProgressActionState = {
	isFavorite: boolean
	isSaved: boolean
	isCompleted: boolean
}

type UseUserProgressActionsParams = {
	contentId?: string
	contentType?: UserProgressContentType
	initialIsFavorite?: boolean
	initialIsSaved?: boolean
	initialIsCompleted?: boolean
}

type ToggleUserProgressAction = 'favorite' | 'save' | 'completed'

export function useUserProgressActions({
	contentId,
	contentType,
	initialIsFavorite = false,
	initialIsSaved = false,
	initialIsCompleted = false,
}: UseUserProgressActionsParams) {
	const { session } = useAuth()

	const [state, setState] = useState<UserProgressActionState>({
		isFavorite: initialIsFavorite,
		isSaved: initialIsSaved,
		isCompleted: initialIsCompleted,
	})

	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	function clearError() {
		setErrorMessage(null)
	}

	async function toggleAction(action: ToggleUserProgressAction) {
		setErrorMessage(null)

		if (!contentId || !contentType) {
			setState((currentState) => {
				if (action === 'favorite') {
					return {
						...currentState,
						isFavorite: !currentState.isFavorite,
					}
				}

				if (action === 'save') {
					return {
						...currentState,
						isSaved: !currentState.isSaved,
					}
				}

				return {
					...currentState,
					isCompleted: !currentState.isCompleted,
				}
			})

			return null
		}

		if (!session?.access_token) {
			setErrorMessage('AUTH_REQUIRED')
			console.error('Uporabnik ni prijavljen.')
			return null
		}

		const isActive =
			action === 'favorite'
				? state.isFavorite
				: action === 'save'
					? state.isSaved
					: state.isCompleted

		try {
			setIsLoading(true)

			const progress = await updateUserProgress({
				action: action === 'completed' ? 'complete' : action,
				isActive,
				contentId,
				contentType,
				accessToken: session.access_token,
			})

			const nextState = {
				isFavorite: isContentFavorite(progress, contentId, contentType),
				isSaved: isContentSaved(progress, contentId, contentType),
				isCompleted: isContentCompleted(progress, contentId, contentType),
			}

			setState(nextState)

			return nextState
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Napaka pri posodobitvi napredka.'

			setErrorMessage(message)
			console.error('Napaka pri posodobitvi napredka:', error)

			return null
		} finally {
			setIsLoading(false)
		}
	}

	return {
		isFavorite: state.isFavorite,
		isSaved: state.isSaved,
		isCompleted: state.isCompleted,
		isLoading,
		errorMessage,
		clearError,
		toggleAction,
	}
}