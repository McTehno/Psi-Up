export type AssistantContextType =
  | 'learning_path'
  | 'module'
  | 'learning_unit'
  | 'general'

export type AssistantMessageRole = 'user' | 'assistant'

export type AssistantMessage = {
  id: string
  role: AssistantMessageRole
  content: string
  createdAt: string
}

export type AssistantChatContext = {
  contextType: AssistantContextType
  contextId?: string
  title?: string
}

