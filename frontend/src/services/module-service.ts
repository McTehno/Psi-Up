import { apiGet } from './api-client'

export type LearningModule = {
  id: string
  title: string
  description?: string
}

export type ModuleDetail = {
  id: string
  title: string
  description?: string
  learning_units?: unknown[]
}

export async function getModules(): Promise<LearningModule[]> {
  return apiGet<LearningModule[]>('/modules')
}

export async function getModuleById(moduleId: string): Promise<LearningModule> {
  return apiGet<LearningModule>(`/modules/${moduleId}`)
}

export async function getModuleDetail(moduleId: string): Promise<ModuleDetail> {
  return apiGet<ModuleDetail>(`/modules/${moduleId}/detail`)
}

export async function getModuleLearningUnits(
  moduleId: string
): Promise<unknown[]> {
  return apiGet<unknown[]>(`/modules/${moduleId}/learning-units`)
}

export async function getModuleQuestionnaire(moduleId: string): Promise<unknown> {
  return apiGet<unknown>(`/modules/${moduleId}/questionnaire`)
}