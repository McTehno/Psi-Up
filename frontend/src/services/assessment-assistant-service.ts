import { apiPost } from './api-client'

type AssessmentAssistantMessageRequest = {
  sessionId?: string
  userId?: string
  learningPathId?: string
  moduleId?: string
  learningUnitId?: string
  questionId: string
  questionText: string
  answerOptions: string[]
  userMessage: string
}

export type AssessmentAssistantMessageResponse = {
  session_id: string
  answer: string
}

export async function sendAssessmentAssistantMessage(
  request: AssessmentAssistantMessageRequest,
): Promise<AssessmentAssistantMessageResponse> {
  return apiPost('/assessment-assistant/message', {
    session_id: request.sessionId,
    user_id: request.userId,
    learning_path_id: request.learningPathId,
    module_id: request.moduleId,
    learning_unit_id: request.learningUnitId,
    question_id: request.questionId,
    question_text: request.questionText,
    answer_options: request.answerOptions ?? ['Da', 'Ne'],
    user_message: request.userMessage,
  })
}