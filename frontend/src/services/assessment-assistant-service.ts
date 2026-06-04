export type AssessmentAssistantMessageRequest = {
  sessionId?: string
  userId?: string
  learningPathId: string
  moduleId?: string
  learningUnitId?: string
  questionId: string
  questionText: string
  answerOptions?: string[]
  userMessage: string
}

export type AssessmentAssistantMessageResponse = {
  session_id: string
  answer: string
}

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_HOST ?? import.meta.env.VITE_API_BASE_URL ?? ''

export async function sendAssessmentAssistantMessage(
  request: AssessmentAssistantMessageRequest,
): Promise<AssessmentAssistantMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/assessment-assistant/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: request.sessionId,
      user_id: request.userId,
      learning_path_id: request.learningPathId,
      module_id: request.moduleId,
      learning_unit_id: request.learningUnitId,
      question_id: request.questionId,
      question_text: request.questionText,
      answer_options: request.answerOptions ?? ['Da', 'Ne'],
      user_message: request.userMessage,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(
      errorBody?.detail ??
        errorBody?.error?.message ??
        'Asistentka trenutno ne more odgovoriti.',
    )
  }

  return response.json()
}


