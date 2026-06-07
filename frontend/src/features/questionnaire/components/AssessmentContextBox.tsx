import { useEffect, useMemo, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { sendAssessmentAssistantMessage } from '../../../services/assessment-assistant-service'
import type { QuestionnaireTargetType } from '../../../types/questionnaire'

import SimpleMarkdownText from '../../../components/common/SimpleMarkdownText/SimpleMarkdownText'

export type AssessmentAssistantDisplayExchange = {
  id: string
  userMessage: string
  answer: string
  isPending?: boolean
}

type AssessmentAssistantHistoryItem = AssessmentAssistantDisplayExchange & {
  sessionId?: string
  questionId: string
  createdAt: string
}

type AssessmentContextBoxProps = {
  userId?: string
  targetType: QuestionnaireTargetType
  targetId: string
  learningPathId?: string
  moduleId?: string
  learningUnitId?: string
  questionId: string
  questionText: string
  answerOptions?: string[]
  variant?: 'inline' | 'visual'
  onActiveExchangeChange: (
    exchange: AssessmentAssistantDisplayExchange | null,
  ) => void
}

const MAX_HISTORY_ITEMS = 12
const STORAGE_KEY_PREFIX = 'assessment_assistant_history'

function createStorageKey(
  targetType: QuestionnaireTargetType,
  targetId: string,
  questionId: string,
) {
  return [STORAGE_KEY_PREFIX, targetType, targetId, questionId].join('__')
}

function createLocalId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function isHistoryItem(value: unknown): value is AssessmentAssistantHistoryItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<AssessmentAssistantHistoryItem>
  return (
    typeof item.id === 'string' &&
    typeof item.userMessage === 'string' &&
    typeof item.answer === 'string' &&
    typeof item.questionId === 'string' &&
    typeof item.createdAt === 'string'
  )
}

function readHistory(storageKey: string): AssessmentAssistantHistoryItem[] {
  const storage = getSessionStorage()
  if (!storage) {
    return []
  }

  try {
    const rawValue = storage.getItem(storageKey)
    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isHistoryItem).slice(0, MAX_HISTORY_ITEMS)
  } catch {
    return []
  }
}

function saveHistory(
  storageKey: string,
  history: AssessmentAssistantHistoryItem[],
) {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  const persistedHistory = history
    .filter((item) => !item.isPending)
    .slice(0, MAX_HISTORY_ITEMS)

  storage.setItem(storageKey, JSON.stringify(persistedHistory))
}

function toDisplayExchange(
  item: AssessmentAssistantHistoryItem,
): AssessmentAssistantDisplayExchange {
  return {
    id: item.id,
    userMessage: item.userMessage,
    answer: item.answer,
    isPending: item.isPending,
  }
}

function AssessmentContextBox({
  userId,
  targetType,
  targetId,
  learningPathId,
  moduleId,
  learningUnitId,
  questionId,
  questionText,
  answerOptions = ['Da', 'Ne'],
  variant = 'inline',
  onActiveExchangeChange,
}: AssessmentContextBoxProps) {
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [userMessage, setUserMessage] = useState('')
  const [history, setHistory] = useState<AssessmentAssistantHistoryItem[]>([])
  const [transientItem, setTransientItem] =
    useState<AssessmentAssistantHistoryItem | null>(null)
  const [activeExchangeId, setActiveExchangeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const storageKey = useMemo(
    () => createStorageKey(targetType, targetId, questionId),
    [questionId, targetId, targetType],
  )

  const visualMessagesRef = useRef<HTMLDivElement | null>(null)

  const visibleHistory = useMemo(() => {
    if (!transientItem) {
      return history
    }

    return [
      transientItem,
      ...history.filter((item) => item.id !== transientItem.id),
    ].slice(0, MAX_HISTORY_ITEMS)
  }, [history, transientItem])

  useEffect(() => {
    const storedHistory = readHistory(storageKey)
    const latestItem = storedHistory[0]

    setHistory(storedHistory)
    setTransientItem(null)
    setActiveExchangeId(latestItem?.id ?? null)
    setSessionId(latestItem?.sessionId)
    setUserMessage('')
    setError(null)

    onActiveExchangeChange(latestItem ? toDisplayExchange(latestItem) : null)
  }, [onActiveExchangeChange, storageKey])

  function handleSelectHistoryItem(item: AssessmentAssistantHistoryItem) {
    setActiveExchangeId(item.id)
    setUserMessage(item.userMessage)
    if (item.sessionId) {
      setSessionId(item.sessionId)
    }

    setError(null)

    onActiveExchangeChange(toDisplayExchange(item))
  }

  useEffect(() => {
    const messagesElement = visualMessagesRef.current

    if (!messagesElement) {
      return
    }

    messagesElement.scrollTo({
      top: messagesElement.scrollHeight,
      behavior: 'smooth',
    })
  }, [visibleHistory, isLoading])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = userMessage.trim()

    const normalizedLearningPathId = learningPathId?.trim() || undefined
    const normalizedModuleId = moduleId?.trim() || undefined
    const normalizedLearningUnitId = learningUnitId?.trim() || undefined
    const normalizedQuestionId = questionId.trim()
    const normalizedQuestionText = questionText.trim()
    const normalizedAnswerOptions =
      answerOptions.length > 0
        ? answerOptions.filter((answer) => answer.trim().length > 0)
        : ['Da', 'Ne']

    if (!trimmedMessage || isLoading) {
      return
    }

    if (
      !normalizedLearningPathId &&
      !normalizedModuleId &&
      !normalizedLearningUnitId
    ) {
      setError('Pomočnika trenutno ni mogoče uporabiti, ker manjka kontekst vsebine.')
      return
    }

    if (
      normalizedQuestionId.length === 0 ||
      normalizedQuestionText.length < 3 ||
      trimmedMessage.length < 2
    ) {
      setError('Pomočnika trenutno ni mogoče uporabiti, ker manjkajo podatki vprašanja.')
      return
    }

    const pendingItem: AssessmentAssistantHistoryItem = {
      id: createLocalId(),
      sessionId,
      questionId,
      userMessage: trimmedMessage,
      answer: 'Asistentka pripravlja kratek odgovor ...',
      createdAt: new Date().toISOString(),
      isPending: true,
    }

    try {
      setIsLoading(true)
      setError(null)
      setTransientItem(pendingItem)
      setActiveExchangeId(pendingItem.id)
      onActiveExchangeChange(toDisplayExchange(pendingItem))

      const response = await sendAssessmentAssistantMessage({
        sessionId,
        userId,
        learningPathId: normalizedLearningPathId,
        moduleId: normalizedModuleId,
        learningUnitId: normalizedLearningUnitId,
        questionId: normalizedQuestionId,
        questionText: normalizedQuestionText,
        answerOptions: normalizedAnswerOptions,
        userMessage: trimmedMessage,
      })

      const savedItem: AssessmentAssistantHistoryItem = {
        id: pendingItem.id,
        sessionId: response.session_id,
        questionId,
        userMessage: trimmedMessage,
        answer: response.answer,
        createdAt: new Date().toISOString(),
      }

      const nextHistory = [
        savedItem,
        ...history.filter((item) => item.id !== savedItem.id),
      ].slice(0, MAX_HISTORY_ITEMS)

      setTransientItem(null)
      setHistory(nextHistory)
      saveHistory(storageKey, nextHistory)
      setSessionId(response.session_id)
      setActiveExchangeId(savedItem.id)
      setUserMessage('')

      onActiveExchangeChange(toDisplayExchange(savedItem))
    } catch (error) {
      console.error(error)


      const errorMessage =
        'Asistentka trenutno ne more pripraviti odgovora. Poskusite znova čez nekaj trenutkov.'

      const errorItem: AssessmentAssistantHistoryItem = {
        ...pendingItem,
        answer:
          'Asistentka trenutno ne more odgovoriti. Vprašanje lahko poskusite poslati še enkrat.',
        isPending: false,
      }

      setTransientItem(errorItem)
      setActiveExchangeId(errorItem.id)
      setStatusMessage(null)
      setError(errorMessage)
      onActiveExchangeChange(toDisplayExchange(errorItem))
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '.assessment-assistant-visual-chat__textarea',
    )

    if (!textarea || userMessage) {
      return
    }

    textarea.style.height = '28px'
  }, [userMessage])


  function resizeAssistantTextarea(
    event: React.FormEvent<HTMLTextAreaElement>,
  ) {
    const textarea = event.currentTarget

    textarea.style.height = '28px'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 76)}px`
  }

  if (variant === 'visual') {
    return (
      <div className="assessment-assistant-visual-chat">

        <div
          ref={visualMessagesRef}
          className={[
            'assessment-assistant-visual-chat__messages',
            visibleHistory.length > 0
              ? 'assessment-assistant-visual-chat__messages--active'
              : '',
          ].join(' ')}
        >
          {[...visibleHistory].slice(0, 8).reverse().map((item) => (
            <div
              key={item.id}
              className="assessment-assistant-visual-chat__exchange"
            >
              <div className="assessment-assistant-bubble assessment-assistant-bubble--user">
                <p>{item.userMessage}</p>
              </div>

              <div className="assessment-assistant-bubble assessment-assistant-bubble--assistant">
                <SimpleMarkdownText
                  content={item.answer}
                  className={
                    item.isPending
                      ? 'assessment-assistant-bubble__text assessment-assistant-bubble__text--pending'
                      : 'assessment-assistant-bubble__text'
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <form
          className="assessment-assistant-visual-chat__form"
          onSubmit={handleSubmit}
        >
          <textarea
            id="assessment-assistant-message"
            className="assessment-assistant-visual-chat__textarea"
            value={userMessage}
            onChange={(event) => setUserMessage(event.target.value)}
            onInput={resizeAssistantTextarea}
            placeholder="Napišite svoje vprašanje ..."
            rows={1}
            maxLength={1000}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="assessment-assistant-visual-chat__submit"
            disabled={isLoading || !userMessage.trim()}
            aria-label="Pošlji vprašanje"
          >
            ➤
          </button>
        </form>

        {error && <p className="assessment-assistant-visual-chat__error">{error}</p>}

        {isHistoryOpen && (
          <div className="assessment-assistant-history-panel">
            <div className="assessment-assistant-history-panel__content">
              <div className="assessment-assistant-history-panel__header">
                <span>Zgodovina vprašanj</span>

                <button type="button" onClick={() => setIsHistoryOpen(false)}>
                  Zapri
                </button>
              </div>

              {visibleHistory.length > 0 ? (
                <ul>
                  {[...visibleHistory].reverse().map((item) => {
                    const isActive = item.id === activeExchangeId

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={
                            isActive
                              ? 'assessment-assistant-history-panel__item assessment-assistant-history-panel__item--active'
                              : 'assessment-assistant-history-panel__item'
                          }
                          onClick={() => {
                            handleSelectHistoryItem(item)
                            setIsHistoryOpen(false)
                          }}
                        >
                          <span>{item.userMessage}</span>
                          <small>{isActive ? 'Prikazano' : 'Prikaži odgovor'}</small>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="assessment-assistant-history-panel__empty">
                  Zgodovina je še prazna.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-[min(500px,calc(100vh-190px))] min-h-[320px] flex-col">
      <div
        ref={visualMessagesRef}
        className="assessment-assistant-scroll mt-4 min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border border-[#c8b79b]/70 bg-white/24 p-4 pb-6 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl transition hover:border-[#b39b78]/80"
      >
        {visibleHistory.length === 0 ? (
          <div>
            <p className="text-sm leading-6 text-[#5f6652]">
              Tukaj lahko vprašaš pomočnika za dodatno razlago trenutnega vprašanja.
            </p>

            <div className="mt-4 rounded-[1.25rem] border border-[#ded5c6]/70 bg-[#fffdf8]/55 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31583b]">
                Trenutno vprašanje
              </p>

              <p className="mt-2 text-sm leading-6 text-[#5f6652]">
                {questionText}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...visibleHistory].slice(0, 8).reverse().map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <div className="max-w-[94%] animate-[fadeIn_0.22s_ease-out] rounded-[1.1rem] rounded-br-md bg-[#31583b] px-3 py-2.5 text-sm font-medium leading-6 text-white shadow-[0_10px_24px_rgba(49,88,59,0.18)] sm:max-w-[86%] sm:rounded-[1.25rem] sm:px-4 sm:py-3">
                    {item.userMessage}
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[98%] animate-[fadeIn_0.22s_ease-out] rounded-[1.1rem] rounded-bl-md border border-[#ded5c6]/80 bg-[#fffdf8]/70 px-3 py-2.5 shadow-[0_12px_28px_rgba(57,47,35,0.08)] sm:max-w-[92%] sm:rounded-[1.25rem] sm:px-4 sm:py-3">
                    <SimpleMarkdownText
                      content={item.answer}
                      className={
                        item.isPending
                          ? 'text-sm leading-6 text-[#8c8378]'
                          : 'text-sm leading-6 text-[#5f6652]'
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {statusMessage ? (
        <p className="mt-3 shrink-0 rounded-[1.25rem] border border-[#ded5c6]/70 bg-[#fffdf8]/60 px-4 py-3 text-sm text-[#5f6652]">
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 shrink-0 rounded-[1.25rem] border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 shrink-0">
        <label htmlFor="assessment-assistant-message-inline" className="sr-only">
          Vprašanje za pomočnika
        </label>

        <div className="flex items-end gap-1.5 rounded-[1.2rem] border border-[#b8a486]/80 bg-white/45 p-1.5 transition focus-within:border-[#31583b] focus-within:bg-white/65 focus-within:ring-4 focus-within:ring-[#31583b]/10 sm:gap-2 sm:rounded-[1.35rem]">
          <textarea
            id="assessment-assistant-message-inline"
            value={userMessage}
            onChange={(event) => setUserMessage(event.target.value)}
            onInput={resizeAssistantTextarea}
            placeholder="Vprašaj pomočnika ..."
            rows={1}
            maxLength={1000}
            disabled={isLoading}
            className="min-h-[40px] max-h-[96px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-5 text-[#2b2118] outline-none placeholder:text-[#8c8378] disabled:cursor-not-allowed disabled:opacity-70"
          />

          <button
            type="submit"
            disabled={isLoading || !userMessage.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#31583b] text-white shadow-[0_10px_24px_rgba(49,88,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#274a31] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:h-11 sm:w-11"
            aria-label="Pošlji vprašanje"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssessmentContextBox


