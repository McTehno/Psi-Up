import { apiPost } from './api-client'
import type { AssessmentResultResponse } from '../types/assessment'
import type { QuestionnaireSubmitRequest } from '../types/questionnaire'

export async function evaluateAssessment(
	request: QuestionnaireSubmitRequest,
): Promise<AssessmentResultResponse> {
	return apiPost<AssessmentResultResponse, QuestionnaireSubmitRequest>(
		'/assessments/evaluate',
		request,
	)
}

