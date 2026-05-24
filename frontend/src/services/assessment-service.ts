import { apiPost } from './api-client'
import type { AssessmentResultResponse } from '../types/assessment'
import type { AssessmentEvaluateRequest } from '../types/questionnaire'

export async function evaluateAssessment(
  request: AssessmentEvaluateRequest,
): Promise<AssessmentResultResponse> {
  return apiPost('/assessments/evaluate', request)
}