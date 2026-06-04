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

export async function sendModuleAssistantMessage(
  request: ModuleAssistantMessageRequest,
): Promise<ModuleAssistantMessageResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/module-assistant/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: request.sessionId,
      user_id: request.userId,
      module_id: request.moduleId,
      user_message: request.userMessage,
    }),
  })

  const responseText = await response.text()
  const payload = responseText ? JSON.parse(responseText) : null

  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }

  return payload as ModuleAssistantMessageResponse
}

