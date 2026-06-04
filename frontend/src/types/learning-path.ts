import type { ModuleDetailResponse } from './module'
import type { LearningUnitResponse } from './learning-unit'

export type LearningPathStepType = 'module' | 'learning_unit' | 'unit'

export type LearningPathStepResponse = {
  type?: LearningPathStepType | (string & {}) | null
  step_type?: LearningPathStepType | (string & {}) | null

  ref_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null

  order?: number | null
  parallel_group?: string | null
  is_required?: boolean | null
  prerequisites?: string[] | null
}

export type LearningPathStepReference = LearningPathStepResponse

export type LearningPathModuleReference = {
  module_id?: string | null
  ref_id?: string | null
  order?: number | null
  is_required?: boolean | null
  parallel_group?: string | null
  prerequisites?: string[] | null
}

export type LearningPathResponse = {
  id?: string
  _id?: string

  title: string
  short_description: string

  duration_hours?: number | null
  duration_min?: number | null

  keywords: string[]

  /**
   * Novi oziroma bolj generičen način prikaza poti.
   * Tukaj so lahko moduli ali učne enote.
   */
  steps?: LearningPathStepResponse[]

  /**
   * Backward compatibility.
   * ÄŚe katera druga stran še vedno uporablja modules, je ne zlomimo.
   */
  modules?: LearningPathModuleReference[]
}

export type LearningPathDetailResponse = LearningPathResponse & {
  module_details?: ModuleDetailResponse[]
  learning_unit_details?: LearningUnitResponse[]
}

