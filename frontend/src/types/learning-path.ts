import type { ModuleResponse } from './module'
import type { LearningUnitResponse } from './learning-unit'

export type LearningPathStepType = 'module' | 'learning_unit'

/**
 * En korak znotraj učne poti.
 *
 * Korak je lahko modul ali samostojna učna enota.
 */
export type LearningPathStepReference = {
	type: LearningPathStepType
	ref_id: string
	order: number
	parallel_group?: string | null
	is_required: boolean
	prerequisites: string[]
}

/**
 * Osnovni response za učno pot.
 *
 * Backend uporablja steps, kjer je vsak korak lahko modul
 * ali samostojna učna enota.
 */
export type LearningPathResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]
	steps: LearningPathStepReference[]
}

/**
 * Razširjen response za detail stran učne poti.
 *
 * Trenutno backend detail endpoint lahko vrne tudi dodatne podatke
 * o modulih in učnih enotah, če jih service sestavi.
 */
export type LearningPathDetailResponse = LearningPathResponse & {
	module_details?: ModuleResponse[]
	learning_unit_details?: LearningUnitResponse[]
}