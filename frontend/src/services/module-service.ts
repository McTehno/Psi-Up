import { apiGet } from './api-client'
import type { ModuleResponse } from '../types/module'
import type { LearningUnitResponse } from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'

export async function getModules(): Promise<ModuleResponse[]> {
  return apiGet<ModuleResponse[]>('/modules')
}

export async function getModuleById(
  moduleId: string
): Promise<ModuleResponse> {
  return apiGet<ModuleResponse>(`/modules/${moduleId}`)
}

export async function getModuleDetail(
  moduleId: string
): Promise<ModuleResponse> {
  return apiGet<ModuleResponse>(`/modules/${moduleId}/detail`)
}

export async function getModuleLearningUnits(
  moduleId: string
): Promise<LearningUnitResponse[]> {
  return apiGet<LearningUnitResponse[]>(
    `/modules/${moduleId}/learning-units`
  )
}

export async function getModuleAvailableLearningUnits(
  moduleId: string
): Promise<LearningUnitResponse[]> {
  return apiGet<LearningUnitResponse[]>(
    `/modules/${moduleId}/available-learning-units`
  )
}

export async function getModuleQuestionnaire(
  moduleId: string
): Promise<QuestionnaireResponse> {
  return apiGet<QuestionnaireResponse>(
    `/modules/${moduleId}/questionnaire`
  )
}