import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  CircleHelp,
  Clock,
  ExternalLink,
  Heart,
  Layers3,
  Route,
} from 'lucide-react'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import { DetailSection, DetailTags } from '../../components/detail'
import { CollapsibleChatPanel } from '../../components/layout/ChatPanel/CollapsibleChatPanel'
import {
  LearningPathMountain,
  type LearningPathMountainNode,
} from '../../features/learning-paths/components/LearningPathMountain'
import { getLearningPathDetail } from '../../services/learning-path-service'
import type { LearningPathDetailResponse } from '../../types/learning-path'
import type { ModuleReferenceResponse, ModuleResponse } from '../../types/module'

import questionnaireIllustration from '../../assets/questionnaire-illustration.png'

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

function createMountainNodes(
  learningPath: LearningPathDetailResponse,
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
      learningPath.modules,
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
    })
  })

  return nodes
    .sort((firstNode, secondNode) => firstNode.order - secondNode.order)
    .slice(0, MAX_VISIBLE_NODES)
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

function ToggleActionButton({
  icon,
  label,
  activeLabel,
  isActive,
  onClick,
}: {
  icon: ReactNode
  label: string
  activeLabel: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex min-h-[64px] items-center gap-4 rounded-[16px] border px-5 py-4 text-left font-bold shadow-[0_10px_26px_rgba(57,47,35,0.06)] transition hover:-translate-y-0.5',
        isActive
          ? 'border-[#dcebe0] bg-[#f4fbf6] text-[#2f4a31]'
          : 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#d8c8b1]',
      ].join(' ')}
      aria-pressed={isActive}
    >
      <span
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border bg-white shadow-sm',
          isActive
            ? 'border-[#dcebe0] text-[#2f4a31]'
            : 'border-[#eadfce] text-[#c98a43]',
        ].join(' ')}
      >
        {icon}
      </span>

      <span>{isActive ? activeLabel : label}</span>
    </button>
  )
}

function LearningPathDetailPage() {
  const { learningPathId } = useParams<{ learningPathId: string }>()
  const navigate = useNavigate()

  const [isChatPanelExpanded, setIsChatPanelExpanded] = useState(false)
  const [learningPath, setLearningPath] =
    useState<LearningPathDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

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

        setLearningPath(learningPathDetail)
        setIsFavorite(false)
        setIsSaved(false)
        setIsCompleted(false)
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

    return createMountainNodes(learningPath)
  }, [learningPath])

  const targetLabel = useMemo(() => {
    if (!learningPath?.keywords.length) {
      return undefined
    }

    return learningPath.keywords.slice(0, 3).join(' · ')
  }, [learningPath])

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
      <main className="min-h-screen bg-[#F7F1E6] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <LoadingState message="Nalaganje učne poti..." />
        </div>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-[#F7F1E6] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
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
      <main className="min-h-screen bg-[#F7F1E6] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px] items-center justify-center rounded-[2rem] border border-[#DED2BC] bg-white">
          <EmptyState
            title="Ni modulov"
            message="Ta učna pot trenutno nima modulov za prikaz."
          />
        </div>
      </main>
    )
  }

  const moduleCount = learningPath.module_details?.length ?? learningPath.modules.length
  const learningUnitCount = getLearningUnitCount(learningPath)

  return (
    <main className="min-h-screen bg-[#F7F1E6] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="relative h-[calc(100vh-7.5rem)] min-h-[760px] min-[1500px]:min-h-[720px]">
          <div
            className={`h-full transition-[width] duration-300 ease-out ${
              isChatPanelExpanded
                ? 'min-[1500px]:w-[calc(100%-384px)]'
                : 'w-full'
            }`}
          >
            <LearningPathMountain
              title={learningPath.title}
              description={learningPath.short_description}
              targetLabel={targetLabel}
              nodes={mountainNodes}
              isCompleted={isCompleted}
              className="h-full"
            />
          </div>

          <div className="hidden min-[1500px]:block">
            <CollapsibleChatPanel
              title="Chat pride kasneje"
              description="Ta prostor je rezerviran za pogovor z asistentom. Za zdaj je fokus na prikazu učne poti in povezavah do modulov."
              footerText="Kasneje lahko tukaj dodamo vprašanja o trenutni učni poti, priporočila in pomoč pri posameznih modulih."
              onExpandedChange={setIsChatPanelExpanded}
            />
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <DetailSection
            title="Podrobnosti učne poti"
            description="Pregled osnovnih informacij, strukture in hitrih dejanj za izbrano učno pot."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-[16px] border border-[var(--color-sand-200)] bg-[var(--color-sand-50)]">
                  <div className="grid md:grid-cols-3">
                    {[
                      {
                        label: 'Predviden čas',
                        value: formatDuration(
                          learningPath.duration_hours,
                          learningPath.duration_min,
                        ),
                        icon: <Clock className="h-5 w-5" />,
                      },
                      {
                        label: 'Moduli',
                        value: String(moduleCount),
                        icon: <Layers3 className="h-5 w-5" />,
                      },
                      {
                        label: 'Učne enote',
                        value: String(learningUnitCount),
                        icon: <BookOpen className="h-5 w-5" />,
                      },
                    ].map((item, index) => (
                      <div
                        key={item.label}
                        className={[
                          'flex min-w-0 items-start gap-4 px-5 py-5',
                          index !== 0
                            ? 'border-t border-[var(--color-sand-200)] md:border-l md:border-t-0'
                            : '',
                        ].join(' ')}
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest-100)] text-[var(--color-forest-700)]">
                          {item.icon}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-brown-500)]">
                            {item.label}
                          </p>

                          <strong className="mt-1.5 block text-[17px] font-bold leading-snug text-[var(--color-brown-900)]">
                            {item.value}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[var(--color-sand-200)] bg-white px-5 py-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest-100)] text-[var(--color-forest-700)]">
                      <Route className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-brown-500)]">
                        Ključne besede
                      </p>
                      <p className="text-sm text-[var(--color-brown-600)]">
                        Fokus in teme, ki jih pokriva učna pot.
                      </p>
                    </div>
                  </div>

                  <DetailTags
                    tags={learningPath.keywords || []}
                    emptyMessage="Ni dodanih ključnih besed."
                  />
                </div>
              </div>

              <aside className="rounded-[18px] border border-[#eadfce] bg-white/90 p-5 shadow-[0_14px_30px_rgba(57,47,35,0.06)]">
                <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#706b60]">
                  Upravljanje učne poti
                </p>

                <div className="grid gap-3">
                  <ToggleActionButton
                    icon={<Heart className="h-5 w-5" />}
                    label="Dodaj med priljubljene"
                    activeLabel="Priljubljeno"
                    isActive={isFavorite}
                    onClick={() => setIsFavorite((current) => !current)}
                  />

                  <ToggleActionButton
                    icon={<Bookmark className="h-5 w-5" />}
                    label="Shrani za pozneje"
                    activeLabel="Shranjeno"
                    isActive={isSaved}
                    onClick={() => setIsSaved((current) => !current)}
                  />

                  <ToggleActionButton
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Označi kot končano"
                    activeLabel="Končano"
                    isActive={isCompleted}
                    onClick={() => setIsCompleted((current) => !current)}
                  />
                </div>
              </aside>
            </div>
          </DetailSection>

          <section className="overflow-hidden rounded-[18px] border border-[#eadfce] bg-[#fff6eb] p-6 shadow-[0_12px_28px_rgba(57,47,35,0.06)]">
            <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a56b] bg-[#fffdf8] text-[#d07a12]">
                    <CircleHelp className="h-6 w-6" />
                  </div>

                  <h2 className="font-serif text-3xl text-[#111111]">
                    Samoocena
                  </h2>
                </div>

                <p className="max-w-[620px] text-[15px] leading-7 text-[#706b60]">
                  Vprašalnik za samooceno se odpre v ločenem oknu. Vzemite si
                  nekaj minut in preverite, kje na učni poti lahko začnete.
                </p>

                <button
                  type="button"
                  onClick={handleStartQuestionnaire}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#c98a43] bg-[#c98a43] px-6 py-3 text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(201,138,67,0.22)] transition hover:bg-[#b97835]"
                >
                  Odpri vprašalnik
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden items-center justify-center md:flex">
                <div className="flex h-[190px] w-[240px] items-center justify-center">
                  <img
                    src={questionnaireIllustration}
                    alt="Ilustracija vprašalnika"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default LearningPathDetailPage