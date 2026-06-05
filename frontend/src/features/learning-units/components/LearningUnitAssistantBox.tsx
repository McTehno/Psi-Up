import { useEffect, useMemo, useState, type JSX } from 'react'
import { Send } from 'lucide-react'

import { CollapsibleChatPanel } from '../../../components/layout/ChatPanel/CollapsibleChatPanel'
import {
  sendLearningUnitAssistantMessage,
} from '../../../services/learning-unit-assistant-service'

type AssistantExchange = {
  id: string
  question: string
  answer: string
  createdAt: string
}

type StoredAssistantState = {
  sessionId?: string
  messages: AssistantExchange[]
}

type LearningUnitAssistantBoxProps = {
  learningUnitId: string
  userId?: string
  variant?: 'desktop' | 'mobile'
  className?: string
}

const suggestedQuestions = [
  'Kaj bom znal po tej učni enoti?',
  'Katere teme pokriva ta učna enota?',
  'Katere digitalne kompetence razvijam?',
  'Kako naj se lotim te učne enote?',
]

function readStoredState(storageKey: string): StoredAssistantState {
  if (typeof window === 'undefined') {
    return { messages: [] }
  }

  try {
    const rawValue = window.sessionStorage.getItem(storageKey)

    if (!rawValue) {
      return { messages: [] }
    }

    const parsedValue = JSON.parse(rawValue) as StoredAssistantState

    return {
      sessionId: parsedValue.sessionId,
      messages: Array.isArray(parsedValue.messages) ? parsedValue.messages : [],
    }
  } catch {
    return { messages: [] }
  }
}

function writeStoredState(storageKey: string, state: StoredAssistantState) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(storageKey, JSON.stringify(state))
}

function InlineMarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={`${part}-${index}`} className="font-bold text-[#2b2118]">
              {part.slice(2, -2)}
            </strong>
          )
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}

function AssistantMarkdownText({ content }: { content: string }) {
  const lines = content.split(/\r?\n/)
  const elements: JSX.Element[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) {
      return
    }

    elements.push(
      <ul
        key={`list-${elements.length}`}
        className="my-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#5f6652]"
      >
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>
            <InlineMarkdownText text={item} />
          </li>
        ))}
      </ul>,
    )

    listItems = []
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      listItems.push(trimmedLine.slice(2).trim())
      return
    }

    flushList()

    if (!trimmedLine) {
      elements.push(<div key={`space-${index}`} className="h-2" />)
      return
    }

    elements.push(
      <p key={`${trimmedLine}-${index}`} className="text-sm leading-6 text-[#5f6652]">
        <InlineMarkdownText text={trimmedLine} />
      </p>,
    )
  })

  flushList()

  return <div>{elements}</div>
}

function LearningUnitAssistantBox({
  learningUnitId,
  userId,
  variant = 'desktop',
  className = '',
}: LearningUnitAssistantBoxProps) {
  const storageKey = useMemo(
    () => `learning-unit-assistant:${learningUnitId}`,
    [learningUnitId],
  )

  const [state, setState] = useState<StoredAssistantState>(() =>
    readStoredState(storageKey),
  )
  const [inputValue, setInputValue] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedMessage =
    state.messages.find((message) => message.id === selectedMessageId) ??
    state.messages[state.messages.length - 1] ??
    null

  useEffect(() => {
    setState(readStoredState(storageKey))
    setSelectedMessageId(null)
    setErrorMessage(null)
    setInputValue('')
  }, [storageKey])

  useEffect(() => {
    writeStoredState(storageKey, state)
  }, [state, storageKey])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const question = inputValue.trim()

    if (!question || isLoading || !learningUnitId) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await sendLearningUnitAssistantMessage({
        sessionId: state.sessionId,
        userId,
        learningUnitId,
        userMessage: question,
      })

      const newMessage: AssistantExchange = {
        id: `${Date.now()}`,
        question,
        answer: response.answer,
        createdAt: new Date().toISOString(),
      }

      setState((currentState) => ({
        sessionId: response.session_id,
        messages: [...currentState.messages, newMessage],
      }))
      setSelectedMessageId(newMessage.id)
      setInputValue('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Pomočnika trenutno ni mogoče doseči. Poskusite znova.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleSuggestedQuestion(question: string) {
    setInputValue(question)
    setErrorMessage(null)
  }

  return (
    <CollapsibleChatPanel
      variant={variant}
      className={className}
    >
      <div className="flex min-h-[220px] flex-1 flex-col">
        {state.messages.length === 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31583b]">
              Predlagana vprašanja
            </p>

            <div className="mt-3 flex flex-col gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="rounded-2xl border border-[#c8b79b]/70 bg-white/35 px-4 py-2 text-left text-sm font-semibold text-[#31583b] shadow-[0_8px_18px_rgba(43,33,24,0.08)] transition hover:border-[#b39b78]/80 hover:bg-white/55 hover:shadow-[0_10px_22px_rgba(43,33,24,0.12)]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31583b]">
              Pretekla vprašanja
            </p>

            <div className="mt-2 flex max-h-28 flex-col gap-2 overflow-y-auto pr-1">
              {state.messages.map((message) => {
                const isSelected = selectedMessage?.id === message.id

                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedMessageId(message.id)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${isSelected
                        ? 'border-[#b39b78]/85 bg-white/60 text-[#2b2118] shadow-sm'
                        : 'border-[#c8b79b]/70 bg-white/30 text-[#31583b] hover:border-[#b39b78]/80 hover:bg-white/50 hover:shadow-sm'
                      }`}
                  >
                    {message.question}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 min-h-[120px] flex-1 overflow-y-auto rounded-[1.5rem] border border-[#c8b79b]/70 bg-white/24 p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_24px_rgba(43,33,24,0.08)] backdrop-blur-2xl transition hover:border-[#b39b78]/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_28px_rgba(43,33,24,0.11)]">
          {selectedMessage ? (
            <div>
              <p className="mb-3 text-sm font-bold text-[#2b2118]">
                {selectedMessage.question}
              </p>

              <AssistantMarkdownText content={selectedMessage.answer} />
            </div>
          ) : (
            <p className="text-sm leading-6 text-[#5f6652]">
              Tukaj se bo prikazal odgovor pomočnika. Odgovarjal bo samo na podlagi
              podatkov te učne enote.
            </p>
          )}
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-[1.25rem] border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="learning-unit-assistant-question" className="sr-only">
            Vprašanje za pomočnika
          </label>

          <textarea
            id="learning-unit-assistant-question"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Npr. Katere kompetence razvijam?"
            rows={3}
            className="w-full resize-none rounded-[1.5rem] border border-[#b8a486]/90 bg-white/45 px-4 py-3 text-sm leading-6 text-[#2b2118] outline-none transition placeholder:text-[#8c8378] focus:border-[#8f7553] focus:bg-white/60 focus:ring-4 focus:ring-white/30"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || inputValue.trim().length === 0 || !learningUnitId}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#31583b] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(49,88,59,0.24)] transition hover:-translate-y-0.5 hover:bg-[#274a31] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isLoading ? 'Pomočnik razmišlja...' : 'Pošlji vprašanje'}
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </CollapsibleChatPanel>
  )
}

export default LearningUnitAssistantBox

