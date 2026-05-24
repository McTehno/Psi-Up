import { apiGet } from './api-client'
import type {
  QuestionnaireResponse,
  QuestionnaireTargetType,
} from '../types/questionnaire'

function getQuestionnaireEndpoint(
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  switch (targetType) {
    case 'learning_path':
      return `/learning-paths/${targetId}/questionnaire`
    case 'module':
      return `/modules/${targetId}/questionnaire`
    case 'learning_unit':
      return `/learning-units/${targetId}/questionnaire`
    default:
      throw new Error('Nepodprt tip vprašalnika.')
  }
}

export async function getQuestionnaire(
  targetType: QuestionnaireTargetType,
  targetId: string,
): Promise<QuestionnaireResponse> {
  return apiGet(getQuestionnaireEndpoint(targetType, targetId))
}