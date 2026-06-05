import { apiPost } from './api-client'

export type LearningUnitAssistantMessageRequest = {
  sessionId?: string
  userId?: string
  learningUnitId: string
  userMessage: string
}

export type LearningUnitAssistantMessageResponse = {
  session_id: string
  answer: string
}

export async function sendLearningUnitAssistantMessage(
  request: LearningUnitAssistantMessageRequest,
): Promise<LearningUnitAssistantMessageResponse> {
  return apiPost('/learning-unit-assistant/message', {
    session_id: request.sessionId,
    user_id: request.userId,
    learning_unit_id: request.learningUnitId,
    user_message: request.userMessage,
  })
}