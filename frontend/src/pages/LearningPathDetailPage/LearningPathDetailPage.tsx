import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleHelp, ExternalLink } from 'lucide-react'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import { DetailTags } from '../../components/detail'
import { CollapsibleChatPanel } from '../../components/layout/ChatPanel/CollapsibleChatPanel'
import {
  LearningPathMountain,
  type LearningPathMountainNode,
} from '../../features/learning-paths/components/LearningPathMountain'
import { getLearningPathDetail } from '../../services/learning-path-service'
import type { LearningPathDetailResponse } from '../../types/learning-path'
import type { ModuleReferenceResponse, ModuleResponse } from '../../types/module'
import { getSessionAssessmentResult } from '../../services/assessment-session-service'
import type {
  AssessmentResultResponse,
  AssessmentStatus,
} from '../../types/assessment'

const MAX_VISIBLE_NODES = 7


type BackendEntity = {
  id?: string
  _id?: string
}

function getBackendEntityId(entity: BackendEntity) {
  return entity.id ?? entity._id
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
  const moduleDetails = learningPath.module_details ?? []
  const nodes: LearningPathMountainNode[] = []

  moduleDetails.forEach((module: ModuleResponse, index) => {
    const moduleId = getBackendEntityId(module as BackendEntity)

    if (!moduleId) {
      return
    }

    const moduleReference = getModuleReferenceById(
      moduleId,
      learningPath.modules ?? [],
    )

    nodes.push({
      id: moduleId,
      order: moduleReference?.order ?? index + 1,
      title: module.title,
      description: module.short_description,
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
  const referenceModuleIds = (learningPath.modules ?? [])
    .map((moduleReference) => moduleReference.module_id)
    .filter((moduleId): moduleId is string => Boolean(moduleId))

  if (referenceModuleIds.length > 0) {
    return referenceModuleIds
  }

  return (learningPath.module_details ?? [])
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
  return (learningPath.module_details ?? []).reduce(
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

      const targetId = getLearningPathEntityId(learningPathDetail, learningPathId)

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

  if (!learningPath || mountainNodes.length === 0) {
    return (
      <main className="min-h-screen px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <EmptyState
            title="Ni modulov"
            message="Ta učna pot trenutno nima modulov za prikaz."
          />
        </div>
      </main>
    )
  }

  const moduleCount =
    learningPath.module_details?.length ?? learningPath.modules?.length ?? 0
  const learningUnitCount = getLearningUnitCount(learningPath)

  return (
    <main className="min-h-screen px-4 pb-14 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <section className="ml-0 max-w-[1280px] pb-8 pt-10 sm:ml-6 lg:ml-10 xl:ml-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-brown-600)]">
            Učna pot
          </p>

          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,5.8vw,6.4rem)] leading-[0.92] tracking-[-0.035em] text-[var(--color-brown-900)]">
            {learningPath.title}
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--color-brown-600)]">
            {learningPath.short_description}
          </p>

          <div className="mt-7">
            <DetailTags
              tags={learningPath.keywords || []}
              emptyMessage="Ni dodanih ključnih besed."
            />
          </div>
        </section>

        <div className="relative h-[calc(100vh-7.5rem)] min-h-[760px] min-[1500px]:min-h-[720px]">
          <div className="h-full">
            <LearningPathMountain
              nodes={mountainNodes}
              durationLabel={formatDuration(
                learningPath.duration_hours,
                learningPath.duration_min,
              )}
              moduleCount={moduleCount}
              learningUnitCount={learningUnitCount}
              isCompleted={isCompleted}
              celebrateCompletedOnMount={isCompletedByAssessment}
              onFavoriteClick={() => {
                // TODO: priklop na user-progress-service, ko bo na voljo userId
              }}
              onSaveClick={() => {
                // TODO: priklop na user-progress-service, ko bo na voljo userId
              }}
              onCompletedChange={(nextIsCompleted) =>
                setIsCompleted(nextIsCompleted)
              }
              className="h-full"
            />
          </div>

          <div className="pointer-events-none absolute inset-y-6 right-6 z-50 hidden w-[420px] min-[1500px]:block">
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

        <section className="mt-12 overflow-hidden rounded-[32px] border border-[#e5cda6] bg-[#fff8ee] px-8 py-10 shadow-[0_18px_50px_rgba(84,59,33,0.08)] sm:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#d58a2b] bg-[#fff8ee] text-[#d58a2b]">
                  <CircleHelp className="h-8 w-8" />
                </div>

                <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em] text-[var(--color-brown-900)]">
                  Samoocena
                </h2>
              </div>

              <p className="mt-7 max-w-3xl text-xl leading-9 text-[var(--color-brown-600)]">
                Vprašalnik za samooceno se odpre v ločenem oknu. Vzemite si nekaj minut
                in preverite svoje znanje.
              </p>

              <button
                type="button"
                onClick={handleStartQuestionnaire}
                className="mt-10 inline-flex items-center justify-center gap-3 rounded-[18px] bg-[#d08a34] px-9 py-5 text-lg font-bold text-white shadow-[0_18px_38px_rgba(208,138,52,0.24)] transition hover:-translate-y-0.5 hover:bg-[#bd7928]"
              >
                Odpri vprašalnik
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>

            <img
              src={questionnaireIllustration}
              alt=""
              className="hidden w-full max-w-[330px] justify-self-center opacity-80 lg:block"
              aria-hidden="true"
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default LearningPathDetailPage