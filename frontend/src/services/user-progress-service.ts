import { apiGet, apiPost, apiPut, apiDeleteWithBody } from './api-client'
import type {
  CompleteContentRequest,
  FavoriteContentRequest,
  SaveContentRequest,
  UpdateCurrentPositionRequest,
  UserProgressCreateRequest,
  UserProgressResponse,
} from '../types/user-progress'

export async function getUserProgress(
  userId: string
): Promise<UserProgressResponse> {
  return apiGet<UserProgressResponse>(`/user-progress/${userId}`)
}

export async function ensureUserProgress(
  request: UserProgressCreateRequest
): Promise<UserProgressResponse> {
  return apiPost<UserProgressResponse, UserProgressCreateRequest>(
    `/user-progress/${request.user_id}/ensure`,
    request
  )
}

export async function saveContent(
  request: SaveContentRequest
): Promise<UserProgressResponse> {
  return apiPost<UserProgressResponse, SaveContentRequest>(
    '/user-progress/save',
    request
  )
}

export async function unsaveContent(
  request: SaveContentRequest
): Promise<UserProgressResponse> {
  return apiDeleteWithBody<UserProgressResponse, SaveContentRequest>(
    '/user-progress/save',
    request
  )
}

export async function favoriteContent(
  request: FavoriteContentRequest
): Promise<UserProgressResponse> {
  return apiPost<UserProgressResponse, FavoriteContentRequest>(
    '/user-progress/favorite',
    request
  )
}

export async function unfavoriteContent(
  request: FavoriteContentRequest
): Promise<UserProgressResponse> {
  return apiDeleteWithBody<UserProgressResponse, FavoriteContentRequest>(
    '/user-progress/favorite',
    request
  )
}

export async function completeContent(
  request: CompleteContentRequest
): Promise<UserProgressResponse> {
  return apiPost<UserProgressResponse, CompleteContentRequest>(
    '/user-progress/complete',
    request
  )
}

export async function uncompleteContent(
  request: CompleteContentRequest
): Promise<UserProgressResponse> {
  return apiDeleteWithBody<UserProgressResponse, CompleteContentRequest>(
    '/user-progress/complete',
    request
  )
}

export async function updateCurrentPosition(
  request: UpdateCurrentPositionRequest
): Promise<UserProgressResponse> {
  return apiPut<UserProgressResponse, UpdateCurrentPositionRequest>(
    '/user-progress/current-position',
    request
  )
}


