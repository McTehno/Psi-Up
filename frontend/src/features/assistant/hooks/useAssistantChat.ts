import { useState } from 'react'
import type { AssistantMessage } from '../types'

const initialMessage: AssistantMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    'Pozdravljena! Tukaj bom lahko pomagal pri razlagi učne vsebine, modulov in učnih poti.',
  createdAt: new Date().toISOString(),
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>([initialMessage])
  const [inputValue, setInputValue] = useState('')

  function sendMessage() {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      return
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedValue,
      createdAt: new Date().toISOString(),
    }

    const mockAssistantMessage: AssistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content:
        'To je trenutno samo demo odgovor. Kasneje bo ta komponenta povezana z backend LLM endpointom.',
      createdAt: new Date().toISOString(),
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      mockAssistantMessage,
    ])

    setInputValue('')
  }

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
  }
}

