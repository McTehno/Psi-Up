import { apiGet } from './api-client'

export type LearningPath = {
  id: string
  title: string
  description?: string
}

export type LearningPathDetail = {
  id: string
  title: string
  description?: string
  modules?: unknown[]
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  return apiGet<LearningPath[]>('/learning-paths')
}

export async function getLearningPathById(
  learningPathId: string
): Promise<LearningPath> {
  return apiGet<LearningPath>(`/learning-paths/${learningPathId}`)
}

export async function getLearningPathDetail(
  learningPathId: string
): Promise<LearningPathDetail> {
  return apiGet<LearningPathDetail>(
    `/learning-paths/${learningPathId}/detail`
  )
}

export async function getLearningPathModules(
  learningPathId: string
): Promise<unknown[]> {
  return apiGet<unknown[]>(`/learning-paths/${learningPathId}/modules`)
}

export async function getLearningPathQuestionnaire(
  learningPathId: string
): Promise<unknown> {
  return apiGet<unknown>(
    `/learning-paths/${learningPathId}/questionnaire`
  )
}