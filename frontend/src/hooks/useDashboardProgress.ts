import { useEffect, useState } from 'react'

import { useAuth } from '../features/auth/hooks/useAuth'
import { getUserProgress } from '../services/user-progress-service'
import type { UserProgressResponse } from '../types/user-progress'

export function useDashboardProgress() {
	const { session, localUser } = useAuth()

	const [progress, setProgress] = useState<UserProgressResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadProgress() {
			if (!session?.access_token || !localUser?._id) {
				setProgress(null)
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				setError(null)

				const data = await getUserProgress(localUser._id, session.access_token)
				setProgress(data)
			} catch (err) {
				console.error('Napaka pri nalaganju uporabniĹˇkega napredka:', err)
				setError(
					err instanceof Error
						? err.message
						: 'Napaka pri nalaganju podatkov.'
				)
				setProgress(null)
			} finally {
				setIsLoading(false)
			}
		}

		loadProgress()
	}, [session?.access_token, localUser?._id])

	return {
		progress,
		isLoading,
		error,
	}
}


