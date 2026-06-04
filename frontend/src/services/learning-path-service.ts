import { apiGet } from './api-client'
import type {
	LearningPathDetailResponse,
	LearningPathResponse,
	LearningPathStepResponse,
} from '../types/learning-path'
import type { ModuleReferenceResponse } from '../types/module'
import type { QuestionnaireResponse } from '../types/questionnaire'

function buildRepeatedQueryParam(
	paramName: string,
	values: string[],
): string {
	if (values.length === 0) {
		return ''
	}

	const searchParams = new URLSearchParams()

	values.forEach((value) => {
		searchParams.append(paramName, value)
	})

	return `?${searchParams.toString()}`
}

export async function getLearningPaths(): Promise<LearningPathResponse[]> {
	return apiGet<LearningPathResponse[]>('/learning-paths')
}

export async function getLearningPathById(
	learningPathId: string,
): Promise<LearningPathResponse> {
	return apiGet<LearningPathResponse>(`/learning-paths/${learningPathId}`)
}

export async function getLearningPathDetail(
	learningPathId: string,
): Promise<LearningPathDetailResponse> {
	return apiGet<LearningPathDetailResponse>(
		`/learning-paths/${learningPathId}/detail`,
	)
}

export async function getLearningPathSteps(
	learningPathId: string,
): Promise<LearningPathStepResponse[]> {
	return apiGet<LearningPathStepResponse[]>(
		`/learning-paths/${learningPathId}/steps`,
	)
}

/**
 * Compatibility endpoint za starejĹˇo logiko.
 *
 * Nova struktura uÄŤne poti uporablja steps, ampak ta endpoint
 * Ĺˇe vedno vrne samo reference modulov znotraj uÄŤne poti.
 */
export async function getLearningPathModules(
	learningPathId: string,
): Promise<ModuleReferenceResponse[]> {
	return apiGet<ModuleReferenceResponse[]>(
		`/learning-paths/${learningPathId}/modules`,
	)
}

export async function getLearningPathAvailableSteps(
	learningPathId: string,
	completedStepIds: string[] = [],
): Promise<LearningPathStepResponse[]> {
	const query = buildRepeatedQueryParam(
		'completed_step_ids',
		completedStepIds,
	)

	return apiGet<LearningPathStepResponse[]>(
		`/learning-paths/${learningPathId}/available-steps${query}`,
	)
}

/**
 * Compatibility endpoint za starejĹˇo logiko.
 *
 * Nova struktura uporablja available-steps, ta endpoint pa vrne
 * samo dostopne module.
 */
export async function getLearningPathAvailableModules(
	learningPathId: string,
	completedModuleIds: string[] = [],
): Promise<ModuleReferenceResponse[]> {
	const query = buildRepeatedQueryParam(
		'completed_module_ids',
		completedModuleIds,
	)

	return apiGet<ModuleReferenceResponse[]>(
		`/learning-paths/${learningPathId}/available-modules${query}`,
	)
}

export async function getLearningPathQuestionnaire(
	learningPathId: string,
): Promise<QuestionnaireResponse> {
	return apiGet<QuestionnaireResponse>(
		`/learning-paths/${learningPathId}/questionnaire`,
	)
}

