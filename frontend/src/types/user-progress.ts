export type ContentType = 'learning_path' | 'module' | 'learning_unit'

export type CurrentPositionResponse = {
  learning_path_id?: string | null
  current_module_id?: string | null
  current_learning_unit_id?: string | null
}

export type UserProgressResponse = {
  id: string
  user_id: string

  saved_learning_paths: string[]
  saved_modules: string[]
  saved_learning_units: string[]

  favorite_learning_paths: string[]
  favorite_modules: string[]
  favorite_learning_units: string[]

  completed_learning_paths: string[]
  completed_modules: string[]
  completed_learning_units: string[]

  current_positions: CurrentPositionResponse[]
}

export type UserProgressCreateRequest = {
  user_id: string
}

export type SaveContentRequest = {
  user_id: string
  content_id: string
  content_type: ContentType
}

export type FavoriteContentRequest = {
  user_id: string
  content_id: string
  content_type: ContentType
}

export type CompleteContentRequest = {
  user_id: string
  content_id: string
  content_type: ContentType
}

export type UpdateCurrentPositionRequest = {
  user_id: string
  learning_path_id?: string | null
  current_module_id?: string | null
  current_learning_unit_id?: string | null
}