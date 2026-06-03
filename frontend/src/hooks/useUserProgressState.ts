import { useEffect, useState } from 'react'

import { useAuth } from '../features/auth/contexts/AuthContext'
import {
	getUserProgress,
	isContentCompleted,
	isContentFavorite,
	isContentSaved,
	type UserProgressContentType,
} from '../services/user-progress-service'
import type { UserProgressResponse } from '../types/user-progress'

type UseUserProgressStateParams = {
	contentId?: string
	contentType?: UserProgressContentType
}

export function useUserProgressState({
	contentId,
	contentType,
}: UseUserProgressStateParams) {
	const { session, localUser } = useAuth()

	const [isFavorite, setIsFavorite] = useState(false)
	const [isSaved, setIsSaved] = useState(false)
	const [isCompleted, setIsCompleted] = useState(false)
	const [isLoadingProgress, setIsLoadingProgress] = useState(false)
	const [userProgress, setUserProgress] =
		useState<UserProgressResponse | null>(null)

	useEffect(() => {
		async function loadProgress() {
			if (!contentId || !contentType || !session?.access_token || !localUser?._id) {
				setIsFavorite(false)
				setIsSaved(false)
				setIsCompleted(false)
				setUserProgress(null)
				return
			}

			try {
				setIsLoadingProgress(true)

				const progress = await getUserProgress(localUser._id, session.access_token)

				setUserProgress(progress)
				setIsFavorite(isContentFavorite(progress, contentId, contentType))
				setIsSaved(isContentSaved(progress, contentId, contentType))
				setIsCompleted(isContentCompleted(progress, contentId, contentType))
			} catch (error) {
				console.error('Napaka pri nalaganju uporabniškega napredka:', error)
				setIsFavorite(false)
				setIsSaved(false)
				setIsCompleted(false)
				setUserProgress(null)
			} finally {
				setIsLoadingProgress(false)
			}
		}

		loadProgress()
	}, [contentId, contentType, session?.access_token, localUser?._id])

	return {
		isFavorite,
		isSaved,
		isCompleted,
		isLoadingProgress,
		userProgress,
	}
}