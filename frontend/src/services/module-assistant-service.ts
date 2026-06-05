import { apiPost } from './api-client'

export type ModuleAssistantMessageRequest = {
  sessionId?: string
  userId?: string
  moduleId: string
  userMessage: string
}

export type ModuleAssistantMessageResponse = {
  session_id: string
  answer: string
}

export async function sendModuleAssistantMessage(
  request: ModuleAssistantMessageRequest,
): Promise<ModuleAssistantMessageResponse> {
  return apiPost('/module-assistant/message', {
    session_id: request.sessionId,
    user_id: request.userId,
    module_id: request.moduleId,
    user_message: request.userMessage,
  })
}