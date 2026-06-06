import { useEffect, useMemo, useState } from 'react'

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
  learningPathId: string
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = userMessage.trim()
    if (!trimmedMessage || isLoading) {
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
        learningPathId,
        moduleId,
        learningUnitId,
        questionId,
        questionText,
        answerOptions,
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

  const activeHistoryItem =
    visibleHistory.find((item) => item.id === activeExchangeId) ?? visibleHistory[0]


  if (variant === 'visual') {
  return (
    <div className="assessment-assistant-visual-chat">
  
      <div className="assessment-assistant-visual-chat__messages">
        {activeHistoryItem && (
          <>
            <div className="assessment-assistant-bubble assessment-assistant-bubble--user">
              <p>{activeHistoryItem.userMessage}</p>
            </div>

            <div className="assessment-assistant-bubble assessment-assistant-bubble--assistant">
              <SimpleMarkdownText
                content={activeHistoryItem.answer}
                className={
                  activeHistoryItem.isPending
                    ? 'assessment-assistant-bubble__text assessment-assistant-bubble__text--pending'
                    : 'assessment-assistant-bubble__text'
                }
              />
            </div>
          </>
        )}
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
    <div className="context-box assessment-assistant-box">

      <div className="assessment-assistant-box__header">
        <span className="assessment-assistant-box__eyebrow">Tekstovna pomoč</span>
        <label htmlFor="assessment-assistant-message">
          Vprašajte asistentko za pomoč pri razumevanju vprašanja
        </label>
      </div>

      {visibleHistory.length > 0 && (
        <div className="assessment-assistant-history">
          <div className="assessment-assistant-history__header">
            Vaša vprašanja:
          </div>
          <ul>
            {[...visibleHistory].reverse().map((item) => {
              const isActive = item.id === activeExchangeId

              return (
                <li
                  key={item.id}
                  className={
                    isActive
                      ? 'assessment-assistant-history__list-item assessment-assistant-history__list-item--active'
                      : 'assessment-assistant-history__list-item'
                  }
                >
                  <button
                    type="button"
                    className={
                      isActive
                        ? 'assessment-assistant-history__item assessment-assistant-history__item--active'
                        : 'assessment-assistant-history__item'
                    }
                    aria-expanded={isActive}
                    onClick={() => handleSelectHistoryItem(item)}
                  >
                    <span>{item.userMessage}</span>
                    <small>{isActive ? 'Prikazano' : 'Prikaži odgovor'}</small>
                  </button>

                  {isActive && (
                    <div className="assessment-assistant-history__mobile-answer">
                      <span className="assessment-assistant-history__mobile-label">
                        Asistentka je odgovorila:
                      </span>
                      <SimpleMarkdownText
                        content={item.answer}
                        className={
                          item.isPending
                            ? 'assessment-assistant-history__mobile-text assessment-assistant-history__mobile-text--pending'
                            : 'assessment-assistant-history__mobile-text'
                        }
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <form className="assessment-assistant-form" onSubmit={handleSubmit}>
        <textarea
          id="assessment-assistant-message"
          className="assessment-assistant-textarea"
          value={userMessage}
          onChange={(event) => setUserMessage(event.target.value)}
          placeholder="Npr. Kaj to vprašanje pomeni?"
          rows={3}
          maxLength={1000}
          disabled={isLoading}
        />

        <div className="assessment-assistant-form__actions">
          <span>
            {isLoading
              ? 'Asistentka pripravlja odgovor ...'
              : 'Pomoč pri trenutnem vprašanju'}
          </span>
          <button type="submit" disabled={isLoading || !userMessage.trim()}>
            {isLoading ? 'Pošiljam ...' : 'Vprašaj'}
          </button>
        </div>
      </form>

      {statusMessage && (
        <p className="assessment-assistant-status">{statusMessage}</p>
      )}

      {error && <p className="assessment-assistant-error">{error}</p>}


    </div>
  )
}

export default AssessmentContextBox


