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

const backendHost = String(import.meta.env.VITE_BACKEND_HOST ?? '').replace(/\/$/, '')
const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '')

const BACKEND_BASE_URL = backendHost || apiBaseUrl || 'http://127.0.0.1:8000'

function getErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'detail' in payload &&
    typeof payload.detail === 'string'
  ) {
    return payload.detail
  }

  return 'PomoÄŤnika trenutno ni mogoÄŤe doseÄŤi. Poskusite znova ÄŤez trenutek.'
}

export async function sendLearningPathAssistantMessage(
  request: LearningPathAssistantMessageRequest,
): Promise<LearningPathAssistantMessageResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/learning-path-assistant/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: request.sessionId,
      user_id: request.userId,
      learning_path_id: request.learningPathId,
      user_message: request.userMessage,
    }),
  })

  const responseText = await response.text()
  const payload = responseText ? JSON.parse(responseText) : null

  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }

  return payload as LearningPathAssistantMessageResponse
}

