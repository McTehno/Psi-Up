import { apiGet } from './api-client'
import type { LearningUnitReferenceResponse } from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'
import type { ModuleDetailResponse, ModuleResponse } from '../types/module'

function buildRepeatedQueryParam(
	paramName: string,
	values: string[],
): string {
	if (values.length === 0) {
		return ''
	}

	const params = new URLSearchParams()

	values.forEach((value) => {
		params.append(paramName, value)
	})

	return `?${params.toString()}`
}

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
 * Detail endpoint poleg osnovnih podatkov vrne tudi podrobnosti uÄŤnih enot
 * in uÄŤne poti, ki vsebujejo izbrani modul.
 */
export async function getModuleDetail(
  moduleId: string,
): Promise<ModuleDetailResponse> {
  return apiGet(`/modules/${moduleId}/detail`)
}

/**
 * Vrne reference uÄŤnih enot znotraj izbranega modula.
 */
export async function getModuleLearningUnits(
	moduleId: string,
): Promise<LearningUnitReferenceResponse[]> {
	return apiGet<LearningUnitReferenceResponse[]>(
		`/modules/${moduleId}/learning-units`,
	)
}

/**
 * Vrne uÄŤne enote, ki jih uporabnik lahko zaÄŤne glede na zakljuÄŤene predpogoje.
 */
export async function getModuleAvailableLearningUnits(
	moduleId: string,
	completedLearningUnitIds: string[] = [],
): Promise<LearningUnitReferenceResponse[]> {
	const query = buildRepeatedQueryParam(
		'completed_learning_unit_ids',
		completedLearningUnitIds,
	)

	return apiGet<LearningUnitReferenceResponse[]>(
		`/modules/${moduleId}/available-learning-units${query}`,
	)
}

/**
 * Vrne vpraĹˇalnik za izbrani modul.
 */
export async function getModuleQuestionnaire(
	moduleId: string,
): Promise<QuestionnaireResponse> {
	return apiGet<QuestionnaireResponse>(
		`/modules/${moduleId}/questionnaire`,
	)
}

