import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Circle,
  Clock,
  Info,
  CircleHelp,
  ExternalLink,
} from 'lucide-react'
import {usePageTitle} from '../../hooks/usePageTitle'
import {
  DetailActions,
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailRecommendationCarousel,
  DetailSection,
  DetailTags,
  QuestionnaireToast,
} from '../../components/detail'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { getModuleDetail } from '../../services/module-service'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import type { ModuleDetailResponse } from '../../types/module'
import type { AssessmentResultResponse } from '../../types/assessment'
import { appStyles } from '../../design'
import { LearningUnitVisualizer } from '../../features/modules/components/LearningUnitVisualizer'
import ModuleAssistantBox from '../../features/modules/components/ModuleAssistantBox'
import { useUserProgressState } from '../../hooks/useUserProgressState'
import { getArrayOrEmpty } from '../../utils/display'
import { normalizeDetailContent } from '../../utils/normalizers/detail-normalizers'




/**
 * ModuleDetailPage prikazuje podrobnosti enega modula.
 *
 * Namen strani:
 * - naložiti modul iz backend-a
 * - prikazati osnovne podatke modula
 * - prikazati ključne besede in domene
 * - prikazati učne enote znotraj modula prek LearningUnitVisualizer
 * - omogočiti začetek vprašalnika, če ima modul povezane učne enote
 * - prikazati uporabniške akcije: shrani, priljubljeno, zaključeno
 *
 * Zakaj uporabljamo normalizerje in varne helperje:
 * Backend lahko vrne manjkajoča, prazna ali delno nepopolna polja.
 * Zato podatke pred prikazom pretvorimo v stabilno obliko, da UI ne pade.
 */

/**
 * Oblikuje trajanje modula za prikaz uporabniku.
 *
 * Trenutna MongoDB struktura uporablja duration_hours.
 * Če trajanje manjka, prikažemo "Ni določeno".
 */
function formatDuration(durationHours?: number | null) {
  if (!durationHours) {
    return 'Ni določeno'
  }

  const formattedDuration = String(durationHours).replace('.', ',')

  if (!Number.isInteger(durationHours)) {
    return `${formattedDuration} h`
  }

  if (durationHours === 1) {
    return '1 ura'
  }

  if (durationHours === 2) {
    return '2 uri'
  }

  if (durationHours === 3 || durationHours === 4) {
    return `${durationHours} ure`
  }

  return `${durationHours} ur`
}

/**
 * Vrne samo veljavne string vrednosti iz array-a.
 *
 * Uporaba:
 * - domains
 *
 * Če backend pošlje null, undefined ali napačne elemente,
 * jih ne prikažemo.
 */
function getStringArrayOrEmpty(value: unknown): string[] {
  return getArrayOrEmpty(value as string[])
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Oblikuje domene za prikaz v compact meta podatkih.
 *
 * Če domen ni, prikažemo "Ni določeno".
 */
function formatDomains(domains: unknown) {
  const safeDomains = getStringArrayOrEmpty(domains)

  if (safeDomains.length === 0) {
    return 'Ni določeno'
  }

  return safeDomains.join(', ')
}

/**
 * Preveri, ali ima modul vsebino, iz katere je smiselno odpreti vprašalnik.
 *
 * Modul trenutno nima svojega seznama vprašanj v istem smislu kot učna enota.
 * Vprašalnik za modul se običajno generira iz povezanih učnih enot.
 * Zato gumb prikažemo samo, če ima modul vsaj eno učno enoto ali detail učno enoto.
 */
function hasQuestionnaireContent(
  learningUnitReferences: unknown[],
  learningUnitDetails: unknown[],
) {
  return learningUnitReferences.length > 0 || learningUnitDetails.length > 0
}

function getLearningUnitIdsFromModule(
  learningUnitReferences: unknown[],
  learningUnitDetails: unknown[],
) {
  const ids = new Set<string>()

  learningUnitReferences.forEach((reference) => {
    if (
      reference &&
      typeof reference === 'object' &&
      '_id' in reference &&
      typeof reference._id === 'string'
    ) {
      ids.add(reference._id)
    }

    if (
      reference &&
      typeof reference === 'object' &&
      'learning_unit_id' in reference &&
      typeof reference.learning_unit_id === 'string'
    ) {
      ids.add(reference.learning_unit_id)
    }
  })

  learningUnitDetails.forEach((learningUnit) => {
    if (
      learningUnit &&
      typeof learningUnit === 'object' &&
      '_id' in learningUnit &&
      typeof learningUnit._id === 'string'
    ) {
      ids.add(learningUnit._id)
    }
  })

  return Array.from(ids)
}


function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [moduleData, setModuleData] = useState<ModuleDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResultResponse | null>(null)

  const [localIsCompleted, setLocalIsCompleted] = useState(false)
  const [manualCompletionOverride, setManualCompletionOverride] =
    useState<boolean | null>(null)


  usePageTitle(moduleData ? `Modul - ${moduleData.title}` : 'Nalaganje modula...')  
  const {
    isFavorite,
    isSaved,
    isCompleted,
  } = useUserProgressState({
    contentId: moduleData?._id,
    contentType: 'module',
  })

  useEffect(() => {
    setLocalIsCompleted(isCompleted)
  }, [isCompleted])

  useEffect(() => {
    window.scrollTo(0, 0)

    async function loadData() {
      if (!moduleId) {
        setError('ID modula ni podan.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await getModuleDetail(moduleId)

        setModuleData(data)
      } catch (err) {
        console.error(err)

        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Napaka pri nalaganju modula.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [moduleId])

  useEffect(() => {
    if (!moduleId) {
      return
    }

    const storedResult = sessionStorage.getItem(`assessment_result_${moduleId}`)

    if (!storedResult) {
      setAssessmentResult(null)
      return
    }

    try {
      setAssessmentResult(JSON.parse(storedResult) as AssessmentResultResponse)
    } catch (err) {
      console.error(err)
      setAssessmentResult(null)
    }
  }, [moduleId])
  const learningUnitReferences = getArrayOrEmpty(moduleData?.learning_units)
  const learningUnitDetails = getArrayOrEmpty(moduleData?.learning_unit_details)

  const learningUnitCount = Math.max(
    learningUnitReferences.length,
    learningUnitDetails.length,
  )

  const shouldUseInlineAssistant = learningUnitCount === 1

  const moduleLearningUnitIds = useMemo(
    () => getLearningUnitIdsFromModule(learningUnitReferences, learningUnitDetails),
    [learningUnitReferences, learningUnitDetails],
  )

  const completedUnitIds = useMemo(() => {
    const completed = new Set<string>()

    const moduleResult = assessmentResult?.module_results?.find(
      (moduleResult) => moduleResult.module_id === moduleId,
    )

    if (manualCompletionOverride === true) {
      moduleLearningUnitIds.forEach((id) => completed.add(id))
      return Array.from(completed)
    }

    if (assessmentResult) {
      if (moduleResult?.completed_learning_units) {
        moduleResult.completed_learning_units.forEach((id) => completed.add(id))
      }

      if (assessmentResult.skipped_learning_units) {
        assessmentResult.skipped_learning_units.forEach((id) => completed.add(id))
      }

      if (assessmentResult.learning_unit_results) {
        assessmentResult.learning_unit_results.forEach((learningUnitResult) => {
          if (learningUnitResult.is_completed_by_assessment) {
            completed.add(learningUnitResult.learning_unit_id)
          }
        })
      }

      return Array.from(completed)
    }

    if (localIsCompleted) {
      moduleLearningUnitIds.forEach((id) => completed.add(id))
      return Array.from(completed)
    }

    return []
  }, [
    assessmentResult,
    localIsCompleted,
    manualCompletionOverride,
    moduleId,
    moduleLearningUnitIds,
  ])

  function handleStartQuestionnaire() {
    if (!moduleId) return

    navigate(`/assessment?target_type=module&target_id=${moduleId}`)
  }

  if (loading) {
    return (
      <DetailPageShell>
        <LoadingState message="Nalaganje modula..." />
      </DetailPageShell>
    )
  }

  if (error) {
    return (
      <DetailPageShell>
        <ErrorState title="Napaka" message={error} />
      </DetailPageShell>
    )
  }

  if (!moduleData) {
    return (
      <DetailPageShell>
        <EmptyState
          title="Modul ni najden"
          message="Modul, ki ga iščete, ne obstaja ali pa je bil izbrisan."
        />
      </DetailPageShell>
    )
  }

  const detail = normalizeDetailContent(moduleData, 'Neimenovan modul')
  const moduleContentId = moduleData._id ?? detail.id ?? moduleId ?? ''

  const recommendedLearningPathItems: Parameters<
    typeof DetailRecommendationCarousel
  >[0]['items'] = getArrayOrEmpty(moduleData.recommended_learning_paths).map(
    (learningPath) => ({
      id: learningPath._id,
      title: learningPath.title,
      description: learningPath.short_description,
      durationHours: learningPath.duration_hours,
      keywords: learningPath.keywords,
      href: `/learning-paths/${learningPath._id}`,
      typeLabel: 'Učna pot',
    }),
  )

  const canUseContentActions = Boolean(detail.id)

  const canStartQuestionnaire = hasQuestionnaireContent(
    learningUnitReferences,
    learningUnitDetails,
  )

  let assessmentPositionUnitId: string | null = null

  if (manualCompletionOverride !== true && assessmentResult) {
    if (assessmentResult.start_learning_unit_id) {
      assessmentPositionUnitId = assessmentResult.start_learning_unit_id
    } else if (assessmentResult.recommended_next_learning_units?.length > 0) {
      assessmentPositionUnitId = assessmentResult.recommended_next_learning_units[0]
    }
  }


  return (
    <DetailPageShell>
      <div className="relative">
        <div className="relative mb-8">
          <div className={appStyles.header.step}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Circle className="h-5 w-5" />
            </div>
            Modul
          </div>

          {canUseContentActions && (
            <DetailActions
              contentId={detail.id}
              contentType="module"
              initialIsFavorite={isFavorite}
              initialIsSaved={isSaved}
              initialIsCompleted={localIsCompleted}
              onCompletedChange={(nextIsCompleted) => {
                setLocalIsCompleted(nextIsCompleted)

                if (nextIsCompleted) {
                  setManualCompletionOverride(true)
                } else {
                  setManualCompletionOverride(null)
                }

              }}
            />
          )}
        </div>

        <DetailHero
          eyebrow="Podrobnosti modula"
          title={detail.title}
          description={detail.description}
        >
          <DetailMeta
            variant="compact"
            items={[
              {
                label: 'Trajanje',
                value: formatDuration(detail.durationHours),
                icon: <Clock className="h-5 w-5" />,
              },
              {
                label: 'Domene',
                value: formatDomains(moduleData.domains),
                icon: <Info className="h-5 w-5" />,
              },
            ]}
          />

          <div className="mt-6">
            <DetailTags
              tags={detail.keywords}
              emptyMessage="Ni dodanih ključnih besed."
            />
          </div>
        </DetailHero>

        <DetailSection
          title="Učne enote"
          description="Vizualizacija poteka učnih enot znotraj modula."
        >
          <div className="relative">
            <LearningUnitVisualizer
              references={learningUnitReferences}
              details={learningUnitDetails}
              completedUnitIds={completedUnitIds}
              moduleId={moduleId}
              assessmentPositionUnitId={assessmentPositionUnitId}
            />

            {!shouldUseInlineAssistant ? (
              <div className="pointer-events-none absolute inset-y-6 right-6 z-20 hidden w-[420px] min-[1500px]:block">
                <ModuleAssistantBox
                  moduleId={moduleContentId}
                  variant="desktop"
                  className="pointer-events-auto"
                />
              </div>
            ) : null}

            {shouldUseInlineAssistant ? (
              <section className="mt-8">
                <ModuleAssistantBox
                  moduleId={moduleContentId}
                  variant="mobile"
                />
              </section>
            ) : (
              <section className="mt-8 min-[1500px]:hidden">
                <ModuleAssistantBox
                  moduleId={moduleContentId}
                  variant="mobile"
                />
              </section>
            )}
          </div>
        </DetailSection>

        <DetailRecommendationCarousel
          eyebrow="Povezane učne poti"
          title="Učne poti, ki vključujejo ta modul"
          description="Ta modul je del spodnjih učnih poti. Odpri učno pot, če želiš videti širši učni kontekst, zaporedje modulov in priporočeno smer učenja."
          items={recommendedLearningPathItems}
        />

        <section className="mt-12 overflow-hidden rounded-[18px] border border-[#eadfce] bg-[#fff6eb] p-6 shadow-[0_12px_28px_rgba(57,47,35,0.06)]">
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

              {canStartQuestionnaire ? (
                <>
                  <p className="max-w-[560px] text-[15px] leading-7 text-[#706b60]">
                    Vprašalnik za samooceno se odpre v ločenem oknu. Vzemite si
                    nekaj minut in preverite svoje znanje.
                  </p>

                  <button
                    type="button"
                    onClick={handleStartQuestionnaire}
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#c98a43] bg-[#c98a43] px-6 py-3 text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(201,138,67,0.22)] transition hover:bg-[#b97835]"
                  >
                    Odpri vprašalnik
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <p className="max-w-[560px] text-[15px] leading-7 text-[#706b60]">
                  Vprašalnik za ta modul še ni pripravljen.
                </p>
              )}
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

      {canStartQuestionnaire && !localIsCompleted && (
        <QuestionnaireToast targetType="module" targetId={moduleContentId} />
      )}
    </DetailPageShell>
  )
}

export default ModuleDetailPage

