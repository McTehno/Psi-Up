import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Award,
  Bookmark,
  Building2,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Heart,
  CircleDot,
  Users,
} from 'lucide-react'

import MapPinAreaIcon from '../../components/icons/MapPinAreaIcon'
import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import { appStyles } from '../../design'
import type { LearningUnitResponse } from '../../types/learning-unit'
import { getLearningUnitDetail } from '../../services/learning-unit-service'
import LearningUnitDetailContent from '../../features/learning-units/components/LearningUnitDetailContent'
import questionnaireIllustration from '../../assets/questionnaire-illustration.png'
function formatDuration(durationHours?: number | null) {
  if (!durationHours) {
    return 'Ni določeno'
  }

  if (!Number.isInteger(durationHours)) {
    return `${durationHours} h`
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

function LearningUnitDetailPage() {
  const { learningUnitId } = useParams()
  const navigate = useNavigate()

  const [learningUnit, setLearningUnit] =
    useState<LearningUnitResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Had to make the page scroll to top when href-ing to it from ModuleDetailPage.tsx
    window.scrollTo(0, 0)
    async function loadLearningUnit() {
      if (!learningUnitId) {
        setError('ID učne enote ni podan.')
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
        setError('Podrobnosti učne enote ni bilo mogoče naložiti.')
      } finally {
        setIsLoading(false)
      }
    }

    loadLearningUnit()
  }, [learningUnitId])

  function handleStartQuestionnaire() {
    if (!learningUnitId) return

    navigate(`/assessment?target_type=learning_unit&target_id=${learningUnitId}`)
  }

  if (isLoading) {
    return (
      <DetailPageShell>
        <DetailSection title="Nalaganje">
          <p className={appStyles.text.body}>Nalaganje učne enote ...</p>
        </DetailSection>
      </DetailPageShell>
    )
  }

  if (error || !learningUnit) {
    return (
      <DetailPageShell>
        <DetailSection title="Napaka">
          <p className={appStyles.text.body}>
            {error ?? 'Podatki za to učno enoto niso na voljo.'}
          </p>
        </DetailSection>
      </DetailPageShell>
    )
  }

  return (
    <DetailPageShell>
      <div className="relative mb-8">
        <div className={appStyles.header.step}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4cc] text-[#c94f3d]">
            <CircleDot className="h-5 w-5" />
          </div>
          Učna enota
        </div>

        <div className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-1 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:mt-0 lg:flex-col lg:items-end lg:gap-2.5 lg:overflow-visible lg:pb-0">
          <button
            type="button"
            className="group inline-flex shrink-0 items-center justify-start gap-2 rounded-[14px] border border-[#d8e8da] bg-[#f2f8f1]/95 px-3 py-2.5 text-xs font-bold text-[#31583b] shadow-[0_10px_24px_rgba(57,47,35,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#31583b]/35 hover:bg-[#fffdf8] hover:shadow-[0_16px_34px_rgba(57,47,35,0.10)] lg:w-[158px] lg:gap-3 lg:rounded-[16px] lg:px-4 lg:py-3 lg:text-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#fffdf8] text-[#31583b] shadow-sm transition group-hover:bg-[#31583b] group-hover:text-[#fffdf8] lg:h-9 lg:w-9 lg:rounded-[11px]">
              <Heart className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            </span>
            Priljubljeno
          </button>

          <button
            type="button"
            className="group inline-flex shrink-0 items-center justify-start gap-2 rounded-[14px] border border-[#eadfce] bg-[#fff6eb]/95 px-3 py-2.5 text-xs font-bold text-[#111111] shadow-[0_10px_24px_rgba(57,47,35,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d07a12]/45 hover:bg-[#fffdf8] hover:shadow-[0_16px_34px_rgba(57,47,35,0.10)] lg:w-[158px] lg:gap-3 lg:rounded-[16px] lg:px-4 lg:py-3 lg:text-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#fffdf8] text-[#d07a12] shadow-sm transition group-hover:bg-[#d07a12] group-hover:text-[#fffdf8] lg:h-9 lg:w-9 lg:rounded-[11px]">
              <Bookmark className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            </span>
            Shrani
          </button>

          <button
            type="button"
            className="group inline-flex shrink-0 items-center justify-start gap-2 rounded-[14px] border border-[#d8e8da] bg-[#fffdf8]/95 px-3 py-2.5 text-xs font-bold text-[#31583b] shadow-[0_10px_24px_rgba(57,47,35,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:shadow-[0_16px_34px_rgba(57,47,35,0.10)] lg:w-[158px] lg:gap-3 lg:rounded-[16px] lg:px-4 lg:py-3 lg:text-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f2f8f1] text-[#31583b] shadow-sm transition group-hover:bg-[#31583b] group-hover:text-[#fffdf8] lg:h-9 lg:w-9 lg:rounded-[11px]">
              <CheckCircle2 className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            </span>
            Končano
          </button>
        </div>
      </div>

      <DetailHero
        eyebrow="Učna enota"
        title={learningUnit.title}
        description={learningUnit.short_description}
      >
        <DetailMeta
          variant="compact"
          items={[
            {
              label: 'Trajanje',
              value: formatDuration(learningUnit.duration_hours),
              icon: <Clock className="h-5 w-5" />,
            },
            {
              label: 'Način izvedbe',
              value: learningUnit.delivery_mode ?? 'Ni določeno',
              icon: <MapPinAreaIcon className="h-5 w-5" />,
            },
            {
              label: 'Certifikat',
              value: learningUnit.certificate ?? 'Ni določeno',
              icon: <Award className="h-5 w-5" />,
            },
          ]}
        />

        <div className="mt-6">
          <DetailTags
            tags={learningUnit.keywords}
            emptyMessage="Ta učna enota nima dodanih ključnih besed."
          />
        </div>
      </DetailHero>

      <DetailSection
        title="Osnovni podatki"
        description="Kratek pregled informacij o izvedbi, izvajalcu in preverjanju znanja."
      >
        <div className="overflow-hidden rounded-[16px] border border-[#eadfce] bg-[#fffdf8]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Ciljna publika',
                value: learningUnit.target_audience ?? 'Ni določeno',
                icon: <Users className="h-5 w-5" />,
              },
              {
                label: 'Izvajalec',
                value: learningUnit.provider ?? 'Ni določeno',
                icon: <Building2 className="h-5 w-5" />,
              },
              {
                label: 'Preverjanje znanja',
                value: learningUnit.knowledge_assessment ?? 'Ni določeno',
                icon: <ClipboardCheck className="h-5 w-5" />,
              },
              {
                label: 'Potrdilo',
                value: learningUnit.certificate ?? 'Ni določeno',
                icon: <Award className="h-5 w-5" />,
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className={[
                  'flex min-w-0 items-start gap-4 px-5 py-5',
                  index !== 0
                    ? 'border-t border-[#eadfce] md:border-l md:border-t-0'
                    : '',
                  index === 2
                    ? 'md:border-l-0 md:border-t xl:border-l xl:border-t-0'
                    : '',
                ].join(' ')}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4eee4] text-[#31583b]">
                  {item.icon}
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
            ))}
          </div>
        </div>
      </DetailSection>
      <LearningUnitDetailContent
        learningUnit={learningUnit}
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

export default LearningUnitDetailPage