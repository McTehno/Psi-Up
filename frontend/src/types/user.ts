export type UserResponse = {
  id: string
  auth_provider?: string | null
  auth_user_id: string
  name?: string | null
  email?: string | null
  created_at: string
  updated_at?: string | null
}

export type UserCreateRequest = {
  auth_provider?: string | null
  auth_user_id: string
  name?: string | null
  email?: string | null
}

export type UserUpdateRequest = {
  name?: string | null
  email?: string | null
}