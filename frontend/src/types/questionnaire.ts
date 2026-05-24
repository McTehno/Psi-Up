export type QuestionnaireTargetType =
  | 'learning_path'
  | 'module'
  | 'learning_unit'

export type QuestionnaireQuestionType = 'yes_no'

export type QuestionnaireQuestionResponse = {
  id: string
  question: string
  type: QuestionnaireQuestionType
  learning_unit_id: string
  related_topic?: string | null
}

export type QuestionnaireResponse = {
  target_type: QuestionnaireTargetType
  target_id: string
  title?: string | null
  questions: QuestionnaireQuestionResponse[]
}

export type QuestionnaireAnswerRequest = {
  learning_unit_id: string
  question_id: string
  answer: boolean
}

export type AssessmentEvaluateRequest = {
  user_id?: string
  target_type: QuestionnaireTargetType
  target_id: string
  answers: QuestionnaireAnswerRequest[]
}