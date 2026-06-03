import type { ModuleDetailResponse } from './module'
import type { LearningUnitResponse } from './learning-unit'

export type LearningPathStepType = 'module' | 'learning_unit'

export type LearningPathStepResponse = {
  type?: LearningPathStepType | string | null
  step_type?: LearningPathStepType | string | null
  ref_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null
  order?: number | null
  parallel_group?: string | null
  is_required?: boolean | null
  prerequisites?: string[] | null
}

export type LearningPathStepReference = LearningPathStepResponse

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
  learning_unit_details?: LearningUnitResponse[]
}