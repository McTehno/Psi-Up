import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailRouteMap,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import { AssistantChat } from '../../features/assistant'
import {
  buildDetailViewState,
  type DetailTargetInfo,
  type DetailViewState,
} from '../../features/detail/utils'

function DetailTemplatePage() {
  const navigate = useNavigate()
  const { learningPathId, moduleId, learningUnitId } = useParams<{
    learningPathId?: string
    moduleId?: string
    learningUnitId?: string
  }>()

  const targetInfo = useMemo<DetailTargetInfo | null>(() => {
    if (learningPathId) {
      return {
        type: 'learning_path',
        id: learningPathId,
      }
    }

    if (moduleId) {
      return {
        type: 'module',
        id: moduleId,
      }
    }

    if (learningUnitId) {
      return {
        type: 'learning_unit',
        id: learningUnitId,
      }
    }

    return null
  }, [learningPathId, moduleId, learningUnitId])

  const [viewState, setViewState] = useState<DetailViewState | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(targetInfo))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadDetail() {
      if (!targetInfo) {
        setViewState(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const nextViewState = await buildDetailViewState(targetInfo)

        if (isActive) {
          setViewState(nextViewState)
        }
      } catch (error) {
        if (!isActive) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Podrobnosti ni bilo mogoče naložiti.'

        setErrorMessage(message)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      isActive = false
    }
  }, [targetInfo])

  if (isLoading) {
    return <LoadingState message="Nalaganje podrobnosti..." />
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Podrobnosti ni bilo mogoče naložiti"
        message={errorMessage}
      />
    )
  }

  if (!targetInfo) {
    return (
      <EmptyState
        title="Ni izbrane vsebine"
        message="Odpri podrobnosti učne poti, modula ali učne enote."
      />
    )
  }

  if (!viewState) {
    return (
      <EmptyState
        title="Ni podatkov"
        message="Za izbrano vsebino ni bilo mogoče pripraviti prikaza."
      />
    )
  }

  return (
    <DetailPageShell
      sidebar={
        <AssistantChat
          contextType={viewState.assistantContextType}
          contextId={viewState.targetId}
        />
      }
    >
      <DetailHero
        eyebrow={viewState.eyebrow}
        title={viewState.title}
        description={viewState.description}
      >
        <DetailMeta items={viewState.metaItems} />
      </DetailHero>

      {viewState.tagsSection && (
        <DetailSection
          title={viewState.tagsSection.title}
          description={viewState.tagsSection.description}
        >
          <DetailTags
            tags={viewState.tagsSection.tags}
            emptyMessage={viewState.tagsSection.emptyMessage}
          />
        </DetailSection>
      )}

      <DetailSection
        title={viewState.routeMapTitle}
        description={viewState.routeMapDescription}
      >
        <div className="rounded-3xl border border-sand-200 bg-white p-4 shadow-sm">
          <DetailRouteMap
            items={viewState.routeMapItems}
            emptyMessage="Za prikaz poti ni bilo najdenih povezanih elementov."
          />
        </div>
      </DetailSection>

      <DetailSection
        title="Pozicioniranje v učni poti"
        description="Sistem lahko na podlagi odgovorov predlaga ustrezno začetno točko."
      >
        <div className="rounded-3xl border border-forest-100 bg-forest-50 p-5">
          <p className="text-sm leading-6 text-brown-700">
            Če želiš, da te sistem postavi na ustrezno vozlišče v učni poti,
            izpolni kratek vprašalnik.
          </p>

          <button
            type="button"
            onClick={() => navigate(viewState.assessmentUrl)}
            className="mt-4 rounded-full bg-forest-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-forest-700"
          >
            Izpolni vprašalnik
          </button>
        </div>
      </DetailSection>
    </DetailPageShell>
  )
}

export default DetailTemplatePage