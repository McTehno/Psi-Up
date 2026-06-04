import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Award,
  Building2,
  CircleHelp,
  ClipboardCheck,
  Clock,
  ExternalLink,
  CircleDot,
  Users,
} from 'lucide-react'

import MapPinAreaIcon from '../../components/icons/MapPinAreaIcon'
import {
  DetailActions,
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailRecommendationCarousel,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import { appStyles } from '../../design'
import type {
  LearningUnitDetailResponse,
  LearningUnitResponse,
} from '../../types/learning-unit'

import { getLearningUnitDetail } from '../../services/learning-unit-service'
import LearningUnitDetailContent from '../../features/learning-units/components/LearningUnitDetailContent'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
import type { AssessmentResultResponse } from '../../types/assessment'
import { useUserProgressState } from '../../hooks/useUserProgressState'
import {
  normalizeDetailContent,
  type DetailExtraField,
} from '../../utils/normalizers/detail-normalizers'
import LearningUnitAssistantBox from '../../features/learning-units/components/LearningUnitAssistantBox'

/**
 * LearningUnitDetailPage prikazuje podrobnosti ene uÄŤne enote.
 *
 * Namen te strani:
 * - naloĹľiti uÄŤno enoto iz backend-a
 * - prikazati osnovne podatke, kljuÄŤne besede in vsebinski del uÄŤne enote
 * - omogoÄŤiti zaÄŤetek vpraĹˇalnika za samooceno, ÄŤe vpraĹˇanja obstajajo
 * - prikazati uporabniĹˇke akcije: shrani, priljubljeno, zakljuÄŤeno
 *
 * Zakaj uporabljamo normalizer:
 * Backend lahko vrne manjkajoÄŤa, null ali dodatna polja.
 * Zato podatke najprej pretvorimo v stabilno frontend obliko z normalizeDetailContent.
 * Tako DetailHero, DetailMeta in DetailTags ne dobijo neurejenih backend vrednosti.
 */

/**
 * Oblikuje trajanje uÄŤne enote za prikaz uporabniku.
 *
 * Trenutna MongoDB struktura uporablja duration_hours.
 * ÄŚe trajanje manjka, prikaĹľemo "Ni doloÄŤeno".
 */
function formatDuration(durationHours?: number | null) {
  if (!durationHours) {
    return 'Ni doloÄŤeno'
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
 * Vrne ikono za dodatno informacijo.
 *
 * Extra fields pridejo iz normalizerja in so dovoljena dodatna polja,
 * na primer provider, delivery_mode, target_audience, knowledge_assessment.
 */
function getExtraFieldIcon(label: string) {
  if (label === 'Ciljna skupina') {
    return <Users className="h-5 w-5" />
  }

  if (label === 'Izvajalec') {
    return <Building2 className="h-5 w-5" />
  }

  if (label === 'Preverjanje znanja') {
    return <ClipboardCheck className="h-5 w-5" />
  }

  if (label === 'Certifikat') {
    return <Award className="h-5 w-5" />
  }

  if (label === 'NaÄŤin izvedbe') {
    return <MapPinAreaIcon className="h-5 w-5" />
  }

  return <CircleDot className="h-5 w-5" />
}

/**
 * Iz dodatnih polj izbere tista, ki jih Ĺľelimo prikazati v sekciji Osnovni podatki.
 *
 * Namen:
 * - osnovni podatki niso veÄŤ direktno vezani na learningUnit.provider itd.
 * - ÄŤe backend poĹˇlje manjkajoÄŤe vrednosti, jih normalizer ne doda
 * - ÄŤe backend kasneje doda novo dovoljeno dodatno polje, ga lahko tu vkljuÄŤimo
 */
function getBasicInfoFields(extraFields: DetailExtraField[]) {
  const allowedLabels = [
    'Ciljna skupina',
    'Izvajalec',
    'Preverjanje znanja',
    'Certifikat',
  ]

  return extraFields.filter((field) => allowedLabels.includes(field.label))
}

/**
 * DoloÄŤi Ĺˇtevilo stolpcev za osnovne podatke glede na Ĺˇtevilo prikazanih kartic.
 *
 * Namen:
 * - ÄŤe manjkajo opcijska polja, kartice ne ostanejo stisnjene v layout za 4 elemente
 * - ÄŤe imamo 1, 2 ali 3 kartice, se razporedijo lepĹˇe
 * - na mobilnem ostane vedno en stolpec
 *
 * Pomembno:
 * ClassName vrednosti so napisane eksplicitno, ker Tailwind ne zazna varno
 * dinamiÄŤnih classov, kot je `xl:grid-cols-${count}`.
 */
function getBasicInfoGridClass(itemCount: number) {
  if (itemCount <= 1) {
    return 'grid grid-cols-1'
  }

  if (itemCount === 2) {
    return 'grid grid-cols-1 md:grid-cols-2'
  }

  if (itemCount === 3) {
    return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  }

  return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
}

/**
 * DoloÄŤi loÄŤilne ÄŤrte med karticami v sekciji Osnovni podatki.
 *
 * Namen:
 * - ohraniti isti vizualni stil kot prej
 * - prepreÄŤiti ÄŤudne borderje, ko imamo manj kot 4 kartice
 * - ohraniti lep responsive prikaz
 */
function getBasicInfoCardBorderClass(index: number, itemCount: number) {
  if (itemCount <= 1) {
    return ''
  }

  if (itemCount === 2) {
    return index === 1
      ? 'border-t border-[#eadfce] md:border-l md:border-t-0'
      : ''
  }

  if (itemCount === 3) {
    if (index === 1) {
      return 'border-t border-[#eadfce] md:border-l md:border-t-0'
    }

    if (index === 2) {
      return 'border-t border-[#eadfce] xl:border-l xl:border-t-0'
    }

    return ''
  }

  return [
    index !== 0
      ? 'border-t border-[#eadfce] md:border-l md:border-t-0'
      : '',
    index === 2
      ? 'md:border-l-0 md:border-t xl:border-l xl:border-t-0'
      : '',
  ].join(' ')
}

/**
 * Vrne vrednost dodatnega polja po labelu.
 *
 * To uporabimo za compact meta podatke v hero sekciji,
 * kjer Ĺľelimo vedno prikazati ista tri polja.
 */
function getExtraFieldValue(
  extraFields: DetailExtraField[],
  label: string,
  fallback = 'Ni doloÄŤeno',
) {
  return extraFields.find((field) => field.label === label)?.value ?? fallback
}

/**
 * Preveri, ali ima uÄŤna enota vpraĹˇanja za samooceno.
 *
 * Zakaj:
 * Gumb za vpraĹˇalnik naj se ne prikaĹľe, ÄŤe backend ne poĹˇlje vpraĹˇanj
 * ali ÄŤe je seznam vpraĹˇanj prazen.
 */
function hasSelfAssessmentQuestions(learningUnit: LearningUnitResponse) {
  return (
    Array.isArray(learningUnit.self_assessment_questions) &&
    learningUnit.self_assessment_questions.length > 0
  )
}

function LearningUnitDetailPage() {
  const { learningUnitId } = useParams()
  const navigate = useNavigate()

  const [learningUnit, setLearningUnit] = useState<LearningUnitDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResultResponse | null>(null)
  const [localIsCompleted, setLocalIsCompleted] = useState(false)
  const [manualCompletionOverride, setManualCompletionOverride] =
    useState<boolean | null>(null)


  const {
    isFavorite,
    isSaved,
    isCompleted,
  } = useUserProgressState({
    contentId: learningUnit?._id,
    contentType: 'learning_unit',
  })

  useEffect(() => {
    setLocalIsCompleted(isCompleted)
  }, [isCompleted])

  useEffect(() => {
    window.scrollTo(0, 0)

    async function loadLearningUnit() {
      if (!learningUnitId) {
        setError('ID uÄŤne enote ni podan.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await getLearningUnitDetail(learningUnitId)
        setLearningUnit(data)
      } catch (error) {
        console.error(error)
        setError('Podrobnosti uÄŤne enote ni bilo mogoÄŤe naloĹľiti.')
      } finally {
        setIsLoading(false)
      }
    }

    loadLearningUnit()
  }, [learningUnitId])

  useEffect(() => {
    if (!learningUnitId) {
      return
    }

    const storedResult = sessionStorage.getItem(
      `assessment_result_${learningUnitId}`,
    )

    if (!storedResult) {
      setAssessmentResult(null)
      return
    }

    try {
      setAssessmentResult(JSON.parse(storedResult) as AssessmentResultResponse)
    } catch (error) {
      console.error(error)
      setAssessmentResult(null)
    }
  }, [learningUnitId])

  function handleStartQuestionnaire() {
    if (!learningUnitId) return

    navigate(`/assessment?target_type=learning_unit&target_id=${learningUnitId}`)
  }

  if (isLoading) {
    return (
      <DetailPageShell>
        <DetailSection title="Nalaganje">
          <p className={appStyles.text.body}>Nalaganje uÄŤne enote ...</p>
        </DetailSection>
      </DetailPageShell>
    )
  }

  if (error || !learningUnit) {
    return (
      <DetailPageShell>
        <DetailSection title="Napaka">
          <p className={appStyles.text.body}>
            {error ?? 'Podatki za to uÄŤno enoto niso na voljo.'}
          </p>
        </DetailSection>
      </DetailPageShell>
    )
  }

  const detail = normalizeDetailContent(
    learningUnit,
    'Neimenovana uÄŤna enota',
  )

  const learningUnitContentId = learningUnit._id ?? detail.id ?? learningUnitId ?? ''

  const basicInfoFields = getBasicInfoFields(detail.extraFields)
  const canUseContentActions = Boolean(detail.id)
  const canStartQuestionnaire = hasSelfAssessmentQuestions(learningUnit)
  const recommendedModuleItems = learningUnit.recommended_modules.map((module) => ({
    id: module._id,
    title: module.title,
    description: module.short_description,
    durationHours: module.duration_hours,
    keywords: module.keywords,
    href: `/modules/${module._id}`,
    typeLabel: 'Modul',
  }))

  return (
    <DetailPageShell>
      <div className="relative mb-8">
        <div className={appStyles.header.step}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4cc] text-[#c94f3d]">
            <CircleDot className="h-5 w-5" />
          </div>
          UÄŤna enota
        </div>

        {canUseContentActions && (
          <DetailActions
            contentId={detail.id}
            contentType="learning_unit"
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
        eyebrow="UÄŤna enota"
        title={detail.title}
        description={detail.description}
      >
        <div className="relative mt-7 lg:pr-[195px]">
          <DetailMeta
            variant="compact"
            items={[
              {
                label: 'Trajanje',
                value: formatDuration(detail.durationHours),
                icon: <Clock className="h-5 w-5" />,
              },
              {
                label: 'NaÄŤin izvedbe',
                value: getExtraFieldValue(detail.extraFields, 'NaÄŤin izvedbe'),
                icon: <MapPinAreaIcon className="h-5 w-5" />,
              },
              {
                label: 'Certifikat',
                value: getExtraFieldValue(detail.extraFields, 'Certifikat'),
                icon: <Award className="h-5 w-5" />,
              },
            ]}
          />
        </div>

        <div className="mt-6">
          <DetailTags
            tags={detail.keywords}
            emptyMessage="Ta uÄŤna enota nima dodanih kljuÄŤnih besed."
          />
        </div>
      </DetailHero>

      <DetailSection
        title="Osnovni podatki"
        description="Kratek pregled informacij o izvedbi, izvajalcu in preverjanju znanja."
      >
        <div className="overflow-hidden rounded-[16px] border border-[#eadfce] bg-[#fffdf8]">
          <div className={getBasicInfoGridClass(basicInfoFields.length)}>
            {basicInfoFields.length > 0 ? (
              basicInfoFields.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    'flex min-w-0 items-start gap-4 px-5 py-5',
                    getBasicInfoCardBorderClass(index, basicInfoFields.length),
                  ].join(' ')}
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4eee4] text-[#31583b]">
                    {getExtraFieldIcon(item.label)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-bold uppercase tracking-wide text-[#706b60]">
                      {item.label}
                    </p>

                    <strong className="mt-1.5 block text-[17px] font-bold leading-snug text-[#111111]">
                      {item.value}
                    </strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-5">
                <p className="text-sm text-[#706b60]">
                  Osnovni podatki za to uÄŤno enoto trenutno niso doloÄŤeni.
                </p>
              </div>
            )}
          </div>
        </div>
      </DetailSection>

      <div>
        <LearningUnitDetailContent
          learningUnit={learningUnit}
          assessmentResult={assessmentResult}
          isCompleted={localIsCompleted}
          manualCompletionOverride={manualCompletionOverride}
        />

        <section className="mt-8">
          <LearningUnitAssistantBox
            learningUnitId={learningUnitContentId}
            variant="mobile"
          />
        </section>
      </div>
      <DetailRecommendationCarousel
        title="PriporoÄŤeni moduli"
        description="Moduli, ki vkljuÄŤujejo to uÄŤno enoto in ti lahko pomagajo razumeti ĹˇirĹˇi kontekst vsebine."
        items={recommendedModuleItems}
      />
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

            {canStartQuestionnaire ? (
              <>
                <p className="max-w-[560px] text-[15px] leading-7 text-[#706b60]">
                  VpraĹˇalnik za samooceno se odpre v loÄŤenem oknu. Vzemite si nekaj
                  minut in preverite svoje znanje.
                </p>

                <button
                  type="button"
                  onClick={handleStartQuestionnaire}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#c98a43] bg-[#c98a43] px-6 py-3 text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(201,138,67,0.22)] transition hover:bg-[#b97835]"
                >
                  Odpri vpraĹˇalnik
                  <ExternalLink className="h-4 w-4" />
                </button>
              </>
            ) : (
              <p className="max-w-[560px] text-[15px] leading-7 text-[#706b60]">
                VpraĹˇalnik za to uÄŤno enoto Ĺˇe ni pripravljen.
              </p>
            )}
          </div>

          <div className="hidden items-center justify-center md:flex">
            <div className="flex h-[190px] w-[240px] items-center justify-center">
              <img
                src={questionnaireIllustration}
                alt="Ilustracija vpraĹˇalnika"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </DetailPageShell>
  )
}

export default LearningUnitDetailPage

