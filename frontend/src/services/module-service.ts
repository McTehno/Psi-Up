import { apiGet } from './api-client'
import type { ModuleDetailResponse, ModuleResponse } from '../types/module'
import type { LearningUnitResponse } from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'

/**
 * Vrne vse module.
 */
export async function getModules(): Promise<ModuleResponse[]> {
	return apiGet<ModuleResponse[]>('/modules')
}

/**
 * Vrne osnovne podatke enega modula.
 */
export async function getModuleById(
	moduleId: string,
): Promise<ModuleResponse> {
	return apiGet<ModuleResponse>(`/modules/${moduleId}`)
}

/**
 * Vrne detail podatke modula.
 *
 * Detail endpoint poleg osnovnih podatkov vrne tudi učne enote
 * in učne poti, ki vsebujejo izbrani modul.
 */
export async function getModuleDetail(
	moduleId: string,
): Promise<ModuleDetailResponse> {
	return apiGet<ModuleDetailResponse>(`/modules/${moduleId}/detail`)
}

/**
 * Vrne učne enote izbranega modula.
 */
export async function getModuleLearningUnits(
	moduleId: string,
): Promise<LearningUnitResponse[]> {
	return apiGet<LearningUnitResponse[]>(
		`/modules/${moduleId}/learning-units`,
	)
}

/**
 * Vrne učne enote, ki so na voljo za dodajanje v izbrani modul.
 */
export async function getModuleAvailableLearningUnits(
	moduleId: string,
): Promise<LearningUnitResponse[]> {
	return apiGet<LearningUnitResponse[]>(
		`/modules/${moduleId}/available-learning-units`,
	)
}

/**
 * Vrne vprašalnik za izbrani modul.
 */
export async function getModuleQuestionnaire(
	moduleId: string,
): Promise<QuestionnaireResponse> {
	return apiGet<QuestionnaireResponse>(
		`/modules/${moduleId}/questionnaire`,
	)
}