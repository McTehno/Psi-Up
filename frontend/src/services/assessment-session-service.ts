import type { AssessmentResultResponse } from '../types/assessment'
import type { QuestionnaireTargetType } from '../types/questionnaire'

const ASSESSMENT_RESULT_STORAGE_PREFIX = 'assessment_result'

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function getAssessmentResultStorageKeys(
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  return [
    `${ASSESSMENT_RESULT_STORAGE_PREFIX}_${targetType}_${targetId}`,
    `${ASSESSMENT_RESULT_STORAGE_PREFIX}_${targetId}`,
  ] as const
}

function isAssessmentResultForTarget(
  result: AssessmentResultResponse,
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  return result.target_type === targetType && result.target_id === targetId
}

export function saveSessionAssessmentResult(
  targetType: QuestionnaireTargetType,
  targetId: string,
  result: AssessmentResultResponse,
) {
  const storage = getSessionStorage()

  if (!storage) {
    return
  }

  for (const key of getAssessmentResultStorageKeys(targetType, targetId)) {
    storage.setItem(key, JSON.stringify(result))
  }
}

export function getSessionAssessmentResult(
  targetType: QuestionnaireTargetType,
  targetId: string,
): AssessmentResultResponse | null {
  const storage = getSessionStorage()

  if (!storage) {
    return null
  }

  for (const key of getAssessmentResultStorageKeys(targetType, targetId)) {
    const rawValue = storage.getItem(key)

    if (!rawValue) {
      continue
    }

    try {
      const result = JSON.parse(rawValue) as AssessmentResultResponse

      if (isAssessmentResultForTarget(result, targetType, targetId)) {
        return result
      }
    } catch {
      storage.removeItem(key)
    }
  }

  return null
}