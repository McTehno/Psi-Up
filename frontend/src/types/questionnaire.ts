export type QuestionnaireTargetType =
  | 'learning_path'
  | 'module'
  | 'learning_unit'

export type QuestionnaireQuestionType = 'yes_no'

export type QuestionnaireQuestionResponse = {
  id: string
  question: string
  type: QuestionnaireQuestionType

  answer?: boolean | string | number | string[] | null
  is_prefilled?: boolean
  prefill_source?: 'last_answer' | 'completed_content' | null

  learning_path_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null
  topic_id?: string | null
  related_topic?: string | null
  related_topic_id?: string | null
  competency_codes?: string[]
  related_competency_codes?: string[]
}

export type QuestionnaireResponse = {
  target_type: QuestionnaireTargetType
  target_id: string
  title?: string | null
  questions: QuestionnaireQuestionResponse[]
}

export type QuestionnaireAnswerRequest = {
  question_id?: string | null
  question: string
  type: QuestionnaireQuestionType
  answer: boolean
  learning_path_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null
  topic_id?: string | null
  competency_codes: string[]
}

export type QuestionnaireSubmitRequest = {
  user_id: string
  target_type: QuestionnaireTargetType
  target_id: string
  answers: QuestionnaireAnswerRequest[]
}

export type AssessmentEvaluateRequest = QuestionnaireSubmitRequest