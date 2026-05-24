import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import { CollapsibleChatPanel } from '../../components/layout/ChatPanel/CollapsibleChatPanel'
import {
  LearningPathMountain,
  type LearningPathMountainNode,
} from '../../features/learning-paths/components/LearningPathMountain'
import { getLearningPathDetail } from '../../services/learning-path-service'
import { getLearningUnitById } from '../../services/learning-unit-service'
import type { LearningPathDetailResponse } from '../../types/learning-path'
import type { LearningUnitResponse } from '../../types/learning-unit'
import type { ModuleResponse } from '../../types/module'
import { LearningPathMobileSteps } from '../../features/learning-paths/components/LearningPathMobileSteps'

const MAX_VISIBLE_NODES = 7

function sortByOrder<T extends { order?: number | null }>(items: T[]) {
  return items
    .slice()
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

type BackendEntity = {
  id?: string
  _id?: string
}

function getBackendEntityId(entity: BackendEntity) {
  return entity.id ?? entity._id
}

function getOrderedModules(
  learningPath: LearningPathDetailResponse,
): ModuleResponse[] {
  const modulesById = new Map(
    (learningPath.module_details ?? []).map((module) => [
      getBackendEntityId(module as BackendEntity),
      module,
    ]),
  )

  return sortByOrder(learningPath.modules)
    .map((moduleReference) => modulesById.get(moduleReference.module_id))
    .filter((module): module is ModuleResponse => Boolean(module))
}

function getLearningUnitIdsFromLearningPath(
  learningPath: LearningPathDetailResponse,
) {
  const seenLearningUnitIds = new Set<string>()
  const learningUnitIds: string[] = []

  const orderedModules = getOrderedModules(learningPath)

  for (const module of orderedModules) {
    const orderedLearningUnits = sortByOrder(module.learning_units)

    for (const learningUnitReference of orderedLearningUnits) {
      const learningUnitId = learningUnitReference.learning_unit_id

      if (!seenLearningUnitIds.has(learningUnitId)) {
        seenLearningUnitIds.add(learningUnitId)
        learningUnitIds.push(learningUnitId)
      }

      if (learningUnitIds.length >= MAX_VISIBLE_NODES) {
        return learningUnitIds
      }
    }
  }

  return learningUnitIds
}

function createMountainNodes(
  learningUnits: LearningUnitResponse[],
): LearningPathMountainNode[] {
  return learningUnits.map((learningUnit, index) => {
    const learningUnitId = getBackendEntityId(
      learningUnit as unknown as BackendEntity,
    )

    return {
      id: learningUnitId ?? `learning-unit-${index + 1}`,
      order: index + 1,
      title: learningUnit.title,
      description: learningUnit.short_description,
      learningUnitId: learningUnitId ?? '',
    }
  })
}

function LearningPathDetailPage() {
  const { learningPathId } = useParams<{ learningPathId: string }>()
  const [isChatPanelExpanded, setIsChatPanelExpanded] = useState(false)
  const [learningPath, setLearningPath] =
    useState<LearningPathDetailResponse | null>(null)
  const [learningUnits, setLearningUnits] = useState<LearningUnitResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        const learningUnitIds =
          getLearningUnitIdsFromLearningPath(learningPathDetail)

        const learningUnitDetails = await Promise.all(
          learningUnitIds.map((learningUnitId) =>
            getLearningUnitById(learningUnitId),
          ),
        )

        if (!isActive) {
          return
        }

        setLearningPath(learningPathDetail)
        setLearningUnits(learningUnitDetails)
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

  const mountainNodes = useMemo(
    () => createMountainNodes(learningUnits),
    [learningUnits],
  )

  const targetLabel = useMemo(() => {
    if (!learningPath?.keywords.length) {
      return undefined
    }

    return learningPath.keywords.slice(0, 3).join(' · ')
  }, [learningPath])

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
            title="Ni učnih enot"
            message="Ta učna pot trenutno nima učnih enot za prikaz."
          />
        </div>
      </main>
    )
  }

return (
  <main className="min-h-screen bg-[#F7F1E6] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1800px]">
      <div className="block min-[1500px]:hidden">
        <LearningPathMobileSteps
          title={learningPath.title}
          description={learningPath.short_description}
          targetLabel={targetLabel}
          nodes={mountainNodes}
        />
      </div>

      <div className="relative hidden h-[calc(100vh-7.5rem)] min-h-[720px] min-[1500px]:block">
        <div
          className={`h-full transition-[width] duration-300 ease-out ${
            isChatPanelExpanded ? 'w-[calc(100%-384px)]' : 'w-full'
          }`}
        >
          <LearningPathMountain
            title={learningPath.title}
            description={learningPath.short_description}
            targetLabel={targetLabel}
            nodes={mountainNodes}
            className="h-full"
          />
        </div>

        <CollapsibleChatPanel
          title="Chat pride kasneje"
          description="Ta prostor je rezerviran za pogovor z asistentom. Za zdaj je fokus na prikazu učne poti in povezavah do učnih enot."
          footerText="Kasneje lahko tukaj dodamo vprašanja o trenutni učni poti, priporočila in pomoč pri posameznih učnih enotah."
          onExpandedChange={setIsChatPanelExpanded}
        />
      </div>
    </div>
  </main>
)
}

export default LearningPathDetailPage