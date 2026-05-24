import type { ModuleReferenceResponse, ModuleResponse } from './module'

export type LearningPathResponse = {
  id: string
  title: string
  short_description: string
  duration_min?: number | null
  duration_hours?: number | null
  keywords: string[]
  modules: ModuleReferenceResponse[]
}

export type LearningPathDetailResponse = LearningPathResponse & {
  module_details?: ModuleResponse[]
}