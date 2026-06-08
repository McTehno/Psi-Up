import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import SimpleMarkdownText from '../../../components/common/SimpleMarkdownText/SimpleMarkdownText'
import { Send } from 'lucide-react'

import { CollapsibleChatPanel } from '../../../components/layout/ChatPanel/CollapsibleChatPanel'
import { sendLearningPathAssistantMessage } from '../../../services/learning-path-assistant-service'

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

type LearningPathAssistantBoxProps = {
  learningPathId: string
  userId?: string
  variant?: 'desktop' | 'mobile'
  className?: string
}

const suggestedQuestions = [
  'Kaj bom znal po tej učni poti?',
  'Kateri moduli so najpomembnejši?',
  'Kako naj se lotim te učne poti?',
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


function LearningPathAssistantBox({
  learningPathId,
  userId,
  variant = 'desktop',
  className = '',
}: LearningPathAssistantBoxProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const latestQuestionRef = useRef<HTMLDivElement | null>(null)
  const storageKey = useMemo(
    () => `learning-path-assistant:${learningPathId}`,
    [learningPathId],
  )

  const [state, setState] = useState<StoredAssistantState>(() =>
    readStoredState(storageKey),
  )
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setState(readStoredState(storageKey))
    setErrorMessage(null)
    setInputValue('')
  }, [storageKey])

  useEffect(() => {
    writeStoredState(storageKey, state)
  }, [state, storageKey])

  useEffect(() => {
    if (!state.messages.length) {
      return
    }

    const container = messagesContainerRef.current
    const latestQuestion = latestQuestionRef.current

    if (!container || !latestQuestion) {
      return
    }

    container.scrollTo({
      top: latestQuestion.offsetTop - container.offsetTop - 12,
      behavior: 'smooth',
    })
  }, [state.messages.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const question = inputValue.trim()

    if (!question || isLoading || !learningPathId) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await sendLearningPathAssistantMessage({
        sessionId: state.sessionId,
        userId,
        learningPathId,
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
    <CollapsibleChatPanel variant={variant} className={className} title="AI pomočnik">
      <div
        className={
          variant === 'mobile'
            ? 'flex h-[min(520px,calc(100vh-220px))] min-h-[360px] flex-col'
            : 'flex min-h-0 flex-1 flex-col'
        }
      >

        <div
          ref={messagesContainerRef}
          className="learning-path-assistant-scroll mt-4 min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border border-[#c8b79b]/70 bg-white/24 p-4 pb-6 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl transition hover:border-[#b39b78]/80"
        >
          {state.messages.length === 0 ? (
            <div>
              <p className="text-sm leading-6 text-[#5f6652]">
                Tukaj se bo prikazal pogovor s pomočnikom. Odgovarjal bo samo na podlagi
                podatkov te učne poti.
              </p>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31583b]">
                  Predlagana vprašanja
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="group cursor-pointer rounded-2xl border border-[#cfc2ad]/80 bg-[#fffdf8]/55 px-4 py-2.5 text-left text-sm font-semibold text-[#31583b] shadow-[0_8px_20px_rgba(57,47,35,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9fb18f]/90 hover:bg-[#f2f8f1]/80 hover:text-[#274a31] hover:shadow-[0_12px_26px_rgba(49,88,59,0.12)] active:translate-y-0"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7f9a72] transition group-hover:scale-125 group-hover:bg-[#31583b]" />
                        <span>{question}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {state.messages.map((message, index) => {
                const isLatestMessage = index === state.messages.length - 1

                return (
                  <div key={message.id} className="flex flex-col gap-3">
                    <div
                      ref={isLatestMessage ? latestQuestionRef : null}
                      className="flex justify-end"
                    >
                      <div className="max-w-[86%] animate-[fadeIn_0.22s_ease-out] rounded-[1.25rem] rounded-br-md bg-[#31583b] px-4 py-3 text-sm font-medium leading-6 text-white shadow-[0_10px_24px_rgba(49,88,59,0.18)]">
                        {message.question}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <SimpleMarkdownText
                        content={message.answer}
                        className="text-sm leading-6 text-[#5f6652]"
                      />
                    </div>
                  </div>
                )
              })}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.25rem] rounded-bl-md border border-[#ded5c6]/80 bg-[#fffdf8]/70 px-4 py-3 text-sm font-semibold text-[#5f6652] shadow-[0_12px_28px_rgba(57,47,35,0.08)]">
                    Pomočnik razmišlja ...
                  </div>
                </div>
              ) : null}


            </div>
          )}
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-[1.25rem] border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 shrink-0">
          <label htmlFor="learning-path-assistant-question" className="sr-only">
            Vprašanje za pomočnika
          </label>

          <div className="flex items-end gap-2 rounded-[1.5rem] border border-[#b8a486]/80 bg-white/45 p-2 transition focus-within:border-[#31583b] focus-within:bg-white/65 focus-within:ring-4 focus-within:ring-[#31583b]/10">
            <textarea
              id="learning-path-assistant-question"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Vprašaj pomočnika ..."
              rows={1}
              className="min-h-[40px] max-h-[96px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-5 text-[#2b2118] outline-none placeholder:text-[#8c8378] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || inputValue.trim().length === 0 || !learningPathId}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#31583b] text-white shadow-[0_10px_24px_rgba(49,88,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#274a31] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              aria-label="Pošlji vprašanje"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </CollapsibleChatPanel>
  )
}

export default LearningPathAssistantBox