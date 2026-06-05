import { apiGet, apiPost } from './api-client'
import type { AssessmentResultResponse } from '../types/assessment'
import type {
	QuestionnaireSubmitRequest,
	QuestionnaireTargetType,
} from '../types/questionnaire'

export async function evaluateAssessment(
	request: QuestionnaireSubmitRequest,
): Promise<AssessmentResultResponse> {
	return apiPost<AssessmentResultResponse, QuestionnaireSubmitRequest>(
		'/assessments/evaluate',
		request,
	)
}

export async function getLatestAssessmentResult(
	targetType: QuestionnaireTargetType,
	targetId: string,
): Promise<AssessmentResultResponse | null> {
	const searchParams = new URLSearchParams({
		target_type: targetType,
		target_id: targetId,
	})

	return apiGet<AssessmentResultResponse | null>(
		`/assessments/latest?${searchParams.toString()}`,
	)
}