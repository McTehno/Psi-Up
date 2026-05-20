export type QuestionnaireTargetType =
  | 'learning_path'
  | 'module'
  | 'learning_unit'

export type QuestionnaireQuestionResponse = {
  id: string
  question: string
  type: string
  learning_unit_id?: string | null
  related_skill?: string | null
}

export type QuestionnaireResponse = {
  target_type: QuestionnaireTargetType
  target_id: string
  title?: string | null
  questions: QuestionnaireQuestionResponse[]
}

export type QuestionnaireAnswerRequest = {
  question_id: string
  learning_unit_id?: string | null
  answer: boolean
}

export type QuestionnaireSubmitRequest = {
  user_id: string
  target_type: QuestionnaireTargetType
  target_id: string
  answers: QuestionnaireAnswerRequest[]
}