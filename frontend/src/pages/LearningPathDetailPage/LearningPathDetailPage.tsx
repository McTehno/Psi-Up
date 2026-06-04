import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleHelp, ExternalLink } from 'lucide-react'

import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import AuthRequiredDialog from '../../components/common/AuthRequiredDialog'
import { DetailTags } from '../../components/detail'
import {
  LearningPathMountain,
  LearningPathOverviewCard,
  type LearningPathMountainNode,
} from '../../features/learning-paths/components/LearningPathMountain'
import LearningPathAssistantBox from '../../features/learning-paths/components/LearningPathAssistantBox'
import { useUserProgressActions } from '../../hooks/useUserProgressActions'
import { useUserProgressState } from '../../hooks/useUserProgressState'
import { getSessionAssessmentResult } from '../../services/assessment-session-service'
import { getLearningPathDetail } from '../../services/learning-path-service'
import type {
  AssessmentResultResponse,
  AssessmentStatus,
} from '../../types/assessment'
import type {
  LearningPathDetailResponse,
  LearningPathStepResponse,
} from '../../types/learning-path'
import type { LearningUnitResponse } from '../../types/learning-unit'
import type { ModuleDetailResponse } from '../../types/module'

const MAX_VISIBLE_NODES = 7

type BackendEntity = {
  id?: string
  _id?: string
}

type LearningPathDisplayNodeKind = 'module' | 'learning_unit'

type LearningPathDisplayStep = LearningPathStepResponse & {
  type?: string | null
  step_type?: string | null
  ref_id?: string | null
  module_id?: string | null
  learning_unit_id?: string | null
}

type LearningUnitAwareLearningPath = LearningPathDetailResponse & {
  learning_unit_details?: LearningUnitResponse[]
}

function getBackendEntityId(entity: BackendEntity | null | undefined) {
  return entity?.id ?? entity?._id
}

function getTextOrFallback(
  value: string | null | undefined,
  fallback: string,
) {
  return value?.trim() || fallback
}

function getStringArrayOrEmpty(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getLearningPathSteps(learningPath: LearningPathDetailResponse) {
  return Array.isArray(learningPath.steps)
    ? (learningPath.steps as LearningPathDisplayStep[])
    : []
}

function isLearningUnitStepKind(value: unknown) {
  const normalized = String(value ?? '')
    .toLowerCase()
    .replace('-', '_')

  return normalized === 'learning_unit' || normalized === 'unit'
}

function getLearningPathStepKind(
  step: LearningPathDisplayStep,
): LearningPathDisplayNodeKind {
  return isLearningUnitStepKind(step.step_type ?? step.type)
    ? 'learning_unit'
    : 'module'
}

function getLearningPathStepNodeId(step: LearningPathDisplayStep) {
  const kind = getLearningPathStepKind(step)

  if (kind === 'learning_unit') {
    return step.learning_unit_id ?? step.ref_id ?? null
  }

  return step.module_id ?? step.ref_id ?? null
}

function getNodeKey(kind: LearningPathDisplayNodeKind, id: string) {
  return `${kind}:${id}`
}

function getStepOrder(step: LearningPathDisplayStep, index: number) {
  return step.order ?? index + 1
}

function createParallelGroupOrderMap(steps: LearningPathDisplayStep[]) {
  const parallelGroupOrderMap = new Map<string, number>()

  steps.forEach((step, index) => {
    const parallelGroup = step.parallel_group?.trim()

    if (!parallelGroup) {
      return
    }

    const stepOrder = getStepOrder(step, index)
    const currentOrder = parallelGroupOrderMap.get(parallelGroup)

    if (currentOrder === undefined || stepOrder < currentOrder) {
      parallelGroupOrderMap.set(parallelGroup, stepOrder)
    }
  })

  return parallelGroupOrderMap
}

function getNodeDetailPath(kind: LearningPathDisplayNodeKind, id: string) {
  return kind === 'learning_unit'
    ? `/learning-units/${id}`
    : `/modules/${id}`
}

function getMountainNodeOrder(
  step: LearningPathDisplayStep | undefined,
  fallbackOrder: number,
  parallelGroupOrderMap: Map<string, number>,
) {
  if (!step) {
    return fallbackOrder
  }

  const parallelGroup = step.parallel_group?.trim()

  if (parallelGroup) {
    return parallelGroupOrderMap.get(parallelGroup) ?? step.order ?? fallbackOrder
  }

  return step.order ?? fallbackOrder
}

function getModuleAssessmentStatus(
  moduleId: string,
  assessmentResult: AssessmentResultResponse | null,
): AssessmentStatus | null {
  if (!assessmentResult) {
    return null
  }

  if (assessmentResult.completed_module_ids?.includes(moduleId)) {
    return 'completed'
  }

  const moduleResult = assessmentResult.module_results?.find(
    (result) => result.module_id === moduleId,
  )

  if (moduleResult) {
    return moduleResult.status
  }

  if (assessmentResult.skipped_modules?.includes(moduleId)) {
    return 'completed'
  }

  if (
    assessmentResult.recommended_next_modules?.includes(moduleId) ||
    assessmentResult.start_module_id === moduleId ||
    assessmentResult.current_position?.current_module_id === moduleId
  ) {
    return 'not_started'
  }

  return null
}

function isAssessmentPositionModule(
  moduleId: string,
  assessmentResult: AssessmentResultResponse | null,
) {
  if (!assessmentResult) {
    return false
  }

  if (assessmentResult.current_position?.current_module_id) {
    return assessmentResult.current_position.current_module_id === moduleId
  }

  if (assessmentResult.start_module_id) {
    return assessmentResult.start_module_id === moduleId
  }

  return assessmentResult.recommended_next_modules?.[0] === moduleId
}

function applyAssessmentPositionFallback(
  nodes: LearningPathMountainNode[],
  assessmentResult: AssessmentResultResponse | null,
) {
  if (!assessmentResult) {
    return nodes
  }

  const alreadyHasPosition = nodes.some((node) => node.isAssessmentPosition)

  if (alreadyHasPosition) {
    return nodes
  }

  const firstUnfinishedNode = nodes.find(
    (node) => node.assessmentStatus !== 'completed',
  )

  if (!firstUnfinishedNode) {
    return nodes
  }

  return nodes.map((node) =>
    node.id === firstUnfinishedNode.id
      ? {
          ...node,
          isAssessmentPosition: true,
        }
      : node,
  )
}

function getLearningUnitAssessmentStatus(
  learningUnitId: string,
  assessmentResult: AssessmentResultResponse | null,
): AssessmentStatus | null {
  if (!assessmentResult) {
    return null
  }

  if (
    assessmentResult.completed_learning_unit_ids?.includes(learningUnitId) ||
    assessmentResult.skipped_learning_units?.includes(learningUnitId)
  ) {
    return 'completed'
  }

  const learningUnitResult = assessmentResult.learning_unit_results?.find(
    (result) => result.learning_unit_id === learningUnitId,
  )

  if (learningUnitResult) {
    if (learningUnitResult.is_completed_by_assessment) {
      return 'completed'
    }

    const hasKnownKnowledge =
      learningUnitResult.known_topic_ids.length > 0 ||
      learningUnitResult.known_competency_codes.length > 0

    const hasMissingKnowledge =
      learningUnitResult.missing_topic_ids.length > 0 ||
      learningUnitResult.missing_competency_codes.length > 0

    if (hasKnownKnowledge) {
      return 'partially_completed'
    }

    if (hasMissingKnowledge) {
      return 'not_started'
    }
  }

  if (
    assessmentResult.target_type === 'learning_unit' &&
    assessmentResult.target_id === learningUnitId
  ) {
    const hasKnownCompetencies =
      assessmentResult.known_competency_codes?.length > 0

    const hasMissingCompetencies =
      assessmentResult.missing_competency_codes?.length > 0

    if (hasKnownCompetencies && !hasMissingCompetencies) {
      return 'completed'
    }

    if (hasKnownCompetencies) {
      return 'partially_completed'
    }

    if (hasMissingCompetencies) {
      return 'not_started'
    }
  }

  if (
    assessmentResult.recommended_next_learning_units?.includes(
      learningUnitId,
    ) ||
    assessmentResult.start_learning_unit_id === learningUnitId ||
    assessmentResult.current_position?.current_learning_unit_id ===
      learningUnitId
  ) {
    return 'not_started'
  }

  return null
}

function createEntityByIdMap<T extends BackendEntity>(items: T[]) {
  const map = new Map<string, T>()

  items.forEach((item) => {
    const id = getBackendEntityId(item)

    if (id && !map.has(id)) {
      map.set(id, item)
    }
  })

  return map
}

function getDirectLearningUnitDetails(
  learningPath: LearningUnitAwareLearningPath,
) {
  return Array.isArray(learningPath.learning_unit_details)
    ? learningPath.learning_unit_details
    : []
}

function getLearningUnitDetailsForLookup(
  learningPath: LearningUnitAwareLearningPath,
) {
  const directLearningUnits = getDirectLearningUnitDetails(learningPath)

  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []

  const nestedLearningUnits = moduleDetails.flatMap((module) =>
    Array.isArray(module.learning_unit_details)
      ? module.learning_unit_details
      : [],
  )

  return [...directLearningUnits, ...nestedLearningUnits]
}

function isAssessmentPositionLearningUnit(
  learningUnitId: string,
  assessmentResult: AssessmentResultResponse | null,
) {
  if (!assessmentResult) {
    return false
  }

  if (assessmentResult.current_position?.current_learning_unit_id) {
    return (
      assessmentResult.current_position.current_learning_unit_id ===
      learningUnitId
    )
  }

  if (assessmentResult.start_learning_unit_id) {
    return assessmentResult.start_learning_unit_id === learningUnitId
  }

  return assessmentResult.recommended_next_learning_units?.[0] === learningUnitId
}

function getNodeAssessmentStatus(
  kind: LearningPathDisplayNodeKind,
  nodeId: string,
  assessmentResult: AssessmentResultResponse | null,
): AssessmentStatus | null {
  const nodeSpecificAssessmentResult = getSessionAssessmentResult(
    kind === 'learning_unit' ? 'learning_unit' : 'module',
    nodeId,
  )

  if (kind === 'learning_unit') {
    return (
      getLearningUnitAssessmentStatus(nodeId, assessmentResult) ??
      getLearningUnitAssessmentStatus(nodeId, nodeSpecificAssessmentResult)
    )
  }

  return (
    getModuleAssessmentStatus(nodeId, assessmentResult) ??
    getModuleAssessmentStatus(nodeId, nodeSpecificAssessmentResult)
  )
}

function createMountainNode(params: {
  kind: LearningPathDisplayNodeKind
  nodeId: string
  source?: ModuleDetailResponse | LearningUnitResponse
  step?: LearningPathDisplayStep
  order: number
  assessmentResult: AssessmentResultResponse | null
}): LearningPathMountainNode {
  const { kind, nodeId, source, step, order, assessmentResult } = params

  const nodeAssessmentStatus = getNodeAssessmentStatus(
    kind,
    nodeId,
    assessmentResult,
  )

  const nodeSpecificAssessmentResult = getSessionAssessmentResult(
    kind === 'learning_unit' ? 'learning_unit' : 'module',
    nodeId,
  )

  const isNodeAssessmentPosition =
    nodeAssessmentStatus !== 'completed' &&
    (kind === 'learning_unit'
      ? isAssessmentPositionLearningUnit(nodeId, assessmentResult) ||
        isAssessmentPositionLearningUnit(nodeId, nodeSpecificAssessmentResult)
      : isAssessmentPositionModule(nodeId, assessmentResult) ||
        isAssessmentPositionModule(nodeId, nodeSpecificAssessmentResult))

  return {
    id: getNodeKey(kind, nodeId),
    order,
    title: getTextOrFallback(
      source?.title,
      kind === 'learning_unit'
        ? 'Neimenovana učna enota'
        : 'Neimenovan modul',
    ),
    description: getTextOrFallback(
      source?.short_description,
      kind === 'learning_unit'
        ? 'Opis učne enote trenutno ni na voljo.'
        : 'Opis modula trenutno ni na voljo.',
    ),

    moduleId: nodeId,

    nodeType: kind,
    detailPath: getNodeDetailPath(kind, nodeId),

    durationHours: source?.duration_hours ?? null,
    isRequired: step?.is_required ?? false,
    parallelGroup: step?.parallel_group?.trim() || null,

    assessmentStatus: nodeAssessmentStatus,
    isAssessmentPosition: isNodeAssessmentPosition,
  }
}


function createMountainNodes(
  learningPath: LearningPathDetailResponse,
  assessmentResult: AssessmentResultResponse | null = null,
): LearningPathMountainNode[] {
  const learningUnitAwarePath = learningPath as LearningUnitAwareLearningPath

  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []

  const directLearningUnitDetails =
    getDirectLearningUnitDetails(learningUnitAwarePath)

  const learningUnitDetails =
    getLearningUnitDetailsForLookup(learningUnitAwarePath)

  const steps = getLearningPathSteps(learningPath)
  const parallelGroupOrderMap = createParallelGroupOrderMap(steps)

  const moduleById = createEntityByIdMap(
    moduleDetails as Array<ModuleDetailResponse & BackendEntity>,
  )

  const learningUnitById = createEntityByIdMap(
    learningUnitDetails as Array<LearningUnitResponse & BackendEntity>,
  )

  const usedNodeKeys = new Set<string>()
  const nodes: LearningPathMountainNode[] = []

  steps.forEach((step, stepIndex) => {
    const kind = getLearningPathStepKind(step)
    const nodeId = getLearningPathStepNodeId(step)

    if (!nodeId) {
      return
    }

    const source =
      kind === 'learning_unit'
        ? learningUnitById.get(nodeId)
        : moduleById.get(nodeId)

    const nodeKey = getNodeKey(kind, nodeId)
    usedNodeKeys.add(nodeKey)

    nodes.push(
      createMountainNode({
        kind,
        nodeId,
        source,
        step,
        order: getMountainNodeOrder(
          step,
          stepIndex + 1,
          parallelGroupOrderMap,
        ),
        assessmentResult,
      }),
    )
  })

  moduleDetails.forEach((module, index) => {
    const moduleId = getBackendEntityId(module as BackendEntity)

    if (!moduleId) {
      return
    }

    const nodeKey = getNodeKey('module', moduleId)

    if (usedNodeKeys.has(nodeKey)) {
      return
    }

    nodes.push(
      createMountainNode({
        kind: 'module',
        nodeId: moduleId,
        source: module,
        order: steps.length + index + 1,
        assessmentResult,
      }),
    )
  })

  directLearningUnitDetails.forEach((learningUnit, index) => {
    const learningUnitId = getBackendEntityId(learningUnit as BackendEntity)

    if (!learningUnitId) {
      return
    }

    const nodeKey = getNodeKey('learning_unit', learningUnitId)

    if (usedNodeKeys.has(nodeKey)) {
      return
    }

    nodes.push(
      createMountainNode({
        kind: 'learning_unit',
        nodeId: learningUnitId,
        source: learningUnit,
        order: steps.length + moduleDetails.length + index + 1,
        assessmentResult,
      }),
    )
  })

  const sortedNodes = nodes
    .sort((firstNode, secondNode) => {
      if (firstNode.order !== secondNode.order) {
        return firstNode.order - secondNode.order
      }

      const firstParallelGroup = firstNode.parallelGroup ?? ''
      const secondParallelGroup = secondNode.parallelGroup ?? ''

      if (firstParallelGroup !== secondParallelGroup) {
        return firstParallelGroup.localeCompare(secondParallelGroup, 'sl')
      }

      return firstNode.title.localeCompare(secondNode.title, 'sl')
    })
    .slice(0, MAX_VISIBLE_NODES)

  return applyAssessmentPositionFallback(sortedNodes, assessmentResult)
}

function getLearningPathModuleIds(learningPath: LearningPathDetailResponse) {
  const steps = getLearningPathSteps(learningPath)

  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []

  const stepModuleIds = steps
    .filter((step) => getLearningPathStepKind(step) === 'module')
    .map(getLearningPathStepNodeId)
    .filter((moduleId): moduleId is string => Boolean(moduleId))

  if (stepModuleIds.length > 0) {
    return stepModuleIds
  }

  return moduleDetails
    .map((module) => getBackendEntityId(module as BackendEntity))
    .filter((moduleId): moduleId is string => Boolean(moduleId))
}

function isLearningPathCompletedByAssessment(
  learningPath: LearningPathDetailResponse,
  assessmentResult: AssessmentResultResponse | null,
) {
  if (!assessmentResult || assessmentResult.target_type !== 'learning_path') {
    return false
  }

  const moduleIds = getLearningPathModuleIds(learningPath)

  if (moduleIds.length === 0) {
    return false
  }

  return moduleIds.every(
    (moduleId) =>
      getModuleAssessmentStatus(moduleId, assessmentResult) === 'completed',
  )
}

function formatDuration(durationHours?: number | null) {
  if (durationHours != null) {
    if (durationHours === 1) {
      return '1 h'
    }

    return `${durationHours} h`
  }

  return 'Ni določeno'
}

function getLearningPathEntityId(
  learningPath: LearningPathDetailResponse,
  fallbackId?: string,
) {
  return getBackendEntityId(learningPath as BackendEntity) ?? fallbackId ?? ''
}

function getVisibleLearningPathNodeCount(
  learningPath: LearningPathDetailResponse,
) {
  const learningUnitAwarePath = learningPath as LearningUnitAwareLearningPath
  const steps = getLearningPathSteps(learningPath)

  if (steps.length > 0) {
    return steps.filter((step) => Boolean(getLearningPathStepNodeId(step)))
      .length
  }

  const moduleCount = Array.isArray(learningPath.module_details)
    ? learningPath.module_details.length
    : 0

  const directLearningUnitCount =
    getDirectLearningUnitDetails(learningUnitAwarePath).length

  return moduleCount + directLearningUnitCount
}

function getLearningUnitCount(learningPath: LearningPathDetailResponse) {
  const learningUnitAwarePath = learningPath as LearningUnitAwareLearningPath

  const directLearningUnitDetails =
    getDirectLearningUnitDetails(learningUnitAwarePath)

  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []

  const learningUnitIds = new Set<string>()

  directLearningUnitDetails.forEach((learningUnit) => {
    const learningUnitId = getBackendEntityId(learningUnit as BackendEntity)

    if (learningUnitId) {
      learningUnitIds.add(learningUnitId)
    }
  })

  moduleDetails.forEach((module) => {
    if (Array.isArray(module.learning_unit_details)) {
      module.learning_unit_details.forEach((learningUnit) => {
        const learningUnitId = getBackendEntityId(
          learningUnit as BackendEntity,
        )

        if (learningUnitId) {
          learningUnitIds.add(learningUnitId)
        }
      })
    }

    if (Array.isArray(module.learning_units)) {
      module.learning_units.forEach((learningUnitReference) => {
        const learningUnitId = learningUnitReference.learning_unit_id

        if (learningUnitId) {
          learningUnitIds.add(learningUnitId)
        }
      })
    }
  })

  return learningUnitIds.size
}

function LearningPathDetailPage() {
  const { learningPathId } = useParams<{ learningPathId: string }>()
  const navigate = useNavigate()

  const [learningPath, setLearningPath] =
    useState<LearningPathDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResultResponse | null>(null)
  const [isCompletedByAssessment, setIsCompletedByAssessment] = useState(false)

  const learningPathContentId = useMemo(() => {
    if (!learningPath) {
      return undefined
    }

    const contentId = getLearningPathEntityId(learningPath, learningPathId)

    return contentId || undefined
  }, [learningPath, learningPathId])

  const {
    isFavorite: initialIsFavorite,
    isSaved: initialIsSaved,
    isCompleted: initialIsCompleted,
  } = useUserProgressState({
    contentId: learningPathContentId,
    contentType: 'learning_path',
  })

  const {
    isFavorite: progressIsFavorite,
    isSaved: progressIsSaved,
    isCompleted: progressIsCompleted,
    errorMessage: progressErrorMessage,
    clearError: clearProgressError,
    toggleAction,
  } = useUserProgressActions({
    contentId: learningPathContentId,
    contentType: 'learning_path',
    initialIsFavorite,
    initialIsSaved,
    initialIsCompleted: initialIsCompleted || isCompletedByAssessment,
  })

const learningPathIsCompleted = progressIsCompleted || isCompletedByAssessment

  useEffect(() => {
    let isActive = true

    async function loadLearningPath() {
      if (!learningPathId) {
        setErrorMessage('ID učne poti manjka.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const learningPathDetail = await getLearningPathDetail(learningPathId)

        if (!isActive) {
          return
        }

        const targetId = getLearningPathEntityId(
          learningPathDetail,
          learningPathId,
        )

        const sessionAssessmentResult =
          getSessionAssessmentResult('learning_path', targetId) ??
          (targetId !== learningPathId
            ? getSessionAssessmentResult('learning_path', learningPathId)
            : null)

        const nextIsCompletedByAssessment = isLearningPathCompletedByAssessment(
          learningPathDetail,
          sessionAssessmentResult,
        )

        setLearningPath(learningPathDetail)
        setAssessmentResult(sessionAssessmentResult)
        setIsCompletedByAssessment(nextIsCompletedByAssessment)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Prišlo je do napake pri nalaganju učne poti.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadLearningPath()

    return () => {
      isActive = false
    }
  }, [learningPathId])

  const mountainNodes = useMemo(() => {
    if (!learningPath) {
      return []
    }

    return createMountainNodes(learningPath, assessmentResult)
  }, [assessmentResult, learningPath])

  function handleStartQuestionnaire() {
    if (!learningPath) {
      return
    }

    const targetId = getLearningPathEntityId(learningPath, learningPathId)

    if (!targetId) {
      return
    }

    navigate(`/assessment?target_type=learning_path&target_id=${targetId}`)
  }

  async function handleFavoriteClick() {
    if (!learningPathContentId) {
      return false
    }

    const nextState = await toggleAction('favorite')

    return Boolean(nextState)
  }

  async function handleSaveClick() {
    if (!learningPathContentId) {
      return false
    }

    const nextState = await toggleAction('save')

    return Boolean(nextState)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <LoadingState message="Nalaganje učne poti..." />
        </div>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <ErrorState
            title="Učne poti ni bilo mogoče naložiti"
            message={errorMessage}
          />
        </div>
      </main>
    )
  }

  if (!learningPath) {
    return (
      <main className="min-h-screen px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <EmptyState
            title="Učna pot ni najdena"
            message="Učna pot, ki jo iščete, ne obstaja ali pa je bila izbrisana."
          />
        </div>
      </main>
    )
  }

  const learningPathTitle = getTextOrFallback(
    learningPath.title,
    'Neimenovana učna pot',
  )

  const learningPathDescription = getTextOrFallback(
    learningPath.short_description,
    'Opis trenutno ni na voljo.',
  )

  const learningPathKeywords = getStringArrayOrEmpty(learningPath.keywords)
  const moduleCount = getVisibleLearningPathNodeCount(learningPath)
  const learningUnitCount = getLearningUnitCount(learningPath)
  const hiddenNodeCount = Math.max(moduleCount - MAX_VISIBLE_NODES, 0)
  const hasMountainNodes = mountainNodes.length > 0
  const canStartQuestionnaire = moduleCount > 0

  return (
    <main className="min-h-screen px-4 pb-14 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <section className="ml-0 max-w-[1280px] pb-8 pt-10 sm:ml-6 lg:ml-10 xl:ml-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-brown-600)]">
            Učna pot
          </p>

          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,5.8vw,6.4rem)] leading-[0.92] tracking-[-0.035em] text-[var(--color-brown-900)]">
            {learningPathTitle}
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--color-brown-600)]">
            {learningPathDescription}
          </p>

          <div className="mt-7">
            <DetailTags
              tags={learningPathKeywords}
              emptyMessage="Ni dodanih ključnih besed."
            />
          </div>
        </section>

        <section className="mb-6">
          <LearningPathOverviewCard
            durationLabel={formatDuration(learningPath.duration_hours)}
            moduleCount={moduleCount}
            learningUnitCount={learningUnitCount}
            hiddenNodeCount={hiddenNodeCount}
            isFavorite={progressIsFavorite}
            isSaved={progressIsSaved}
            onFavoriteClick={handleFavoriteClick}
            onSaveClick={handleSaveClick}
          />
        </section>

        <div className="relative h-[calc(100vh-7.5rem)] min-h-[760px] min-[1500px]:min-h-[720px]">
          <div className="h-full">
            {hasMountainNodes ? (
            <LearningPathMountain
              nodes={mountainNodes}
              durationLabel={formatDuration(learningPath.duration_hours)}
              moduleCount={moduleCount}
              learningUnitCount={learningUnitCount}
              isFavorite={progressIsFavorite}
              isSaved={progressIsSaved}
              isCompleted={learningPathIsCompleted}
              celebrateCompletedOnMount={learningPathIsCompleted}
              onFavoriteClick={handleFavoriteClick}
              onSaveClick={handleSaveClick}
              className="h-full"
            />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
                <EmptyState
                  title="Ni modulov"
                  message="Ta učna pot trenutno nima modulov za prikaz."
                />
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-6 right-6 z-20 hidden w-[420px] min-[1500px]:block">
            <LearningPathAssistantBox
              learningPathId={learningPathContentId ?? learningPathId ?? ''}
              variant="desktop"
              className="pointer-events-auto"
            />
          </div>
        </div>

        <section className="mt-8 min-[1500px]:hidden">
          <LearningPathAssistantBox
            learningPathId={learningPathContentId ?? learningPathId ?? ''}
            variant="mobile"
          />
        </section>

        <section className="mt-12 overflow-hidden rounded-[28px] border border-[#e5cda6] bg-[#fff8ee] px-8 py-7 shadow-[0_12px_35px_rgba(84,59,33,0.07)] sm:px-10 lg:px-14">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d58a2b] bg-[#fff8ee] text-[#d58a2b]">
                  <CircleHelp className="h-6 w-6" />
                </div>

                <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] text-[var(--color-brown-900)]">
                  Samoocena
                </h2>
              </div>

              {canStartQuestionnaire ? (
                <>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-brown-600)]">
                    Vprašalnik za samooceno se odpre v ločenem oknu. Vzemite si
                    nekaj minut in preverite svoje znanje.
                  </p>

                  <button
                    type="button"
                    onClick={handleStartQuestionnaire}
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#d08a34] px-7 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(208,138,52,0.20)] transition hover:-translate-y-0.5 hover:bg-[#bd7928]"
                  >
                    Odpri vprašalnik
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-brown-600)]">
                  Vprašalnik za to učno pot še ni pripravljen.
                </p>
              )}
            </div>

            <img
              src={questionnaireIllustration}
              alt=""
              className="hidden w-full max-w-[280px] justify-self-center opacity-80 lg:block"
              aria-hidden="true"
            />
          </div>
        </section>
      </div>

      <AuthRequiredDialog
        isOpen={progressErrorMessage === 'AUTH_REQUIRED'}
        onClose={clearProgressError}
      />
    </main>
  )
}

export default LearningPathDetailPage