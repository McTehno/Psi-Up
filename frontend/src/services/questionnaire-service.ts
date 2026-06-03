import { apiGet } from './api-client'
import type {
	QuestionnaireResponse,
	QuestionnaireTargetType,
} from '../types/questionnaire'

export async function getQuestionnaire(
	targetType: QuestionnaireTargetType,
	targetId: string,
	userId?: string,
): Promise<QuestionnaireResponse> {
	const params = new URLSearchParams()

	params.set('target_type', targetType)
	params.set('target_id', targetId)

	if (userId) {
		params.set('user_id', userId)
	}

	return apiGet<QuestionnaireResponse>(
		`/questionnaires?${params.toString()}`,
	)
}