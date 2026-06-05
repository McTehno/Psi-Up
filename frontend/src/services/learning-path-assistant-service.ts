import { apiPost } from './api-client'

export type LearningPathAssistantMessageRequest = {
  sessionId?: string
  userId?: string
  learningPathId: string
  userMessage: string
}

export type LearningPathAssistantMessageResponse = {
  session_id: string
  answer: string
}

export async function sendLearningPathAssistantMessage(
  request: LearningPathAssistantMessageRequest,
): Promise<LearningPathAssistantMessageResponse> {
  return apiPost('/learning-path-assistant/message', {
    session_id: request.sessionId,
    user_id: request.userId,
    learning_path_id: request.learningPathId,
    user_message: request.userMessage,
  })
}