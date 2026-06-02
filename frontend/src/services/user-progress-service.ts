import type {
	ContentType,
	SaveQuestionnaireAnswersRequest,
	UpdateCurrentPositionRequest,
	UserProgressResponse,
} from '../types/user-progress'
import {
	apiDeleteWithBody,
	apiGet,
	apiPost,
	apiPut,
} from './api-client'

export type UserProgressContentType = ContentType

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

	/**
	 * Compatibility parameter.
	 *
	 * Starejši hooki ga še lahko pošiljajo, ampak api-client že sam
	 * prebere access token iz Supabase session.
	 */
	accessToken?: string
}

export async function getUserProgress(
	userId: string,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiGet<UserProgressResponse>(`/user-progress/${userId}`)
}

export async function ensureUserProgress(
	userId: string,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPost<UserProgressResponse, Record<string, never>>(
		`/user-progress/${userId}/ensure`,
		{},
	)
}

export async function updateUserProgress({
	action,
	isActive,
	contentId,
	contentType,
	accessToken,
}: UpdateUserProgressParams): Promise<UserProgressResponse> {
	void accessToken

	const request: UserProgressRequest = {
		content_id: contentId,
		content_type: contentType,
	}

	if (isActive) {
		return apiDeleteWithBody<UserProgressResponse, UserProgressRequest>(
			`/user-progress/${action}`,
			request,
		)
	}

	return apiPost<UserProgressResponse, UserProgressRequest>(
		`/user-progress/${action}`,
		request,
	)
}

export async function saveContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPost<UserProgressResponse, UserProgressRequest>(
		'/user-progress/save',
		request,
	)
}

export async function unsaveContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiDeleteWithBody<UserProgressResponse, UserProgressRequest>(
		'/user-progress/save',
		request,
	)
}

export async function favoriteContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPost<UserProgressResponse, UserProgressRequest>(
		'/user-progress/favorite',
		request,
	)
}

export async function unfavoriteContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiDeleteWithBody<UserProgressResponse, UserProgressRequest>(
		'/user-progress/favorite',
		request,
	)
}

export async function completeContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPost<UserProgressResponse, UserProgressRequest>(
		'/user-progress/complete',
		request,
	)
}

export async function uncompleteContent(
	request: UserProgressRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiDeleteWithBody<UserProgressResponse, UserProgressRequest>(
		'/user-progress/complete',
		request,
	)
}

export async function saveQuestionnaireAnswers(
	request: SaveQuestionnaireAnswersRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPost<UserProgressResponse, SaveQuestionnaireAnswersRequest>(
		'/user-progress/questionnaire-answers',
		request,
	)
}

export async function updateCurrentPosition(
	request: UpdateCurrentPositionRequest,
	accessToken?: string,
): Promise<UserProgressResponse> {
	void accessToken

	return apiPut<UserProgressResponse, UpdateCurrentPositionRequest>(
		'/user-progress/current-position',
		request,
	)
}

export function isContentSaved(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.saved.learning_path_ids.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.saved.module_ids.includes(contentId)
	}

	return progress.saved.learning_unit_ids.includes(contentId)
}

export function isContentFavorite(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.favorites.learning_path_ids.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.favorites.module_ids.includes(contentId)
	}

	return progress.favorites.learning_unit_ids.includes(contentId)
}

export function isContentCompleted(
	progress: UserProgressResponse,
	contentId: string,
	contentType: UserProgressContentType,
) {
	if (contentType === 'learning_path') {
		return progress.completed.learning_path_ids.includes(contentId)
	}

	if (contentType === 'module') {
		return progress.completed.module_ids.includes(contentId)
	}

	return progress.completed.learning_unit_ids.includes(contentId)
}