import type {
  LearningUnitReferenceResponse,
  LearningUnitResponse,
} from './learning-unit'


export type ModuleDetailResponse = ModuleResponse & {
  learning_unit_details: LearningUnitResponse[]
}

export type ModuleReferenceResponse = {
  module_id: string
  order?: number | null
  parallel_group?: string | null
  is_required: boolean
  prerequisites: string[]
}

export type RecommendedLearningPathResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords?: string[]
}

export type ModuleResponse = {
	id?: string
	_id?: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]
	domains: string[]
	learning_units: LearningUnitReferenceResponse[]
	recommended_learning_paths?: RecommendedLearningPathResponse[]
}