export type DigCompCompetencyResponse = {
  code: string
  title: string
  description: string
}

export type SelfAssessmentQuestionResponse = {
  _id: string
  question: string
  type: string
  related_topic?: string | null
}

export type LearningUnitResponse = {
  _id: string
  title: string
  short_description: string
  duration_hours?: number | null
  keywords: string[]

  content_topics: string[]
  acquired_competencies: string[]
  digcomp_competencies: DigCompCompetencyResponse[]

  delivery_mode?: string | null
  provider?: string | null
  target_audience?: string | null
  prerequisites: string[]
  knowledge_assessment?: string | null
  certificate?: string | null

  self_assessment_questions: SelfAssessmentQuestionResponse[]
}

export type LearningUnitReferenceResponse = {
  learning_unit_id: string
  order?: number | null
  parallel_group?: string | null
  is_required: boolean
  prerequisites: string[]
}