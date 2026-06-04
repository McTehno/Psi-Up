import type { QuestionnaireTargetType } from './questionnaire'

export type AssessmentStatus =
	| 'completed'
	| 'partially_completed'
	| 'not_started'

export type LearningUnitAssessmentResult = {
	learning_unit_id: string

	known_topic_ids: string[]
	missing_topic_ids: string[]

	known_competency_codes: string[]
	missing_competency_codes: string[]

	is_completed_by_assessment: boolean
}

export type ModuleAssessmentResult = {
	module_id: string
	status: AssessmentStatus
	completed_learning_units: string[]
	missing_learning_units: string[]
}

export type AssessmentCurrentPositionResponse = {
	learning_path_id?: string | null
	current_module_id?: string | null
	current_learning_unit_id?: string | null
}

export type AssessmentResultResponse = {
	user_id: string
	target_type: QuestionnaireTargetType
	target_id: string

	start_module_id?: string | null
	start_learning_unit_id?: string | null

	skipped_modules: string[]
	skipped_learning_units: string[]

	recommended_next_modules: string[]
	recommended_next_learning_units: string[]

	known_competency_codes: string[]
	missing_competency_codes: string[]

	learning_unit_results: LearningUnitAssessmentResult[]
	module_results: ModuleAssessmentResult[]

	completed_learning_unit_ids: string[]
	completed_module_ids: string[]
	completed_learning_path_ids: string[]

	current_position?: AssessmentCurrentPositionResponse | null

	summary?: string | null
}

