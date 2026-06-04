import { apiGet } from './api-client'
import type {
	LearningUnitDetailResponse,
	LearningUnitResponse,
} from '../types/learning-unit'
import type { QuestionnaireResponse } from '../types/questionnaire'

/**
 * Vrne vse uÄŤne enote.
 */
export async function getLearningUnits(): Promise<LearningUnitResponse[]> {
	return apiGet<LearningUnitResponse[]>('/learning-units')
}

/**
 * Vrne osnovne podatke ene uÄŤne enote.
 */
export async function getLearningUnitById(
	learningUnitId: string,
): Promise<LearningUnitResponse> {
	return apiGet<LearningUnitResponse>(
		`/learning-units/${learningUnitId}`,
	)
}

/**
 * Vrne detail podatke uÄŤne enote.
 *
 * Detail endpoint poleg osnovnih podatkov vrne tudi priporoÄŤene module,
 * ki vsebujejo izbrano uÄŤno enoto.
 */
export async function getLearningUnitDetail(
	learningUnitId: string,
): Promise<LearningUnitDetailResponse> {
	return apiGet<LearningUnitDetailResponse>(
		`/learning-units/${learningUnitId}/detail`,
	)
}

/**
 * Vrne vpraĹˇalnik za izbrano uÄŤno enoto.
 */
export async function getLearningUnitQuestionnaire(
	learningUnitId: string,
): Promise<QuestionnaireResponse> {
	return apiGet<QuestionnaireResponse>(
		`/learning-units/${learningUnitId}/questionnaire`,
	)
}

