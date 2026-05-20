import type { QuestionnaireTargetType } from './questionnaire'

export type AssessmentStatus =
  | 'completed'
  | 'partially_completed'
  | 'not_started'

export type LearningUnitAssessmentResult = {
  learning_unit_id: string
  known_skills: string[]
  missing_skills: string[]
  is_completed_by_assessment: boolean
}

export type ModuleAssessmentResult = {
  module_id: string
  status: AssessmentStatus
  completed_learning_units: string[]
  missing_learning_units: string[]
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

  learning_unit_results: LearningUnitAssessmentResult[]
  module_results: ModuleAssessmentResult[]

  summary?: string | null
}