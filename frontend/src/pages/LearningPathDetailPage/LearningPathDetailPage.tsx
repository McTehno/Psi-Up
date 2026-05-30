import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleHelp, ExternalLink } from 'lucide-react'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import AuthRequiredDialog from '../../components/common/AuthRequiredDialog'
import { DetailTags } from '../../components/detail'
import { CollapsibleChatPanel } from '../../components/layout/ChatPanel/CollapsibleChatPanel'
import {
  LearningPathMountain,
  LearningPathOverviewCard,
  type LearningPathMountainNode,
} from '../../features/learning-paths/components/LearningPathMountain'
import { useUserProgressActions } from '../../hooks/useUserProgressActions'
import { useUserProgressState } from '../../hooks/useUserProgressState'
import { getSessionAssessmentResult } from '../../services/assessment-session-service'
import { getLearningPathDetail } from '../../services/learning-path-service'
import type {
  AssessmentResultResponse,
  AssessmentStatus,
} from '../../types/assessment'
import type { LearningPathDetailResponse } from '../../types/learning-path'
import type { ModuleReferenceResponse, ModuleResponse } from '../../types/module'

const MAX_VISIBLE_NODES = 7

type BackendEntity = {
  id?: string
  _id?: string
}

function getBackendEntityId(entity: BackendEntity) {
  return entity.id ?? entity._id
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

function getModuleReferenceById(
  moduleId: string,
  references: ModuleReferenceResponse[],
) {
  return references.find((reference) => reference.module_id === moduleId)
}

function getModuleAssessmentStatus(
  moduleId: string,
  assessmentResult: AssessmentResultResponse | null,
): AssessmentStatus | null {
  if (!assessmentResult) {
    return null
  }

  const moduleResult = assessmentResult.module_results.find(
    (result) => result.module_id === moduleId,
  )

  if (moduleResult) {
    return moduleResult.status
  }

  if (assessmentResult.skipped_modules.includes(moduleId)) {
    return 'completed'
  }

  if (
    assessmentResult.recommended_next_modules.includes(moduleId) ||
    assessmentResult.start_module_id === moduleId
  ) {
    return 'not_started'
  }

  return null
}

function createMountainNodes(
  learningPath: LearningPathDetailResponse,
  assessmentResult: AssessmentResultResponse | null = null,
): LearningPathMountainNode[] {
  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []
  const moduleReferences = Array.isArray(learningPath.modules)
    ? learningPath.modules
    : []
  const nodes: LearningPathMountainNode[] = []

  moduleDetails.forEach((module: ModuleResponse, index) => {
    const moduleId = getBackendEntityId(module as BackendEntity)

    if (!moduleId) {
      return
    }

    const moduleReference = getModuleReferenceById(moduleId, moduleReferences)

    nodes.push({
      id: moduleId,
      order: moduleReference?.order ?? index + 1,
      title: getTextOrFallback(module.title, 'Neimenovan modul'),
      description: getTextOrFallback(
        module.short_description,
        'Opis modula trenutno ni na voljo.',
      ),
      moduleId,
      durationHours: module.duration_hours,
      isRequired: moduleReference?.is_required ?? false,
      parallelGroup: moduleReference?.parallel_group ?? null,
      assessmentStatus: getModuleAssessmentStatus(moduleId, assessmentResult),
    })
  })

  return nodes
    .sort((firstNode, secondNode) => firstNode.order - secondNode.order)
    .slice(0, MAX_VISIBLE_NODES)
}

function getLearningPathModuleIds(learningPath: LearningPathDetailResponse) {
  const modules = Array.isArray(learningPath.modules)
    ? learningPath.modules
    : []
  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []
  const referenceModuleIds = modules
    .map((moduleReference) => moduleReference.module_id)
    .filter((moduleId): moduleId is string => Boolean(moduleId))

  if (referenceModuleIds.length > 0) {
    return referenceModuleIds
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

function formatDuration(
  durationHours?: number | null,
  durationMin?: number | null,
) {
  if (durationHours != null) {
    if (durationHours === 1) {
      return '1 h'
    }

    return `${durationHours} h`
  }

  if (durationMin != null) {
    return `${durationMin} min`
  }

  return 'Ni določeno'
}

function getLearningPathEntityId(
  learningPath: LearningPathDetailResponse,
  fallbackId?: string,
) {
  return getBackendEntityId(learningPath as BackendEntity) ?? fallbackId ?? ''
}

function getLearningUnitCount(learningPath: LearningPathDetailResponse) {
  const moduleDetails = Array.isArray(learningPath.module_details)
    ? learningPath.module_details
    : []

  return moduleDetails.reduce(
    (totalCount, module) => totalCount + (module.learning_units?.length ?? 0),
    0,
  )
}

function LearningPathDetailPage() {
  const { learningPathId } = useParams<{ learningPathId: string }>()
  const navigate = useNavigate()

  const [learningPath, setLearningPath] =
    useState<LearningPathDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
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

  useEffect(() => {
    setIsCompleted(isCompletedByAssessment || progressIsCompleted)
  }, [isCompletedByAssessment, progressIsCompleted])

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
        setIsCompleted(nextIsCompletedByAssessment)
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

  async function handleCompletedChange(_nextIsCompleted: boolean) {
    if (!learningPathContentId) {
      return false
    }

    const nextState = await toggleAction('completed')

    if (!nextState) {
      return false
    }

    setIsCompleted(isCompletedByAssessment || nextState.isCompleted)
    return true
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
  const moduleCount =
    learningPath.module_details?.length ?? learningPath.modules?.length ?? 0
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
            durationLabel={formatDuration(
              learningPath.duration_hours,
              learningPath.duration_min,
            )}
            moduleCount={moduleCount}
            learningUnitCount={learningUnitCount}
            hiddenNodeCount={hiddenNodeCount}
            isCompleted={isCompleted}
            onFavoriteClick={handleFavoriteClick}
            onSaveClick={handleSaveClick}
            onCompletedChange={handleCompletedChange}
          />
        </section>

        <div className="relative h-[calc(100vh-7.5rem)] min-h-[760px] min-[1500px]:min-h-[720px]">
          <div className="h-full">
            {hasMountainNodes ? (
              <LearningPathMountain
                nodes={mountainNodes}
                isCompleted={isCompleted}
                celebrateCompletedOnMount={isCompletedByAssessment}
                onFavoriteClick={handleFavoriteClick}
                onSaveClick={handleSaveClick}
                onCompletedChange={handleCompletedChange}
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
            <CollapsibleChatPanel
              title="Chat pride kasneje"
              description="Ta prostor je rezerviran za pogovor z asistentom. Za zdaj je fokus na prikazu učne poti in povezavah do modulov."
              footerText="Kasneje lahko tukaj dodamo vprašanja o trenutni učni poti, priporočila in pomoč pri posameznih modulih."
              variant="desktop"
              className="pointer-events-auto"
            />
          </div>
        </div>

        <section className="mt-8 min-[1500px]:hidden">
          <CollapsibleChatPanel
            title="Chat pride kasneje"
            description="Ta prostor je rezerviran za pogovor z asistentom. Za zdaj je fokus na prikazu učne poti in povezavah do modulov."
            footerText="Kasneje lahko tukaj dodamo vprašanja o trenutni učni poti, priporočila in pomoč pri posameznih modulih."
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
