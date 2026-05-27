import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layers, Clock, Info, BookOpen, CircleHelp, ExternalLink } from 'lucide-react'

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
import { appStyles } from '../../design'
import { LearningUnitVisualizer } from '../../features/modules/components/LearningUnitVisualizer'

function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [moduleData, setModuleData] = useState<ModuleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!moduleId) return
      try {
        setLoading(true)
        setError(null)
        const data = await getModuleDetail(moduleId)
        setModuleData(data)
      } catch (err: any) {
        setError(err.message || 'Napaka pri nalaganju modula.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [moduleId])

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

  return (
    <DetailPageShell>
      <div className="relative mb-8">
        <div className={appStyles.header.step}>
          <div className={appStyles.header.stepIcon}>
            <Layers className="h-5 w-5" />
          </div>
          Modul
        </div>

        <DetailActions />
      </div>

      <DetailHero
        eyebrow="Podrobnosti modula"
        title={moduleData.title}
        description={moduleData.short_description}
      >
        <DetailMeta
          variant="compact"
          items={[
            {
              label: 'Trajanje',
              value: moduleData.duration_hours ? `${moduleData.duration_hours} h` : 'Ni določeno',
              icon: <Clock className="h-5 w-5" />,
            },
            {
              label: 'Domene',
              value: moduleData.domains?.join(', ') || 'Ni določeno',
              icon: <Info className="h-5 w-5" />,
            },
          ]}
        />

        <div className="mt-6">
          <DetailTags
            tags={moduleData.keywords || []}
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
                value: String(moduleData.learning_units?.length || 0),
                icon: <BookOpen className="h-5 w-5" />,
              },
              {
                label: 'Predviden čas',
                value: moduleData.duration_hours ? `${moduleData.duration_hours} ur` : 'Ni na voljo',
                icon: <Clock className="h-5 w-5" />,
              }
            ].map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={[
                  'flex min-w-0 items-start gap-4 px-5 py-5',
                  index !== 0 ? 'border-t border-[var(--color-sand-200)] md:border-l md:border-t-0' : '',
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
        <div className="rounded-[16px] border border-dashed border-[var(--color-sand-300)] bg-[var(--color-sand-50)] px-6 py-8">
          <LearningUnitVisualizer
            references={moduleData.learning_units || []}
            details={moduleData.learning_unit_details || []}
            /* Current demo for completed units - change for production*/
            completedUnitIds={moduleId === 'mod_002' ? ['ue_001', 'ue_002'] : []}
          />
        </div>
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

export default ModuleDetailPage