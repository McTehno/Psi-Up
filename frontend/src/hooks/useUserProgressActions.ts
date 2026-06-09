import { useEffect, useRef, useState } from 'react'

import type { UserProgressResponse } from '../types/user-progress'

import { useAuth } from '../features/auth/hooks/useAuth'
import {
	updateUserProgress,
	type UserProgressContentType,
} from '../services/user-progress-service'

type UserProgressActionState = {
	isFavorite: boolean
	isSaved: boolean
	isCompleted: boolean
}

type UserProgressActionResult = UserProgressActionState & {
	progress: UserProgressResponse
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

	const contentKey = `${contentType ?? 'unknown'}:${contentId ?? 'unknown'}`

	const lastContentKeyRef = useRef(contentKey)
	const hasUserChangedStateRef = useRef(false)

	const [state, setState] = useState<UserProgressActionState>({
		isFavorite: initialIsFavorite,
		isSaved: initialIsSaved,
		isCompleted: initialIsCompleted,
	})

	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		const hasContentChanged = lastContentKeyRef.current !== contentKey

		if (hasContentChanged) {
			lastContentKeyRef.current = contentKey
			hasUserChangedStateRef.current = false
		}

		if (!hasUserChangedStateRef.current) {
			setState({
				isFavorite: initialIsFavorite,
				isSaved: initialIsSaved,
				isCompleted: initialIsCompleted,
			})
		}
	}, [
		contentKey,
		initialIsFavorite,
		initialIsSaved,
		initialIsCompleted,
	])

	function clearError() {
		setErrorMessage(null)
	}

	function getActionValue(
		currentState: UserProgressActionState,
		action: ToggleUserProgressAction,
	) {
		if (action === 'favorite') {
			return currentState.isFavorite
		}

		if (action === 'save') {
			return currentState.isSaved
		}

		return currentState.isCompleted
	}

	function applyActionToState(
		currentState: UserProgressActionState,
		action: ToggleUserProgressAction,
		nextValue: boolean,
	): UserProgressActionState {
		if (action === 'favorite') {
			return {
				...currentState,
				isFavorite: nextValue,
			}
		}

		if (action === 'save') {
			return {
				...currentState,
				isSaved: nextValue,
			}
		}

		return {
			...currentState,
			isCompleted: nextValue,
		}
	}

	async function toggleAction(action: ToggleUserProgressAction) {
		setErrorMessage(null)

		if (isLoading) {
			return null
		}

		const isActive = getActionValue(state, action)
		const nextValue = !isActive

		if (!contentId || !contentType) {
			hasUserChangedStateRef.current = true

			const nextState = applyActionToState(state, action, nextValue)
			setState(nextState)

			return null
		}

		if (!session?.access_token) {
			setErrorMessage('AUTH_REQUIRED')
			console.error('Uporabnik ni prijavljen.')
			return null
		}

		try {
			setIsLoading(true)

			const progress = await updateUserProgress({
				action: action === 'completed' ? 'complete' : action,
				isActive,
				contentId,
				contentType,
				accessToken: session.access_token,
			})

			hasUserChangedStateRef.current = true

			const nextState = applyActionToState(state, action, nextValue)

			setState(nextState)

			const result: UserProgressActionResult = {
				...nextState,
				progress,
			}

			return result
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