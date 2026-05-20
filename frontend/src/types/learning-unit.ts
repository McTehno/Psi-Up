export type SelfAssessmentQuestionResponse = {
  id: string
  question: string
  type: string
  related_skill?: string | null
}

export type LearningUnitResponse = {
  id: string
  title: string
  short_description: string
  duration_min?: number | null
  keywords: string[]
  skills: string[]
  self_assessment_questions: SelfAssessmentQuestionResponse[]
}

export type LearningUnitReferenceResponse = {
  learning_unit_id: string
  order?: number | null
  parallel_group?: string | null
  is_required: boolean
  prerequisites: string[]
}