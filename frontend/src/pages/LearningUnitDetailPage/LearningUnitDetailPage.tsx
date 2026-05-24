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
  Route,
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className={appStyles.header.step}>
          <div className={appStyles.header.stepIcon}>
            <Route className="h-5 w-5" />
          </div>
          Učna enota
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className={appStyles.button.smallSecondary}
        >
          Nazaj
        </button>
      </div>

      <DetailHero
        eyebrow="Podrobnosti učne enote"
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

      <DetailSection
        title="Upravljanje učne enote"
        description="Tu lahko enoto dodate med priljubljene, jo shranite za pozneje ali označite kot končano."
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <Heart className="h-4 w-4 text-[#31583b]" />
            Dodaj med priljubljene
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <Bookmark className="h-4 w-4 text-[#31583b]" />
            Shrani za pozneje
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <CheckCircle2 className="h-4 w-4 text-[#31583b]" />
            Označi kot končano
          </button>
        </div>
      </DetailSection>
    </DetailPageShell>
  )
}

export default LearningUnitDetailPage