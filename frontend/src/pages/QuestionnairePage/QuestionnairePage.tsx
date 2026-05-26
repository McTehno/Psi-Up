import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import womanImage from '../../assets/woman.png'
import AssessmentActions from '../../features/questionnaire/components/AssessmentActions'
import AssessmentHeader from '../../features/questionnaire/components/AssessmentHeader'
import AssessmentIntro from '../../features/questionnaire/components/AssessmentIntro'
import AssessmentJourneyResult from '../../features/questionnaire/components/AssessmentJourneyResult'
import AssessmentLayout from '../../features/questionnaire/components/AssessmentLayout'
import QuestionnaireQuestion from '../../features/questionnaire/components/QuestionnaireQuestion'
import { useAudioPlayer } from '../../features/questionnaire/hooks/useAudioPlayer'
import { assessmentCopy } from '../../features/questionnaire/utils/assessmentSteps'
import { getAssessmentVoice } from '../../features/questionnaire/utils/assessmentVoice'
import { evaluateAssessment } from '../../services/assessment-service'
import { getModuleDetail } from '../../services/module-service'
import { getQuestionnaire } from '../../services/questionnaire-service'
import type { AssessmentResultResponse } from '../../types/assessment'
import type {
  AssessmentEvaluateRequest,
  QuestionnaireAnswerRequest,
  QuestionnaireQuestionResponse,
  QuestionnaireResponse,
  QuestionnaireTargetType,
} from '../../types/questionnaire'
import './QuestionnairePage.css'

type AnswerOption = {
  answer: string
  weight: boolean
}

type QuestionnaireItem = QuestionnaireQuestionResponse & {
  answers: AnswerOption[]
}

type CompetencyGroup = {
  _id: string
  title: string
  description?: string
  competencies?: { competency_id: string; title?: string }[]
}

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

type ModuleDetail = {
  _id: string
  title: string
  short_description: string
  duration_hours: number
  learning_units: {
    learning_unit_id: string
    order: number
    parallel_group: string | null
    is_required: boolean
    prerequisites: string[]
  }[]
  learning_unit_details: {
    _id: string
    title: string
    short_description: string
    duration_hours: number
    keywords: string[]
    content_topics: string[]
  }[]
}

type QuestionGroup = {
  learningUnitId: string
  questions: QuestionnaireItem[]
}

type QuestionPosition = {
  groupIndex: number
  questionIndex: number
}

const yesNoAnswers: AnswerOption[] = [
  { answer: 'Da', weight: true },
  { answer: 'Ne', weight: false },
]

function normalizeTargetType(value: string | null): QuestionnaireTargetType | null {
  if (
    value === 'learning_unit' ||
    value === 'module' ||
    value === 'learning_path'
  ) {
    return value
  }

  return null
}

function getTargetTypeLabel(targetType: QuestionnaireTargetType) {
  if (targetType === 'learning_path') {
    return 'učna pot'
  }

  if (targetType === 'learning_unit') {
    return 'učna enota'
  }

  return 'modul'
}

function createFallbackTitle(
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  return `Vprašalnik za ${getTargetTypeLabel(targetType)} ${targetId}`
}

function normalizeQuestionnaireResponse(
  data: unknown,
  targetType: QuestionnaireTargetType,
  targetId: string,
): QuestionnaireResponse {
  if (Array.isArray(data)) {
    return {
      target_type: targetType,
      target_id: targetId,
      title: createFallbackTitle(targetType, targetId),
      questions: data as QuestionnaireQuestionResponse[],
    }
  }

  const response = data as Partial<QuestionnaireResponse>

  return {
    target_type: response.target_type ?? targetType,
    target_id: response.target_id ?? targetId,
    title: response.title ?? createFallbackTitle(targetType, targetId),
    questions: response.questions ?? [],
  }
}

function groupQuestionsByLearningUnit(
  questions: QuestionnaireItem[],
): QuestionGroup[] {
  const groups: QuestionGroup[] = []
  const groupIndexesByLearningUnitId = new Map<string, number>()

  for (const question of questions) {
    const existingGroupIndex = groupIndexesByLearningUnitId.get(
      question.learning_unit_id,
    )

    if (existingGroupIndex !== undefined) {
      groups[existingGroupIndex].questions.push(question)
      continue
    }

    groupIndexesByLearningUnitId.set(question.learning_unit_id, groups.length)
    groups.push({
      learningUnitId: question.learning_unit_id,
      questions: [question],
    })
  }

  return groups
}

function findQuestionPosition(
  groups: QuestionGroup[],
  questionId: string,
): QuestionPosition | null {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const questionIndex = groups[groupIndex].questions.findIndex(
      (question) => question.id === questionId,
    )

    if (questionIndex !== -1) {
      return { groupIndex, questionIndex }
    }
  }

  return null
}

function getFirstQuestionOfNextGroup(
  groups: QuestionGroup[],
  groupIndex: number,
) {
  return groups[groupIndex + 1]?.questions[0] ?? null
}

function getNextQuestion(params: {
  currentQuestion: QuestionnaireItem
  selectedAnswer: AnswerOption
  targetType: QuestionnaireTargetType
  groups: QuestionGroup[]
}) {
  const { currentQuestion, groups } = params
  const position = findQuestionPosition(groups, currentQuestion.id)

  if (!position) {
    return null
  }

  const currentGroup = groups[position.groupIndex]
  const nextQuestionInSameGroup =
    currentGroup.questions[position.questionIndex + 1] ?? null

  if (nextQuestionInSameGroup) {
    return nextQuestionInSameGroup
  }

  return getFirstQuestionOfNextGroup(groups, position.groupIndex)
}

function isQuestionnaireAnswerRequest(
  value: QuestionnaireAnswerRequest | null,
): value is QuestionnaireAnswerRequest {
  return value !== null
}

function createAnswerPayload(
  questionIds: string[],
  questionById: Map<string, QuestionnaireItem>,
  selectedAnswers: Record<string, AnswerOption>,
): QuestionnaireAnswerRequest[] {
  return questionIds
    .map((questionId) => {
      const question = questionById.get(questionId)
      const selectedAnswer = selectedAnswers[questionId]

      if (!question || !selectedAnswer) {
        return null
      }

      return {
        learning_unit_id: question.learning_unit_id,
        question_id: question.id,
        answer: selectedAnswer.weight,
      }
    })
    .filter(isQuestionnaireAnswerRequest)
}

function createAutoFalsePayload(
  questions: QuestionnaireItem[],
  alreadyAnsweredQuestionIds: string[],
  selectedAnswers: Record<string, AnswerOption>,
): QuestionnaireAnswerRequest[] {
  const alreadyAnsweredQuestionIdSet = new Set(alreadyAnsweredQuestionIds)

  const answeredPayload = createAnswerPayload(
    alreadyAnsweredQuestionIds,
    new Map(questions.map((question) => [question.id, question] as const)),
    selectedAnswers,
  )

  const autoFalsePayload = questions
    .filter((question) => !alreadyAnsweredQuestionIdSet.has(question.id))
    .map((question) => ({
      learning_unit_id: question.learning_unit_id,
      question_id: question.id,
      answer: false,
    }))

  return [...answeredPayload, ...autoFalsePayload]
}

function AssessmentResultSummary({
  result,
}: {
  result: AssessmentResultResponse | null
}) {
  if (!result) {
    return null
  }

  return (
    <section className="mt-6 rounded-3xl border border-[#e7dac7] bg-white/90 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#31583b]">
        Rezultat iz backenda
      </p>

      {result.summary && (
        <p className="mt-3 text-sm leading-6 text-[#756f65]">
          {result.summary}
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#F7F1E6] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7F58]">
            Začetni modul
          </p>
          <p className="mt-1 text-lg font-bold text-[#2b2118]">
            {result.start_module_id ?? 'Ni določen'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F1E6] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7F58]">
            Začetna učna enota
          </p>
          <p className="mt-1 text-lg font-bold text-[#2b2118]">
            {result.start_learning_unit_id ?? 'Ni določena'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F1E6] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7F58]">
            Priporočeni moduli
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2b2118]">
            {result.recommended_next_modules.length > 0
              ? result.recommended_next_modules.join(', ')
              : 'Ni priporočil'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F1E6] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F7F58]">
            Priporočene učne enote
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2b2118]">
            {result.recommended_next_learning_units.length > 0
              ? result.recommended_next_learning_units.join(', ')
              : 'Ni priporočil'}
          </p>
        </div>
      </div>
    </section>
  )
}

function QuestionnairePage() {
  const ASSESSMENT_USER_ID = 'demo_user'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const targetType = normalizeTargetType(searchParams.get('target_type'))
  const targetId = searchParams.get('target_id')

  const [phase, setPhase] = useState<AssessmentPhase>('questionnaire')
  const [questionnaireTitle, setQuestionnaireTitle] = useState('')
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>([])
  const [visibleQuestionIds, setVisibleQuestionIds] = useState<string[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, AnswerOption>
  >({})
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResultResponse | null>(null)
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(true)
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null)

  const questionGroups = useMemo(
    () => groupQuestionsByLearningUnit(questionnaire),
    [questionnaire],
  )

  const questionById = useMemo(
    () =>
      new Map(
        questionnaire.map((question) => [question.id, question] as const),
      ),
    [questionnaire],
  )

  useEffect(() => {
    document.body.classList.add('questionnaire-route')

    return () => {
      document.body.classList.remove('questionnaire-route')
    }
  }, [])

  const currentQuestionId = visibleQuestionIds[activeQuestionIndex]
  const currentQuestion = currentQuestionId
    ? questionById.get(currentQuestionId)
    : undefined
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined

  const currentAudioSrc = getAssessmentVoice({
    phase,
    groupId: targetId,
    questionIndex: activeQuestionIndex,
  })

  const {
    isPlaying: isAudioPlaying,
    toggle: toggleAudio,
    hasAudio,
  } = useAudioPlayer(currentAudioSrc)

  const selectedGroup = useMemo<CompetencyGroup | undefined>(() => {
    if (!targetType || !targetId || !questionnaireTitle) {
      return undefined
    }

    return {
      _id: targetId,
      title: questionnaireTitle,
      description: `Vprašalnik za ${getTargetTypeLabel(targetType)}`,
      competencies: [],
    }
  }, [questionnaireTitle, targetId, targetType])

  const totalSteps =
    phase === 'completed'
      ? Math.max(visibleQuestionIds.length, 1)
      : questionnaire.length || 1
  const currentStepNumber =
    phase === 'completed'
      ? Math.max(visibleQuestionIds.length, 1)
      : Math.min(activeQuestionIndex + 1, totalSteps)

  const currentLabel = assessmentCopy.questionnaire.label
  const currentTitle =
    phase === 'completed'
      ? 'Vprašalnik je zaključen'
      : currentQuestion?.question ?? 'Vprašalnik se nalaga ...'
  const currentDescription =
    phase === 'completed'
      ? 'Backend je ocenil odgovore in vrnil rezultat.'
      : assessmentCopy.questionnaire.description

  const canGoPrevious =
    phase === 'completed' ||
    (phase === 'questionnaire' && activeQuestionIndex > 0)

  const shouldFinishAfterCurrentAnswer =
    Boolean(selectedAnswer) &&
    !selectedAnswer?.weight &&
    targetType !== 'learning_unit'

  const nextQuestion =
    currentQuestion && selectedAnswer && targetType && !shouldFinishAfterCurrentAnswer
      ? getNextQuestion({
        currentQuestion,
        selectedAnswer,
        targetType,
        groups: questionGroups,
      })
      : null

  const canGoNext =
    phase === 'questionnaire' &&
    Boolean(currentQuestion) &&
    Boolean(selectedAnswer) &&
    !isSubmittingAssessment

  const nextButtonLabel = isSubmittingAssessment
    ? 'Pošiljanje ...'
    : nextQuestion
      ? 'Naslednjo →'
      : 'Zaključi →'

  useEffect(() => {
    let isActive = true

    async function loadQuestionnaire() {
      if (!targetType || !targetId) {
        setError(
          'Manjka target_type ali target_id. Primer: /assessment?target_type=module&target_id=mod_001',
        )
        setIsLoadingQuestionnaire(false)
        return
      }

      try {
        setIsLoadingQuestionnaire(true)
        setError(null)

        const data = await getQuestionnaire(targetType, targetId)
        const normalizedData = normalizeQuestionnaireResponse(
          data,
          targetType,
          targetId,
        )

        const questions = normalizedData.questions.map((question) => ({
          ...question,
          answers: yesNoAnswers,
        }))

        let nextModuleDetail: ModuleDetail | null = null

        if (targetType === 'module') {
          nextModuleDetail = (await getModuleDetail(
            targetId,
          )) as unknown as ModuleDetail
        }

        if (!isActive) {
          return
        }

        setQuestionnaireTitle(
          normalizedData.title ?? createFallbackTitle(targetType, targetId),
        )
        setQuestionnaire(questions)
        setVisibleQuestionIds(questions[0] ? [questions[0].id] : [])
        setActiveQuestionIndex(0)
        setSelectedAnswers({})
        setAssessmentResult(null)
        setModuleDetail(nextModuleDetail)
        setPhase('questionnaire')
      } catch (error) {
        console.error(error)

        if (!isActive) {
          return
        }

        setError(
          error instanceof Error
            ? error.message
            : 'Vprašalnika ni bilo mogoče naložiti. Preverite, če backend deluje.',
        )
      } finally {
        if (isActive) {
          setIsLoadingQuestionnaire(false)
        }
      }
    }

    loadQuestionnaire()

    return () => {
      isActive = false
    }
  }, [targetType, targetId])

  function handleSelectAnswer(answer: AnswerOption) {
    if (!currentQuestion) {
      return
    }

    const questionIdsToClear = visibleQuestionIds.slice(activeQuestionIndex + 1)

    setSelectedAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers }

      for (const questionId of questionIdsToClear) {
        delete nextAnswers[questionId]
      }

      nextAnswers[currentQuestion.id] = answer
      return nextAnswers
    })

    setVisibleQuestionIds((currentQuestionIds) =>
      currentQuestionIds.slice(0, activeQuestionIndex + 1),
    )
  }

  async function submitAssessment(
    questionIdsToSubmit: string[],
    shouldAutoMarkRemainingAsFalse = false,
  ) {
    if (!targetType || !targetId) {
      return
    }

    setIsSubmittingAssessment(true)
    setError(null)

    try {
      const answers = shouldAutoMarkRemainingAsFalse
        ? createAutoFalsePayload(
          questionnaire,
          questionIdsToSubmit,
          selectedAnswers,
        )
        : createAnswerPayload(
          questionIdsToSubmit,
          questionById,
          selectedAnswers,
        )

      const payload: AssessmentEvaluateRequest = {
        user_id: ASSESSMENT_USER_ID,
        target_type: targetType,
        target_id: targetId,
        answers,
      }

      const result = await evaluateAssessment(payload)

      setAssessmentResult(result)

      if (targetType === 'learning_unit') {
        sessionStorage.setItem(
          `assessment_result_${targetId}`,
          JSON.stringify(result),
        )

        navigate(`/learning-units/${targetId}?assessment=completed`)
        return
      }

      setPhase('completed')
    } catch (error) {
      console.error(error)
      setError(
        error instanceof Error
          ? error.message
          : 'Napaka pri pošiljanju vprašalnika. Preverite, če backend deluje.',
      )
    } finally {
      setIsSubmittingAssessment(false)
    }
  }

  async function goToNextStep() {
    if (
      phase !== 'questionnaire' ||
      !currentQuestion ||
      !selectedAnswer ||
      !targetType
    ) {
      return
    }

    const questionIdsUntilCurrent = visibleQuestionIds.slice(
      0,
      activeQuestionIndex + 1,
    )

    const shouldFinishAfterNoAnswer =
      !selectedAnswer.weight && targetType !== 'learning_unit'

    if (shouldFinishAfterNoAnswer) {
      await submitAssessment(questionIdsUntilCurrent, true)
      return
    }

    const followingQuestion = getNextQuestion({
      currentQuestion,
      selectedAnswer,
      targetType,
      groups: questionGroups,
    })

    if (!followingQuestion) {
      await submitAssessment(questionIdsUntilCurrent)
      return
    }

    setVisibleQuestionIds([...questionIdsUntilCurrent, followingQuestion.id])
    setActiveQuestionIndex(questionIdsUntilCurrent.length)
  }

  function goToPreviousStep() {
    if (phase === 'completed') {
      setPhase('questionnaire')
      setActiveQuestionIndex(Math.max(visibleQuestionIds.length - 1, 0))
      return
    }

    if (phase === 'questionnaire' && activeQuestionIndex > 0) {
      setActiveQuestionIndex((index) => index - 1)
    }
  }

  if (error) {
    return (
      <AssessmentLayout
        imageSrc={womanImage}
        defaultNote={assessmentCopy.groupSelection.note}
        phase="questionnaire"
        selectedGroup={selectedGroup}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Napaka
          </p>
          <p className="mt-2 text-base">{error}</p>
        </div>
      </AssessmentLayout>
    )
  }

  if (isLoadingQuestionnaire) {
    return (
      <AssessmentLayout
        imageSrc={womanImage}
        defaultNote={assessmentCopy.groupSelection.note}
        phase="questionnaire"
        selectedGroup={selectedGroup}
      >
        <div className="rounded-3xl border border-[#e7dac7] bg-white p-6 text-[#756f65]">
          Nalaganje vprašalnika ...
        </div>
      </AssessmentLayout>
    )
  }

  if (questionnaire.length === 0) {
    return (
      <AssessmentLayout
        imageSrc={womanImage}
        defaultNote={assessmentCopy.groupSelection.note}
        phase="questionnaire"
        selectedGroup={selectedGroup}
      >
        <div className="rounded-3xl border border-[#e7dac7] bg-white p-6 text-[#756f65]">
          Ta cilj trenutno nima vprašanj.
        </div>
      </AssessmentLayout>
    )
  }

  return (
    <AssessmentLayout
      imageSrc={womanImage}
      defaultNote={assessmentCopy.groupSelection.note}
      phase={phase}
      selectedGroup={selectedGroup}
      currentQuestion={currentQuestion}
      selectedAnswer={selectedAnswer}
    >
      <AssessmentHeader
        stepNumber={currentStepNumber}
        totalSteps={totalSteps}
        label={currentLabel}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
        hasAudio={hasAudio}
      />

      <AssessmentIntro
        title={currentTitle}
        description={currentDescription}
      />

      {phase === 'questionnaire' && currentQuestion && (
        <>
          <div className="mb-5 rounded-3xl border border-[#e7dac7] bg-white/80 p-4 text-sm leading-6 text-[#756f65]">
            <div>
              Učna enota:{' '}
              <span className="font-semibold text-[#31583b]">
                {currentQuestion.learning_unit_id}
              </span>
            </div>

            {currentQuestion.related_topic && (
              <div>
                Tema:{' '}
                <span className="font-semibold text-[#31583b]">
                  {currentQuestion.related_topic}
                </span>
              </div>
            )}
          </div>

          <QuestionnaireQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
          />

          <AssessmentActions
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            nextLabel={nextButtonLabel}
          />
        </>
      )}

      {phase === 'completed' && (
        <>
          {targetType === 'module' && (
            <AssessmentJourneyResult
              title={questionnaireTitle}
              result={assessmentResult}
              moduleDetail={moduleDetail}
            />
          )}

          <AssessmentResultSummary result={assessmentResult} />

          <AssessmentActions
            canGoPrevious={canGoPrevious}
            canGoNext={false}
            onPrevious={goToPreviousStep}
            onNext={() => undefined}
            nextLabel="Zaključeno"
          />
        </>
      )}

      <button
        type="button"
        onClick={() => setIsChatOpen((value) => !value)}
        className="mt-6 rounded-full bg-[#31583b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25442d]"
      >
        {isChatOpen ? 'Skrij pomočnika' : 'Vprašaj pomočnika'}
      </button>

      {isChatOpen && (
        <div className="mt-4 rounded-3xl border border-[#e7dac7] bg-white p-5 text-sm leading-6 text-[#756f65] shadow-sm">
          Demo prostor za pomočnika. Logika vprašalnika je ločena od chata.
        </div>
      )}
    </AssessmentLayout>
  )
}

export default QuestionnairePage