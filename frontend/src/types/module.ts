import type {
	LearningUnitReferenceResponse,
	LearningUnitResponse,
} from './learning-unit'

/**
 * Kratek prikaz učne poti, ki vsebuje izbrani modul.
 *
 * Uporablja se na detail strani modula v sekciji
 * povezanih učnih poti.
 */
export type RecommendedLearningPathResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]
}

/**
 * Osnovni response za modul.
 *
 * Uporablja se pri seznamih, osnovnem prikazu in kot osnova
 * za razširjene detail response tipe.
 */
export type ModuleResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]
	domains: string[]
	learning_units: LearningUnitReferenceResponse[]
	learning_unit_details?: LearningUnitResponse[]
}

/**
 * Razširjen response za detail stran modula.
 *
 * Backend pri /modules/:id/detail doda tudi učne poti,
 * ki vsebujejo izbrani modul.
 */
export type ModuleDetailResponse = ModuleResponse & {
	recommended_learning_paths: RecommendedLearningPathResponse[]
}

/**
 * Referenca modula znotraj učne poti.
 *
 * Uporablja se pri prikazu zaporedja modulov v učni poti.
 */
export type ModuleReferenceResponse = {
	module_id: string
	order?: number | null
	parallel_group?: string | null
	is_required: boolean
	prerequisites: string[]
}