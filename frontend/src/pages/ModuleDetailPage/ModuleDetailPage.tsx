import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layers, Clock, Info, BookOpen } from 'lucide-react'

import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'

import AssistantChat from '../../features/assistant/components/AssistantChat/AssistantChat'
import { getModuleDetail } from '../../services/module-service'
import type { ModuleResponse } from '../../types/module'
import { appStyles } from '../../design'
import { LearningUnitVisualizer } from '../../features/modules/components/LearningUnitVisualizer'

function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>()

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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className={appStyles.header.step}>
          <div className={appStyles.header.stepIcon}>
            <Layers className="h-5 w-5" />
          </div>
          Modul
        </div>
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
           />
        </div>
      </DetailSection>

      <div className="mt-12">
        <AssistantChat contextType="module" contextId={moduleId} />
      </div>
    </DetailPageShell>
  )
}

export default ModuleDetailPage