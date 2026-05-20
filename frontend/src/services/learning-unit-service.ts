import { apiGet } from './api-client'
import type { LearningUnitResponse } from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'

export async function getLearningUnits(): Promise<LearningUnitResponse[]> {
  return apiGet<LearningUnitResponse[]>('/learning-units')
}

export async function getLearningUnitById(
  learningUnitId: string
): Promise<LearningUnitResponse> {
  return apiGet<LearningUnitResponse>(
    `/learning-units/${learningUnitId}`
  )
}

export async function getLearningUnitDetail(
  learningUnitId: string
): Promise<LearningUnitResponse> {
  return apiGet<LearningUnitResponse>(
    `/learning-units/${learningUnitId}/detail`
  )
}

export async function getLearningUnitQuestionnaire(
  learningUnitId: string
): Promise<QuestionnaireResponse> {
  return apiGet<QuestionnaireResponse>(
    `/learning-units/${learningUnitId}/questionnaire`
  )
}