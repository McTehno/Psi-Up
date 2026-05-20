import { apiGet, apiPost, apiPut } from './api-client'
import type {
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from '../types/user'

export async function createUserProfile(
  request: UserCreateRequest
): Promise<UserResponse> {
  return apiPost<UserResponse, UserCreateRequest>(
    '/users/profile',
    request
  )
}

export async function getUserByAuthId(
  authUserId: string
): Promise<UserResponse> {
  return apiGet<UserResponse>(`/users/by-auth/${authUserId}`)
}

export async function getUserById(userId: string): Promise<UserResponse> {
  return apiGet<UserResponse>(`/users/${userId}`)
}

export async function updateUser(
  userId: string,
  request: UserUpdateRequest
): Promise<UserResponse> {
  return apiPut<UserResponse, UserUpdateRequest>(
    `/users/${userId}`,
    request
  )
}