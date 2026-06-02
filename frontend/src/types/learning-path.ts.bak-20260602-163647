import type { ModuleDetailResponse, ModuleReferenceResponse } from './module'

export type LearningPathStepResponse = ModuleReferenceResponse & {
  type?: 'module' | string
  step_type?: 'module' | string
}

export type LearningPathResponse = {
  id?: string
  _id?: string
  title: string
  short_description: string
  duration_hours?: number | null
  keywords: string[]
  steps: LearningPathStepResponse[]
}

export type LearningPathDetailResponse = LearningPathResponse & {
  module_details?: ModuleDetailResponse[]
}