import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import womanImage from '../../assets/woman.webp'
import { usePageTitle } from '../../hooks/usePageTitle'
import AssessmentActions from '../../features/questionnaire/components/AssessmentActions'
import AssessmentContextBox, {
  type AssessmentAssistantDisplayExchange,
} from '../../features/questionnaire/components/AssessmentContextBox'
import AssessmentHeader from '../../features/questionnaire/components/AssessmentHeader'
import AssessmentIntro from '../../features/questionnaire/components/AssessmentIntro'
import AssessmentLayout from '../../features/questionnaire/components/AssessmentLayout'
import AssessmentProgress, {
  type AssessmentProgressQuestion,
  type AssessmentProgressQuestionStatus,
  type AssessmentProgressStep,
  type AssessmentProgressStepStatus,
} from '../../features/questionnaire/components/AssessmentProgress'
import QuestionnaireQuestion from '../../features/questionnaire/components/QuestionnaireQuestion'
import { assessmentCopy } from '../../features/questionnaire/utils/assessmentSteps'

import { useAuth } from '../../features/auth/hooks/useAuth'
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
  id: string
  contentType: 'learning_path' | 'module' | 'learning_unit' | 'question'
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
const GUEST_QUESTIONNAIRE_ANSWERS_KEY_PREFIX = 'nidiko_guest_questionnaire_answers'

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
  storedAnswers: Record<string, boolean> = {},
): Record<string, AnswerOption> {
  const initialAnswers: Record<string, AnswerOption> = {}

  for (const question of questions) {
    const prefilledAnswer = getAnswerOptionFromBackendQuestion(question)

    if (prefilledAnswer) {
      initialAnswers[question.runtimeId] = prefilledAnswer
    }

    const storedAnswer = storedAnswers[question.runtimeId]

    if (storedAnswer === true) {
      initialAnswers[question.runtimeId] = yesNoAnswers[0]
    }

    if (storedAnswer === false) {
      initialAnswers[question.runtimeId] = yesNoAnswers[1]
    }
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


function getLearningUnitReferenceId(reference: LearningUnitReferenceResponse) {
  return reference.learning_unit_id
}

function getLearningPathStepRefId(step: LearningPathStepReference) {
  return step.ref_id ?? step.module_id ?? step.learning_unit_id ?? ''
}

function getQuestionGroupInfo(
  question: QuestionnaireItem,
  targetType: QuestionnaireTargetType | null,
): QuestionGroup {
  const source = getQuestionSources(question)[0]

  if (targetType === 'learning_path') {
    const moduleId = source?.module_id ?? question.module_id ?? null

    if (moduleId) {
      return {
        id: moduleId,
        contentType: 'module',
        questions: [],
      }
    }

    const learningUnitId =
      source?.learning_unit_id ?? question.learning_unit_id ?? null

    if (learningUnitId) {
      return {
        id: learningUnitId,
        contentType: 'learning_unit',
        questions: [],
      }
    }

    const learningPathId =
      source?.learning_path_id ?? question.learning_path_id ?? null

    if (learningPathId) {
      return {
        id: learningPathId,
        contentType: 'learning_path',
        questions: [],
      }
    }
  }

  const learningUnitId =
    source?.learning_unit_id ?? question.learning_unit_id ?? null

  if (learningUnitId) {
    return {
      id: learningUnitId,
      contentType: 'learning_unit',
      questions: [],
    }
  }

  return {
    id: `question_${question.runtimeId}`,
    contentType: 'question',
    questions: [],
  }
}

function groupQuestionsByQuestionnaireTarget(
  questions: QuestionnaireItem[],
  targetType: QuestionnaireTargetType | null,
): QuestionGroup[] {
  const groups: QuestionGroup[] = []
  const groupIndexesById = new Map<string, number>()

  for (const question of questions) {
    const groupInfo = getQuestionGroupInfo(question, targetType)
    const existingGroupIndex = groupIndexesById.get(groupInfo.id)

    if (existingGroupIndex !== undefined) {
      groups[existingGroupIndex].questions.push(question)
      continue
    }

    groupIndexesById.set(groupInfo.id, groups.length)
    groups.push({
      ...groupInfo,
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

function getQuestionParallelGroupKey(question: QuestionnaireItem) {
  const source = getQuestionSources(question)[0]

  const parallelGroup =
    source?.parallel_group ?? question.parallel_group ?? null

  if (!parallelGroup) {
    return null
  }

  const learningPathId =
    source?.learning_path_id ?? question.learning_path_id ?? 'no_learning_path'

  const order = source?.order ?? question.order ?? 'no_order'

  return `${learningPathId}::${order}::${parallelGroup}`
}

function getGroupParallelGroupKey(group: QuestionGroup) {
  const firstQuestion = group.questions[0]

  if (!firstQuestion) {
    return null
  }

  return getQuestionParallelGroupKey(firstQuestion)
}

function getFirstQuestionOfNextParallelGroupMember(params: {
  groups: QuestionGroup[]
  currentGroupIndex: number
  parallelGroupKey: string
}) {
  const { groups, currentGroupIndex, parallelGroupKey } = params

  for (
    let groupIndex = currentGroupIndex + 1;
    groupIndex < groups.length;
    groupIndex += 1
  ) {
    const group = groups[groupIndex]
    const groupParallelGroupKey = getGroupParallelGroupKey(group)

    if (groupParallelGroupKey === parallelGroupKey) {
      return group.questions[0] ?? null
    }

    return null
  }

  return null
}

function hasConfirmedNegativeAnswerInParallelGroup(params: {
  groups: QuestionGroup[]
  selectedAnswers: Record<string, AnswerOption>
  confirmedQuestionIds: string[]
  parallelGroupKey: string
}) {
  const {
    groups,
    selectedAnswers,
    confirmedQuestionIds,
    parallelGroupKey,
  } = params

  const confirmedQuestionIdSet = new Set(confirmedQuestionIds)

  return groups.some((group) => {
    if (getGroupParallelGroupKey(group) !== parallelGroupKey) {
      return false
    }

    return group.questions.some(
      (question) =>
        confirmedQuestionIdSet.has(question.runtimeId) &&
        selectedAnswers[question.runtimeId]?.weight === false,
    )
  })
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
    currentQuestion,
    groups,
    selectedAnswers,
    targetType,
    confirmedQuestionIds,
  } = params

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

  const nextGroupFirstQuestion = getFirstQuestionOfNextGroup(
    groups,
    position.groupIndex,
  )

  if (targetType === 'learning_unit') {
    return nextGroupFirstQuestion
  }

  const currentParallelGroupKey = getGroupParallelGroupKey(currentGroup)

  if (!currentParallelGroupKey) {
    return nextGroupFirstQuestion
  }

  const nextGroup = groups[position.groupIndex + 1]
  const nextGroupParallelGroupKey = nextGroup
    ? getGroupParallelGroupKey(nextGroup)
    : null

  if (nextGroupParallelGroupKey === currentParallelGroupKey) {
    return nextGroup?.questions[0] ?? null
  }

  const hasNegativeAnswerInCurrentParallelGroup =
    hasConfirmedNegativeAnswerInParallelGroup({
      groups,
      selectedAnswers,
      confirmedQuestionIds,
      parallelGroupKey: currentParallelGroupKey,
    })

  if (hasNegativeAnswerInCurrentParallelGroup) {
    return null
  }

  return nextGroupFirstQuestion
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
  const { currentQuestion, groups, targetType } = params

  if (targetType === 'learning_unit') {
    return getNextQuestion({
      currentQuestion,
      groups,
    })
  }

  const position = findQuestionPosition(groups, currentQuestion.runtimeId)

  if (!position) {
    return null
  }

  const currentGroup = groups[position.groupIndex]
  const currentParallelGroupKey = getGroupParallelGroupKey(currentGroup)

  if (!currentParallelGroupKey) {
    return null
  }

  return getFirstQuestionOfNextParallelGroupMember({
    groups,
    currentGroupIndex: position.groupIndex,
    parallelGroupKey: currentParallelGroupKey,
  })
}

function getQuestionIdsRejectedByCurrentNegativeAnswer(params: {
  currentQuestion: QuestionnaireItem
  groups: QuestionGroup[]
}) {
  const { currentQuestion, groups } = params

  const position = findQuestionPosition(groups, currentQuestion.runtimeId)

  if (!position) {
    return [currentQuestion.runtimeId]
  }

  const currentGroup = groups[position.groupIndex]

  return currentGroup.questions
    .slice(position.questionIndex)
    .map((question) => question.runtimeId)
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

function createAnswerPayloadWithRejectedQuestions(
  questionIds: string[],
  questionById: Map<string, QuestionnaireItem>,
  selectedAnswers: Record<string, AnswerOption>,
  rejectedQuestionIds: Set<string>,
  targetType: QuestionnaireTargetType,
  targetId: string,
): QuestionnaireAnswerRequest[] {
  return questionIds
    .map((questionId) => {
      const question = questionById.get(questionId)

      if (!question) {
        return null
      }

      const selectedAnswer = selectedAnswers[questionId]

      if (!selectedAnswer && !rejectedQuestionIds.has(questionId)) {
        return null
      }

      return createQuestionnaireAnswerRequest(
        question,
        selectedAnswer ? selectedAnswer.weight : false,
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
function getGuestQuestionnaireAnswersStorageKey(
  targetType: QuestionnaireTargetType,
  targetId: string,
) {
  return `${GUEST_QUESTIONNAIRE_ANSWERS_KEY_PREFIX}_${targetType}_${targetId}`
}

function getGuestQuestionnaireAnswers(
  targetType: QuestionnaireTargetType,
  targetId: string,
): Record<string, boolean> {
  const storage = getSessionStorage()

  if (!storage) {
    return {}
  }

  const storedValue = storage.getItem(
    getGuestQuestionnaireAnswersStorageKey(targetType, targetId),
  )

  if (!storedValue) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(storedValue)

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    return parsedValue as Record<string, boolean>
  } catch {
    return {}
  }
}

function saveGuestQuestionnaireAnswer(
  targetType: QuestionnaireTargetType,
  targetId: string,
  questionId: string,
  answer: boolean,
) {
  const storage = getSessionStorage()

  if (!storage) {
    return
  }

  const storageKey = getGuestQuestionnaireAnswersStorageKey(targetType, targetId)
  const currentAnswers = getGuestQuestionnaireAnswers(targetType, targetId)

  storage.setItem(
    storageKey,
    JSON.stringify({
      ...currentAnswers,
      [questionId]: answer,
    }),
  )
}

function removeGuestQuestionnaireAnswers(
  targetType: QuestionnaireTargetType,
  targetId: string,
  questionIds: string[],
) {
  const storage = getSessionStorage()

  if (!storage || questionIds.length === 0) {
    return
  }

  const storageKey = getGuestQuestionnaireAnswersStorageKey(targetType, targetId)
  const currentAnswers = getGuestQuestionnaireAnswers(targetType, targetId)

  for (const questionId of questionIds) {
    delete currentAnswers[questionId]
  }

  storage.setItem(storageKey, JSON.stringify(currentAnswers))
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

function getQuestionProgressPosition(
  questionCountUntilStep: number,
  totalQuestionCount: number,
) {
  if (totalQuestionCount <= 0) {
    return 0
  }

  return Math.min(totalQuestionCount, Math.max(0, questionCountUntilStep))
}

function createRuntimeIdSet(questionIds: string[]) {
  return new Set(questionIds)
}

function mergeQuestionIds(...questionIdGroups: string[][]) {
  return Array.from(new Set(questionIdGroups.flat()))
}

function getLeafStatus(
  questionIds: string[],
  questionProgressById: Map<string, AssessmentProgressQuestionStatus>,
): AssessmentProgressStepStatus {
  const statuses = questionIds.map(
    (questionId) => questionProgressById.get(questionId) ?? 'upcoming',
  )

  if (statuses.includes('rejected')) {
    return 'rejected'
  }

  if (statuses.includes('active')) {
    return 'active'
  }

  const isCompleted =
    statuses.length > 0 && statuses.every((status) => status === 'completed')

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

  if (childStatuses.includes('rejected')) {
    return 'rejected'
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
        step.subSteps.filter(
          (subStep) =>
            subStep.status === 'completed' || subStep.status === 'rejected',
        ).length
      )
    }

    return count + (step.status === 'completed' || step.status === 'rejected' ? 1 : 0)
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
  questionProgressById: Map<string, AssessmentProgressQuestionStatus>
  totalQuestionCount: number
}) {
  const {
    questionGroups,
    questionProgressById,
    totalQuestionCount,
  } = params

  let questionCountUntilStep = 0

  return questionGroups.map((group, groupIndex) => {
    const questionIds = group.questions.map((question) => question.runtimeId)
    questionCountUntilStep += questionIds.length

    return {
      id: group.id,
      label: String(groupIndex + 1),
      title:
        group.contentType === 'module'
          ? `Modul ${groupIndex + 1}`
          : group.contentType === 'learning_unit'
            ? `Učna enota ${groupIndex + 1}`
            : group.contentType === 'learning_path'
              ? `Učna pot ${groupIndex + 1}`
              : `Vprašanje ${groupIndex + 1}`,
      status: getLeafStatus(questionIds, questionProgressById),
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
  usePageTitle("Vprašalnik")
  const [phase, setPhase] = useState<AssessmentPhase>('questionnaire')
  const [questionnaireTitle, setQuestionnaireTitle] = useState('')
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>([])
  const [visibleQuestionIds, setVisibleQuestionIds] = useState<string[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, AnswerOption>
  >({})
  const [rejectedQuestionIds, setRejectedQuestionIds] = useState<Set<string>>(
    () => new Set(),
  )
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
    () => groupQuestionsByQuestionnaireTarget(questionnaire, targetType),
    [questionnaire, targetType],
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

  const currentRejectedQuestionIdsPreview = useMemo(() => {
    if (
      phase !== 'questionnaire' ||
      !currentQuestion ||
      selectedAnswer?.weight !== false ||
      targetType === 'learning_unit'
    ) {
      return new Set<string>()
    }

    return createRuntimeIdSet(
      getQuestionIdsRejectedByCurrentNegativeAnswer({
        currentQuestion,
        groups: questionGroups,
      }),
    )
  }, [
    currentQuestion,
    phase,
    questionGroups,
    selectedAnswer?.weight,
    targetType,
  ])

  const questionProgress = useMemo<AssessmentProgressQuestion[]>(() => {
    const confirmedQuestionIds =
      phase === 'completed'
        ? questionnaire.map((question) => question.runtimeId)
        : visibleQuestionIds.slice(0, activeQuestionIndex)

    const confirmedQuestionIdSet = createRuntimeIdSet(confirmedQuestionIds)

    const rejectedQuestionIdSet = new Set([
      ...Array.from(rejectedQuestionIds),
      ...Array.from(currentRejectedQuestionIdsPreview),
    ])

    return questionnaire.map((question) => {
      const isActiveQuestion =
        phase === 'questionnaire' &&
        currentQuestion?.runtimeId === question.runtimeId

      const selectedAnswerForQuestion = selectedAnswers[question.runtimeId]

      if (rejectedQuestionIdSet.has(question.runtimeId)) {
        return {
          id: question.runtimeId,
          status: 'rejected',
        }
      }

      if (isActiveQuestion && selectedAnswerForQuestion?.weight === false) {
        return {
          id: question.runtimeId,
          status: 'rejected',
        }
      }

      if (isActiveQuestion && selectedAnswerForQuestion?.weight === true) {
        return {
          id: question.runtimeId,
          status: 'completed',
        }
      }

      if (confirmedQuestionIdSet.has(question.runtimeId)) {
        if (selectedAnswerForQuestion?.weight === false) {
          return {
            id: question.runtimeId,
            status: 'rejected',
          }
        }

        if (selectedAnswerForQuestion?.weight === true) {
          return {
            id: question.runtimeId,
            status: 'completed',
          }
        }
      }

      if (isActiveQuestion) {
        return {
          id: question.runtimeId,
          status: 'active',
        }
      }

      return {
        id: question.runtimeId,
        status: 'upcoming',
      }
    })
  }, [
    activeQuestionIndex,
    currentQuestion?.runtimeId,
    currentRejectedQuestionIdsPreview,
    phase,
    questionnaire,
    rejectedQuestionIds,
    selectedAnswers,
    visibleQuestionIds,
  ])

  const questionProgressById = useMemo(
    () =>
      new Map(
        questionProgress.map((question) => [question.id, question.status] as const),
      ),
    [questionProgress],
  )

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
      ? selectedAnswer.weight === false && targetType !== 'learning_unit'
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
      selectedAnswer?.weight === false &&
      targetType !== 'learning_unit'
      ? nextQuestion
        ? 'Nadaljevali bomo z vprašanji, ki se bolje ujemajo z vašim trenutnim znanjem.'
        : 'Vprašalnik lahko zdaj zaključite.'
      : null

  const confirmedQuestionCount =
    phase === 'completed'
      ? questionnaire.length
      : Math.min(Math.max(activeQuestionIndex, 0), questionnaire.length)

  const assessmentProgress = useMemo(() => {
    if (targetType === 'learning_unit') {
      let questionCountUntilStep = 0

      const steps: AssessmentProgressStep[] = questionnaire.map(
        (question, index) => {
          questionCountUntilStep += 1

          return {
            id: question.runtimeId,
            label: String(index + 1),
            title: `Vprašanje ${index + 1}`,
            status: getLeafStatus([question.runtimeId], questionProgressById),
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
            status: getLeafStatus(questionIds, questionProgressById),
            questionCountUntilStep: getQuestionProgressPosition(
              questionCountUntilStep,
              questionnaire.length,
            ),
            questionCount: questionIds.length,
          }
        })
        .filter((step) => step.questionCount > 0)
        .map(({ questionCount: _questionCount, ...step }) => {
          void _questionCount
          return step
        })

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
          status: getLeafStatus(questionIds, questionProgressById),
          questionCountUntilStep: getQuestionProgressPosition(
            questionCountUntilStep,
            questionnaire.length,
          ),
        })
      }

      if (steps.length === 0) {
        const fallbackSteps = createFallbackProgressSteps({
          questionGroups,
          questionProgressById,
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
                  status: getLeafStatus(questionIds, questionProgressById),
                  questionCount: questionIds.length,
                }
              })
              .filter((subStep) => subStep.questionCount > 0)
              .map(({ questionCount: _questionCount, ...subStep }) => subStep)

            questionCountUntilStep += moduleQuestionCount

            return {
              id: refId || `module_${stepIndex}`,
              label: `M${stepIndex + 1}`,
              title: moduleItem?.title ?? `Modul ${stepIndex + 1}`,
              status: getStepStatusFromChildren(
                subSteps.map((subStep) => subStep.status),
              ),
              subSteps,
              variant: 'module' as const,
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
            label: `UE${stepIndex + 1}`,
            title: learningUnitTitle,
            status: getLeafStatus(questionIds, questionProgressById),
            variant: 'learning-unit' as const,
            questionCountUntilStep: getQuestionProgressPosition(
              questionCountUntilStep,
              questionnaire.length,
            ),
            questionCount: questionIds.length,
          }
        })
        .filter((step) => step.questionCount > 0)
        .map(({ questionCount: _questionCount, ...step }) => {
          void _questionCount
          return step
        })

      const unmatchedQuestions = questionnaire.filter(
        (question) => !usedQuestionIds.has(question.runtimeId),
      )

      if (unmatchedQuestions.length > 0) {
        const questionIds = unmatchedQuestions.map((question) => question.runtimeId)
        questionCountUntilStep += questionIds.length

        steps.push({
          id: 'learning_path_additional_questions',
          label: `UE${steps.length + 1}`,
          variant: 'learning-unit',
          title: 'Dodatna vprašanja',
          status: getLeafStatus(questionIds, questionProgressById),
          questionCountUntilStep: getQuestionProgressPosition(
            questionCountUntilStep,
            questionnaire.length,
          ),
        })
      }

      if (steps.length === 0) {
        const fallbackSteps = createFallbackProgressSteps({
          questionGroups,
          questionProgressById,
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
      questionProgressById,
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
      ? 'Naslednjo → '
      : 'Zaključi → '

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
        const storedGuestAnswers = userId
          ? {}
          : getGuestQuestionnaireAnswers(targetType, targetId)

        setSelectedAnswers(createInitialSelectedAnswers(questions, storedGuestAnswers))
        setRejectedQuestionIds(new Set())
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
    if (!currentQuestion || !targetType || !targetId) {
      return
    }

    const questionIdsToClear = visibleQuestionIds.slice(activeQuestionIndex + 1)

    const questionIdsRejectedByCurrentQuestion =
      getQuestionIdsRejectedByCurrentNegativeAnswer({
        currentQuestion,
        groups: questionGroups,
      })

    const rejectedQuestionIdsToClear = new Set([
      ...questionIdsToClear,
      ...questionIdsRejectedByCurrentQuestion,
    ])

    if (!userId) {
      removeGuestQuestionnaireAnswers(
        targetType,
        targetId,
        Array.from(rejectedQuestionIdsToClear).filter(
          (questionId) => questionId !== currentQuestion.runtimeId,
        ),
      )

      saveGuestQuestionnaireAnswer(
        targetType,
        targetId,
        currentQuestion.runtimeId,
        answer.weight,
      )
    }

    setSelectedAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers }

      for (const questionId of questionIdsToClear) {
        delete nextAnswers[questionId]
      }

      nextAnswers[currentQuestion.runtimeId] = answer

      return nextAnswers
    })

    setRejectedQuestionIds((currentRejectedQuestionIds) => {
      const nextRejectedQuestionIds = new Set(currentRejectedQuestionIds)

      for (const questionId of rejectedQuestionIdsToClear) {
        nextRejectedQuestionIds.delete(questionId)
      }

      return nextRejectedQuestionIds
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

  async function submitAssessment(
    questionIdsToSubmit: string[],
    rejectedQuestionIdsToSubmit = rejectedQuestionIds,
  ) {
    if (!targetType || !targetId) {
      setError('Manjka cilj vprašalnika.')
      return
    }

    setIsSubmittingAssessment(true)
    setError(null)

    try {
      const answers = createAnswerPayloadWithRejectedQuestions(
        questionIdsToSubmit,
        questionById,
        selectedAnswers,
        rejectedQuestionIdsToSubmit,
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

    const questionIdsRejectedByCurrentNo =
      selectedAnswer.weight === false && targetType !== 'learning_unit'
        ? getQuestionIdsRejectedByCurrentNegativeAnswer({
          currentQuestion,
          groups: questionGroups,
        })
        : []

    const nextRejectedQuestionIds = new Set(rejectedQuestionIds)

    for (const questionId of questionIdsRejectedByCurrentNo) {
      nextRejectedQuestionIds.add(questionId)
    }

    const followingQuestion =
      selectedAnswer.weight === false && targetType !== 'learning_unit'
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
      const questionIdsToSubmit = mergeQuestionIds(
        questionIdsUntilCurrent,
        Array.from(nextRejectedQuestionIds),
      )

      await submitAssessment(questionIdsToSubmit, nextRejectedQuestionIds)
      return
    }

    setRejectedQuestionIds(nextRejectedQuestionIds)

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


  const assistantBox =
  targetType && targetId && currentQuestion && isChatOpen ? (
    <AssessmentContextBox
      userId={assessmentUserId}
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
  ) : null

  const desktopAssistantPanel =
    targetType && targetId && currentQuestion ? (
      <AssessmentContextBox
        variant="visual"
        userId={assessmentUserId}
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
    ) : null


  return (
    <>
      <AssessmentLayout
        imageSrc={womanImage}
        defaultNote="Odgovorite na kratka vprašanja, da lahko pripravimo priporočilo."
        phase={phase}
        selectedGroup={selectedGroup}
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        assistantExchange={assistantExchange}
        assistantPanel={desktopAssistantPanel}
      >
        <AssessmentHeader
          label={currentLabel}
          currentQuestion={currentQuestion ?? null}
          isVoiceSupportDisabled={phase !== 'questionnaire'}
        />

        <AssessmentIntro title={currentTitle} description={currentDescription} />

        {targetType && (
          <AssessmentProgress
            targetLabel={getTargetTypeLabel(targetType)}
            steps={assessmentProgress.steps}
            completedLeafCount={assessmentProgress.completedLeafCount}
            totalLeafCount={assessmentProgress.totalLeafCount}
            isGoalReached={isLearningPathGoalReached}
            questionCount={questionnaire.length}
            confirmedQuestionCount={confirmedQuestionCount}
            questions={questionProgress}
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

        {targetType && targetId && currentQuestion && (
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
              className="assessment-assistant-mobile-toggle mt-6 rounded-full bg-[#31583b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25442d]"
            >
              {isChatOpen ? 'Skrij pomočnika' : 'Vprašaj pomočnika'}
            </button>

            <div className="assessment-assistant-inline">
              {assistantBox}
            </div>
          </>
        )}
      </AssessmentLayout>
    </>
  )
}

export default QuestionnairePage






