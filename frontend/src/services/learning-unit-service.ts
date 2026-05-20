import { apiGet } from './api-client'

export type LearningUnit = {
  id: string
  title: string
  description?: string
}

export type LearningUnitDetail = {
  id: string
  title: string
  description?: string
  content?: unknown
}

export async function getLearningUnits(): Promise<LearningUnit[]> {
  return apiGet<LearningUnit[]>('/learning-units')
}

export async function getLearningUnitById(
  learningUnitId: string
): Promise<LearningUnit> {
  return apiGet<LearningUnit>(`/learning-units/${learningUnitId}`)
}

export async function getLearningUnitDetail(
  learningUnitId: string
): Promise<LearningUnitDetail> {
  return apiGet<LearningUnitDetail>(
    `/learning-units/${learningUnitId}/detail`
  )
}

export async function getLearningUnitQuestionnaire(
  learningUnitId: string
): Promise<unknown> {
  return apiGet<unknown>(
    `/learning-units/${learningUnitId}/questionnaire`
  )
}