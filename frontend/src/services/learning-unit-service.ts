import { apiGet } from './api-client'
import type {
	LearningUnitDetailResponse,
	LearningUnitResponse,
} from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'

/**
 * Vrne vse učne enote.
 */
export async function getLearningUnits(): Promise<LearningUnitResponse[]> {
	return apiGet<LearningUnitResponse[]>('/learning-units')
}

/**
 * Vrne osnovne podatke ene učne enote.
 */
export async function getLearningUnitById(
	learningUnitId: string,
): Promise<LearningUnitResponse> {
	return apiGet<LearningUnitResponse>(
		`/learning-units/${learningUnitId}`,
	)
}

/**
 * Vrne detail podatke učne enote.
 *
 * Detail endpoint poleg osnovnih podatkov vrne tudi priporočene module,
 * ki vsebujejo izbrano učno enoto.
 */
export async function getLearningUnitDetail(
	learningUnitId: string,
): Promise<LearningUnitDetailResponse> {
	return apiGet<LearningUnitDetailResponse>(
		`/learning-units/${learningUnitId}/detail`,
	)
}

/**
 * Vrne vprašalnik za izbrano učno enoto.
 */
export async function getLearningUnitQuestionnaire(
	learningUnitId: string,
): Promise<QuestionnaireResponse> {
	return apiGet<QuestionnaireResponse>(
		`/learning-units/${learningUnitId}/questionnaire`,
	)
}

