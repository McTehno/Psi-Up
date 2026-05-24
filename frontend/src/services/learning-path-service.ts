import { apiGet } from './api-client'
import type {
  LearningPathDetailResponse,
  LearningPathResponse,
} from '../types/learning-path'
import type { ModuleResponse } from '../types/module'
import type { QuestionnaireResponse } from '../types/questionnaire'

export async function getLearningPaths(): Promise<LearningPathResponse[]> {
  return apiGet<LearningPathResponse[]>('/learning-paths')
}

export async function getLearningPathById(
  learningPathId: string
): Promise<LearningPathResponse> {
  return apiGet<LearningPathResponse>(`/learning-paths/${learningPathId}`)
}

export async function getLearningPathDetail(
  learningPathId: string,
): Promise<LearningPathDetailResponse> {
  return apiGet(`/learning-paths/${learningPathId}/detail`)
}

export async function getLearningPathModules(
  learningPathId: string
): Promise<ModuleResponse[]> {
  return apiGet<ModuleResponse[]>(
    `/learning-paths/${learningPathId}/modules`
  )
}

export async function getLearningPathAvailableModules(
  learningPathId: string
): Promise<ModuleResponse[]> {
  return apiGet<ModuleResponse[]>(
    `/learning-paths/${learningPathId}/available-modules`
  )
}

export async function getLearningPathQuestionnaire(
  learningPathId: string
): Promise<QuestionnaireResponse> {
  return apiGet<QuestionnaireResponse>(
    `/learning-paths/${learningPathId}/questionnaire`
  )
}