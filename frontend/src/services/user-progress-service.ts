import type { UserProgressResponse } from '../types/user-progress'

export type UserProgressContentType =
	| 'learning_path'
	| 'module'
	| 'learning_unit'

export type UserProgressAction = 'save' | 'favorite' | 'complete'

export type UserProgressRequest = {
	content_id: string
	content_type: UserProgressContentType
}

type UpdateUserProgressParams = {
	action: UserProgressAction
	isActive: boolean
	contentId: string
	contentType: UserProgressContentType
	accessToken: string
}

function getApiBaseUrl() {
	return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

function getAuthHeaders(accessToken: string) {
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${accessToken}`,
	}
}

async function readProgressResponse(
	response: Response,
): Promise<UserProgressResponse> {
	const data = await response.json()

	if (!response.ok) {
		throw new Error(
			data?.error?.message || 'Napaka pri posodobitvi uporabniškega napredka.',
		)
	}

	return data
}

export async function getUserProgress(
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})

	return readProgressResponse(response)
}

export async function updateUserProgress({
	action,
	isActive,
	contentId,
	contentType,
	accessToken,
}: UpdateUserProgressParams): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/${action}`, {
		method: isActive ? 'DELETE' : 'POST',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify({
			content_id: contentId,
			content_type: contentType,
		}),
	})

	return readProgressResponse(response)
}

export async function saveContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/save`, {
		method: 'POST',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export async function unsaveContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/save`, {
		method: 'DELETE',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export async function favoriteContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/favorite`, {
		method: 'POST',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export async function unfavoriteContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/favorite`, {
		method: 'DELETE',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export async function completeContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/complete`, {
		method: 'POST',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export async function uncompleteContent(
	request: UserProgressRequest,
	accessToken: string,
): Promise<UserProgressResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/user-progress/complete`, {
		method: 'DELETE',
		headers: getAuthHeaders(accessToken),
		body: JSON.stringify(request),
	})

	return readProgressResponse(response)
}

export function isContentSaved(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.saved_learning_paths.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.saved_modules.includes(contentId)
	}

	return progress.saved_learning_units.includes(contentId)
}

export function isContentFavorite(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.favorite_learning_paths.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.favorite_modules.includes(contentId)
	}

	return progress.favorite_learning_units.includes(contentId)
}

export function isContentCompleted(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.completed_learning_paths.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.completed_modules.includes(contentId)
	}

	return progress.completed_learning_units.includes(contentId)
}