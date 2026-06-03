import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import womanImage from '../../assets/woman.png'

import AssessmentActions from '../../features/questionnaire/components/AssessmentActions'
import AssessmentContextBox, {
  type AssessmentAssistantDisplayExchange,
} from '../../features/questionnaire/components/AssessmentContextBox'
import AssessmentHeader from '../../features/questionnaire/components/AssessmentHeader'
import AssessmentIntro from '../../features/questionnaire/components/AssessmentIntro'
import AssessmentLayout from '../../features/questionnaire/components/AssessmentLayout'
import AssessmentProgress, {
  type AssessmentProgressStep,
  type AssessmentProgressStepStatus,
} from '../../features/questionnaire/components/AssessmentProgress'
import QuestionnaireQuestion from '../../features/questionnaire/components/QuestionnaireQuestion'
import { assessmentCopy } from '../../features/questionnaire/utils/assessmentSteps'

import { useAuth } from '../../features/auth/contexts/AuthContext'
import { evaluateAssessment } from '../../services/assessment-service'
import { getLearningPathDetail } from '../../services/learning-path-service'
import { getModuleDetail } from '../../services/module-service'
import { getQuestionnaire } from '../../services/questionnaire-service'

import type { AssessmentResultResponse } from '../../types/assessment'
import type {
  LearningPathDetailResponse,
  LearningPathStepReference,
} from '../../types/learning-path'
import type { LearningUnitReferenceResponse } from '../../types/learning-unit'
import type { ModuleDetailResponse } from '../../types/module'
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

type QuestionnaireQuestionSource = {
  learning_path_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null
  topic_id?: string | null
  related_topic?: string | null
  competency_codes?: string[]
  order?: number | null
  parallel_group?: string | null
  is_required?: boolean
  prerequisites?: string[]
}

type QuestionnaireItem = QuestionnaireQuestionResponse & {
  answers: AnswerOption[]
  runtimeId: string
  sources?: QuestionnaireQuestionSource[]
}

type CompetencyGroup = {
  _id: string
  title: string
  description?: string
  competencies?: { competency_id: string; title?: string }[]
}

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

type QuestionGroup = {
  learningUnitId: string
  questions: QuestionnaireItem[]
}

type QuestionPosition = {
  groupIndex: number
  questionIndex: number
}

type BackendEntity = {
  id?: string
  _id?: string
}

const GUEST_ASSESSMENT_USER_ID_KEY = 'assessment_guest_user_id'

const yesNoAnswers: AnswerOption[] = [
  { answer: 'Da', weight: true },
  { answer: 'Ne', weight: false },
]

function getAnswerOptionFromBackendQuestion(
  question: QuestionnaireQuestionResponse,
): AnswerOption | null {
  if (!question.is_prefilled) {
    return null
  }

  if (question.answer === true) {
    return yesNoAnswers[0]
  }

  if (question.answer === false) {
    return yesNoAnswers[1]
  }

  return null
}

function createInitialSelectedAnswers(
  questions: QuestionnaireItem[],
): Record<string, AnswerOption> {
  const initialAnswers: Record<string, AnswerOption> = {}

  for (const question of questions) {
    const prefilledAnswer = getAnswerOptionFromBackendQuestion(question)

    if (!prefilledAnswer) {
      continue
    }

    initialAnswers[question.runtimeId] = prefilledAnswer
  }

  return initialAnswers
}

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

function getTargetDetailPath(
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  if (targetType === 'learning_path') {
    return `/learning-paths/${targetId}`
  }

  if (targetType === 'module') {
    return `/modules/${targetId}`
  }

  return `/learning-units/${targetId}`
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

function getBackendEntityId(entity?: BackendEntity | null) {
  return entity?.id ?? entity?._id ?? null
}

function getQuestionLearningUnitKey(question: QuestionnaireItem) {
  return question.learning_unit_id ?? `question_${question.runtimeId}`
}

function getLearningUnitReferenceId(reference: LearningUnitReferenceResponse) {
  return reference.learning_unit_id
}

function getLearningPathStepRefId(step: LearningPathStepReference) {
  return step.ref_id ?? step.module_id ?? step.learning_unit_id ?? ''
}

function groupQuestionsByLearningUnit(
  questions: QuestionnaireItem[],
): QuestionGroup[] {
  const groups: QuestionGroup[] = []
  const groupIndexesByLearningUnitId = new Map<string, number>()

  for (const question of questions) {
    const learningUnitKey = getQuestionLearningUnitKey(question)
    const existingGroupIndex = groupIndexesByLearningUnitId.get(learningUnitKey)

    if (existingGroupIndex !== undefined) {
      groups[existingGroupIndex].questions.push(question)
      continue
    }

    groupIndexesByLearningUnitId.set(learningUnitKey, groups.length)
    groups.push({
      learningUnitId: learningUnitKey,
      questions: [question],
    })
  }

  return groups
}

function findQuestionPosition(
  groups: QuestionGroup[],
  questionRuntimeId: string,
): QuestionPosition | null {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const questionIndex = groups[groupIndex].questions.findIndex(
      (question) => question.runtimeId === questionRuntimeId,
    )

    if (questionIndex !== -1) {
      return {
        groupIndex,
        questionIndex,
      }
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
  groups: QuestionGroup[]
}) {
  const { currentQuestion, groups } = params
  const position = findQuestionPosition(groups, currentQuestion.runtimeId)

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

function getCompetencyCodes(question: QuestionnaireItem) {
  const competencyCodes =
    question.competency_codes ?? question.related_competency_codes ?? []

  return Array.isArray(competencyCodes) ? competencyCodes : []
}

function normalizeQuestionText(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getQuestionFallbackSource(
  question: QuestionnaireItem,
): QuestionnaireQuestionSource {
  return {
    learning_path_id: question.learning_path_id ?? null,
    module_id: question.module_id ?? null,
    learning_unit_id: question.learning_unit_id ?? null,
    topic_id: question.topic_id ?? question.related_topic_id ?? null,
    competency_codes: getCompetencyCodes(question),
    order: question.order ?? null,
    parallel_group: question.parallel_group ?? null,
    is_required: question.is_required ?? true,
    prerequisites: question.prerequisites ?? [],
  }
}

function getQuestionSources(question: QuestionnaireItem) {
  if (Array.isArray(question.sources) && question.sources.length > 0) {
    return question.sources
  }

  return [getQuestionFallbackSource(question)]
}

function getQuestionSourceParallelGroup(
  question: QuestionnaireItem,
  source: QuestionnaireQuestionSource,
) {
  return source.parallel_group ?? question.parallel_group ?? null
}

function getQuestionParallelGroups(question: QuestionnaireItem) {
  return new Set(
    getQuestionSources(question)
      .map((source) => getQuestionSourceParallelGroup(question, source))
      .filter((group): group is string => Boolean(group)),
  )
}

function questionHasAnyParallelGroup(question: QuestionnaireItem) {
  return getQuestionParallelGroups(question).size > 0
}

function getQuestionSourceContentKey(params: {
  question: QuestionnaireItem
  source: QuestionnaireQuestionSource
  targetType: QuestionnaireTargetType
  targetId: string
}) {
  const { question, source, targetType, targetId } = params

  const fallbackKey =
    normalizeQuestionText(question.question) || question.id || question.runtimeId

  if (source.module_id || question.module_id) {
    return source.module_id ?? question.module_id ?? fallbackKey
  }

  if (targetType === 'module') {
    return targetId
  }

  if (source.learning_unit_id || question.learning_unit_id) {
    return source.learning_unit_id ?? question.learning_unit_id ?? fallbackKey
  }

  if (targetType === 'learning_unit') {
    return targetId
  }

  return fallbackKey
}

function getQuestionContentKeys(params: {
  question: QuestionnaireItem
  targetType: QuestionnaireTargetType
  targetId: string
  parallelGroups?: Set<string> | null
}) {
  const { question, targetType, targetId, parallelGroups } = params
  const keys = new Set<string>()

  for (const source of getQuestionSources(question)) {
    const sourceParallelGroup = getQuestionSourceParallelGroup(question, source)

    if (
      parallelGroups &&
      parallelGroups.size > 0 &&
      (!sourceParallelGroup || !parallelGroups.has(sourceParallelGroup))
    ) {
      continue
    }

    const contentKey = getQuestionSourceContentKey({
      question,
      source,
      targetType,
      targetId,
    })

    if (contentKey) {
      keys.add(contentKey)
    }
  }

  return [...keys]
}

function getRejectedContentKeys(params: {
  questions: QuestionnaireItem[]
  selectedAnswers: Record<string, AnswerOption>
  targetType: QuestionnaireTargetType
  targetId: string
  confirmedQuestionIds: string[]
}) {
  const {
    questions,
    selectedAnswers,
    targetType,
    targetId,
    confirmedQuestionIds,
  } = params

  const confirmedQuestionIdSet = new Set(confirmedQuestionIds)
  const rejectedContentKeys = new Set<string>()

  for (const question of questions) {
    if (!confirmedQuestionIdSet.has(question.runtimeId)) {
      continue
    }

    if (selectedAnswers[question.runtimeId]?.weight !== false) {
      continue
    }

    for (const contentKey of getQuestionContentKeys({
      question,
      targetType,
      targetId,
    })) {
      rejectedContentKeys.add(contentKey)
    }
  }

  return rejectedContentKeys
}

function questionHasUnrejectedContent(params: {
  question: QuestionnaireItem
  targetType: QuestionnaireTargetType
  targetId: string
  rejectedContentKeys: Set<string>
}) {
  const { question, targetType, targetId, rejectedContentKeys } = params

  const contentKeys = getQuestionContentKeys({
    question,
    targetType,
    targetId,
  })

  if (contentKeys.length === 0) {
    return true
  }

  return contentKeys.some((contentKey) => !rejectedContentKeys.has(contentKey))
}

function getNextEligibleQuestion(params: {
  questions: QuestionnaireItem[]
  currentQuestion: QuestionnaireItem
  groups: QuestionGroup[]
  selectedAnswers: Record<string, AnswerOption>
  targetType: QuestionnaireTargetType
  targetId: string
  confirmedQuestionIds: string[]
  onlyParallelQuestions?: boolean
}) {
  const {
    questions,
    currentQuestion,
    groups,
    selectedAnswers,
    targetType,
    targetId,
    confirmedQuestionIds,
    onlyParallelQuestions = false,
  } = params

  const rejectedContentKeys = getRejectedContentKeys({
    questions,
    selectedAnswers,
    targetType,
    targetId,
    confirmedQuestionIds,
  })

  let candidate = getNextQuestion({
    currentQuestion,
    groups,
  })

  while (candidate) {
    if (
      (!onlyParallelQuestions || questionHasAnyParallelGroup(candidate)) &&
      questionHasUnrejectedContent({
        question: candidate,
        targetType,
        targetId,
        rejectedContentKeys,
      })
    ) {
      return candidate
    }

    candidate = getNextQuestion({
      currentQuestion: candidate,
      groups,
    })
  }

  return null
}

function getNextQuestionAfterNegativeAnswer(params: {
  questions: QuestionnaireItem[]
  currentQuestion: QuestionnaireItem
  groups: QuestionGroup[]
  selectedAnswers: Record<string, AnswerOption>
  targetType: QuestionnaireTargetType
  targetId: string
  confirmedQuestionIds: string[]
}) {
  const {
    questions,
    currentQuestion,
    groups,
    selectedAnswers,
    targetType,
    targetId,
    confirmedQuestionIds,
  } = params

  if (targetType === 'learning_unit') {
    return null
  }

  if (!questionHasAnyParallelGroup(currentQuestion)) {
    return null
  }

  return getNextEligibleQuestion({
    questions,
    currentQuestion,
    groups,
    selectedAnswers,
    targetType,
    targetId,
    confirmedQuestionIds,
    onlyParallelQuestions: true,
  })
}

function createQuestionnaireAnswerRequest(
  question: QuestionnaireItem,
  answer: boolean,
  targetType: QuestionnaireTargetType,
  targetId: string,
): QuestionnaireAnswerRequest {
  return {
    question_id: question.id,
    question: question.question,
    type: question.type,
    answer,
    learning_path_id:
      question.learning_path_id ?? (targetType === 'learning_path' ? targetId : null),
    module_id: question.module_id ?? (targetType === 'module' ? targetId : null),
    learning_unit_id:
      question.learning_unit_id ??
      (targetType === 'learning_unit' ? targetId : null),
    topic_id: question.topic_id ?? question.related_topic_id ?? null,
    competency_codes: getCompetencyCodes(question),
  }
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
  targetType: QuestionnaireTargetType,
  targetId: string,
): QuestionnaireAnswerRequest[] {
  return questionIds
    .map((questionId) => {
      const question = questionById.get(questionId)
      const selectedAnswer = selectedAnswers[questionId]

      if (!question || !selectedAnswer) {
        return null
      }

      return createQuestionnaireAnswerRequest(
        question,
        selectedAnswer.weight,
        targetType,
        targetId,
      )
    })
    .filter(isQuestionnaireAnswerRequest)
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

function createGuestAssessmentUserId() {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return `guest_${globalThis.crypto.randomUUID()}`
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getAssessmentUserId(authenticatedUserId?: string | null) {
  if (authenticatedUserId) {
    return authenticatedUserId
  }

  const storage = getSessionStorage()

  if (!storage) {
    return createGuestAssessmentUserId()
  }

  const existingUserId = storage.getItem(GUEST_ASSESSMENT_USER_ID_KEY)

  if (existingUserId) {
    return existingUserId
  }

  const nextUserId = createGuestAssessmentUserId()
  storage.setItem(GUEST_ASSESSMENT_USER_ID_KEY, nextUserId)

  return nextUserId
}

function saveAssessmentResult(
  targetType: QuestionnaireTargetType,
  targetId: string,
  result: AssessmentResultResponse,
) {
  const storage = getSessionStorage()

  if (!storage) {
    return
  }

  storage.setItem(
    `assessment_result_${targetType}_${targetId}`,
    JSON.stringify(result),
  )
  storage.setItem(`assessment_result_${targetId}`, JSON.stringify(result))
}

function getOrderedItems<T extends { order?: number | null }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function getQuestionIdsByLearningUnit(
  questionnaire: QuestionnaireItem[],
  learningUnitId: string,
) {
  return questionnaire
    .filter((question) => question.learning_unit_id === learningUnitId)
    .map((question) => question.runtimeId)
}

function getProgressQuestionIds(
  visibleQuestionIds: string[],
  activeQuestionIndex: number,
  phase: AssessmentPhase,
) {
  if (phase === 'completed') {
    return new Set(visibleQuestionIds)
  }

  return new Set(visibleQuestionIds.slice(0, activeQuestionIndex))
}

function getQuestionProgressPosition(
  questionCountUntilStep: number,
  totalQuestionCount: number,
) {
  if (totalQuestionCount <= 0) {
    return 0
  }

  return Math.min(totalQuestionCount, Math.max(0, questionCountUntilStep))
}

function getLeafStatus(
  questionIds: string[],
  selectedAnswers: Record<string, AnswerOption>,
  progressQuestionIds: Set<string>,
  activeQuestionId?: string,
): AssessmentProgressStepStatus {
  const visibleQuestionIds = questionIds.filter((questionId) =>
    progressQuestionIds.has(questionId),
  )

  const isActive = Boolean(
    activeQuestionId && questionIds.includes(activeQuestionId),
  )

  const hasNoAnswer = visibleQuestionIds.some(
    (questionId) => selectedAnswers[questionId]?.weight === false,
  )

  const isCompleted =
    questionIds.length > 0 &&
    questionIds.every(
      (questionId) =>
        progressQuestionIds.has(questionId) &&
        selectedAnswers[questionId]?.weight === true,
    )

  if (hasNoAnswer) {
    return 'upcoming'
  }

  if (isActive) {
    return 'active'
  }

  if (isCompleted) {
    return 'completed'
  }

  return 'upcoming'
}

function getStepStatusFromChildren(
  childStatuses: AssessmentProgressStepStatus[],
): AssessmentProgressStepStatus {
  if (
    childStatuses.length > 0 &&
    childStatuses.every((status) => status === 'completed')
  ) {
    return 'completed'
  }

  if (childStatuses.includes('missing')) {
    return 'missing'
  }

  if (childStatuses.includes('active')) {
    return 'active'
  }

  return 'upcoming'
}

function getCompletedLeafCount(steps: AssessmentProgressStep[]) {
  return steps.reduce((count, step) => {
    if (step.subSteps && step.subSteps.length > 0) {
      return (
        count +
        step.subSteps.filter((subStep) => subStep.status === 'completed').length
      )
    }

    return count + (step.status === 'completed' ? 1 : 0)
  }, 0)
}

function getTotalLeafCount(steps: AssessmentProgressStep[]) {
  const leafCount = steps.reduce((count, step) => {
    if (step.subSteps && step.subSteps.length > 0) {
      return count + step.subSteps.length
    }

    return count + 1
  }, 0)

  return Math.max(leafCount, 1)
}

function createFallbackProgressSteps(params: {
  questionGroups: QuestionGroup[]
  selectedAnswers: Record<string, AnswerOption>
  progressQuestionIds: Set<string>
  activeQuestionId?: string
  totalQuestionCount: number
}) {
  const {
    questionGroups,
    selectedAnswers,
    progressQuestionIds,
    activeQuestionId,
    totalQuestionCount,
  } = params

  let questionCountUntilStep = 0

  return questionGroups.map((group, groupIndex) => {
    const questionIds = group.questions.map((question) => question.runtimeId)
    questionCountUntilStep += questionIds.length

    return {
      id: group.learningUnitId,
      label: String(groupIndex + 1),
      title: group.learningUnitId.startsWith('question_')
        ? `Vprašanje ${groupIndex + 1}`
        : `Učna enota ${groupIndex + 1}`,
      status: getLeafStatus(
        questionIds,
        selectedAnswers,
        progressQuestionIds,
        activeQuestionId,
      ),
      questionCountUntilStep: getQuestionProgressPosition(
        questionCountUntilStep,
        totalQuestionCount,
      ),
    }
  })
}

function QuestionnairePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { localUser } = useAuth()

  const userId = localUser?._id
  const assessmentUserId = useMemo(() => getAssessmentUserId(userId), [userId])
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
  const [moduleDetail, setModuleDetail] =
    useState<ModuleDetailResponse | null>(null)
  const [learningPathDetail, setLearningPathDetail] =
    useState<LearningPathDetailResponse | null>(null)
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(true)
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [assistantExchange, setAssistantExchange] =
    useState<AssessmentAssistantDisplayExchange | null>(null)

  useEffect(() => {
    document.body.classList.add('questionnaire-route')

    return () => {
      document.body.classList.remove('questionnaire-route')
    }
  }, [])

  const questionGroups = useMemo(
    () => groupQuestionsByLearningUnit(questionnaire),
    [questionnaire],
  )

  const questionById = useMemo(
    () =>
      new Map(
        questionnaire.map((question) => [question.runtimeId, question] as const),
      ),
    [questionnaire],
  )

  const currentQuestionId = visibleQuestionIds[activeQuestionIndex]
  const currentQuestion = currentQuestionId
    ? questionById.get(currentQuestionId)
    : undefined

  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.runtimeId]
    : undefined

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

const confirmedQuestionIdsForPreview = visibleQuestionIds.slice(
  0,
  activeQuestionIndex + 1,
)

const nextQuestion =
  currentQuestion && selectedAnswer && targetType && targetId
    ? selectedAnswer.weight === false
      ? getNextQuestionAfterNegativeAnswer({
          questions: questionnaire,
          currentQuestion,
          groups: questionGroups,
          selectedAnswers,
          targetType,
          targetId,
          confirmedQuestionIds: confirmedQuestionIdsForPreview,
        })
      : getNextEligibleQuestion({
          questions: questionnaire,
          currentQuestion,
          groups: questionGroups,
          selectedAnswers,
          targetType,
          targetId,
          confirmedQuestionIds: confirmedQuestionIdsForPreview,
        })
    : null

  const skipNotice =
    phase === 'questionnaire' &&
    currentQuestion &&
    selectedAnswer?.weight === false
      ? nextQuestion
        ? 'Odgovor Ne bo preskočil preostala vprašanja tega modula in nadaljeval pri drugem vzporednem modulu. Z gumbom Nazaj lahko odgovor spremeniš.'
        : 'Odgovor Ne bo zaključil vprašalnik, ker ni več neodgovorjenega vzporednega modula. Z gumbom Nazaj lahko odgovor spremeniš.'
      : null

  const confirmedQuestionCount =
    phase === 'completed'
      ? questionnaire.length
      : Math.min(Math.max(activeQuestionIndex, 0), questionnaire.length)

  const assessmentProgress = useMemo(() => {
    const progressQuestionIds = getProgressQuestionIds(
      visibleQuestionIds,
      activeQuestionIndex,
      phase,
    )

    const activeQuestionId =
      phase === 'questionnaire' ? currentQuestion?.runtimeId : undefined

    if (targetType === 'learning_unit') {
      let questionCountUntilStep = 0

      const steps: AssessmentProgressStep[] = questionnaire.map(
        (question, index) => {
          questionCountUntilStep += 1

          return {
            id: question.runtimeId,
            label: String(index + 1),
            title: `Vprašanje ${index + 1}`,
            status: getLeafStatus(
              [question.runtimeId],
              selectedAnswers,
              progressQuestionIds,
              activeQuestionId,
            ),
            questionCountUntilStep: getQuestionProgressPosition(
              questionCountUntilStep,
              questionnaire.length,
            ),
          }
        },
      )

      return {
        steps,
        completedLeafCount: getCompletedLeafCount(steps),
        totalLeafCount: getTotalLeafCount(steps),
      }
    }

    if (targetType === 'module' && moduleDetail) {
      let questionCountUntilStep = 0
      const usedQuestionIds = new Set<string>()

      const steps: AssessmentProgressStep[] = getOrderedItems(
        moduleDetail.learning_units,
      )
        .map((learningUnitReference, unitIndex) => {
          const learningUnitId = getLearningUnitReferenceId(learningUnitReference)

          const questionIds = getQuestionIdsByLearningUnit(
            questionnaire,
            learningUnitId,
          )

          for (const questionId of questionIds) {
            usedQuestionIds.add(questionId)
          }

          questionCountUntilStep += questionIds.length

          const unitTitle =
            moduleDetail.learning_unit_details?.find(
              (learningUnit) =>
                getBackendEntityId(learningUnit) === learningUnitId,
            )?.title ?? `Učna enota ${unitIndex + 1}`

          return {
            id: learningUnitId,
            label: String(unitIndex + 1),
            title: unitTitle,
            status: getLeafStatus(
              questionIds,
              selectedAnswers,
              progressQuestionIds,
              activeQuestionId,
            ),
            questionCountUntilStep: getQuestionProgressPosition(
              questionCountUntilStep,
              questionnaire.length,
            ),
            questionCount: questionIds.length,
          }
        })
        .filter((step) => step.questionCount > 0)
        .map(({ questionCount, ...step }) => step)

      const unmatchedQuestions = questionnaire.filter(
        (question) => !usedQuestionIds.has(question.runtimeId),
      )

      if (unmatchedQuestions.length > 0) {
        const questionIds = unmatchedQuestions.map((question) => question.runtimeId)
        questionCountUntilStep += questionIds.length

        steps.push({
          id: 'module_additional_questions',
          label: String(steps.length + 1),
          title: 'Dodatna vprašanja',
          status: getLeafStatus(
            questionIds,
            selectedAnswers,
            progressQuestionIds,
            activeQuestionId,
          ),
          questionCountUntilStep: getQuestionProgressPosition(
            questionCountUntilStep,
            questionnaire.length,
          ),
        })
      }

      if (steps.length === 0) {
        const fallbackSteps = createFallbackProgressSteps({
          questionGroups,
          selectedAnswers,
          progressQuestionIds,
          activeQuestionId,
          totalQuestionCount: questionnaire.length,
        })

        return {
          steps: fallbackSteps,
          completedLeafCount: getCompletedLeafCount(fallbackSteps),
          totalLeafCount: getTotalLeafCount(fallbackSteps),
        }
      }

      return {
        steps,
        completedLeafCount: getCompletedLeafCount(steps),
        totalLeafCount: getTotalLeafCount(steps),
      }
    }

    if (targetType === 'learning_path' && learningPathDetail) {
      let questionCountUntilStep = 0
      const usedQuestionIds = new Set<string>()
      const orderedSteps = getOrderedItems(learningPathDetail.steps ?? [])
      const moduleDetails = learningPathDetail.module_details ?? []

      const steps: AssessmentProgressStep[] = orderedSteps
        .map((pathStep, stepIndex) => {
          const refId = getLearningPathStepRefId(pathStep)

          if (pathStep.type === 'module') {
            const moduleItem = moduleDetails.find(
              (item) => getBackendEntityId(item) === refId,
            )

            const learningUnits = moduleItem?.learning_units
              ? getOrderedItems(moduleItem.learning_units)
              : []

            let moduleQuestionCount = 0

            const subSteps = learningUnits
              .map((learningUnitReference, unitIndex) => {
                const learningUnitId =
                  getLearningUnitReferenceId(learningUnitReference)

                const questionIds = getQuestionIdsByLearningUnit(
                  questionnaire,
                  learningUnitId,
                )

                for (const questionId of questionIds) {
                  usedQuestionIds.add(questionId)
                }

                moduleQuestionCount += questionIds.length

                const unitTitle =
                  moduleItem?.learning_unit_details?.find(
                    (learningUnit) =>
                      getBackendEntityId(learningUnit) === learningUnitId,
                  )?.title ?? `Učna enota ${unitIndex + 1}`

                return {
                  id: learningUnitId,
                  title: unitTitle,
                  status: getLeafStatus(
                    questionIds,
                    selectedAnswers,
                    progressQuestionIds,
                    activeQuestionId,
                  ),
                  questionCount: questionIds.length,
                }
              })
              .filter((subStep) => subStep.questionCount > 0)
              .map(({ questionCount, ...subStep }) => subStep)

            questionCountUntilStep += moduleQuestionCount

            return {
              id: refId || `module_${stepIndex}`,
              label: `M${stepIndex + 1}`,
              title: moduleItem?.title ?? `Modul ${stepIndex + 1}`,
              status: getStepStatusFromChildren(
                subSteps.map((subStep) => subStep.status),
              ),
              subSteps,
              questionCountUntilStep: getQuestionProgressPosition(
                questionCountUntilStep,
                questionnaire.length,
              ),
              questionCount: moduleQuestionCount,
            }
          }

          const questionIds = getQuestionIdsByLearningUnit(questionnaire, refId)

          for (const questionId of questionIds) {
            usedQuestionIds.add(questionId)
          }

          questionCountUntilStep += questionIds.length

          const learningUnitTitle =
            learningPathDetail.learning_unit_details?.find(
              (learningUnit) => getBackendEntityId(learningUnit) === refId,
            )?.title ?? `Učna enota ${stepIndex + 1}`

          return {
            id: refId || `learning_unit_${stepIndex}`,
            label: String(stepIndex + 1),
            title: learningUnitTitle,
            status: getLeafStatus(
              questionIds,
              selectedAnswers,
              progressQuestionIds,
              activeQuestionId,
            ),
            questionCountUntilStep: getQuestionProgressPosition(
              questionCountUntilStep,
              questionnaire.length,
            ),
            questionCount: questionIds.length,
          }
        })
        .filter((step) => step.questionCount > 0)
        .map(({ questionCount, ...step }) => step)

      const unmatchedQuestions = questionnaire.filter(
        (question) => !usedQuestionIds.has(question.runtimeId),
      )

      if (unmatchedQuestions.length > 0) {
        const questionIds = unmatchedQuestions.map((question) => question.runtimeId)
        questionCountUntilStep += questionIds.length

        steps.push({
          id: 'learning_path_additional_questions',
          label: String(steps.length + 1),
          title: 'Dodatna vprašanja',
          status: getLeafStatus(
            questionIds,
            selectedAnswers,
            progressQuestionIds,
            activeQuestionId,
          ),
          questionCountUntilStep: getQuestionProgressPosition(
            questionCountUntilStep,
            questionnaire.length,
          ),
        })
      }

      if (steps.length === 0) {
        const fallbackSteps = createFallbackProgressSteps({
          questionGroups,
          selectedAnswers,
          progressQuestionIds,
          activeQuestionId,
          totalQuestionCount: questionnaire.length,
        })

        return {
          steps: fallbackSteps,
          completedLeafCount: getCompletedLeafCount(fallbackSteps),
          totalLeafCount: getTotalLeafCount(fallbackSteps),
        }
      }

      return {
        steps,
        completedLeafCount: getCompletedLeafCount(steps),
        totalLeafCount: getTotalLeafCount(steps),
      }
    }

    const fallbackSteps = createFallbackProgressSteps({
      questionGroups,
      selectedAnswers,
      progressQuestionIds,
      activeQuestionId,
      totalQuestionCount: questionnaire.length,
    })

    return {
      steps: fallbackSteps,
      completedLeafCount: getCompletedLeafCount(fallbackSteps),
      totalLeafCount: getTotalLeafCount(fallbackSteps),
    }
  }, [
    activeQuestionIndex,
    currentQuestion?.runtimeId,
    learningPathDetail,
    moduleDetail,
    phase,
    questionGroups,
    questionnaire,
    selectedAnswers,
    targetType,
    visibleQuestionIds,
  ])

  const hasAnsweredEveryLearningPathQuestionWithYes = useMemo(() => {
    if (targetType !== 'learning_path' || questionnaire.length === 0) {
      return false
    }

    return questionnaire.every(
      (question) => selectedAnswers[question.runtimeId]?.weight === true,
    )
  }, [questionnaire, selectedAnswers, targetType])

  const isLearningPathGoalReached =
    targetType === 'learning_path' &&
    phase === 'completed' &&
    hasAnsweredEveryLearningPathQuestionWithYes

  const currentLabel = assessmentCopy.questionnaire.label
  const currentTitle =
    phase === 'completed'
      ? 'Cilj učne poti je dosežen'
      : currentQuestion?.question ?? 'Vprašalnik se nalaga ...'

  const currentDescription =
    phase === 'completed'
      ? 'Odgovori so bili shranjeni. Preusmerjamo vas nazaj na podrobnosti.'
      : assessmentCopy.questionnaire.description

  const canGoPrevious =
    phase === 'completed' ||
    (phase === 'questionnaire' && activeQuestionIndex > 0)

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
    setAssistantExchange(null)
  }, [currentQuestion?.runtimeId, targetId, targetType])

  useEffect(() => {
    let isActive = true

    async function loadQuestionnaire() {
      if (!targetType || !targetId) {
        setError(
          'Manjka target_type ali target_id. Primer: /assessment?target_type=module&target_id=mod_001',
        )
        setModuleDetail(null)
        setLearningPathDetail(null)
        setIsLoadingQuestionnaire(false)
        return
      }

      try {
        setIsLoadingQuestionnaire(true)
        setError(null)
        setModuleDetail(null)
        setLearningPathDetail(null)
        setAssistantExchange(null)

        const data = await getQuestionnaire(targetType, targetId, userId)

        let nextModuleDetail: ModuleDetailResponse | null = null
        let nextLearningPathDetail: LearningPathDetailResponse | null = null

        if (targetType === 'module') {
          try {
            nextModuleDetail = await getModuleDetail(targetId)
          } catch (detailError) {
            console.warn('Module detail ni bil naložen.', detailError)
          }
        }

        if (targetType === 'learning_path') {
          try {
            nextLearningPathDetail = await getLearningPathDetail(targetId)
          } catch (detailError) {
            console.warn('Learning path detail ni bil naložen.', detailError)
          }
        }

        const normalizedData = normalizeQuestionnaireResponse(
          data,
          targetType,
          targetId,
        )

        const questions = normalizedData.questions.map((question, index) => ({
          ...question,
          runtimeId: `${question.id}_${index}`,
          answers: yesNoAnswers,
        })) as QuestionnaireItem[]

        if (!isActive) {
          return
        }

        setQuestionnaireTitle(
          normalizedData.title ?? createFallbackTitle(targetType, targetId),
        )
        setQuestionnaire(questions)
        setVisibleQuestionIds(questions[0] ? [questions[0].runtimeId] : [])
        setActiveQuestionIndex(0)
        setSelectedAnswers(createInitialSelectedAnswers(questions))
        setModuleDetail(nextModuleDetail)
        setLearningPathDetail(nextLearningPathDetail)
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
  }, [targetType, targetId, userId])

  useEffect(() => {
    if (!isLearningPathGoalReached || !targetType || !targetId) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigate(getTargetDetailPath(targetType, targetId))
    }, 2200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isLearningPathGoalReached, navigate, targetId, targetType])

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

      nextAnswers[currentQuestion.runtimeId] = answer
      return nextAnswers
    })

    setVisibleQuestionIds((currentQuestionIds) =>
      currentQuestionIds.slice(0, activeQuestionIndex + 1),
    )
  }

  function shouldShowLearningPathCompletion(questionIdsToSubmit: string[]) {
    return (
      targetType === 'learning_path' &&
      questionIdsToSubmit.length === questionnaire.length &&
      questionIdsToSubmit.every(
        (questionId) => selectedAnswers[questionId]?.weight === true,
      )
    )
  }

  async function submitAssessment(questionIdsToSubmit: string[]) {
    if (!targetType || !targetId) {
      setError('Manjka cilj vprašalnika.')
      return
    }

    setIsSubmittingAssessment(true)
    setError(null)

    try {
      const answers = createAnswerPayload(
        questionIdsToSubmit,
        questionById,
        selectedAnswers,
        targetType,
        targetId,
      )

      const payload: AssessmentEvaluateRequest = {
        user_id: assessmentUserId,
        target_type: targetType,
        target_id: targetId,
        answers,
      }

      const result = await evaluateAssessment(payload)

      saveAssessmentResult(targetType, targetId, result)

      if (shouldShowLearningPathCompletion(questionIdsToSubmit)) {
        setVisibleQuestionIds(questionnaire.map((question) => question.runtimeId))
        setActiveQuestionIndex(Math.max(questionnaire.length - 1, 0))
        setPhase('completed')
        return
      }

      navigate(getTargetDetailPath(targetType, targetId))
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
    !targetType ||
    !targetId
  ) {
    return
  }

  const questionIdsUntilCurrent = visibleQuestionIds.slice(
    0,
    activeQuestionIndex + 1,
  )

  const followingQuestion =
    selectedAnswer.weight === false
      ? getNextQuestionAfterNegativeAnswer({
          questions: questionnaire,
          currentQuestion,
          groups: questionGroups,
          selectedAnswers,
          targetType,
          targetId,
          confirmedQuestionIds: questionIdsUntilCurrent,
        })
      : getNextEligibleQuestion({
          questions: questionnaire,
          currentQuestion,
          groups: questionGroups,
          selectedAnswers,
          targetType,
          targetId,
          confirmedQuestionIds: questionIdsUntilCurrent,
        })

  if (!followingQuestion) {
    await submitAssessment(questionIdsUntilCurrent)
    return
  }

  setVisibleQuestionIds([
    ...questionIdsUntilCurrent,
    followingQuestion.runtimeId,
  ])
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
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12">
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">Napaka</h1>
          <p className="mt-4 text-slate-700">{error}</p>
        </section>
      </main>
    )
  }

  if (isLoadingQuestionnaire) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12">
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">Nalaganje vprašalnika ...</p>
        </section>
      </main>
    )
  }

  if (questionnaire.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12">
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">Ta cilj trenutno nima vprašanj.</p>
        </section>
      </main>
    )
  }

  return (
    <AssessmentLayout
      imageSrc={womanImage}
      defaultNote="Odgovorite na kratka vprašanja, da lahko pripravimo priporočilo."
      phase={phase}
      selectedGroup={selectedGroup}
      currentQuestion={currentQuestion}
      selectedAnswer={selectedAnswer}
    >
      <AssessmentHeader
        label={currentLabel}
        currentQuestion={currentQuestion ?? null}
        isVoiceSupportDisabled={phase !== 'questionnaire'}
      />

      <AssessmentIntro title={currentTitle} description={currentDescription} />

      {targetType && (
        <AssessmentProgress
          targetLabel={questionnaireTitle || getTargetTypeLabel(targetType)}
          steps={assessmentProgress.steps}
          completedLeafCount={assessmentProgress.completedLeafCount}
          totalLeafCount={assessmentProgress.totalLeafCount}
          isGoalReached={isLearningPathGoalReached}
          questionCount={questionnaire.length}
          confirmedQuestionCount={confirmedQuestionCount}
          showGoalFlag={targetType === 'learning_path'}
        />
      )}

      {phase === 'questionnaire' && currentQuestion && (
        <>
          <QuestionnaireQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
          />

          {skipNotice && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {skipNotice}
            </p>
          )}

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
          <section className="mt-6 rounded-3xl bg-white/80 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#31583b]">
              Odlično, cilj je dosežen.
            </h2>
            <p className="mt-3 text-slate-700">
              Vprašalnik kaže, da trenutno že obvladate celotno učno pot.
              Preusmeritev na podrobnosti se bo izvedla samodejno.
            </p>
          </section>

          <AssessmentActions
            canGoPrevious={canGoPrevious}
            canGoNext={false}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            nextLabel="Zaključeno"
          />
        </>
      )}

      {targetType && targetId && userId && currentQuestion && (
        <>
          <button
            type="button"
            onClick={() => {
              setIsChatOpen((value) => {
                const nextValue = !value

                if (!nextValue) {
                  setAssistantExchange(null)
                }

                return nextValue
              })
            }}
            className="mt-6 rounded-full bg-[#31583b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25442d]"
          >
            {isChatOpen ? 'Skrij pomočnika' : 'Vprašaj pomočnika'}
          </button>

          {assistantExchange && (
            <section className="mt-4 rounded-3xl bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#31583b]">
                Asistentka je odgovorila:
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {assistantExchange.answer}
              </p>
            </section>
          )}

          {isChatOpen && (
            <AssessmentContextBox
              userId={userId}
              targetType={targetType}
              targetId={targetId}
              learningPathId={
                targetType === 'learning_path'
                  ? targetId
                  : currentQuestion.learning_path_id ?? ''
              }
              moduleId={
                targetType === 'module'
                  ? targetId
                  : currentQuestion.module_id ?? undefined
              }
              learningUnitId={
                targetType === 'learning_unit'
                  ? targetId
                  : currentQuestion.learning_unit_id ?? undefined
              }
              questionId={currentQuestion.id}
              questionText={currentQuestion.question}
              answerOptions={currentQuestion.answers.map((answer) => answer.answer)}
              onActiveExchangeChange={setAssistantExchange}
            />
          )}
        </>
      )}
    </AssessmentLayout>
  )
}

export default QuestionnairePage