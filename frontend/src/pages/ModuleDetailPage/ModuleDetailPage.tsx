import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Circle,
  Clock,
  Info,
  BookOpen,
  CircleHelp,
  ExternalLink,
} from 'lucide-react'

import {
  DetailActions,
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'

import { getModuleDetail } from '../../services/module-service'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import type { ModuleResponse } from '../../types/module'
import type { AssessmentResultResponse } from '../../types/assessment'
import { appStyles } from '../../design'
import { LearningUnitVisualizer } from '../../features/modules/components/LearningUnitVisualizer'
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

function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [moduleData, setModuleData] = useState<ModuleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResultResponse | null>(null)

  const { isFavorite, isSaved, isCompleted } = useUserProgressState({
    contentId: moduleData?._id,
    contentType: 'module',
  })

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

  const completedUnitIds = useMemo(() => {
    if (!assessmentResult) {
      return []
    }

    const moduleResult = assessmentResult.module_results?.find(
      (moduleResult) => moduleResult.module_id === moduleId,
    )

    const completed = new Set<string>()

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
  }, [assessmentResult, moduleId])

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
        <ErrorState
          title="Napaka"
          message={error}
        />
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
  const learningUnitReferences = getArrayOrEmpty(moduleData.learning_units)
  const learningUnitDetails = getArrayOrEmpty(moduleData.learning_unit_details)

  const canUseContentActions = Boolean(detail.id)
  const canStartQuestionnaire = hasQuestionnaireContent(
    learningUnitReferences,
    learningUnitDetails,
  )

  return (
    <DetailPageShell>
      <div className="relative mb-8">
        <div className={appStyles.header.step}>
          <div className={appStyles.header.stepIcon}>
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
            initialIsCompleted={isCompleted}
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
        title="Osnovni podatki"
        description="Ključne informacije o strukturi modula."
      >
        <div className="overflow-hidden rounded-[16px] border border-[var(--color-sand-200)] bg-[var(--color-sand-50)]">
          <div className="grid md:grid-cols-2">
            {[
              {
                label: 'Število učnih enot',
                value: String(learningUnitReferences.length),
                icon: <BookOpen className="h-5 w-5" />,
              },
              {
                label: 'Predviden čas',
                value: formatDuration(detail.durationHours),
                icon: <Clock className="h-5 w-5" />,
              },
            ].map((item, index) => (
              <div
                key={`${item.label}-${index}`}
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
      </DetailSection>

      <DetailSection
        title="Učne enote"
        description="Vizualizacija poteka učnih enot znotraj modula."
      >
        <LearningUnitVisualizer
          references={learningUnitReferences}
          details={learningUnitDetails}
          completedUnitIds={completedUnitIds}
          moduleId={moduleId}
        />
      </DetailSection>

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
                  Vprašalnik za samooceno se odpre v ločenem oknu. Vzemite si nekaj
                  minut in preverite svoje znanje.
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
    </DetailPageShell>
  )
}

export default ModuleDetailPage